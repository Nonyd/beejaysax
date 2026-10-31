import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { fmt } from '@/lib/time'
import { getRevenueReport, getRevenueTransactions, money, parseRevenueFilter, type Totals } from '@/lib/revenue'

export const dynamic = 'force-dynamic'

type Search = { mode?: string; event?: string; from?: string; to?: string; page?: string }

const STATUS_CLS: Record<string, string> = { PAID: 'text-success', REFUNDED: 'text-warn' }

export default async function RevenuePage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin('revenue')
  const sp = await searchParams
  const filter = parseRevenueFilter(sp)
  const page = Math.max(1, Math.floor(Number(sp.page) || 1))

  const [report, tx, events] = await Promise.all([
    getRevenueReport(filter),
    getRevenueTransactions(filter, page),
    prisma.event.findMany({ where: { status: { not: 'DRAFT' } }, select: { id: true, title: true, eventDate: true }, orderBy: { eventDate: 'desc' } }),
  ])

  // Links keep the other filters and change one.
  const qs = (patch: Partial<Search>) => {
    const p = new URLSearchParams()
    const next = { mode: sp.mode, event: sp.event, from: sp.from, to: sp.to, ...patch }
    for (const [k, v] of Object.entries(next)) if (v && !(k === 'mode' && v === 'live')) p.set(k, v)
    const s = p.toString()
    return s ? `?${s}` : ''
  }
  const link = (patch: Partial<Search>) => `/admin/revenue${qs({ page: undefined, ...patch })}`
  const exportQs = qs({ page: undefined })
  const selectedEvent = events.find((e) => e.id === filter.eventId)
  const isTest = filter.mode === 'test'

  return (
    <div>
      <AdminPageHeader
        eyebrow="Revenue"
        title="Ticket revenue"
        subtitle="Money from ticket sales, worked out from paid orders: what buyers paid, Paystack's fees, refunds, and what's left."
        action={
          <a href={`/api/admin/revenue/export${exportQs}`} className="border border-ivory/25 px-6 py-3 font-semibold text-ivory no-underline">
            Export CSV
          </a>
        }
      />

      {/* Live or test payments */}
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Payment mode">
        {(['live', 'test'] as const).map((m) => (
          <Link
            key={m}
            href={link({ mode: m })}
            role="tab"
            aria-selected={filter.mode === m}
            className={
              filter.mode === m
                ? 'bg-gold px-4 py-2 text-[13px] font-semibold text-night no-underline'
                : 'border border-ivory/20 px-4 py-2 text-[13px] text-ivory no-underline'
            }
          >
            {m === 'live' ? 'Live payments' : 'Test payments'}
          </Link>
        ))}
      </div>
      {isTest && (
        <p className="mb-6 rounded-[14px] border border-warn/40 px-4 py-3 text-[14px] text-warn">
          Test payments use Paystack&rsquo;s test mode. No real money moved, and none of these count in live revenue.
        </p>
      )}

      {/* Filters */}
      <form action="/admin/revenue" className="mb-8 flex flex-wrap items-end gap-3 rounded-[18px] border border-ivory/12 bg-ink p-4">
        {isTest && <input type="hidden" name="mode" value="test" />}
        <label className="flex min-w-[220px] flex-1 flex-col gap-1.5 text-[12px] font-semibold text-ivory/65">
          Event
          <select name="event" defaultValue={filter.eventId ?? ''} className="rounded-[12px] border border-ivory/16 bg-night px-3 py-2.5 text-sm font-normal text-ivory">
            <option value="">All events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({fmt(e.eventDate, 'MMM yyyy')})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-ivory/65">
          Paid from
          <input type="date" name="from" defaultValue={sp.from ?? ''} className="rounded-[12px] border border-ivory/16 bg-night px-3 py-2 text-sm font-normal text-ivory" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-ivory/65">
          Paid to
          <input type="date" name="to" defaultValue={sp.to ?? ''} className="rounded-[12px] border border-ivory/16 bg-night px-3 py-2 text-sm font-normal text-ivory" />
        </label>
        <button type="submit" className="bg-gold px-5 py-2.5 text-[13px] font-semibold text-night">
          Apply
        </button>
        {(sp.event || sp.from || sp.to) && (
          <Link href={link({ event: undefined, from: undefined, to: undefined })} className="px-2 py-2.5 text-[13px] text-ivory/70">
            Clear
          </Link>
        )}
      </form>

      {/* Headline figures, one block per currency */}
      {report.totals.length === 0 ? (
        <div className="mb-10 rounded-[18px] border border-ivory/12 bg-ink px-6 py-10 text-center">
          <p className="font-display text-2xl text-ivory">No {isTest ? 'test ' : ''}sales yet</p>
          <p className="mt-2 text-[14px] text-ivory/60">
            {selectedEvent ? `Nothing has been paid for ${selectedEvent.title}` : 'Nothing has been paid'}
            {filter.from || filter.to ? ' in this date range' : ''}. Paid ticket orders show up here as soon as Paystack confirms them.
          </p>
        </div>
      ) : (
        report.totals.map((t) => <TotalsBlock key={t.currency} t={t} showCurrency={report.totals.length > 1} />)
      )}

      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <SmallStat label="Free tickets" value={report.freeTickets} hint="Free ticket types and 100% discount codes" />
        <SmallStat label="Complimentary" value={report.compTickets} hint="Issued by admins, no payment" />
        <SmallStat label="Open checkouts" value={report.pendingCheckouts} hint="Unpaid, holding seats right now" />
      </div>

      {report.timeline.points.length > 1 && <Timeline {...report.timeline} />}

      {/* Breakdown: by ticket type for one event, by event otherwise */}
      {selectedEvent ? (
        report.tiers.length > 0 && (
          <Breakdown title={`${selectedEvent.title}: by ticket type`} rows={report.tiers.flatMap((t) => t.totals.map((x) => ({ key: `${t.name}-${x.currency}`, name: t.name, t: x })))} />
        )
      ) : (
        report.events.length > 0 && (
          <Breakdown
            title="By event"
            rows={report.events.flatMap((e) =>
              e.totals.map((x) => ({
                key: `${e.eventId}-${x.currency}`,
                name: e.title,
                sub: fmt(e.eventDate, 'd MMM yyyy'),
                href: link({ event: e.eventId }),
                t: x,
              }))
            )}
          />
        )
      )}

      {/* The orders behind the numbers */}
      {tx.count > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-xl text-ivory">
            Transactions <span className="font-body text-[14px] text-ivory/55">({tx.count})</span>
          </h2>
          <div className="overflow-x-auto rounded-[18px] border border-ivory/12">
            <table className="w-full min-w-[980px] text-left text-[14px]">
              <thead className="bg-ink text-[12px] text-ivory/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Paid</th>
                  <th className="px-3 py-3 font-semibold">Buyer</th>
                  <th className="px-3 py-3 font-semibold">Event / ticket</th>
                  <th className="px-3 py-3 text-right font-semibold">Qty</th>
                  <th className="px-3 py-3 text-right font-semibold">Paid</th>
                  <th className="px-3 py-3 text-right font-semibold">Fee</th>
                  <th className="px-3 py-3 text-right font-semibold">Refunded</th>
                  <th className="px-3 py-3 text-right font-semibold">Net</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory/8">
                {tx.rows.map((o) => {
                  const refunded = o.status === 'REFUNDED' ? (o.refundedAmount ?? o.total) : 0
                  const fee = o.gatewayFee ?? 0
                  return (
                    <tr key={o.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-[13px] text-ivory/75">
                        {o.paidAt ? fmt(o.paidAt, 'd MMM yyyy, HH:mm') : '—'}
                        <span className="block font-mono text-[11px] text-ivory/45">{o.reference}</span>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-ivory">
                          {o.firstName} {o.lastName}
                        </p>
                        <p className="text-[13px] text-ivory/60">{o.email}</p>
                      </td>
                      <td className="px-3 py-3 text-[13px]">
                        <p className="text-ivory">{o.event.title}</p>
                        <p className="text-ivory/60">
                          {o.tier?.name ?? 'Ticket'}
                          {o.coupon ? ` · code ${o.coupon.code}` : ''}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ivory">{o.quantity}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-ivory">
                        {money(o.total, o.currency)}
                        {o.discount > 0 && <span className="block text-[12px] text-ivory/50">−{money(o.discount, o.currency)} off</span>}
                        {o.serviceFee > 0 && <span className="block text-[12px] text-ivory/50">incl. {money(o.serviceFee, o.currency)} fee</span>}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ivory/75">{o.gatewayFee == null ? '—' : money(fee, o.currency)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-ivory/75">{refunded ? money(refunded, o.currency) : '—'}</td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums text-ivory">{money(o.total - fee - refunded, o.currency)}</td>
                      <td className={`px-3 py-3 text-[13px] font-semibold ${STATUS_CLS[o.status] ?? 'text-ivory'}`}>
                        {o.status === 'REFUNDED' ? (refunded < o.total ? 'Part refunded' : 'Refunded') : 'Paid'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {tx.pages > 1 && (
            <nav className="mt-4 flex items-center gap-3 text-[13px]" aria-label="Transactions pages">
              {page > 1 && (
                <Link href={`/admin/revenue${qs({ page: String(page - 1) })}`} className="border border-ivory/20 px-4 py-2 text-ivory no-underline">
                  Newer
                </Link>
              )}
              <span className="text-ivory/60">
                Page {page} of {tx.pages}
              </span>
              {page < tx.pages && (
                <Link href={`/admin/revenue${qs({ page: String(page + 1) })}`} className="border border-ivory/20 px-4 py-2 text-ivory no-underline">
                  Older
                </Link>
              )}
            </nav>
          )}
        </section>
      )}

      <div className="space-y-2 text-[13px] leading-relaxed text-ivory/55">
        <p>
          Figures use the date Paystack confirmed each payment. Net revenue is what buyers paid, less Paystack&rsquo;s fees and refunds; Paystack pays it out to the bank
          account in your Paystack settings on its normal schedule.
        </p>
        <p>Fees are recorded for payments confirmed from 31 October 2026 on. A dash means Paystack hadn&rsquo;t reported the fee.</p>
        {report.orphanTickets > 0 && (
          <p className="text-warn">
            {report.orphanTickets} ticket{report.orphanTickets === 1 ? ' was' : 's were'} created outside checkout (no order or payment), so{' '}
            {report.orphanTickets === 1 ? 'it isn’t' : 'they aren’t'} counted here. Old test tickets are the usual cause; cancel them from the event&rsquo;s registrations
            to clear this note.
          </p>
        )}
      </div>
    </div>
  )
}

function TotalsBlock({ t, showCurrency }: { t: Totals; showCurrency: boolean }) {
  return (
    <section className="mb-6" aria-label={`Totals in ${t.currency}`}>
      {showCurrency && <p className="mb-3 text-[13px] font-semibold text-ivory/65">{t.currency}</p>}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_2fr]">
        <div className="rounded-[18px] border border-gold/40 bg-ink p-6">
          <p className="text-[13px] font-semibold text-gold">Net revenue</p>
          <p className="mt-3 font-display text-[44px] leading-none text-ivory tabular-nums">{money(t.net, t.currency)}</p>
          <p className="mt-3 text-[13px] text-ivory/60">
            {t.ticketsSold} ticket{t.ticketsSold === 1 ? '' : 's'} sold in {t.orders} order{t.orders === 1 ? '' : 's'}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <SmallStat label="Gross sales" value={money(t.gross, t.currency)} hint="Ticket prices before discounts" />
          <SmallStat label="Discounts" value={money(t.discounts, t.currency)} hint="From discount codes" />
          <SmallStat label="Buyers paid" value={money(t.collected, t.currency)} hint="Tickets less discounts, plus processing fees" />
          <SmallStat label="Paystack fees" value={money(t.fees, t.currency)} hint="Taken before payout" />
          <SmallStat label="Refunds" value={money(t.refunds, t.currency)} hint="Returned to buyers" />
          <SmallStat label="Processing fees" value={money(t.serviceFees, t.currency)} hint="Paid by buyers to cover Paystack" />
        </dl>
      </div>
    </section>
  )
}

function SmallStat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-[18px] border border-ivory/12 bg-ink p-5">
      <dt className="text-[13px] font-semibold text-gold">{label}</dt>
      <dd className="mt-2 font-display text-[26px] leading-none text-ivory tabular-nums">{value}</dd>
      {hint && <dd className="mt-2 text-[12px] text-ivory/55">{hint}</dd>}
    </div>
  )
}

function Timeline({ unit, currency, points }: { unit: 'day' | 'month'; currency: string; points: { label: string; key: string; value: number }[] }) {
  const max = Math.max(...points.map((p) => p.value), 1)
  const every = Math.ceil(points.length / 12) // label at most ~12 bars
  return (
    <section className="mb-10 rounded-[18px] border border-ivory/12 bg-ink p-6">
      <h2 className="mb-1 font-display text-xl text-ivory">Sales by {unit}</h2>
      <p className="mb-6 text-[13px] text-ivory/55">What buyers paid, in {currency}</p>
      <div className="flex h-48 items-end gap-[3px]" role="img" aria-label={`Bar chart of sales by ${unit}`}>
        {points.map((p) => (
          <div key={p.key} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${p.label}: ${money(p.value, currency)}`}>
            <div className="w-full rounded-t-[3px] bg-gold" style={{ height: `${p.value ? Math.max(2, (p.value / max) * 100) : 0}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[3px] text-[11px] text-ivory/50" aria-hidden>
        {points.map((p, i) => (
          <span key={p.key} className="min-w-0 flex-1 truncate">
            {i % every === 0 ? p.label : ''}
          </span>
        ))}
      </div>
      {/* The same figures as text, for screen readers */}
      <table className="sr-only">
        <caption>Sales by {unit}</caption>
        <tbody>
          {points.map((p) => (
            <tr key={p.key}>
              <th>{p.label}</th>
              <td>{money(p.value, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function Breakdown({ title, rows }: { title: string; rows: { key: string; name: string; sub?: string; href?: string; t: Totals }[] }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 font-display text-xl text-ivory">{title}</h2>
      <div className="overflow-x-auto rounded-[18px] border border-ivory/12">
        <table className="w-full min-w-[760px] text-left text-[14px]">
          <thead className="bg-ink text-[12px] text-ivory/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-3 py-3 text-right font-semibold">Tickets</th>
              <th className="px-3 py-3 text-right font-semibold">Buyers paid</th>
              <th className="px-3 py-3 text-right font-semibold">Fees</th>
              <th className="px-3 py-3 text-right font-semibold">Refunds</th>
              <th className="px-3 py-3 text-right font-semibold">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory/8">
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="px-4 py-3">
                  {r.href ? (
                    <Link href={r.href} className="text-ivory underline-offset-4 hover:underline">
                      {r.name}
                    </Link>
                  ) : (
                    <span className="text-ivory">{r.name}</span>
                  )}
                  {r.sub && <span className="block text-[12px] text-ivory/50">{r.sub}</span>}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-ivory">{r.t.ticketsSold}</td>
                <td className="px-3 py-3 text-right tabular-nums text-ivory">{money(r.t.collected, r.t.currency)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-ivory/75">{money(r.t.fees, r.t.currency)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-ivory/75">{money(r.t.refunds, r.t.currency)}</td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-ivory">{money(r.t.net, r.t.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
