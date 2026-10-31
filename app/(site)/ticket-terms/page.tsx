import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'
import { getContent, paragraphs } from '@/lib/content/store'
import LegalPage, { LegalHeading, type LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = pageMetadata({
  title: 'Ticket Terms & Refund Policy — BeeJay Sax',
  description: 'The conditions for BeeJay Sax concert tickets: refunds, cancellations and postponements, entry, QR codes, transfers, pricing and discount codes.',
  path: '/ticket-terms',
})

// Rendered per request; see app/(site)/layout.tsx.
export const dynamic = 'force-dynamic'

const SECTIONS: LegalSection[] = [
  { id: 'refunds', title: 'Refunds, cancellations and postponements' },
  { id: 'your-ticket', title: 'Your ticket' },
  { id: 'buying', title: 'Prices and payment' },
  { id: 'discounts', title: 'Discount codes' },
  { id: 'entry', title: 'Getting in' },
  { id: 'at-the-event', title: 'At the event' },
  { id: 'lost', title: 'Lost tickets' },
  { id: 'liability', title: 'Our liability and contact' },
]

const h = (i: number) => <LegalHeading section={SECTIONS[i]} n={i + 1} />

export default async function TicketTermsPage() {
  const [legal, site] = await Promise.all([getContent('legal'), getContent('site')])
  const mail = <a href={`mailto:${site.email}`}>{site.email}</a>

  return (
    <LegalPage
      title={['Ticket', 'terms']}
      intro="The conditions that apply when you buy or book a ticket for a BeeJay Sax event on this website."
      lastUpdated={legal.lastUpdated}
      sections={SECTIONS}
    >
      <p>
        Tickets are sold by {legal.controllerName}. Where an event is run with a venue or a partner promoter, their conditions of entry also apply at
        the door. These terms sit alongside our <Link href="/terms">Terms of Use</Link> and <Link href="/privacy">Privacy Policy</Link>.
      </p>

      {h(0)}
      {paragraphs(legal.refundPolicy).map((p) => (
        <p key={p.slice(0, 48)}>{p}</p>
      ))}
      <p>
        Refunds go back to the card or account you paid with, through Paystack, and can take several working days to appear depending on your bank.
        To ask for a refund, email {mail} with your order reference.
      </p>
      <p>
        If your payment goes through after your seats were released (see below) and the event has sold out in the meantime, we will refund the full
        amount.
      </p>

      {h(1)}
      <ul>
        <li>A ticket is a personal, revocable licence to attend the event. It stays our property and we may cancel it if these terms are broken.</li>
        <li>Each ticket has its own QR code, which admits the number of people shown on it, once.</li>
        <li>Tickets may not be resold for profit or used for promotions or prizes without our written permission. Tickets bought from anyone else may not be valid.</li>
        <li>Children and young people under 18 need a ticket bought by a parent or guardian, unless the event says otherwise, and may need to be accompanied.</li>
      </ul>

      {h(2)}
      <ul>
        <li>
          Prices are shown in the event’s currency (for example Naira or Pounds). A payment processing fee, which covers our payment provider Paystack’s charge, is
          added on top of the ticket price and shown at checkout before you pay. Your bank may add its own charges for foreign currency.
        </li>
        <li>The processing fee is not refundable, because Paystack does not return it to us. Refunds are of the ticket price you paid.</li>
        <li>Payments are processed by Paystack by card, bank transfer or USSD. We never see or store your card details.</li>
        <li>Your seats are held for 15 minutes while you pay. If payment isn’t completed in that time they are released to other buyers.</li>
        <li>Your order is confirmed when payment succeeds and your tickets are emailed to you. If you don’t get them within an hour, check your spam folder, then contact us.</li>
        <li>Free tickets are issued straight away and are subject to the same terms.</li>
      </ul>

      {h(3)}
      <ul>
        <li>One discount code per order. Codes may be for a specific event, have start and end dates, and be limited to a number of uses.</li>
        <li>Codes have no cash value, can’t be exchanged, and can’t be applied after you have paid.</li>
        <li>We may cancel a code that is shared or used in ways it wasn’t intended for.</li>
      </ul>

      {h(4)}
      <ul>
        <li>Bring your QR code on your phone or printed. It is scanned at the door.</li>
        <li>Each QR code works once. If a ticket has been copied, only the first person to scan gets in, and we may refuse entry for a duplicated or already-used code.</li>
        <li>You may be asked for photo ID matching the name on the ticket, particularly for concessions or if a ticket looks suspicious.</li>
        <li>Doors, start times and the line-up can change. We will email you about important changes.</li>
        <li>Late arrivals may be admitted at a suitable break in the programme.</li>
      </ul>

      {h(5)}
      <ul>
        <li>Venue rules apply, including security searches and the venue’s policies on bags, food and drink.</li>
        <li>We or the venue may refuse entry, or ask you to leave, without a refund, if you behave in a way that is unsafe, disruptive or unlawful.</li>
        <li>
          Events may be photographed, filmed and recorded for broadcast and promotion. By attending you accept that you may appear in this footage. If
          you have a concern, speak to our team on the night or email {mail}.
        </li>
        <li>You may take photos for personal use, but professional recording equipment and recording full performances need our permission.</li>
      </ul>

      {h(6)}
      <p>
        Your tickets are in the confirmation email: open it to view, print or save them as a PDF, or share them on WhatsApp. You can also forward the email or the ticket link to
        someone in your group. If you can’t find it, email {mail} from the address you used to buy, with your name and the event, and we will re-send
        it.
      </p>

      {h(7)}
      <p>
        To the extent allowed by law, our liability to you in connection with a ticket is limited to the price you paid for it. We are not responsible
        for travel, accommodation or other costs if an event changes or is cancelled. This doesn’t affect your statutory rights as a consumer.
      </p>
      <p>Questions about an order: {mail}.</p>
    </LegalPage>
  )
}
