import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'
import { getContent } from '@/lib/content/store'
import LegalPage, { LegalHeading, LegalTable, type LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy — BeeJay Sax',
  description: 'How BeeJay Sax collects, uses, shares and protects your personal data, and the rights you have under the Nigeria Data Protection Act and the GDPR.',
  path: '/privacy',
})

// Rendered per request; see app/(site)/layout.tsx.
export const dynamic = 'force-dynamic'

const SECTIONS: LegalSection[] = [
  { id: 'who-we-are', title: 'Who we are' },
  { id: 'what-we-collect', title: 'What we collect and why' },
  { id: 'lawful-basis', title: 'Our lawful basis' },
  { id: 'sharing', title: 'Who we share it with' },
  { id: 'transfers', title: 'Transfers outside Nigeria' },
  { id: 'retention', title: 'How long we keep it' },
  { id: 'rights', title: 'Your rights' },
  { id: 'exercise', title: 'How to use your rights' },
  { id: 'complaints', title: 'Complaints' },
  { id: 'children', title: 'Children' },
  { id: 'security', title: 'Security' },
  { id: 'breaches', title: 'If something goes wrong' },
  { id: 'cookies', title: 'Cookies' },
  { id: 'changes', title: 'Changes to this policy' },
]

const h = (i: number) => <LegalHeading section={SECTIONS[i]} n={i + 1} />

export default async function PrivacyPage() {
  const legal = await getContent('legal')
  const mail = <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>

  return (
    <LegalPage
      title={['Privacy', 'policy']}
      intro="What personal data this website collects, what we do with it, who else sees it, and how to get it changed or deleted."
      lastUpdated={legal.lastUpdated}
      sections={SECTIONS}
    >
      {h(0)}
      <p>
        This website, beejaysax.com, is run by <strong>{legal.controllerName}</strong> (“BeeJay Sax”, “we”, “us”), {legal.address}. We are the
        data controller for the personal data described here: we decide why and how it is used.
      </p>
      <p>Questions about this policy or your data: {mail}.</p>
      {legal.dpoName && (
        <p>
          Our Data Protection Officer is {legal.dpoName}
          {legal.dpoEmail && (
            <>
              , who you can reach at <a href={`mailto:${legal.dpoEmail}`}>{legal.dpoEmail}</a>
            </>
          )}
          .
        </p>
      )}
      <p>
        This policy is written to meet the Nigeria Data Protection Act 2023 (NDPA) and the Nigeria Data Protection Commission’s General Application
        and Implementation Directive 2025 (GAID). Because the site has visitors and events in the UK and Europe, it also covers the UK GDPR and the
        EU General Data Protection Regulation (GDPR).
      </p>

      {h(1)}
      <p>We only collect what we need for each thing you do on the site.</p>

      <h3>Sending a message through the contact form</h3>
      <p>
        Your name, email address, phone number (optional), the type of enquiry, subject and message. We use them to read and answer your enquiry,
        for example a booking request. The message is saved in our admin inbox and a copy is emailed to the team. You also get an automatic email
        confirming we received it.
      </p>

      <h3>Joining the mailing list</h3>
      <p>
        Your email address (and name if you give it). We use it to send news about new music, concerts and early tickets. Every email has an
        unsubscribe link. We record when you joined, how (website signup or added by the team, for example people who signed up at an event), and
        if you unsubscribe or your address bounces.
      </p>

      <h3>Buying or booking tickets</h3>
      <p>
        Your first and last name, email address and phone number (optional), the event, ticket type, quantity, any discount code, the amount and
        currency, and the payment status and reference. We use this to issue your tickets, email them with their QR codes, send event reminders and
        any important updates (such as a change of time or venue), handle refunds, and keep financial records.
      </p>
      <p>
        Payment is taken by <strong>Paystack</strong> on its own secure page. We send Paystack your email address, the amount and an order
        reference. Your card or bank details go straight to Paystack: <strong>we never see or store them</strong>.
      </p>

      <h3>Checking in at the door</h3>
      <p>
        When your QR code is scanned we record that the ticket was used, when, and which staff account or volunteer scanned it. This stops a ticket
        being used twice.
      </p>

      <h3>Staff and volunteer accounts</h3>
      <p>
        For people who manage the site: username, email address, a securely hashed password and when they last signed in. Door volunteers enter a
        PIN for an event; we store only a hashed version of it.
      </p>

      <h3>Security and technical data</h3>
      <p>
        Like any website, our server and our security provider <strong>Cloudflare</strong> receive technical information with each request: your IP
        address, browser type, the page requested and the time. Cloudflare uses it to block attacks and bots. To stop the forms being abused, our
        server briefly holds your IP address in memory and counts how many times it has submitted a form or tried to sign in in the last hour or
        less. That count is never written to the database or disk.
      </p>

      <h3>Videos, maps and music previews</h3>
      <p>
        YouTube videos and Google Maps only load if you agree to media embeds in the cookie banner, or press “Load video” or “Load map”. Google then
        receives your IP address and may set cookies, under Google’s own privacy policy. When you press play on a 30-second track preview, the audio
        streams from Apple’s servers, so Apple receives your IP address. See the <Link href="/cookies">Cookie Policy</Link>.
      </p>
      <p>We do not use advertising trackers or sell your data. We do not currently run analytics on the site.</p>

      {h(2)}
      <p>
        The law only lets us use personal data when we have a lawful basis (NDPA section 25; GDPR Article 6). Ours are:
      </p>
      <LegalTable
        head={['What', 'Lawful basis']}
        rows={[
          ['Tickets, ticket emails, reminders, event updates, check-in', 'Contract: we need it to sell you a ticket and let you in.'],
          ['Payment and order records kept for tax and accounting', 'Legal obligation.'],
          ['Mailing list', 'Consent. You can withdraw it at any time with the unsubscribe link.'],
          ['Answering contact form messages', 'Legitimate interests (responding to people who write to us), or steps before a contract when you ask to book BeeJay.'],
          ['Security, rate limits, Cloudflare, staff sign-in logs', 'Legitimate interests in keeping the site and your data safe.'],
          ['YouTube and Google Maps embeds', 'Consent, given in the cookie banner.'],
        ]}
      />
      <p>
        Where we rely on legitimate interests we have weighed them against your rights, and you can object (see <a href="#rights">Your rights</a>).
      </p>

      {h(3)}
      <p>
        We don’t sell or rent personal data. We use these service providers (“processors”) who handle data on our instructions and under contract:
      </p>
      <ul>
        <li>
          <strong>Paystack</strong> (Nigeria): takes card, bank transfer and USSD payments. It is also a controller for the payment data it collects
          itself.
        </li>
        <li>
          <strong>Resend</strong> (USA) and <strong>Brevo</strong> (France): send our emails (tickets, replies, newsletters) and tell us if an email
          bounces or is marked as spam.
        </li>
        <li>
          <strong>Our web hosting provider</strong>: the server that runs the website and its database, and stores uploaded photos.
        </li>
        <li>
          <strong>Cloudflare</strong> (USA, global network): sits in front of the site to speed it up and protect it from attacks.
        </li>
        <li>
          <strong>Google</strong> (YouTube and Google Maps) and <strong>Apple</strong> (music previews): only when you load a video or map or play a
          preview, as described above. They act as independent controllers.
        </li>
      </ul>
      <p>
        We may also share data where the law requires it (for example with tax authorities or the police under a valid legal request), or with
        professional advisers such as accountants and lawyers.
      </p>

      {h(4)}
      <p>
        Some of our providers store or process data outside Nigeria, including in the United Kingdom, the European Union and the United States. Under
        Part VIII of the NDPA and the GAID, we only transfer personal data abroad when the receiving country has adequate protection, or when there are
        appropriate safeguards such as contractual clauses with the provider, or another ground the NDPA allows (for example, the transfer is needed
        to perform your ticket contract).
      </p>
      <p>
        For visitors in the UK and EU, transfers to countries without an adequacy decision are covered by the providers’ Standard Contractual Clauses
        (and the UK Addendum), or the EU–US and UK–US Data Privacy Framework where the provider is certified.
      </p>
      <p>You can ask us for details of the safeguards for any provider at {mail}.</p>

      {h(5)}
      <LegalTable
        head={['Data', 'How long']}
        rows={[
          ['Orders, tickets, payment and refund records', '6 years after the event, for tax and accounting.'],
          ['Unpaid or abandoned checkouts', 'Up to 12 months, then deleted.'],
          ['Contact form messages', '2 years after you send them, then deleted. Details needed for a booking are kept with that booking’s records.'],
          ['Mailing list', 'Until you unsubscribe. We then keep only your email address and the date, so we never email you again by mistake.'],
          ['Bounced or spam-reported addresses', 'Kept on a do-not-email list for as long as we send email.'],
          ['Copies of emails we sent and delivery status', '2 years.'],
          ['Staff accounts', 'While the person works with us; deleted when the account is removed.'],
          ['IP addresses used for rate limits', 'In server memory only, ignored after at most one hour and cleared when the server restarts.'],
          ['Server and security logs', 'Short-term, normally no more than 30 days, set by our host and Cloudflare.'],
          ['Your cookie choice', '12 months, then we ask again.'],
        ]}
      />

      {h(6)}
      <p>Under the NDPA (sections 34 to 38) and the GDPR (Articles 15 to 22) you have the right to:</p>
      <ul>
        <li>
          <strong>Be informed</strong> about how your data is used. This policy does that.
        </li>
        <li>
          <strong>Access</strong> your data and get a copy.
        </li>
        <li>
          <strong>Rectification</strong>: have wrong or incomplete data corrected.
        </li>
        <li>
          <strong>Erasure</strong>: have your data deleted, unless we must keep it (for example financial records).
        </li>
        <li>
          <strong>Restriction</strong>: ask us to pause using your data while a concern is sorted out.
        </li>
        <li>
          <strong>Portability</strong>: receive the data you gave us in a common, machine-readable format, or have it sent to someone else.
        </li>
        <li>
          <strong>Object</strong> to our use of your data based on legitimate interests, and to direct marketing at any time.
        </li>
        <li>
          <strong>Withdraw consent</strong> at any time, for example by unsubscribing or changing your cookie settings. This doesn’t affect what we
          did before.
        </li>
        <li>
          <strong>Not be subject to decisions made solely by automated means</strong> that have legal or similarly significant effects. We don’t make
          any such decisions.
        </li>
      </ul>

      {h(7)}
      <p>
        Email {mail} and tell us what you’d like. We may ask you to confirm your identity, for example by replying from the email address you used
        with us. It’s free. We will reply within 30 days (NDPA) or one month (GDPR). If a request is complex we may need longer, as the law allows,
        and will tell you why.
      </p>
      <p>To leave the mailing list, use the unsubscribe link in any of our emails.</p>

      {h(8)}
      <p>Please contact us first so we can try to put things right. You also have the right to complain to a regulator:</p>
      <ul>
        <li>
          In Nigeria: the <strong>Nigeria Data Protection Commission</strong>,{' '}
          <a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer">
            ndpc.gov.ng
          </a>
          .
        </li>
        <li>
          In the UK: the <strong>Information Commissioner’s Office</strong>,{' '}
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
            ico.org.uk
          </a>
          .
        </li>
        <li>
          In the EU: the data protection authority in the country where you live or work (listed at{' '}
          <a href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer">
            edpb.europa.eu
          </a>
          ).
        </li>
      </ul>

      {h(9)}
      <p>
        This website is not aimed at children under 13 and we don’t knowingly collect their data. Under the NDPA, anyone under 18 needs a parent or
        guardian’s consent, so tickets for under-18s should be bought by a parent or guardian, using the adult’s details. Young people under 18 should
        ask a parent or guardian before joining the mailing list. If you think a child has given us their data, email {mail} and we will delete it.
      </p>

      {h(10)}
      <ul>
        <li>The whole site uses HTTPS, so data is encrypted between your browser and us.</li>
        <li>Staff passwords and door PINs are stored only as salted hashes, never in plain text.</li>
        <li>Staff accounts have individual permissions, and sign-in attempts are limited to block password guessing.</li>
        <li>Saved third-party passwords and keys are encrypted in the database.</li>
        <li>Card details are handled only by Paystack.</li>
      </ul>
      <p>No system is perfectly secure, but we work to protect your data and fix problems quickly.</p>

      {h(11)}
      <p>
        If a personal data breach is likely to put people’s rights at risk, we will report it to the Nigeria Data Protection Commission within 72 hours
        of becoming aware of it, and to the ICO or EU authority where the GDPR applies. If the risk to you is high, we will tell you directly and
        without delay, with what happened and what you can do.
      </p>

      {h(12)}
      <p>
        We only use the cookies the site needs to work, plus YouTube and Google Maps if you allow them. The full list is in our{' '}
        <Link href="/cookies">Cookie Policy</Link>.
      </p>

      {h(13)}
      <p>
        If we change this policy, we will update the date at the top. For significant changes we will tell you on the site or by email, and ask for
        your consent again where the law requires it.
      </p>
    </LegalPage>
  )
}
