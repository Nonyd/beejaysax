'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import AdminInput from '@/components/admin/AdminInput'

type Summary = { rows: number; invalid: number; fixed: number; duplicatesInFile: number; added: number; alreadyOnList: number }

async function postJson(body: Record<string, unknown>) {
  const res = await fetch('/api/admin/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'That didn’t work.')
  return data
}

const card = 'rounded-[20px] border border-ivory/12 bg-ink p-6'
const goldBtn = 'inline-flex shrink-0 items-center justify-center gap-2 bg-gold px-5 py-3 text-[14px] font-semibold text-night disabled:opacity-60'
const ghostBtn = 'inline-flex items-center justify-center gap-2 border border-ivory/20 px-5 py-3 text-[14px] text-ivory disabled:opacity-60'

function TagsInput({ value, onChange, tags, id }: { value: string; onChange: (v: string) => void; tags: string[]; id: string }) {
  return (
    <>
      <AdminInput list={`${id}-tags`} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Tags, comma separated (e.g. Concert 2025 buyers)" aria-label="Tags" />
      <datalist id={`${id}-tags`}>
        {tags.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </>
  )
}

export default function ContactsTools({ tags }: { tags: string[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [importTags, setImportTags] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [busy, setBusy] = useState<'' | 'check' | 'import' | 'add'>('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [addTags, setAddTags] = useState('')

  async function upload(dryRun: boolean) {
    if (!file) return
    setBusy(dryRun ? 'check' : 'import')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('tags', importTags)
      if (dryRun) form.append('dryRun', '1')
      const res = await fetch('/api/admin/contacts', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Import failed.')
      if (dryRun) setSummary(data.summary)
      else {
        toast.success(`Imported: ${data.summary.added.toLocaleString()} added, ${data.summary.alreadyOnList.toLocaleString()} already on the list`)
        setSummary(null)
        setFile(null)
        if (fileRef.current) fileRef.current.value = ''
        router.refresh()
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import failed.')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className={card}>
        <p className="font-display text-xl text-ivory">Import a spreadsheet</p>
        <p className="mt-1 mb-4 text-[14px] text-ivory/65">
          Excel (.xlsx) or CSV with an email column, and optionally a name column. Duplicates are skipped and obvious typos like “gmail.con” are fixed.
          People who unsubscribed stay unsubscribed.
        </p>
        <div className="flex flex-col gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.csv"
            aria-label="Spreadsheet file"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setSummary(null)
            }}
            className="text-[14px] text-ivory/80 file:mr-4 file:border-0 file:bg-night file:px-4 file:py-2.5 file:text-ivory"
          />
          <TagsInput id="import" value={importTags} onChange={(v) => (setImportTags(v), setSummary(null))} tags={tags} />
          {summary ? (
            <div className="rounded-[14px] bg-night p-4 text-[14px] text-ivory/85">
              <p>
                <strong className="text-ivory">{summary.added.toLocaleString()} new people</strong> will be added
                {summary.alreadyOnList ? `, ${summary.alreadyOnList.toLocaleString()} already on the list will get the tags` : ''}.
              </p>
              <p className="mt-1 text-[13px] text-ivory/60">
                {summary.rows.toLocaleString()} rows · {summary.duplicatesInFile.toLocaleString()} repeated in the file · {summary.fixed.toLocaleString()} typos fixed ·{' '}
                {summary.invalid.toLocaleString()} not valid emails
              </p>
              <div className="mt-3 flex gap-2">
                <button type="button" className={goldBtn} disabled={!!busy} onClick={() => upload(false)}>
                  {busy === 'import' && <Loader2 className="h-4 w-4 animate-spin" />}Import {summary.added.toLocaleString()} people
                </button>
                <button type="button" className={ghostBtn} disabled={!!busy} onClick={() => setSummary(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className={`${goldBtn} self-start`} disabled={!file || !!busy} onClick={() => upload(true)}>
              {busy === 'check' && <Loader2 className="h-4 w-4 animate-spin" />}Check file
            </button>
          )}
        </div>
      </div>

      <form
        className={card}
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy('add')
          try {
            const r = await postJson({ action: 'add', email, name, tags: addTags })
            toast.success(r.fixed ? `Added as ${r.fixed}` : 'Added')
            setEmail('')
            setName('')
            router.refresh()
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Not added')
          } finally {
            setBusy('')
          }
        }}
      >
        <p className="font-display text-xl text-ivory">Add one person</p>
        <p className="mt-1 mb-4 text-[14px] text-ivory/65">They’re added as subscribed. Only add people who agreed to hear from you.</p>
        <div className="flex flex-col gap-3">
          <AdminInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" aria-label="Email address" />
          <AdminInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" aria-label="Name" />
          <TagsInput id="add" value={addTags} onChange={setAddTags} tags={tags} />
          <button type="submit" className={`${goldBtn} self-start`} disabled={busy === 'add'}>
            {busy === 'add' && <Loader2 className="h-4 w-4 animate-spin" />}Add to list
          </button>
        </div>
      </form>
    </div>
  )
}

export function ContactRowActions({ id, email, name: initialName, tags: initialTags, status }: { id: string; email: string; name: string; tags: string[]; status: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialName)
  const [tags, setTags] = useState(initialTags.join(', '))
  const [busy, setBusy] = useState(false)

  async function run(body: Record<string, unknown>, done: string) {
    setBusy(true)
    try {
      await postJson({ id, ...body })
      toast.success(done)
      setOpen(false)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'That didn’t work.')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[13px] text-gold underline">
        Edit
      </button>
    )
  }
  return (
    <div className="ml-auto flex w-[280px] flex-col gap-2 text-left">
      <AdminInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" aria-label={`Name for ${email}`} />
      <AdminInput value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags, comma separated" aria-label={`Tags for ${email}`} />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} className={goldBtn} onClick={() => run({ action: 'update', name, tags }, 'Saved')}>
          Save
        </button>
        {status === 'SUBSCRIBED' ? (
          <button type="button" disabled={busy} className={ghostBtn} onClick={() => run({ action: 'update', status: 'UNSUBSCRIBED' }, 'Unsubscribed')}>
            Unsubscribe
          </button>
        ) : status === 'UNSUBSCRIBED' ? (
          <button type="button" disabled={busy} className={ghostBtn} onClick={() => run({ action: 'update', status: 'SUBSCRIBED' }, 'Resubscribed')}>
            Resubscribe
          </button>
        ) : null}
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          disabled={busy}
          className="text-[13px] text-danger underline"
          onClick={() => confirm(`Delete ${email} from the mailing list? This can’t be undone.`) && run({ action: 'delete' }, 'Deleted')}
        >
          Delete
        </button>
        <button type="button" className="text-[13px] text-ivory/70 underline" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
    </div>
  )
}
