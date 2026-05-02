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
  BOOKING: '#C9A84C',
  COLLABORATION: '#60a5fa',
  MEDIA: '#a78bfa',
  GENERAL: '#888',
}

export default function MessagesClient({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages)
  const [selected, setSelected] = useState<Message | null>(null)

  async function markRead(id: string) {
    await fetch(`/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    })
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)))
  }

  async function handleSelect(msg: Message) {
    setSelected(msg)
    if (!msg.isRead) void markRead(msg.id)
  }

  const unread = messages.filter((m) => !m.isRead).length

  return (
    <div>
      {unread > 0 && (
        <div className="mb-4 inline-block border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-2">
          <span style={{ fontSize: 12, color: '#C9A84C' }}>
            {unread} unread message{unread > 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="flex gap-0 border border-[#1E1E1E] bg-[#0F0F0F]" style={{ minHeight: 500 }}>
        <div className="w-80 shrink-0 overflow-y-auto border-r border-[#1E1E1E]">
          {messages.length === 0 && (
            <p className="p-6 text-center text-sm" style={{ color: '#444' }}>
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
              className="cursor-pointer border-b border-[#1E1E1E] px-4 py-4 transition hover:bg-[#161616]"
              style={{
                borderLeft: !msg.isRead ? '2px solid #C9A84C' : '2px solid transparent',
                background: selected?.id === msg.id ? '#161616' : 'transparent',
              }}
            >
              <div className="mb-1 flex items-center justify-between">
                <p style={{ fontSize: 13, color: '#F5F0E8', fontWeight: msg.isRead ? 400 : 600 }}>{msg.name}</p>
                <span
                  style={{
                    fontSize: 10,
                    color: INQUIRY_COLORS[msg.inquiryType] ?? '#888',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {msg.inquiryType}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#888' }} className="truncate">
                {msg.subject}
              </p>
              <p style={{ fontSize: 11, color: '#444', marginTop: 4 }}>
                {new Date(msg.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        <div className="flex-1 p-8">
          {!selected ? (
            <div className="flex h-full items-center justify-center">
              <p style={{ color: '#333', fontSize: 14 }}>Select a message to read</p>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: '#F5F0E8' }}>
                    {selected.subject}
                  </h3>
                  <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>
                    From: <span style={{ color: '#C9A84C' }}>{selected.name}</span> · {selected.email}
                    {selected.phone && ` · ${selected.phone}`}
                  </p>
                  <p style={{ color: '#444', fontSize: 12, marginTop: 2 }}>
                    {new Date(selected.createdAt).toLocaleString('en-NG')}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: INQUIRY_COLORS[selected.inquiryType] ?? '#888',
                    border: `1px solid ${INQUIRY_COLORS[selected.inquiryType] ?? '#444'}`,
                    padding: '4px 10px',
                  }}
                >
                  {selected.inquiryType}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #1E1E1E', paddingTop: 24 }}>
                <p style={{ fontSize: 15, color: '#F5F0E8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {selected.message}
                </p>
              </div>

              <div className="mt-8">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="inline-block bg-[#C9A84C] px-6 py-2.5 font-semibold text-[#080808] transition hover:bg-[#E8C96D]"
                  style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                >
                  Reply via Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
