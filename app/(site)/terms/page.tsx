import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'
import { getContent } from '@/lib/content/store'
import LegalPage, { LegalHeading, type LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Use — BeeJay Sax',
  description: 'The terms for using beejaysax.com: content and copyright, acceptable use, links, liability and governing law.',
  path: '/terms',
})

// Rendered per request; see app/(site)/layout.tsx.
export const dynamic = 'force-dynamic'

const SECTIONS: LegalSection[] = [
  { id: 'about', title: 'About these terms' },
  { id: 'content', title: 'Music, photos and videos' },
  { id: 'acceptable-use', title: 'Using the site fairly' },
  { id: 'submissions', title: 'What you send us' },
  { id: 'links', title: 'Links and embedded content' },
  { id: 'tickets', title: 'Tickets' },
  { id: 'availability', title: 'Availability and accuracy' },
  { id: 'liability', title: 'Our liability' },
  { id: 'law', title: 'Governing law' },
  { id: 'changes', title: 'Changes and contact' },
]

const h = (i: number) => <LegalHeading section={SECTIONS[i]} n={i + 1} />

export default async function TermsPage() {
  const [legal, site] = await Promise.all([getContent('legal'), getContent('site')])

  return (
    <LegalPage
      title={['Terms', 'of use']}
      intro="The rules for using this website. Please read them; by using the site you agree to them."
      lastUpdated={legal.lastUpdated}
      sections={SECTIONS}
    >
      {h(0)}
      <p>
        beejaysax.com is run by {legal.controllerName}, {legal.address} (“BeeJay Sax”, “we”, “us”). These terms apply to everyone who uses the site. Our{' '}
        <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookie Policy</Link> explain how we handle personal data, and the{' '}
        <Link href="/ticket-terms">Ticket Terms</Link> apply when you buy or book a ticket.
      </p>

      {h(1)}
      <p>
        The music, recordings, artwork, photos, videos, logos, the BeeJay Sax name and the text on this site belong to BeeJay Sax or to the people who
        licensed them to us, and are protected by copyright and trade mark law, including the Nigerian Copyright Act 2022.
      </p>
      <p>You may view and listen to the content for your own personal, non-commercial use, and share links to pages. Without our written permission you may not:</p>
      <ul>
        <li>download, copy, re-upload or distribute the music, previews, photos or videos;</li>
        <li>use them in other works, adverts, broadcasts or public performances;</li>
        <li>use the BeeJay Sax name or logo in a way that suggests we endorse you.</li>
      </ul>
      <p>
        For permission, licensing or press use, <Link href="/contact?inquiry=media">get in touch</Link>.
      </p>

      {h(2)}
      <p>You agree not to:</p>
      <ul>
        <li>break the law, or help anyone else do so, while using the site;</li>
        <li>try to get into parts of the site you aren’t allowed in, such as the admin area or other people’s tickets;</li>
        <li>interfere with the site, overload it, or probe it for weaknesses without permission;</li>
        <li>use bots or scripts to buy tickets, submit forms or copy content;</li>
        <li>send spam, abuse or harmful files through the contact form or any other feature;</li>
        <li>impersonate someone else or give false details.</li>
      </ul>
      <p>We may block access or cancel orders made in breach of these rules.</p>

      {h(3)}
      <p>
        When you contact us you confirm the information is accurate and yours to share. Please don’t send us confidential information unless we have
        asked for it. If you send ideas or material, we don’t have to use or return them, and we won’t owe you anything if we develop something similar
        independently.
      </p>

      {h(4)}
      <p>
        The site links to and embeds content from other services such as YouTube, Google Maps, Spotify, Apple Music and social media. Their own terms
        and privacy policies apply. We aren’t responsible for their content or for how they handle your data.
      </p>

      {h(5)}
      <p>
        Tickets are sold under our <Link href="/ticket-terms">Ticket Terms and Refund Policy</Link>, which form part of these terms.
      </p>

      {h(6)}
      <p>
        We work to keep the site accurate and available, but we can’t promise it will always be error-free or online. Event details can change: the
        details sent with your ticket and our announcements take priority over anything on an older page.
      </p>

      {h(7)}
      <p>
        To the extent allowed by Nigerian law, the site is provided “as is”, and we are not liable for indirect or consequential loss, loss of profit
        or data, or loss caused by events outside our reasonable control. Our total liability to you in connection with the site is limited to the
        amount you paid us, if any, for the item the claim relates to.
      </p>
      <p>
        Nothing in these terms limits liability that can’t legally be limited, such as for death or personal injury caused by negligence, or for
        fraud, and nothing affects your rights as a consumer under the Federal Competition and Consumer Protection Act 2018 or, if you live in the UK
        or EU, under the consumer law of your country.
      </p>

      {h(8)}
      <p>
        These terms are governed by the laws of the Federal Republic of Nigeria. The courts of Lagos State have jurisdiction over any dispute, though
        we will always try to resolve problems informally first. If you are a consumer living in the UK or EU, you may also bring a claim in the courts
        where you live.
      </p>

      {h(9)}
      <p>
        We may update these terms; the date at the top shows the latest version. Questions? Email{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalPage>
  )
}
