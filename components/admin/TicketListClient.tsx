'use client'

import { useState } from 'react'
import QRScanner from '@/components/admin/QRScanner'

interface Ticket {
  id: string
  ticketNumber: string
  firstName: string
  lastName: string
  email: string
  ticketType: string
  quantity: number
  totalAmount: number
  isUsed: boolean
  createdAt: string
}

export default function TicketListClient({ tickets, eventId }: { tickets: Ticket[]; eventId: string }) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'list' | 'scanner'>('list')

  const filtered = tickets.filter((t) =>
    `${t.firstName} ${t.lastName} ${t.email} ${t.ticketNumber}`.toLowerCase().includes(search.toLowerCase())
  )

  function exportCSV() {
    const headers = ['Ticket #', 'Name', 'Email', 'Type', 'Qty', 'Amount', 'Status', 'Date']
    const rows = tickets.map((t) => [
      t.ticketNumber,
      `${t.firstName} ${t.lastName}`,
      t.email,
      t.ticketType,
      t.quantity,
      t.totalAmount,
      t.isUsed ? 'Used' : 'Valid',
      new Date(t.createdAt).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tickets-${eventId}.csv`
    a.click()
  }

  return (
    <div>
      <div className="mb-6 inline-flex gap-0 border border-[rgba(247,241,227,0.2)]">
        {(['list', 'scanner'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="px-6 py-2.5 transition"
            style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 500,
              background: activeTab === tab ? '#E3B23C' : 'transparent',
              color: activeTab === tab ? '#11142F' : 'rgba(247,241,227,0.55)',
            }}
          >
            {tab === 'list' ? 'Ticket List' : 'QR Scanner'}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <div>
          <div className="mb-4 flex max-w-2xl flex-wrap gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or ticket number..."
              className="min-w-[200px] flex-1 border border-[rgba(247,241,227,0.12)] bg-[#1B1F4B] px-4 py-2.5 text-sm text-white focus:border-[#E3B23C] focus:outline-none"
            />
            <button
              type="button"
              onClick={exportCSV}
              className="border border-[rgba(247,241,227,0.2)] px-4 py-2.5 text-xs text-white transition hover:border-[#E3B23C]"
              style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Export CSV
            </button>
          </div>

          <div className="overflow-hidden border border-[rgba(247,241,227,0.12)] bg-[#1B1F4B]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(247,241,227,0.12)]">
                  {['Ticket #', 'Name', 'Email', 'Type', 'Amount', 'Status', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left"
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'rgba(247,241,227,0.55)',
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(247,241,227,0.12)]">
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className="transition hover:bg-[#20255A]">
                    <td className="px-4 py-3 font-mono text-xs text-[#E3B23C]">{ticket.ticketNumber}</td>
                    <td className="px-4 py-3 text-sm text-[#F7F1E3]">
                      {ticket.firstName} {ticket.lastName}
                    </td>
                    <td className="px-4 py-3 text-xs text-[rgba(247,241,227,0.7)]">{ticket.email}</td>
                    <td className="px-4 py-3">
                      <span
                        style={{
                          fontSize: 10,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#E3B23C',
                          background: 'rgba(227,178,60,0.1)',
                          border: '1px solid rgba(227,178,60,0.3)',
                          padding: '2px 6px',
                        }}
                      >
                        {ticket.ticketType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#F7F1E3]">
                      {ticket.totalAmount === 0 ? 'Free' : `₦${ticket.totalAmount.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        style={{
                          fontSize: 10,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          background: ticket.isUsed ? 'rgba(127,29,29,0.3)' : 'rgba(20,83,45,0.3)',
                          color: ticket.isUsed ? '#f87171' : '#4ade80',
                          border: `1px solid ${ticket.isUsed ? 'rgba(127,29,29,0.5)' : 'rgba(20,83,45,0.5)'}`,
                        }}
                      >
                        {ticket.isUsed ? 'Used' : 'Valid'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[rgba(247,241,227,0.55)]">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(247,241,227,0.45)' }}>
                      No tickets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'scanner' && (
        <div className="mt-2">
          <QRScanner />
        </div>
      )}
    </div>
  )
}
