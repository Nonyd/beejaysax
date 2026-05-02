import { BrevoClient, BrevoError } from '@getbrevo/brevo'
import { format } from 'date-fns'

function getBrevoClient(): BrevoClient | null {
  const key = process.env.BREVO_API_KEY?.trim()
  if (!key || key === 'paste-your-key-here') return null
  return new BrevoClient({ apiKey: key })
}

function brevoSender(): { email: string; name?: string } | null {
  const raw = process.env.EMAIL_FROM?.trim()
  if (!raw) return null
  const bracket = raw.match(/^(.+?)\s*<([^>]+)>$/)
  if (bracket) {
    const name = bracket[1].replace(/^["']|["']$/g, '').trim()
    const email = bracket[2].trim()
    if (email) return { email, name: name || undefined }
  }
  return { email: raw }
}

export type TicketEmailLine = {
  ticketNumber: string
  qrDataUrl: string
  viewUrl: string
}

export async function sendTicketEmail(args: {
  to: string
  attendeeFirstName: string
  eventTitle: string
  eventDate: Date
  venue: string
  city: string
  country: string
  tickets: TicketEmailLine[]
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const sender = brevoSender()
  if (!sender) {
    return { ok: false, message: 'EMAIL_FROM is not configured' }
  }
  const client = getBrevoClient()
  if (!client) {
    return { ok: false, message: 'BREVO_API_KEY is not configured' }
  }

  const when = format(args.eventDate, 'EEEE, MMMM d, yyyy')
  const blocks = args.tickets
    .map(
      (t) => `
      <div style="margin:24px 0;padding:20px;border:1px solid #c9a84c;background:#0f0f0f;">
        <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:18px;color:#f5f0e8;">${escapeHtml(t.ticketNumber)}</p>
        <p style="margin:0 0 16px;font-family:sans-serif;font-size:13px;">
          <a href="${escapeHtml(t.viewUrl)}" style="color:#c9a84c;">View digital ticket</a>
        </p>
        <img src="${t.qrDataUrl}" alt="Ticket QR" width="220" height="220" style="display:block;background:#f5f0e8;padding:8px;" />
      </div>`
    )
    .join('')

  const html = `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;background:#080808;color:#f5f0e8;font-family:system-ui,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:32px 16px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;text-align:left;">
              <tr><td style="font-family:Georgia,serif;font-size:22px;color:#c9a84c;font-style:italic;">BeeJay Sax Live</td></tr>
              <tr><td style="height:16px;"></td></tr>
              <tr><td style="font-size:15px;line-height:1.6;">Hi ${escapeHtml(args.attendeeFirstName)},</td></tr>
              <tr><td style="height:12px;"></td></tr>
              <tr><td style="font-size:15px;line-height:1.6;">You&apos;re confirmed for <strong>${escapeHtml(args.eventTitle)}</strong>.</td></tr>
              <tr><td style="height:8px;"></td></tr>
              <tr><td style="font-size:14px;color:#aaaaaa;line-height:1.6;">${escapeHtml(when)}<br/>
              ${escapeHtml(args.venue)} · ${escapeHtml(args.city)}, ${escapeHtml(args.country)}</td></tr>
              <tr><td style="height:24px;"></td></tr>
              <tr><td style="font-size:13px;line-height:1.6;">Your ticket${args.tickets.length > 1 ? 's' : ''}:</td></tr>
              <tr><td>${blocks}</td></tr>
              <tr><td style="font-size:12px;color:#888888;line-height:1.5;">Show this email or your digital ticket at the entrance. If you don&apos;t see images, open the ticket link in your browser.</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`

  try {
    const data = await client.transactionalEmails.sendTransacEmail({
      sender: { email: sender.email, name: sender.name ?? 'BeeJay Sax Live' },
      to: [{ email: args.to }],
      subject: `Your ticket — ${args.eventTitle}`,
      htmlContent: html,
    })

    if (!data?.messageId && !(data?.messageIds && data.messageIds.length)) {
      return { ok: false, message: 'No message id from Brevo' }
    }
    return { ok: true }
  } catch (e) {
    if (e instanceof BrevoError) {
      return { ok: false, message: e.message ?? 'Brevo error' }
    }
    return { ok: false, message: e instanceof Error ? e.message : 'Email send failed' }
  }
}

export const sendTicketConfirmationEmail = sendTicketEmail

export async function sendContactAutoReply(args: {
  to: string
  firstName: string
  subject?: string
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const sender = brevoSender()
  if (!sender) {
    return { ok: false, message: 'EMAIL_FROM is not configured' }
  }
  const client = getBrevoClient()
  if (!client) {
    return { ok: false, message: 'BREVO_API_KEY is not configured' }
  }

  const subj = args.subject?.trim()
  const html = `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;background:#080808;color:#f5f0e8;font-family:system-ui,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:32px 16px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;text-align:left;">
              <tr><td style="font-family:Georgia,serif;font-size:22px;color:#c9a84c;font-style:italic;">BeeJay Sax Live</td></tr>
              <tr><td style="height:16px;"></td></tr>
              <tr><td style="font-size:15px;line-height:1.6;">Hi ${escapeHtml(args.firstName)},</td></tr>
              <tr><td style="height:12px;"></td></tr>
              <tr><td style="font-size:15px;line-height:1.6;">Thanks for reaching out. We&apos;ve received your message${
                subj ? ` about <strong>${escapeHtml(subj)}</strong>` : ''
              } and will get back to you as soon as we can.</td></tr>
              <tr><td style="height:16px;"></td></tr>
              <tr><td style="font-size:13px;color:#aaaaaa;line-height:1.6;">— BeeJay Sax team</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`

  try {
    const data = await client.transactionalEmails.sendTransacEmail({
      sender: { email: sender.email, name: sender.name ?? 'BeeJay Sax Live' },
      to: [{ email: args.to }],
      subject: 'We received your message — BeeJay Sax',
      htmlContent: html,
    })

    if (!data?.messageId && !(data?.messageIds && data.messageIds.length)) {
      return { ok: false, message: 'No message id from Brevo' }
    }
    return { ok: true }
  } catch (e) {
    if (e instanceof BrevoError) {
      return { ok: false, message: e.message ?? 'Brevo error' }
    }
    return { ok: false, message: e instanceof Error ? e.message : 'Email send failed' }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
