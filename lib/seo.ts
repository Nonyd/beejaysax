import type { Metadata } from 'next'
import type { Event, Release, TicketTier } from '@prisma/client'

/** Search and link-preview helpers shared by every public page. */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')
export const SITE_NAME = 'BeeJay Sax'
export const LEGAL_NAME = 'Abolaji David Banjoko'

/** The branded share card in public/og.jpg; pages without their own image use it. */
export const DEFAULT_OG_IMAGE = {
  url: '/og.jpg',
  width: 1200,
  height: 630,
  alt: 'BeeJay Sax, gospel saxophonist and music minister',
}

type ShareImage = { url: string; width?: number; height?: number; alt?: string }

export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`)

/**
 * Metadata for a public page. Next merges metadata shallowly, so a page that sets openGraph
 * replaces the site-wide one entirely; this always fills in the image, site name and canonical URL.
 */
export function pageMetadata(p: {
  title: string
  description: string
  path: string
  shareTitle?: string
  shareDescription?: string
  image?: ShareImage | null
  type?: 'website' | 'profile' | 'music.album' | 'music.song' | 'article'
}): Metadata {
  const images = [p.image ?? DEFAULT_OG_IMAGE]
  const shareTitle = p.shareTitle ?? p.title
  const shareDescription = p.shareDescription ?? p.description
  return {
    title: { absolute: p.title },
    description: p.description,
    alternates: { canonical: p.path },
    openGraph: {
      title: shareTitle,
      description: shareDescription,
      url: p.path,
      siteName: SITE_NAME,
      locale: 'en_NG',
      type: p.type ?? 'website',
      images,
    },
    twitter: { card: 'summary_large_image', title: shareTitle, description: shareDescription, images: images.map((i) => i.url) },
  }
}

/* ---------- Structured data (schema.org JSON-LD) ---------- */

const ARTIST_ID = `${SITE_URL}/#artist`
const PERSON_ID = `${SITE_URL}/#person`
const SITE_ID = `${SITE_URL}/#website`

/** The artist and the person behind it, so Google and AI answer engines connect the name to the site and profiles. */
export function artistJsonLd(opts: { description: string; socials: { url: string }[]; image?: string }) {
  const sameAs = opts.socials.map((s) => s.url).filter((u) => /^https:\/\/[^/]+\/./.test(u))
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'MusicGroup',
      '@id': ARTIST_ID,
      name: SITE_NAME,
      alternateName: ['Beejay Sax', 'BeeJaySax'],
      url: SITE_URL,
      logo: absoluteUrl('/brand/icon-512.png'),
      image: absoluteUrl(opts.image ?? '/og.jpg'),
      description: opts.description,
      genre: ['Gospel', 'Christian', 'Jazz', 'Instrumental'],
      foundingLocation: { '@type': 'Place', name: 'Lagos, Nigeria' },
      member: { '@id': PERSON_ID },
      sameAs,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': PERSON_ID,
      name: LEGAL_NAME,
      alternateName: SITE_NAME,
      jobTitle: 'Gospel saxophonist and music minister',
      nationality: { '@type': 'Country', name: 'Nigeria' },
      url: `${SITE_URL}/about`,
      image: absoluteUrl(opts.image ?? '/og.jpg'),
      knowsAbout: ['Saxophone', 'Gospel music', 'Worship ministry'],
      memberOf: { '@id': ARTIST_ID },
      sameAs,
    },
  ]
}

export function websiteJsonLd(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description,
    inLanguage: 'en',
    publisher: { '@id': ARTIST_ID },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...items].map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  }
}

const EVENT_STATUS: Record<string, string> = {
  CANCELLED: 'https://schema.org/EventCancelled',
  POSTPONED: 'https://schema.org/EventPostponed',
}

/** A concert as a MusicEvent with its ticket offers, which makes it eligible for Google's event results. */
export function eventJsonLd(event: Event, tiers: Pick<TicketTier, 'name' | 'price' | 'saleStartsAt'>[], soldOut: boolean) {
  const url = `${SITE_URL}/events/${event.id}`
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: event.title,
    description: event.excerpt ?? event.description?.slice(0, 300) ?? `${event.title} with BeeJay Sax`,
    url,
    startDate: event.eventDate.toISOString(),
    ...(event.endDate ? { endDate: event.endDate.toISOString() } : {}),
    eventStatus: EVENT_STATUS[event.status] ?? 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [absoluteUrl(event.posterImage ?? '/og.jpg')],
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        ...(event.address ? { streetAddress: event.address } : {}),
        addressLocality: event.city,
        addressCountry: event.country,
      },
    },
    performer: { '@id': ARTIST_ID, '@type': 'MusicGroup', name: SITE_NAME },
    organizer: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    offers: (tiers.length ? tiers : [{ name: 'Admission', price: event.isFree ? 0 : (event.ticketPrice ?? 0), saleStartsAt: null }]).map((t) => ({
      '@type': 'Offer',
      name: t.name,
      price: t.price,
      priceCurrency: event.currency,
      url,
      availability: soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      ...(t.saleStartsAt ? { validFrom: t.saleStartsAt.toISOString() } : {}),
    })),
  }
}

/** Albums and EPs as MusicAlbum, singles as MusicRecording, linked to the streaming pages. */
export function releaseJsonLd(release: Release) {
  const links = [release.spotifyUrl, release.appleMusicUrl, release.youtubeUrl, release.audiomackUrl, release.boomplayUrl].filter(
    (u): u is string => Boolean(u)
  )
  const single = release.releaseType === 'SINGLE'
  return {
    '@context': 'https://schema.org',
    '@type': single ? 'MusicRecording' : 'MusicAlbum',
    name: release.title,
    url: `${SITE_URL}/releases/${release.slug}`,
    ...(release.description ? { description: release.description } : {}),
    ...(release.coverImage ? { image: absoluteUrl(release.coverImage) } : {}),
    ...(release.releaseDate ? { datePublished: release.releaseDate.toISOString().slice(0, 10) } : {}),
    byArtist: { '@id': ARTIST_ID, '@type': 'MusicGroup', name: SITE_NAME },
    ...(single ? {} : { albumReleaseType: release.releaseType === 'EP' ? 'https://schema.org/EPRelease' : 'https://schema.org/AlbumRelease' }),
    genre: 'Gospel',
    sameAs: links,
  }
}
