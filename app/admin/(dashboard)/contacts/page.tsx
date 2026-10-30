import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ContactsTools, { ContactRowActions } from '@/components/admin/ContactsTools'
import { tagCounts } from '@/lib/mailing/contacts'
import { contactFilter } from '@/lib/mailing/filter'
import { fmt } from '@/lib/time'

export const dynamic = 'force-dynamic'

const PAGE = 50
const STATUSES = [
  { key: '', label: 'Everyone' },
  { key: 'subscribed', label: 'Subscribed' },
  { key: 'unsubscribed', label: 'Unsubscribed' },
  { key: 'bounced', label: 'Bounced' },
  { key: 'complained', label: 'Marked as spam' },
]
const STATUS_CLS: Record<string, string> = {
  SUBSCRIBED: 'text-success',
  UNSUBSCRIBED: 'text-ivory/60',
  BOUNCED: 'text-danger',
  COMPLAINED: 'text-danger',
}
const STATUS_LABEL: Record<string, string> = { SUBSCRIBED: 'Subscribed', UNSUBSCRIBED: 'Unsubscribed', BOUNCED: 'Bounced', COMPLAINED: 'Marked as spam' }

type SP = { q?: string; tag?: string; status?: string; page?: string }

export default async function AdminContactsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin('mailing')
  const sp = await searchParams
  const f = { q: sp.q ?? '', tag: sp.tag ?? '', status: sp.status ?? '' }
  const page = Math.max(1, Number(sp.page) || 1)
  const where = contactFilter(f)
  const [contacts, matching, byStatus, tags] = await Promise.all([
    prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE, take: PAGE }),
    prisma.contact.count({ where }),
    prisma.contact.groupBy({ by: ['status'], _count: true }),
    tagCounts(),
  ])
  const count = (...s: string[]) => byStatus.filter((x) => s.includes(x.status)).reduce((n, x) => n + x._count, 0)
  const pages = Math.max(1, Math.ceil(matching / PAGE))
  const link = (over: Partial<SP>) => {
    const p = new URLSearchParams(Object.entries({ ...f, page: '', ...over }).filter(([, v]) => v) as [string, string][])
    return `/admin/contacts${p.size ? `?${p}` : ''}`
  }
  const exportQs = new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString()

  return (
    <div>
      <AdminPageHeader
        eyebrow="Communication"
        title="Mailing list"
        subtitle="Everyone who gets your campaigns. Import past ticket buyers, tag people by event, and see who unsubscribed or bounced."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Subscribed', count('SUBSCRIBED')],
          ['Unsubscribed', count('UNSUBSCRIBED')],
          ['Bounced or spam', count('BOUNCED', 'COMPLAINED')],
          ['Everyone', count('SUBSCRIBED', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED')],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[18px] border border-ivory/12 bg-ink p-5">
            <p className="text-[13px] font-semibold text-gold">{label}</p>
            <p className="mt-2 font-display text-[34px] leading-none text-ivory">{Number(value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <ContactsTools tags={tags.map((t) => t.tag)} />

      {tags.length > 0 && (
        <div className="mt-10">
          <p className="mb-3 text-[13px] font-semibold text-ivory/60">Tags</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={link({ tag: '' })}
              className={!f.tag ? 'bg-gold px-4 py-2 text-[13px] font-semibold text-night no-underline' : 'border border-ivory/20 px-4 py-2 text-[13px] text-ivory no-underline'}
            >
              All tags
            </Link>
            {tags.map((t) => (
              <Link
                key={t.tag}
                href={link({ tag: t.tag })}
                className={f.tag === t.tag ? 'bg-gold px-4 py-2 text-[13px] font-semibold text-night no-underline' : 'border border-ivory/20 px-4 py-2 text-[13px] text-ivory no-underline'}
              >
                {t.tag} <span className="opacity-70">({t.subscribed.toLocaleString()})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 mb-4 flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.key}
            href={link({ status: s.key })}
            className={f.status === s.key ? 'bg-gold px-4 py-2 text-[13px] font-semibold text-night no-underline' : 'border border-ivory/20 px-4 py-2 text-[13px] text-ivory no-underline'}
          >
            {s.label}
          </Link>
        ))}
        <form className="ml-auto flex gap-2" action="/admin/contacts">
          {f.tag && <input type="hidden" name="tag" value={f.tag} />}
          {f.status && <input type="hidden" name="status" value={f.status} />}
          <input
            name="q"
            defaultValue={f.q}
            placeholder="Search name or email"
            aria-label="Search name or email"
            className="rounded-[12px] border border-ivory/16 bg-night px-4 py-2.5 text-sm text-ivory"
          />
        </form>
        <a href={`/api/admin/contacts/export${exportQs ? `?${exportQs}` : ''}`} className="border border-ivory/20 px-4 py-2.5 text-[13px] text-ivory no-underline">
          Export CSV
        </a>
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-ivory/12">
        <table className="w-full min-w-[860px] text-left text-[14px]">
          <thead className="bg-ink text-[12px] text-ivory/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Person</th>
              <th className="px-3 py-3 font-semibold">Tags</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Added</th>
              <th className="px-3 py-3 font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory/8">
            {contacts.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <p className="text-ivory">{c.name ?? '—'}</p>
                  <p className="text-[13px] text-ivory/60">{c.email}</p>
                </td>
                <td className="px-3 py-3 text-[13px] text-ivory/75">{c.tags.join(', ') || '—'}</td>
                <td className={`px-3 py-3 font-semibold ${STATUS_CLS[c.status] ?? ''}`}>{STATUS_LABEL[c.status] ?? c.status}</td>
                <td className="px-3 py-3 whitespace-nowrap text-[13px] text-ivory/70">
                  {fmt(c.createdAt, 'd MMM yyyy')}
                  <span className="block text-[12px] text-ivory/50">{c.source === 'SIGNUP' ? 'Website' : c.source === 'IMPORT' ? 'Imported' : 'Added by admin'}</span>
                </td>
                <td className="px-3 py-3 text-right">
                  <ContactRowActions id={c.id} email={c.email} name={c.name ?? ''} tags={c.tags} status={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && (
          <p className="px-6 py-12 text-center text-ivory/60">
            {f.q || f.tag || f.status ? 'Nobody matches these filters.' : 'The list is empty. Import a spreadsheet or add someone above.'}
          </p>
        )}
      </div>

      {pages > 1 && (
        <div className="mt-5 flex items-center justify-between text-[14px] text-ivory/70">
          <span>
            {((page - 1) * PAGE + 1).toLocaleString()}–{Math.min(page * PAGE, matching).toLocaleString()} of {matching.toLocaleString()}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={link({ page: String(page - 1) })} className="border border-ivory/20 px-4 py-2 text-ivory no-underline">
                Previous
              </Link>
            )}
            {page < pages && (
              <Link href={link({ page: String(page + 1) })} className="border border-ivory/20 px-4 py-2 text-ivory no-underline">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
