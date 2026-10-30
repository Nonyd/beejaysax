'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import AdminInput from '@/components/admin/AdminInput'
import AdminTextarea from '@/components/admin/AdminTextarea'
import ImageUpload from '@/components/admin/ImageUpload'
import { campaignEmail } from '@/lib/email/templates'
import type { CampaignStats } from '@/lib/mailing/campaigns'

type Fields = {
  subject: string
  preheader: string
  heading: string
  body: string
  imageUrl: string
  buttonLabel: string
  buttonUrl: string
  audienceTag: string
}
type Campaign = Fields & { id: string; status: string }
type Audience = { tag: string; label: string; size: number }

async function api(body: Record<string, unknown>) {
  const res = await fetch('/api/admin/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'That didn’t work.')
  return data
}

const goldBtn = 'inline-flex items-center justify-center gap-2 bg-gold px-5 py-3 text-[14px] font-semibold text-night disabled:opacity-60'
const ghostBtn = 'inline-flex items-center justify-center gap-2 border border-ivory/20 px-5 py-3 text-[14px] text-ivory disabled:opacity-60'
const label = 'mb-1.5 block text-[13px] font-semibold text-ivory/80'
const help = 'mt-1.5 text-[12px] text-ivory/55'

export function NewCampaignButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return (
    <button
      type="button"
      className={goldBtn}
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        try {
          const { id } = await api({ action: 'create' })
          router.push(`/admin/campaigns/${id}`)
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Couldn’t create a campaign.')
          setBusy(false)
        }
      }}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}New campaign
    </button>
  )
}

export default function CampaignEditor({
  campaign,
  audiences,
  stats: initialStats,
  failures,
}: {
  campaign: Campaign
  audiences: Audience[]
  stats: CampaignStats | null
  failures: { email: string; status: string; error: string | null }[]
}) {
  const router = useRouter()
  const draft = campaign.status === 'DRAFT'
  const [f, setF] = useState<Fields>(campaign)
  const [saved, setSaved] = useState(JSON.stringify(campaign))
  const [busy, setBusy] = useState<'' | 'save' | 'test' | 'send' | 'other'>('')
  const [testTo, setTestTo] = useState('')
  const [status, setStatus] = useState(campaign.status)
  const [stats, setStats] = useState(initialStats)
  const dirty = draft && JSON.stringify({ ...campaign, ...f }) !== saved
  const set = (k: keyof Fields) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }))

  const preview = useMemo(
    () => campaignEmail({ ...f, subject: f.subject || 'Subject', body: f.body || 'Your message appears here.' }, { name: 'Ada Okafor', unsubscribeUrl: '#' }),
    [f]
  )

  async function save(quiet = false) {
    setBusy('save')
    try {
      await api({ action: 'save', id: campaign.id, ...f })
      setSaved(JSON.stringify({ ...campaign, ...f }))
      if (!quiet) toast.success('Draft saved')
      return true
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Not saved')
      return false
    } finally {
      setBusy('')
    }
  }

  // While a send is running, keep it moving and show progress (the scheduled jobs also finish it if this page closes).
  const pumping = useRef(false)
  useEffect(() => {
    if (status !== 'SENDING') return
    let stop = false
    const tick = async () => {
      if (stop || pumping.current) return
      pumping.current = true
      try {
        const r = await api({ action: 'pump', id: campaign.id })
        if (r.stats) setStats(r.stats)
        if (r.status && r.status !== 'SENDING') {
          setStatus(r.status)
          router.refresh()
        }
        if (r.progress?.error) toast.error(r.progress.error)
      } catch {
        /* try again on the next tick */
      } finally {
        pumping.current = false
      }
    }
    tick()
    const t = setInterval(tick, 3000)
    return () => {
      stop = true
      clearInterval(t)
    }
  }, [status, campaign.id, router])

  const audience = audiences.find((a) => a.tag === f.audienceTag) ?? audiences[0]

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,620px)]">
      <div className="flex flex-col gap-6">
        {stats && <Progress stats={stats} status={status} />}

        <fieldset disabled={!draft} className="flex flex-col gap-5 rounded-[20px] border border-ivory/12 bg-ink p-6 disabled:opacity-80">
          <div>
            <label htmlFor="c-subject" className={label}>
              Subject line
            </label>
            <AdminInput id="c-subject" value={f.subject} onChange={set('subject')} maxLength={200} placeholder="BeeJay Sax Live Concert 2027: tickets are out" />
          </div>
          <div>
            <label htmlFor="c-preheader" className={label}>
              Preview text (optional)
            </label>
            <AdminInput id="c-preheader" value={f.preheader} onChange={set('preheader')} maxLength={200} placeholder="Shown after the subject in most inboxes" />
          </div>
          <div>
            <p className={label}>Photo (optional)</p>
            <ImageUpload folder="campaigns" label="Upload a photo" currentUrl={f.imageUrl || undefined} onUpload={(url) => setF((x) => ({ ...x, imageUrl: url }))} />
            {f.imageUrl && (
              <button type="button" className="mt-2 text-[13px] text-gold underline" onClick={() => setF((x) => ({ ...x, imageUrl: '' }))}>
                Remove photo
              </button>
            )}
          </div>
          <div>
            <label htmlFor="c-heading" className={label}>
              Heading (optional)
            </label>
            <AdminInput id="c-heading" value={f.heading} onChange={set('heading')} maxLength={200} placeholder="Hello {{name}}!" />
          </div>
          <div>
            <label htmlFor="c-body" className={label}>
              Message
            </label>
            <AdminTextarea id="c-body" value={f.body} onChange={set('body')} rows={12} placeholder={'Leave a blank line between paragraphs.\n\nWrite **like this** for bold. Links starting with https:// become clickable.'} />
            <p className={help}>
              <code>{'{{name}}'}</code> becomes each person’s first name (or “friend” if we don’t know it).
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="c-btn" className={label}>
                Button text (optional)
              </label>
              <AdminInput id="c-btn" value={f.buttonLabel} onChange={set('buttonLabel')} maxLength={60} placeholder="Get tickets" />
            </div>
            <div>
              <label htmlFor="c-url" className={label}>
                Button link
              </label>
              <AdminInput id="c-url" value={f.buttonUrl} onChange={set('buttonUrl')} maxLength={500} placeholder="https://beejaysax.com/events" />
            </div>
          </div>
          <div>
            <label htmlFor="c-aud" className={label}>
              Send to
            </label>
            <select
              id="c-aud"
              value={f.audienceTag}
              onChange={set('audienceTag')}
              className="w-full rounded-[12px] border border-ivory/16 bg-night px-4 py-3 text-sm text-ivory"
            >
              {audiences.map((a) => (
                <option key={a.tag} value={a.tag}>
                  {a.label} ({a.size.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {draft ? (
          <>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={ghostBtn} disabled={!!busy || !dirty} onClick={() => save()}>
                {busy === 'save' && <Loader2 className="h-4 w-4 animate-spin" />}
                {dirty ? 'Save draft' : 'Saved'}
              </button>
              <button
                type="button"
                className="text-[13px] text-danger underline"
                disabled={!!busy}
                onClick={async () => {
                  if (!confirm('Delete this draft?')) return
                  try {
                    await api({ action: 'delete', id: campaign.id })
                    router.push('/admin/campaigns')
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Not deleted')
                  }
                }}
              >
                Delete draft
              </button>
            </div>

            <form
              className="rounded-[20px] border border-ivory/12 bg-ink p-6"
              onSubmit={async (e) => {
                e.preventDefault()
                setBusy('test')
                try {
                  const r = await api({ action: 'test', id: campaign.id, to: testTo, ...f })
                  toast.success(`Test sent to ${testTo} with ${r.provider}`)
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Not sent')
                } finally {
                  setBusy('')
                }
              }}
            >
              <p className="font-display text-xl text-ivory">1. Send yourself a test</p>
              <p className="mt-1 mb-4 text-[14px] text-ivory/65">Check it on your phone before it goes to everyone.</p>
              <div className="flex gap-2">
                <AdminInput type="email" required value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" aria-label="Test recipient" />
                <button type="submit" disabled={!!busy} className={`${goldBtn} shrink-0`}>
                  {busy === 'test' && <Loader2 className="h-4 w-4 animate-spin" />}Send test
                </button>
              </div>
            </form>

            <div className="rounded-[20px] border border-gold/40 bg-ink p-6">
              <p className="font-display text-xl text-ivory">2. Send to the list</p>
              <p className="mt-1 mb-4 text-[14px] text-ivory/65">
                Goes to {audience.label.toLowerCase() === 'everyone subscribed' ? 'everyone subscribed' : `everyone tagged “${audience.label}”`}. People who
                unsubscribed, bounced or marked you as spam are skipped automatically.
              </p>
              <button
                type="button"
                className={goldBtn}
                disabled={!!busy}
                onClick={async () => {
                  if (!f.subject.trim() || !f.body.trim()) return toast.error('Add a subject and a message first.')
                  setBusy('send')
                  try {
                    if (dirty && !(await save(true))) return
                    const { size } = await api({ action: 'audience', tag: f.audienceTag })
                    if (!size) return toast.error('Nobody on the list matches this audience.')
                    if (!confirm(`Send “${f.subject}” to ${size.toLocaleString()} people now? This can’t be undone.`)) return
                    const r = await api({ action: 'send', id: campaign.id })
                    toast.success(`Sending to ${r.recipients.toLocaleString()} people`)
                    setStatus('SENDING')
                    router.refresh()
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Not sent')
                  } finally {
                    setBusy('')
                  }
                }}
              >
                {busy === 'send' && <Loader2 className="h-4 w-4 animate-spin" />}Send to {audience.size.toLocaleString()} people
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={ghostBtn}
              disabled={!!busy}
              onClick={async () => {
                setBusy('other')
                try {
                  const { id } = await api({ action: 'duplicate', id: campaign.id })
                  router.push(`/admin/campaigns/${id}`)
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Couldn’t duplicate')
                  setBusy('')
                }
              }}
            >
              Duplicate as new draft
            </button>
            {status === 'SENDING' && (
              <button
                type="button"
                className="text-[13px] text-danger underline"
                onClick={async () => {
                  if (!confirm('Stop sending? People not emailed yet won’t get it.')) return
                  await api({ action: 'cancel', id: campaign.id }).catch(() => null)
                  setStatus('CANCELLED')
                  router.refresh()
                }}
              >
                Stop sending
              </button>
            )}
          </div>
        )}

        {failures.length > 0 && (
          <div className="rounded-[20px] border border-ivory/12 bg-ink p-6">
            <p className="font-display text-xl text-ivory">Not delivered</p>
            <ul className="mt-3 space-y-2 text-[13px]">
              {failures.map((x) => (
                <li key={x.email}>
                  <span className="text-ivory">{x.email}</span>{' '}
                  <span className="text-ivory/55">
                    {x.status === 'COMPLAINED' ? 'marked as spam' : x.status.toLowerCase()}
                    {x.error ? `: ${x.error}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <p className="mb-2 text-[13px] font-semibold text-ivory/60">
          Preview <span className="font-normal">(as Ada Okafor would see it)</span>
        </p>
        <div className="rounded-[14px] border border-ivory/12 bg-ink px-4 py-3 text-[14px]">
          <p className="truncate font-semibold text-ivory">{preview.subject}</p>
          <p className="truncate text-[13px] text-ivory/60">{f.preheader || f.body.slice(0, 120) || 'Preview text'}</p>
        </div>
        <iframe title="Email preview" srcDoc={preview.html} sandbox="" className="mt-3 h-[760px] w-full rounded-[14px] border border-ivory/12 bg-night" />
      </div>
    </div>
  )
}

function Progress({ stats, status }: { stats: CampaignStats; status: string }) {
  const done = stats.recipients ? Math.round(((stats.sent + stats.failed) / stats.recipients) * 100) : 0
  return (
    <div className="rounded-[20px] border border-ivory/12 bg-ink p-6" aria-live="polite">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-xl text-ivory">
          {status === 'SENDING' ? 'Sending…' : status === 'CANCELLED' ? 'Stopped' : 'Sent'}
        </p>
        <p className="text-[14px] text-ivory/70">{done}%</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-night">
        <div className="h-full bg-gold transition-[width] duration-500" style={{ width: `${done}%` }} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ['Sent', stats.sent],
          ['Delivered', stats.delivered],
          ['Bounced or spam', stats.bounced],
          ['Not sent', stats.failed],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-[12px] text-ivory/60">{k}</dt>
            <dd className="font-display text-[26px] leading-tight text-ivory">{Number(v).toLocaleString()}</dd>
          </div>
        ))}
      </dl>
      {status === 'SENDING' && stats.pending > 0 && (
        <p className="mt-3 text-[12px] text-ivory/55">{stats.pending.toLocaleString()} still to send. You can leave this page; sending continues in the background.</p>
      )}
    </div>
  )
}
