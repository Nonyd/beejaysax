'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowDown, ArrowUp, Loader2, Plus, RotateCcw, Trash2 } from 'lucide-react'
import AdminSectionCard from '@/components/admin/AdminSectionCard'
import AdminFormField from '@/components/admin/AdminFormField'
import AdminInput from '@/components/admin/AdminInput'
import AdminTextarea from '@/components/admin/AdminTextarea'
import CloudinaryUpload from '@/components/admin/CloudinaryUpload'
import type { Field, ScalarField } from '@/lib/content/registry'

type Values = Record<string, unknown>

function Help({ f }: { f: Field }) {
  const empty = f.type !== 'list' ? 'Leave empty to use the original.' : null
  const text = [f.help, empty].filter(Boolean).join(' ')
  return text ? <p className="mt-1.5 text-[12px] text-[rgba(247,241,227,0.55)]">{text}</p> : null
}

function ScalarInput({ f, value, onChange, id }: { f: ScalarField; value: unknown; onChange: (v: unknown) => void; id: string }) {
  switch (f.type) {
    case 'text':
    case 'url':
      return (
        <AdminInput
          id={id}
          type={f.type === 'url' ? 'url' : 'text'}
          value={String(value ?? '')}
          maxLength={f.type === 'text' ? f.max : undefined}
          placeholder={f.type === 'url' ? 'https://…' : f.default}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'textarea': {
      const s = String(value ?? '')
      return (
        <>
          <AdminTextarea id={id} rows={f.rows ?? 4} value={s} maxLength={f.max} onChange={(e) => onChange(e.target.value)} className="resize-y" />
          {f.max && s.length > f.max * 0.8 && (
            <p className="mt-1 text-right text-[12px] text-[rgba(247,241,227,0.55)]">
              {s.length} / {f.max}
            </p>
          )}
        </>
      )
    }
    case 'lines':
      return (
        <AdminTextarea
          id={id}
          rows={Math.max(2, (value as string[] | undefined)?.length ?? 2)}
          value={((value as string[]) ?? []).join('\n')}
          onChange={(e) => onChange(e.target.value.split('\n'))}
          placeholder={f.default.join('\n')}
        />
      )
    case 'image': {
      const src = String(value ?? '')
      return (
        <div className="flex flex-wrap items-start gap-4">
          {src && (
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[12px] bg-[#11142F]">
              {/* plain img: the link may not be saved/validated yet */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="min-w-[220px] flex-1 space-y-2">
            <CloudinaryUpload folder="beejaysax/site" label="Upload a photo" aspectRatio="free" onUpload={(url) => onChange(url)} />
            <AdminInput value={src} onChange={(e) => onChange(e.target.value)} placeholder="…or paste an image link (https://)" aria-label="Image link" />
          </div>
        </div>
      )
    }
  }
}

export default function ContentEditor({ sectionKey, fields, initial }: { sectionKey: string; fields: Record<string, Field>; initial: Values }) {
  const router = useRouter()
  const [values, setValues] = useState<Values>(initial)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: unknown) => {
    setValues((s) => ({ ...s, [k]: v }))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/content/${sectionKey}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setValues(data.values)
      setDirty(false)
      toast.success('Saved. The website is updated.')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Not saved.')
    } finally {
      setSaving(false)
    }
  }

  async function reset() {
    if (!confirm('Put back the original text and photos for this whole section?')) return
    const res = await fetch(`/api/admin/content/${sectionKey}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) {
      setValues(data.values)
      setDirty(false)
      toast.success('Original content restored')
      router.refresh()
    }
  }

  const scalars = Object.entries(fields).filter(([, f]) => f.type !== 'list')
  const lists = Object.entries(fields).filter(([, f]) => f.type === 'list') as [string, Extract<Field, { type: 'list' }>][]

  return (
    <div className="mx-auto max-w-[860px] pb-28">
      {scalars.length > 0 && (
        <AdminSectionCard title="Text & photos">
          {scalars.map(([k, f]) => (
            <div key={k}>
              <AdminFormField label={f.label}>
                <ScalarInput id={`f-${k}`} f={f as ScalarField} value={values[k]} onChange={(v) => set(k, v)} />
              </AdminFormField>
              <Help f={f} />
            </div>
          ))}
        </AdminSectionCard>
      )}

      {lists.map(([k, f]) => {
        const rows = (values[k] as Values[]) ?? []
        const update = (next: Values[]) => set(k, next)
        const move = (i: number, d: -1 | 1) => {
          const j = i + d
          if (j < 0 || j >= rows.length) return
          const n = [...rows]
          ;[n[i], n[j]] = [n[j], n[i]]
          update(n)
        }
        const itemEntries = Object.entries(f.item)
        return (
          <AdminSectionCard key={k} title={f.label} description={f.help}>
            <ol className="space-y-3">
              {rows.map((row, i) => (
                <li key={i} className="rounded-[16px] border border-[rgba(247,241,227,0.14)] bg-[#11142F] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-[rgba(247,241,227,0.75)]">
                      {f.itemLabel} {i + 1}
                    </p>
                    <div className="flex items-center gap-1">
                      <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="p-2 text-[rgba(247,241,227,0.7)] disabled:opacity-30">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="p-2 text-[rgba(247,241,227,0.7)] disabled:opacity-30">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label={`Remove ${f.itemLabel.toLowerCase()}`} onClick={() => update(rows.filter((_, j) => j !== i))} className="p-2 text-[#f87171]">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className={itemEntries.length > 1 && itemEntries.every(([, s]) => s.type === 'text' || s.type === 'url') ? 'grid gap-3 sm:grid-cols-2' : 'space-y-3'}>
                    {itemEntries.map(([sk, sf]) => (
                      <AdminFormField key={sk} label={sf.label}>
                        <ScalarInput
                          id={`f-${k}-${i}-${sk}`}
                          f={sf}
                          value={row[sk]}
                          onChange={(v) => update(rows.map((r, j) => (j === i ? { ...r, [sk]: v } : r)))}
                        />
                      </AdminFormField>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
            {(!f.maxItems || rows.length < f.maxItems) && (
              <button
                type="button"
                onClick={() => update([...rows, Object.fromEntries(itemEntries.map(([sk, sf]) => [sk, sf.type === 'lines' ? [] : '']))])}
                className="inline-flex items-center gap-2 self-start border border-[rgba(247,241,227,0.25)] px-5 py-2.5 font-semibold text-[#F7F1E3] hover:border-[#E3B23C]"
              >
                <Plus className="h-4 w-4" /> Add {f.itemLabel.toLowerCase()}
              </button>
            )}
          </AdminSectionCard>
        )
      })}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[rgba(247,241,227,0.12)] bg-[#11142F]/95 backdrop-blur md:left-[280px]">
        <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-end gap-3 px-6 py-4">
          <button type="button" onClick={reset} className="mr-auto inline-flex items-center gap-2 text-[14px] text-[rgba(247,241,227,0.7)] underline">
            <RotateCcw className="h-4 w-4" /> Restore original
          </button>
          {dirty && <span className="text-[13px] text-[#f0a35e]">Unsaved changes</span>}
          <button type="button" onClick={save} disabled={saving || !dirty} className="inline-flex items-center gap-2 bg-[#E3B23C] px-7 py-3 font-semibold text-[#11142F] disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
