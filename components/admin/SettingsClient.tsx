'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Check, Copy, Loader2, X } from 'lucide-react'
import AdminSectionCard from '@/components/admin/AdminSectionCard'
import AdminFormField from '@/components/admin/AdminFormField'
import AdminInput from '@/components/admin/AdminInput'
import AdminSelect from '@/components/admin/AdminSelect'
import type { SettingGroup, SettingView } from '@/lib/settings'

type Group = { id: SettingGroup; title: string; description: string; test?: string }
type CheckResult = { name: string; ok: boolean; detail: string }

const SOURCE_LABEL: Record<SettingView['source'], string> = {
  db: 'Saved here',
  env: 'From server environment',
  default: 'Default',
  none: 'Not set',
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-ivory/75">{label}</span>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-[10px] border border-ivory/14 bg-night px-3 py-2.5 text-[13px] text-ivory">
          {value}
        </code>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(value).then(() => toast.success('Copied'))}
          className="flex h-10 w-10 shrink-0 items-center justify-center border border-ivory/20 text-ivory hover:border-gold hover:text-gold"
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function SettingsClient({
  initial,
  groups,
  siteUrl,
}: {
  initial: SettingView[]
  groups: Group[]
  siteUrl: string
}) {
  const [settings, setSettings] = useState(initial)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<SettingGroup | null>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, CheckResult[]>>({})

  const byGroup = useMemo(() => {
    const m = new Map<SettingGroup, SettingView[]>()
    for (const s of settings) m.set(s.group, [...(m.get(s.group) ?? []), s])
    return m
  }, [settings])

  const brevoToken = draft['brevo.webhookSecret']
  const webhookUrls: Partial<Record<SettingGroup, { label: string; value: string }[]>> = {
    payments: [{ label: 'Paystack webhook URL (paste in Paystack → Settings → API Keys & Webhooks)', value: `${siteUrl}/api/webhooks/paystack` }],
    email: [
      { label: 'Resend webhook URL (events: delivered, bounced, complained)', value: `${siteUrl}/api/webhooks/resend` },
      {
        label: 'Brevo webhook URL (transactional: delivered, hard bounce, spam, blocked)',
        value: `${siteUrl}/api/webhooks/brevo?token=${brevoToken && !brevoToken.startsWith('••') ? brevoToken : '<your Brevo webhook token>'}`,
      },
    ],
    jobs: [
      { label: 'Jobs endpoint (call every 15 minutes)', value: `${siteUrl}/api/jobs/run` },
      { label: 'Example crontab line', value: `*/15 * * * * curl -fsS -H "Authorization: Bearer <token>" ${siteUrl}/api/jobs/run` },
    ],
  }

  async function save(group: SettingGroup) {
    const keys = (byGroup.get(group) ?? []).map((s) => s.key)
    const values = Object.fromEntries(Object.entries(draft).filter(([k]) => keys.includes(k)))
    if (Object.keys(values).length === 0) {
      toast('No changes to save')
      return
    }
    setSaving(group)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Settings could not be saved.')
      setSettings(data.settings)
      setDraft((d) => Object.fromEntries(Object.entries(d).filter(([k]) => !keys.includes(k))))
      toast.success('Settings saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Settings could not be saved.')
    } finally {
      setSaving(null)
    }
  }

  async function clearValue(key: string) {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: {}, clear: [key] }),
    })
    const data = await res.json()
    if (res.ok) {
      setSettings(data.settings)
      toast.success('Removed')
    } else toast.error(data.error ?? 'Could not remove the value.')
  }

  async function runTest(service: string) {
    setTesting(service)
    try {
      const res = await fetch(`/api/admin/settings/test/${service}`, { method: 'POST' })
      const data = await res.json()
      setResults((r) => ({ ...r, [service]: data.checks ?? [] }))
    } catch {
      setResults((r) => ({ ...r, [service]: [{ name: service, ok: false, detail: 'The test could not run.' }] }))
    } finally {
      setTesting(null)
    }
  }

  return (
    <div className="mx-auto max-w-[860px]">
      {groups.map((g) => {
        const fields = byGroup.get(g.id) ?? []
        const dirty = fields.some((f) => draft[f.key] !== undefined)
        return (
          <AdminSectionCard key={g.id} title={g.title} description={g.description}>
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((f) => {
                const value = draft[f.key] ?? (f.secret ? '' : f.value)
                return (
                  <div key={f.key} className={f.help || f.secret ? 'sm:col-span-2' : undefined}>
                    <AdminFormField label={f.label}>
                      {f.options ? (
                        <AdminSelect
                          options={f.options}
                          value={value || f.default || f.options[0].value}
                          onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                        />
                      ) : (
                        <AdminInput
                          type={f.secret ? 'password' : 'text'}
                          autoComplete="off"
                          spellCheck={false}
                          placeholder={f.secret && f.isSet ? `${f.value} (leave blank to keep)` : f.placeholder}
                          value={value}
                          onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                        />
                      )}
                    </AdminFormField>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[12px] text-ivory/55">
                      <span className={f.source === 'none' ? 'text-warn' : undefined}>{SOURCE_LABEL[f.source]}</span>
                      {f.help && <span>{f.help}</span>}
                      {f.source === 'db' && !f.options && (
                        <button type="button" onClick={() => clearValue(f.key)} className="text-gold underline">
                          Remove saved value
                        </button>
                      )}
                    </p>
                  </div>
                )
              })}
            </div>

            {webhookUrls[g.id] && (
              <div className="mt-6 space-y-4 border-t border-ivory/12 pt-6">
                {webhookUrls[g.id]!.map((w) => (
                  <CopyRow key={w.label} label={w.label} value={w.value} />
                ))}
              </div>
            )}

            {g.test && results[g.test] && (
              <ul className="mt-6 space-y-2 rounded-[14px] bg-night p-4" aria-live="polite">
                {results[g.test].map((c) => (
                  <li key={c.name} className="flex items-start gap-3 text-[14px]">
                    {c.ok ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="Passed" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-label="Failed" />
                    )}
                    <span>
                      <strong className="font-semibold text-ivory">{c.name}:</strong>{' '}
                      <span className="text-ivory/75">{c.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => save(g.id)}
                disabled={saving === g.id || !dirty}
                className="inline-flex items-center gap-2 bg-gold px-6 py-3 font-semibold text-night disabled:opacity-50"
              >
                {saving === g.id && <Loader2 className="h-4 w-4 animate-spin" />}
                Save {g.title.split(' ')[0].toLowerCase()} settings
              </button>
              {g.test && (
                <button
                  type="button"
                  onClick={() => runTest(g.test!)}
                  disabled={testing === g.test || dirty}
                  title={dirty ? 'Save your changes first' : undefined}
                  className="inline-flex items-center gap-2 border border-ivory/25 px-6 py-3 font-semibold text-ivory hover:border-gold disabled:opacity-50"
                >
                  {testing === g.test && <Loader2 className="h-4 w-4 animate-spin" />}
                  Test connection
                </button>
              )}
            </div>
          </AdminSectionCard>
        )
      })}
    </div>
  )
}
