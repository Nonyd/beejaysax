import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmailTools, { RetryButton } from '@/components/admin/EmailTools'
import { fmt } from '@/lib/time'

export const dynamic = 'force-dynamic'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'problems', label: 'Problems' },
  { key: 'queued', label: 'Waiting to retry' },
] as const

const STATUS_CLS: Record<string, string> = {
  SENT: 'text-ivory/75',
  DELIVERED: 'text-success',
  QUEUED: 'text-warn',
  FAILED: 'text-danger',
  BOUNCED: 'text-danger',
  COMPLAINED: 'text-danger',
  SUPPRESSED: 'text-warn',
}

export default async function AdminEmailsPage({ searchParams }: { searchParams: Promise<{ f?: string; q?: string }> }) {
  await requireAdmin('emails')
  const { f = 'all', q = '' } = await searchParams
  const where = {
    ...(f === 'problems' ? { status: { in: ['FAILED', 'BOUNCED', 'COMPLAINED', 'SUPPRESSED'] } } : f === 'queued' ? { status: 'QUEUED' } : {}),
    ...(q ? { to: { contains: q.toLowerCase() } } : {}),
  }
  const since = new Date(Date.now() - 30 * 864e5)
  const [logs, suppressions, counts] = await Promise.all([
    prisma.emailLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.emailSuppression.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.emailLog.groupBy({ by: ['status'], where: { createdAt: { gte: since } }, _count: true }),
  ])
  const count = (s: string[]) => counts.filter((c) => s.includes(c.status)).reduce((n, c) => n + c._count, 0)

  return (
    <div>
      <AdminPageHeader
        eyebrow="Communication"
        title="Emails"
        subtitle="Every ticket, reminder and contact email, which provider sent it, and whether it arrived. Failed emails retry automatically."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Sent (30 days)', count(['SENT', 'DELIVERED'])],
          ['Confirmed delivered', count(['DELIVERED'])],
          ['Waiting to retry', count(['QUEUED'])],
          ['Problems', count(['FAILED', 'BOUNCED', 'COMPLAINED', 'SUPPRESSED'])],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[18px] border border-ivory/12 bg-ink p-5">
            <p className="text-[13px] font-semibold text-gold">{label}</p>
            <p className="mt-2 font-display text-[34px] leading-none text-ivory">{value}</p>
          </div>
        ))}
      </div>

      <EmailTools suppressions={suppressions.map((s) => ({ email: s.email, reason: s.reason, at: fmt(s.createdAt, 'd MMM yyyy') }))} />

      <div className="mt-10 mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((x) => (
          <Link
            key={x.key}
            href={`/admin/emails?f=${x.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={f === x.key ? 'bg-gold px-4 py-2 text-[13px] font-semibold text-night no-underline' : 'border border-ivory/20 px-4 py-2 text-[13px] text-ivory no-underline'}
          >
            {x.label}
          </Link>
        ))}
        <form className="ml-auto" action="/admin/emails">
          <input type="hidden" name="f" value={f} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by recipient"
            aria-label="Search by recipient"
            className="rounded-[12px] border border-ivory/16 bg-night px-4 py-2.5 text-sm text-ivory"
          />
        </form>
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-ivory/12">
        <table className="w-full min-w-[820px] text-left text-[14px]">
          <thead className="bg-ink text-[12px] text-ivory/60">
            <tr>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-3 py-3 font-semibold">To</th>
              <th className="px-3 py-3 font-semibold">Email</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Provider</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory/8">
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3 whitespace-nowrap text-[13px] text-ivory/70">{fmt(l.createdAt, 'd MMM, HH:mm')}</td>
                <td className="px-3 py-3 text-ivory">{l.to}</td>
                <td className="px-3 py-3">
                  <p className="text-ivory">{l.subject}</p>
                  <p className="text-[12px] text-ivory/55">{l.kind.toLowerCase()}</p>
                </td>
                <td className="px-3 py-3">
                  <p className={`font-semibold ${STATUS_CLS[l.status] ?? ''}`}>{l.status.charAt(0) + l.status.slice(1).toLowerCase()}</p>
                  {l.error && <p className="max-w-[320px] text-[12px] text-ivory/55">{l.error}</p>}
                  {l.status === 'QUEUED' && l.nextAttemptAt && (
                    <p className="text-[12px] text-ivory/55">Next try {fmt(l.nextAttemptAt, 'HH:mm')} · attempt {l.attempts}</p>
                  )}
                  {(l.status === 'QUEUED' || l.status === 'FAILED') && l.html && <RetryButton id={l.id} />}
                </td>
                <td className="px-3 py-3 text-[13px] text-ivory/70">{l.provider ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="px-6 py-12 text-center text-ivory/60">No emails match.</p>}
      </div>
    </div>
  )
}
