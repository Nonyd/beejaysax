// Server-only module: reads decrypted secrets. Never import from a client component.
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { decryptSecret, encryptSecret, maskSecret } from '@/lib/secret-box'

/**
 * Every admin-managed setting is declared here once. The admin Settings page, the
 * API and runtime lookups all read from this list. Lookup order: database, then env.
 */
export type SettingDef = {
  key: string
  label: string
  group: SettingGroup
  secret?: boolean
  env?: string
  help?: string
  placeholder?: string
  options?: { value: string; label: string }[]
  default?: string
}

export type SettingGroup = 'payments' | 'email' | 'music' | 'jobs'

export const SETTING_GROUPS: { id: SettingGroup; title: string; description: string; test?: string }[] = [
  {
    id: 'payments',
    title: 'Payments (Paystack)',
    description:
      'Keys from dashboard.paystack.com → Settings → API Keys & Webhooks. Use test keys until you are ready to sell real tickets, then switch the mode to Live.',
    test: 'paystack',
  },
  {
    id: 'email',
    title: 'Email',
    description:
      'Ticket, reminder and contact emails. The primary provider sends first; if it fails, the other one is tried automatically.',
    test: 'email',
  },
  {
    id: 'music',
    title: 'Music & video sync',
    description:
      'Pulls releases from Spotify (with Apple Music links found automatically) and videos from the YouTube channel.',
    test: 'music',
  },
  {
    id: 'jobs',
    title: 'Scheduled jobs',
    description:
      'Reminders, email retries and syncs run when the server calls the jobs endpoint. Set this token and use it in the server crontab.',
  },
]

export const SETTINGS: SettingDef[] = [
  // payments
  {
    key: 'payments.mode',
    label: 'Mode',
    group: 'payments',
    options: [
      { value: 'test', label: 'Test (no real money)' },
      { value: 'live', label: 'Live' },
    ],
    default: 'test',
  },
  { key: 'paystack.test.publicKey', label: 'Test public key', group: 'payments', placeholder: 'pk_test_…' },
  { key: 'paystack.test.secretKey', label: 'Test secret key', group: 'payments', secret: true, placeholder: 'sk_test_…' },
  { key: 'paystack.live.publicKey', label: 'Live public key', group: 'payments', env: 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY', placeholder: 'pk_live_…' },
  { key: 'paystack.live.secretKey', label: 'Live secret key', group: 'payments', secret: true, env: 'PAYSTACK_SECRET_KEY', placeholder: 'sk_live_…' },

  // email
  {
    key: 'email.primary',
    label: 'Primary provider',
    group: 'email',
    options: [
      { value: 'resend', label: 'Resend (Brevo as fallback)' },
      { value: 'brevo', label: 'Brevo (Resend as fallback)' },
    ],
    default: 'resend',
  },
  { key: 'email.fromName', label: 'Sender name', group: 'email', default: 'BeeJay Sax' },
  {
    key: 'email.fromAddress',
    label: 'Sender address',
    group: 'email',
    env: 'EMAIL_FROM',
    placeholder: 'tickets@beejaysax.com',
    help: 'Must be on a domain verified with both Resend and Brevo.',
  },
  { key: 'email.replyTo', label: 'Reply-to address', group: 'email', placeholder: 'booking@beejaysax.com' },
  { key: 'email.adminNotify', label: 'Admin notification address', group: 'email', env: 'ADMIN_EMAIL' },
  { key: 'resend.apiKey', label: 'Resend API key', group: 'email', secret: true, env: 'RESEND_API_KEY', placeholder: 're_…' },
  {
    key: 'resend.webhookSecret',
    label: 'Resend webhook signing secret',
    group: 'email',
    secret: true,
    env: 'RESEND_WEBHOOK_SECRET',
    placeholder: 'whsec_…',
  },
  { key: 'brevo.apiKey', label: 'Brevo API key', group: 'email', secret: true, env: 'BREVO_API_KEY', placeholder: 'xkeysib-…' },
  {
    key: 'brevo.webhookSecret',
    label: 'Brevo webhook token',
    group: 'email',
    secret: true,
    env: 'BREVO_WEBHOOK_SECRET',
    help: 'Any long random string. Add it to the Brevo webhook URL as ?token=… (shown below).',
  },

  // music
  { key: 'spotify.clientId', label: 'Spotify client ID', group: 'music', env: 'SPOTIFY_CLIENT_ID' },
  { key: 'spotify.clientSecret', label: 'Spotify client secret', group: 'music', secret: true, env: 'SPOTIFY_CLIENT_SECRET' },
  {
    key: 'spotify.artistId',
    label: 'Spotify artist ID or link',
    group: 'music',
    env: 'SPOTIFY_ARTIST_ID',
    help: 'Paste the artist page link from Spotify; the ID is taken from it.',
  },
  { key: 'youtube.apiKey', label: 'YouTube Data API key', group: 'music', secret: true, env: 'YOUTUBE_API_KEY' },
  {
    key: 'youtube.channelId',
    label: 'YouTube channel ID or handle',
    group: 'music',
    env: 'YOUTUBE_CHANNEL_ID',
    placeholder: '@beejaysax or UC…',
  },
  {
    key: 'sync.enabled',
    label: 'Daily automatic sync',
    group: 'music',
    options: [
      { value: 'off', label: 'Off (sync manually)' },
      { value: 'on', label: 'On' },
    ],
    default: 'off',
  },

  {
    key: 'campaigns.maxRecipients',
    label: 'Campaign size limit',
    group: 'email',
    options: [
      { value: '100', label: 'Up to 100 people per campaign (Resend free plan)' },
      { value: 'off', label: 'No limit (Resend Pro)' },
    ],
    default: '100',
    help: 'The free Resend plan sends about 100 emails a day. Keep the limit until you upgrade, so a big campaign can’t use up the allowance ticket emails need.',
  },

  // jobs
  {
    key: 'jobs.token',
    label: 'Jobs endpoint token',
    group: 'jobs',
    secret: true,
    env: 'CRON_SECRET',
    help: 'Long random string. The crontab sends it as: Authorization: Bearer <token>',
  },
]

const DEF_BY_KEY = new Map(SETTINGS.map((s) => [s.key, s]))

/** All stored rows, read once per request. */
const loadRows = cache(async () => {
  try {
    const rows = await prisma.siteSetting.findMany()
    return new Map(rows.map((r) => [r.key, r]))
  } catch {
    return new Map<string, { key: string; value: string; isSecret: boolean }>()
  }
})

export async function getSetting(key: string): Promise<string | undefined> {
  const def = DEF_BY_KEY.get(key)
  const row = (await loadRows()).get(key)
  if (row) {
    const v = row.isSecret ? decryptSecret(row.value) : row.value
    if (v) return v
  }
  const envVal = def?.env ? process.env[def.env]?.trim() : undefined
  return envVal || def?.default
}

export type SettingView = SettingDef & { value: string; isSet: boolean; source: 'db' | 'env' | 'default' | 'none' }

/** For the admin form: secrets are masked, never returned in full. */
export async function getSettingsForAdmin(): Promise<SettingView[]> {
  const rows = await loadRows()
  return SETTINGS.map((def) => {
    const row = rows.get(def.key)
    const dbVal = row ? (row.isSecret ? decryptSecret(row.value) : row.value) : null
    const envVal = def.env ? process.env[def.env]?.trim() : undefined
    const value = dbVal || envVal || def.default || ''
    const source = dbVal ? 'db' : envVal ? 'env' : def.default ? 'default' : 'none'
    return {
      ...def,
      value: def.secret ? maskSecret(value) : value,
      isSet: Boolean(dbVal || envVal),
      source,
    }
  })
}

/**
 * Save values from the admin form. For secrets, an empty string means "keep the current
 * value"; use `clear` to remove a stored value and fall back to env.
 */
export async function saveSettings(values: Record<string, string>, clear: string[], adminName?: string) {
  const ops = []
  for (const [k, raw] of Object.entries(values)) {
    const def = DEF_BY_KEY.get(k)
    if (!def) continue
    const value = raw.trim()
    if (def.secret && (value === '' || value.startsWith('••••'))) continue
    if (def.options && !def.options.some((o) => o.value === value)) continue
    if (value === '') {
      ops.push(prisma.siteSetting.deleteMany({ where: { key: k } }))
      continue
    }
    const stored = def.secret ? encryptSecret(value) : value
    ops.push(
      prisma.siteSetting.upsert({
        where: { key: k },
        create: { key: k, value: stored, isSecret: Boolean(def.secret), updatedBy: adminName },
        update: { value: stored, isSecret: Boolean(def.secret), updatedBy: adminName },
      })
    )
  }
  for (const k of clear) {
    if (DEF_BY_KEY.has(k)) ops.push(prisma.siteSetting.deleteMany({ where: { key: k } }))
  }
  await prisma.$transaction(ops)
}

/** Paystack keys for the active mode. */
export async function getPaystackKeys() {
  const mode = (await getSetting('payments.mode')) === 'live' ? 'live' : 'test'
  const [publicKey, secretKey] = await Promise.all([
    getSetting(`paystack.${mode}.publicKey`),
    getSetting(`paystack.${mode}.secretKey`),
  ])
  return { mode, publicKey, secretKey } as const
}
