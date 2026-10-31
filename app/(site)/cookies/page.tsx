import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'
import { getContent } from '@/lib/content/store'
import LegalPage, { LegalHeading, LegalTable, type LegalSection } from '@/components/legal/LegalPage'
import CookieSettingsButton from '@/components/consent/CookieSettingsButton'

export const metadata: Metadata = pageMetadata({
  title: 'Cookie Policy — BeeJay Sax',
  description: 'Every cookie and storage item beejaysax.com uses, what each one is for, how long it lasts, and how to change your choice.',
  path: '/cookies',
})

// Rendered per request; see app/(site)/layout.tsx.
export const dynamic = 'force-dynamic'

const SECTIONS: LegalSection[] = [
  { id: 'what-are-cookies', title: 'What cookies are' },
  { id: 'essential', title: 'Essential cookies' },
  { id: 'media', title: 'Media embeds (optional)' },
  { id: 'not-used', title: 'What we don’t use' },
  { id: 'your-choice', title: 'Changing your choice' },
  { id: 'contact', title: 'Questions' },
]

const h = (i: number) => <LegalHeading section={SECTIONS[i]} n={i + 1} />
const HEAD = ['Name', 'Set by', 'What it’s for', 'How long']

export default async function CookiesPage() {
  const legal = await getContent('legal')

  return (
    <LegalPage
      title={['Cookie', 'policy']}
      intro="This site keeps cookies to a minimum: only what it needs to work, plus YouTube and Google Maps if you allow them."
      lastUpdated={legal.lastUpdated}
      sections={SECTIONS}
    >
      {h(0)}
      <p>
        Cookies are small text files a website stores in your browser. “Local storage” is a similar store kept by your browser. Some are essential
        for a site to work; others, like those set by embedded videos, need your permission first. This policy covers both, as required by the
        Nigeria Data Protection Act 2023, the UK and EU GDPR, and the UK and EU rules on cookies (PECR and the ePrivacy Directive).
      </p>

      {h(1)}
      <p>These are always on, because the site can’t work safely without them. They are never used for advertising or to track you across sites.</p>
      <LegalTable
        head={HEAD}
        rows={[
          ['bjs_consent', 'beejaysax.com', 'Remembers your cookie choice and when you made it, so we don’t ask on every page and can show what you agreed to.', '12 months'],
          ['bjs-theme (local storage)', 'beejaysax.com', 'Remembers whether you picked the Night or Dawn colour theme.', 'Until you clear it'],
          ['__cf_bm', 'Cloudflare', 'Tells people apart from bots, to protect the site from automated attacks.', '30 minutes'],
          ['cf_clearance', 'Cloudflare', 'Only set if you are shown and pass a Cloudflare security check, so you aren’t asked again.', '30 minutes by default, up to 1 year'],
          ['_cfuvid', 'Cloudflare', 'Only if Cloudflare rate limiting is in use: keeps visitors who share an IP address from being blocked together.', 'Browser session'],
          ['__Secure-authjs.session-token', 'beejaysax.com', 'Staff only: keeps an administrator signed in to the admin area.', '7 days'],
          ['__Host-authjs.csrf-token', 'beejaysax.com', 'Staff only: protects the admin sign-in form from forged requests.', 'Browser session'],
          ['__Secure-authjs.callback-url', 'beejaysax.com', 'Staff only: returns an administrator to the page they were on after signing in.', 'Browser session'],
          ['bjs_checkin', 'beejaysax.com', 'Door volunteers only: lets a volunteer who entered the event PIN scan tickets for that event.', '12 hours'],
        ]}
      />
      <p>Visitors who only browse the site or buy tickets get only the first five at most. The staff and volunteer cookies are set only on sign-in.</p>

      {h(2)}
      <p>
        These are only set if you choose <strong>Accept all</strong>, turn on <strong>Media embeds</strong> under Customise, or press{' '}
        <strong>Load video</strong> or <strong>Load map</strong> on a single video or map. Until then you see a placeholder and nothing is loaded from
        Google. We use YouTube’s privacy-enhanced mode (youtube-nocookie.com), which avoids most cookies until you play a video.
      </p>
      <LegalTable
        head={HEAD}
        rows={[
          ['YSC', 'YouTube (Google)', 'Keeps track of video views and settings during a visit; also used for security.', 'Browser session'],
          ['VISITOR_INFO1_LIVE', 'YouTube (Google)', 'Estimates your connection speed so videos play smoothly.', 'About 6 months'],
          ['VISITOR_PRIVACY_METADATA', 'YouTube (Google)', 'Stores your cookie consent state for YouTube.', 'About 6 months'],
          ['__Secure-ROLLOUT_TOKEN', 'YouTube (Google)', 'Used by YouTube to manage features and settings for the player.', 'About 6 months'],
          ['yt-remote-*, ytidb::* (local storage)', 'YouTube (Google)', 'Player preferences, such as volume and casting to other devices.', 'Session to persistent'],
          ['NID, AEC and similar', 'Google (google.com)', 'Set by embedded Google Maps for security, preferences and to stop abuse. If you are signed in to Google, your Google cookies may also be sent.', 'About 6 months'],
        ]}
      />
      <p>
        Google decides the exact cookies and may change them. See{' '}
        <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">
          how Google uses cookies
        </a>{' '}
        and{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google’s privacy policy
        </a>
        .
      </p>
      <p>
        Track previews in the music player stream from Apple’s servers when you press play. They don’t set cookies, but Apple receives your IP
        address, as with any web request.
      </p>

      {h(3)}
      <p>No advertising cookies, no social media tracking pixels and no analytics cookies. If we ever add any, we will update this page and ask you first.</p>

      {h(4)}
      <p>
        You can change your mind at any time:{' '}
        <CookieSettingsButton className="cursor-pointer font-semibold text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold">
          open cookie settings
        </CookieSettingsButton>
        , or use “Cookie settings” at the bottom of any page. Withdrawing consent stops videos and maps loading from then on; to remove cookies Google
        has already set, clear them in your browser settings.
      </p>
      <p>
        You can also block or delete cookies in your browser. If you block essential cookies, parts of the site (such as the admin area) won’t work.
      </p>

      {h(5)}
      <p>
        Email <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>. More about how we handle personal data is in our{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  )
}
