'use client'

import { useState } from 'react'

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  inquiryType: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

const INQUIRY_COLORS: Record<string, string> = {
  BOOKING: '#E3B23C',
  COLLABORATION: '#60a5fa',
  MEDIA: '#a78bfa',
  GENERAL: 'rgba(247,241,227,0.7)',
}

export default function MessagesClient({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages)
  const [selected, setSelected] = useState<Message | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function markRead(id: string) {
    await fetch(`/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    })
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)))
  }

  async function handleDelete(msg: Message) {
    if (!confirm(`Delete the message from ${msg.name}? This can’t be undone.`)) return
    setDeleting(true)
    setError('')
    const res = await fetch(`/api/messages/${msg.id}`, { method: 'DELETE' }).catch(() => null)
    setDeleting(false)
    if (!res?.ok) {
      setError('Couldn’t delete the message. Check your connection and try again.')
      return
    }
    setMessages((prev) => prev.filter((m) => m.id !== msg.id))
    setSelected(null)
  }

  async function handleSelect(msg: Message) {
    setSelected(msg)
    setError('')
    if (!msg.isRead) void markRead(msg.id)
  }

  const unread = messages.filter((m) => !m.isRead).length

  return (
    <div>
      {unread > 0 && (
        <div className="mb-4 inline-block border border-[#E3B23C]/30 bg-[#E3B23C]/10 px-4 py-2">
          <span style={{ fontSize: 12, color: '#E3B23C' }}>
            {unread} unread message{unread > 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div
        className="flex gap-0 border border-[rgba(247,241,227,0.12)] bg-[#1B1F4B]"
        style={{ minHeight: 500, boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}
      >
        <div className="w-80 shrink-0 overflow-y-auto border-r border-[rgba(247,241,227,0.12)]">
          {messages.length === 0 && (
            <p className="p-6 text-center text-sm" style={{ color: 'rgba(247,241,227,0.45)' }}>
              No messages yet
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              role="button"
              tabIndex={0}
              onClick={() => void handleSelect(msg)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') void handleSelect(msg)
              }}
              className="cursor-pointer border-b border-[rgba(247,241,227,0.12)] px-4 py-4 transition hover:bg-[#20255A]"
              style={{
                borderLeft: !msg.isRead ? '2px solid #E3B23C' : '2px solid transparent',
                background: selected?.id === msg.id ? '#20255A' : 'transparent',
              }}
            >
              <div className="mb-1 flex items-center justify-between">
                <p style={{ fontSize: 13, color: '#F7F1E3', fontWeight: msg.isRead ? 400 : 600 }}>{msg.name}</p>
                <span
                  style={{
                    fontSize: 10,
                    color: INQUIRY_COLORS[msg.inquiryType] ?? 'rgba(247,241,227,0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {msg.inquiryType}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(247,241,227,0.7)' }} className="truncate">
                {msg.subject}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(247,241,227,0.45)', marginTop: 4 }}>
                {new Date(msg.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        <div className="flex-1 p-8">
          {!selected ? (
            <div className="flex h-full items-center justify-center">
              <p style={{ color: 'rgba(247,241,227,0.35)', fontSize: 14 }}>Select a message to read</p>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: '#F7F1E3' }}>
                    {selected.subject}
                  </h3>
                  <p style={{ color: 'rgba(247,241,227,0.55)', fontSize: 13, marginTop: 4 }}>
                    From: <span style={{ color: '#E3B23C' }}>{selected.name}</span> · {selected.email}
                    {selected.phone && ` · ${selected.phone}`}
                  </p>
                  <p style={{ color: 'rgba(247,241,227,0.45)', fontSize: 12, marginTop: 2 }}>
                    {new Date(selected.createdAt).toLocaleString('en-NG')}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: INQUIRY_COLORS[selected.inquiryType] ?? 'rgba(247,241,227,0.7)',
                    border: `1px solid ${INQUIRY_COLORS[selected.inquiryType] ?? 'rgba(247,241,227,0.45)'}`,
                    padding: '4px 10px',
                  }}
                >
                  {selected.inquiryType}
                </span>
              </div>

              <div style={{ borderTop: '1px solid rgba(247,241,227,0.12)', paddingTop: 24 }}>
                <p style={{ fontSize: 15, color: '#F7F1E3', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {selected.message}
                </p>
              </div>

              <div className="mt-8">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="inline-block bg-[#E3B23C] px-6 py-2.5 font-semibold text-[#11142F] transition hover:bg-[#F0C75E]"
                  style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                >
                  Reply via Email
                </a>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void handleDelete(selected)}
                  className="ml-3 inline-block border border-[rgba(247,241,227,0.25)] px-6 py-2.5 text-[#F7F1E3] transition hover:border-[#f87171] hover:text-[#f87171] disabled:opacity-50"
                  style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
                {error && (
                  <p role="alert" style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>
                    {error}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
