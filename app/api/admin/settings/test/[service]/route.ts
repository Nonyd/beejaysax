import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { getPaystackKeys, getSetting } from '@/lib/settings'
import { parseSpotifyArtistId, parseYouTubeChannel } from '@/lib/music-ids'
import { youtubeErrorMessage, youtubeHeaders } from '@/lib/sync/youtube'

export const dynamic = 'force-dynamic'

type Check = { name: string; ok: boolean; detail: string }

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(10_000), cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  return { res, data: data as Record<string, unknown> }
}

async function testPaystack(): Promise<Check[]> {
  const { mode, publicKey, secretKey } = await getPaystackKeys()
  const checks: Check[] = []
  checks.push({
    name: 'Public key',
    ok: Boolean(publicKey?.startsWith(mode === 'live' ? 'pk_live_' : 'pk_test_')),
    detail: publicKey ? `${mode} key present` : `No ${mode} public key saved`,
  })
  if (!secretKey) return [...checks, { name: 'Secret key', ok: false, detail: `No ${mode} secret key saved` }]
  const { res, data } = await fetchJson('https://api.paystack.co/transaction?perPage=1', {
    headers: { Authorization: `Bearer ${secretKey}` },
  })
  checks.push({
    name: 'Secret key',
    ok: res.ok,
    detail: res.ok ? `Paystack accepted the ${mode} key` : String(data.message ?? `Paystack returned ${res.status}`),
  })
  return checks
}

async function testEmail(): Promise<Check[]> {
  const checks: Check[] = []
  const from = await getSetting('email.fromAddress')
  const domain = from?.match(/@([^>\s]+)/)?.[1]?.toLowerCase()
  checks.push({ name: 'Sender address', ok: Boolean(domain), detail: from ? from : 'No sender address saved' })

  const resendKey = await getSetting('resend.apiKey')
  if (!resendKey) checks.push({ name: 'Resend', ok: false, detail: 'No API key saved' })
  else {
    const { res, data } = await fetchJson('https://api.resend.com/domains', { headers: { Authorization: `Bearer ${resendKey}` } })
    if (!res.ok && /restricted to only send/i.test(String(data.message))) {
      // Sending-only keys can't list domains; that is the recommended key type, not a failure
      checks.push({
        name: 'Resend',
        ok: true,
        detail: 'Sending-only key (recommended). Use "Send a test email" in Email log to confirm delivery.',
      })
    } else if (!res.ok) checks.push({ name: 'Resend', ok: false, detail: String(data.message ?? `Resend returned ${res.status}`) })
    else {
      const list = (data.data as { name: string; status: string }[] | undefined) ?? []
      const match = list.find((d) => d.name.toLowerCase() === domain)
      checks.push({
        name: 'Resend',
        ok: match?.status === 'verified',
        detail: match ? `Domain ${match.name} is ${match.status}` : `Key works, but ${domain ?? 'the sender domain'} is not added in Resend`,
      })
    }
  }

  const brevoKey = await getSetting('brevo.apiKey')
  if (!brevoKey) checks.push({ name: 'Brevo', ok: false, detail: 'No API key saved' })
  else {
    const { res, data } = await fetchJson('https://api.brevo.com/v3/senders', { headers: { 'api-key': brevoKey, accept: 'application/json' } })
    if (!res.ok) checks.push({ name: 'Brevo', ok: false, detail: String(data.message ?? `Brevo returned ${res.status}`) })
    else {
      const senders = (data.senders as { email: string; active: boolean }[] | undefined) ?? []
      const match = senders.find((s) => s.email.toLowerCase() === from?.match(/[^<\s]+@[^>\s]+/)?.[0]?.toLowerCase())
      checks.push({
        name: 'Brevo',
        ok: Boolean(match?.active),
        detail: match ? (match.active ? `Sender ${match.email} is active` : `Sender ${match.email} is not yet verified`) : 'Key works, but the sender address is not added in Brevo',
      })
    }
  }
  return checks
}

async function testMusic(): Promise<Check[]> {
  const checks: Check[] = []
  const [clientId, clientSecret, artistRaw, ytKey, ytRaw] = await Promise.all([
    getSetting('spotify.clientId'),
    getSetting('spotify.clientSecret'),
    getSetting('spotify.artistId'),
    getSetting('youtube.apiKey'),
    getSetting('youtube.channelId'),
  ])

  const artistId = parseSpotifyArtistId(artistRaw)
  if (!clientId || !clientSecret) checks.push({ name: 'Spotify', ok: false, detail: 'Client ID and secret are needed' })
  else {
    const { res, data } = await fetchJson('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    if (!res.ok) checks.push({ name: 'Spotify', ok: false, detail: String(data.error_description ?? 'Spotify rejected the client ID/secret') })
    else if (!artistId) checks.push({ name: 'Spotify', ok: false, detail: 'Credentials work; add the artist link' })
    else {
      const a = await fetchJson(`https://api.spotify.com/v1/artists/${artistId}`, { headers: { Authorization: `Bearer ${data.access_token}` } })
      checks.push({ name: 'Spotify', ok: a.res.ok, detail: a.res.ok ? `Artist: ${a.data.name}` : 'Artist not found' })
    }
  }

  const channel = parseYouTubeChannel(ytRaw)
  if (!ytKey) checks.push({ name: 'YouTube', ok: false, detail: 'No API key saved' })
  else if (!channel) checks.push({ name: 'YouTube', ok: false, detail: 'Add the channel link, @handle or ID' })
  else {
    const q = channel.id ? `id=${channel.id}` : `forHandle=${encodeURIComponent(channel.handle!)}`
    const { res, data } = await fetchJson(`https://www.googleapis.com/youtube/v3/channels?part=snippet&${q}&key=${ytKey}`, {
      headers: youtubeHeaders(),
    })
    const item = (data.items as { snippet: { title: string } }[] | undefined)?.[0]
    checks.push({
      name: 'YouTube',
      ok: res.ok && Boolean(item),
      detail: !res.ok
        ? youtubeErrorMessage(String((data.error as { message?: string } | undefined)?.message ?? `YouTube returned ${res.status}`))
        : item
          ? `Channel: ${item.snippet.title}`
          : 'Channel not found',
    })
  }
  return checks
}

const TESTS: Record<string, () => Promise<Check[]>> = { paystack: testPaystack, email: testEmail, music: testMusic }

export async function POST(_req: Request, { params }: { params: Promise<{ service: string }> }) {
  const gate = await requireAdminApi('settings')
  if (gate instanceof NextResponse) return gate
  const { service } = await params
  const run = TESTS[service]
  if (!run) return NextResponse.json({ error: 'Unknown service' }, { status: 404 })
  try {
    return NextResponse.json({ checks: await run() })
  } catch (e) {
    const msg = e instanceof Error && e.name === 'TimeoutError' ? 'The service did not respond in time.' : 'The test could not run.'
    return NextResponse.json({ checks: [{ name: service, ok: false, detail: msg }] })
  }
}
