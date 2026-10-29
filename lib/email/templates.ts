import { fmt } from '@/lib/time'

/*
 * Email-safe HTML: tables, inline styles, web-safe font fallbacks (Gloock loads in clients
 * that allow web fonts, Georgia elsewhere). Brand: indigo #1B1F4B, gold #E3B23C, ivory #F7F1E3.
 */
const C = { ink: '#1B1F4B', night: '#11142F', gold: '#E3B23C', clay: '#A9452C', ivory: '#F7F1E3', text: '#1B1F4B', muted: '#5b5f80' }
const SERIF = `'Gloock', Georgia, 'Times New Roman', serif`
const SANS = `'Hanken Grotesk', 'Helvetica Neue', Arial, sans-serif`

export function esc(s: string | null | undefined) {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')
}

function button(href: string, label: string, primary = true) {
  return `<a href="${esc(href)}" style="display:inline-block;padding:13px 26px;border-radius:999px;font-family:${SANS};font-size:15px;font-weight:700;text-decoration:none;${
    primary ? `background:${C.ink};color:${C.ivory};` : `border:1.5px solid ${C.ink};color:${C.ink};`
  }">${esc(label)}</a>`
}

/** Shared frame: indigo header with wordmark, ivory card, small footer. */
export function layout(opts: { preheader: string; body: string; footer?: string }) {
  const base = siteUrl()
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<link href="https://fonts.googleapis.com/css2?family=Gloock&family=Hanken+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<title>BeeJay Sax</title></head>
<body style="margin:0;padding:0;background:${C.night};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.night};">
<tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
    <tr><td style="padding:8px 8px 22px;font-family:${SERIF};font-size:28px;line-height:1;color:${C.ivory};">
      <a href="${base}" style="color:${C.ivory};text-decoration:none;">BeeJay <span style="color:${C.gold};">Sax</span></a>
    </td></tr>
    <tr><td style="background:${C.ivory};border-radius:24px;padding:36px 32px;font-family:${SANS};color:${C.text};font-size:16px;line-height:1.6;">
      ${opts.body}
    </td></tr>
    <tr><td style="padding:22px 8px;font-family:${SANS};font-size:12px;line-height:1.6;color:rgba(247,241,227,0.55);">
      BeeJay Sax · Lagos, Nigeria · <a href="${base}" style="color:rgba(247,241,227,0.75);">beejaysax.com</a><br>
      Questions? Reply to this email or write to booking@beejaysax.com.${opts.footer ? `<br>${opts.footer}` : ''}
    </td></tr>
  </table>
</td></tr></table></body></html>`
}

export type EventInfo = {
  id: string
  title: string
  eventDate: Date
  eventTime: string | null
  venue: string
  address: string | null
  city: string
  country: string
}

export type TicketInfo = { ticketNumber: string; qrToken: string; tierName: string | null; holder: string }

function eventBlock(e: EventInfo) {
  const where = [e.venue, e.address, e.city].filter(Boolean).join(', ')
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.venue, e.address, e.city, e.country].filter(Boolean).join(', '))}`
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 8px;border-top:1px solid rgba(27,31,75,0.15);border-bottom:1px solid rgba(27,31,75,0.15);">
    <tr><td style="padding:16px 0;font-family:${SANS};font-size:15px;line-height:1.7;">
      <strong>When</strong><br>${esc(fmt(e.eventDate, 'EEEE d MMMM yyyy'))}${e.eventTime ? `, doors ${esc(e.eventTime)}` : `, ${esc(fmt(e.eventDate, 'h:mm a'))}`}<br>
      <strong>Where</strong><br>${esc(where)} · <a href="${maps}" style="color:${C.clay};">Map</a>
    </td></tr>
  </table>`
}

function ticketCard(t: TicketInfo, index: number, total: number) {
  const base = siteUrl()
  const view = `${base}/tickets/${t.qrToken}`
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;background:#ffffff;border-radius:18px;border:1px solid rgba(27,31,75,0.14);">
    <tr><td style="background:${C.gold};border-radius:18px 18px 0 0;padding:14px 22px;font-family:${SANS};font-size:13px;font-weight:700;color:${C.night};">
      ${total > 1 ? `Ticket ${index + 1} of ${total} · ` : ''}${esc(t.tierName ?? 'General admission')}
    </td></tr>
    <tr><td align="center" style="padding:24px 22px 8px;">
      <img src="${base}/api/tickets/${t.qrToken}/qr.png" width="220" height="220" alt="Ticket QR code ${esc(t.ticketNumber)}" style="display:block;width:220px;height:220px;border:0;">
    </td></tr>
    <tr><td align="center" style="padding:0 22px 22px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.muted};">
      <span style="font-family:${SERIF};font-size:20px;color:${C.text};">${esc(t.holder)}</span><br>
      ${esc(t.ticketNumber)}<br>
      <a href="${view}" style="color:${C.clay};font-weight:700;">Open ticket</a> &nbsp;·&nbsp;
      <a href="${base}/api/tickets/${t.qrToken}/pdf" style="color:${C.clay};font-weight:700;">Download PDF</a>
    </td></tr>
  </table>`
}

export function ticketEmail(args: { firstName: string; event: EventInfo; tickets: TicketInfo[] }) {
  const { event, tickets } = args
  const base = siteUrl()
  const n = tickets.length
  const subject = `Your ${n > 1 ? `${n} tickets` : 'ticket'} for ${event.title}`
  const body = `
    <p style="margin:0 0 6px;font-family:${SANS};font-size:14px;font-weight:700;color:${C.clay};">You’re in</p>
    <h1 style="margin:0;font-family:${SERIF};font-weight:400;font-size:34px;line-height:1.05;color:${C.text};">${esc(event.title)}</h1>
    <p style="margin:16px 0 0;">Hi ${esc(args.firstName)}, here ${n > 1 ? `are your ${n} tickets` : 'is your ticket'}. Show the QR code at the entrance, on your phone or printed. Each code works once.</p>
    ${eventBlock(event)}
    ${tickets.map((t, i) => ticketCard(t, i, n)).join('')}
    <p style="margin:8px 0 0;">${button(`${base}/api/tickets/${tickets[0].qrToken}/calendar`, 'Add to calendar', false)}</p>
    <p style="margin:24px 0 0;font-size:14px;color:${C.muted};">Keep this email. If you bought for friends, forward them their ticket or send the “Open ticket” link.</p>`
  const text = [
    `You're in: ${event.title}`,
    `${fmt(event.eventDate, 'EEEE d MMMM yyyy')}${event.eventTime ? `, doors ${event.eventTime}` : ''}`,
    `${[event.venue, event.address, event.city].filter(Boolean).join(', ')}`,
    '',
    ...tickets.map((t) => `${t.tierName ?? 'Ticket'} – ${t.holder} – ${t.ticketNumber}\n${base}/tickets/${t.qrToken}`),
    '',
    'Show the QR code at the entrance. Each code works once.',
  ].join('\n')
  return { subject, html: layout({ preheader: `${n > 1 ? `${n} tickets` : 'Your ticket'} for ${event.title}, with QR codes for the door.`, body }), text }
}

export type ReminderKind = 'WEEK' | 'DAY' | 'MORNING'

export function reminderEmail(args: { firstName: string; event: EventInfo; tickets: TicketInfo[]; kind: ReminderKind }) {
  const { event, tickets, kind } = args
  const when = kind === 'WEEK' ? 'one week' : kind === 'DAY' ? 'tomorrow' : 'today'
  const subject = kind === 'WEEK' ? `One week to ${event.title}` : kind === 'DAY' ? `Tomorrow: ${event.title}` : `Today: ${event.title}`
  const headline = kind === 'WEEK' ? 'One week to go' : kind === 'DAY' ? 'See you tomorrow' : 'See you tonight'
  const body = `
    <p style="margin:0 0 6px;font-family:${SANS};font-size:14px;font-weight:700;color:${C.clay};">${esc(headline)}</p>
    <h1 style="margin:0;font-family:${SERIF};font-weight:400;font-size:34px;line-height:1.05;color:${C.text};">${esc(event.title)}</h1>
    <p style="margin:16px 0 0;">Hi ${esc(args.firstName)}, ${kind === 'WEEK' ? 'it’s one week until' : kind === 'DAY' ? 'it’s tomorrow:' : 'it’s today:'} ${esc(event.title)}. Have your ticket${tickets.length > 1 ? 's' : ''} ready on your phone for a quick entry.</p>
    ${eventBlock(event)}
    ${kind === 'WEEK' ? '' : tickets.map((t, i) => ticketCard(t, i, tickets.length)).join('')}
    ${kind === 'WEEK' ? `<p style="margin:16px 0 0;">${tickets.map((t) => button(`${siteUrl()}/tickets/${t.qrToken}`, tickets.length > 1 ? `Open ${t.holder}'s ticket` : 'Open my ticket')).join('<br><br>')}</p>` : ''}`
  const text = `${headline}: ${event.title}\n${fmt(event.eventDate, 'EEEE d MMMM yyyy')}${event.eventTime ? `, doors ${event.eventTime}` : ''}\n${event.venue}, ${event.city}\n\n${tickets
    .map((t) => `${t.holder}: ${siteUrl()}/tickets/${t.qrToken}`)
    .join('\n')}`
  return { subject, html: layout({ preheader: `${event.title} is ${when === 'one week' ? 'in one week' : when}. Your tickets are inside.`, body }), text }
}

export function broadcastEmail(args: { subject: string; message: string; event: EventInfo }) {
  const paras = args.message
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;">${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
  const body = `
    <p style="margin:0 0 6px;font-family:${SANS};font-size:14px;font-weight:700;color:${C.clay};">Update about your event</p>
    <h1 style="margin:0 0 18px;font-family:${SERIF};font-weight:400;font-size:30px;line-height:1.1;color:${C.text};">${esc(args.subject)}</h1>
    ${paras}
    ${eventBlock(args.event)}
    <p style="margin:12px 0 0;">${button(`${siteUrl()}/events/${args.event.id}`, 'Event details', false)}</p>`
  return { subject: args.subject, html: layout({ preheader: args.message.slice(0, 120), body }), text: `${args.subject}\n\n${args.message}` }
}

export function contactAutoReply(args: { firstName: string; subject: string }) {
  const body = `
    <h1 style="margin:0 0 14px;font-family:${SERIF};font-weight:400;font-size:30px;line-height:1.1;">Thanks, ${esc(args.firstName)}</h1>
    <p style="margin:0 0 12px;">We’ve received your message about <strong>${esc(args.subject)}</strong>. The team will reply by email, usually within two working days.</p>
    <p style="margin:0;color:${C.muted};font-size:14px;">For bookings, it helps to include the date, city and type of event if you haven’t already.</p>`
  return {
    subject: 'We received your message',
    html: layout({ preheader: 'The BeeJay Sax team will reply soon.', body }),
    text: `Thanks, ${args.firstName}. We've received your message about "${args.subject}" and will reply soon.`,
  }
}

export function adminContactNotice(m: { name: string; email: string; phone?: string | null; inquiryType: string; subject: string; message: string }) {
  const body = `
    <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${C.clay};">New ${esc(m.inquiryType.toLowerCase())} enquiry</p>
    <h1 style="margin:0 0 14px;font-family:${SERIF};font-weight:400;font-size:28px;line-height:1.1;">${esc(m.subject)}</h1>
    <p style="margin:0 0 4px;"><strong>${esc(m.name)}</strong> · <a href="mailto:${esc(m.email)}" style="color:${C.clay};">${esc(m.email)}</a>${m.phone ? ` · ${esc(m.phone)}` : ''}</p>
    <div style="margin:16px 0;padding:16px;background:#fff;border-radius:14px;white-space:pre-wrap;">${esc(m.message)}</div>
    <p style="margin:0;">${button(`${siteUrl()}/admin/messages`, 'Open messages')}</p>`
  return { subject: `[${m.inquiryType}] ${m.subject}`, html: layout({ preheader: `${m.name}: ${m.message.slice(0, 90)}`, body }), text: `${m.name} <${m.email}>\n\n${m.message}` }
}

export function testEmail() {
  const body = `<h1 style="margin:0 0 14px;font-family:${SERIF};font-weight:400;font-size:30px;">Email is working</h1><p style="margin:0;">This test was sent from Admin → Settings. Ticket and reminder emails will look like this.</p>`
  return { subject: 'BeeJay Sax test email', html: layout({ preheader: 'Test email from the admin', body }), text: 'Email is working.' }
}

export type CampaignContent = {
  subject: string
  preheader?: string | null
  heading?: string | null
  body: string
  imageUrl?: string | null
  buttonLabel?: string | null
  buttonUrl?: string | null
}

/** Escapes, then turns **bold**, bare https:// links and line breaks into email-safe HTML. */
function richText(s: string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, `<a href="$1" style="color:${C.clay};">$1</a>`)
    .replace(/\n/g, '<br>')
}

const absolute = (u: string) => (u.startsWith('/') ? siteUrl() + u : u)

/**
 * A mailing-list campaign. {{name}} in the heading or body becomes the reader's first name ("friend" if unknown).
 * Safe to import in the browser (the admin editor uses it for the live preview).
 */
export function campaignEmail(c: CampaignContent, to: { name: string | null; unsubscribeUrl: string }) {
  const first = to.name?.trim().split(/\s+/)[0] || 'friend'
  const fill = (s: string) => s.replace(/\{\{\s*name\s*\}\}/gi, first)
  const body = c.body.trim() ? fill(c.body.trim()) : ''
  const paras = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;">${richText(p)}</p>`)
    .join('')
  const html = layout({
    preheader: fill(c.preheader?.trim() || body.slice(0, 120)),
    body: `
    ${c.imageUrl ? `<img src="${esc(absolute(c.imageUrl))}" alt="" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:16px;margin:0 0 24px;">` : ''}
    ${c.heading?.trim() ? `<h1 style="margin:0 0 18px;font-family:${SERIF};font-weight:400;font-size:30px;line-height:1.1;color:${C.text};">${esc(fill(c.heading.trim()))}</h1>` : ''}
    ${paras}
    ${c.buttonLabel?.trim() && c.buttonUrl?.trim() ? `<p style="margin:22px 0 4px;">${button(absolute(c.buttonUrl.trim()), c.buttonLabel.trim())}</p>` : ''}`,
    footer: `You’re getting this because you’re on the BeeJay Sax mailing list. <a href="${esc(to.unsubscribeUrl)}" style="color:rgba(247,241,227,0.75);">Unsubscribe</a>`,
  })
  const text = [c.heading?.trim() ? fill(c.heading.trim()) : '', body, c.buttonLabel && c.buttonUrl ? `${c.buttonLabel}: ${absolute(c.buttonUrl)}` : '', `Unsubscribe: ${to.unsubscribeUrl}`]
    .filter(Boolean)
    .join('\n\n')
  return { subject: fill(c.subject), html, text }
}
