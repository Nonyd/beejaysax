/**
 * Every piece of editable website text and imagery is declared here once, with its default
 * (the text the site shipped with). The admin editor, the save API and the public pages all
 * read from this registry, so adding a field here makes it editable everywhere.
 */

type Base = { label: string; help?: string }
export type TextField = Base & { type: 'text'; default: string; max?: number }
export type TextareaField = Base & { type: 'textarea'; default: string; max?: number; rows?: number }
export type LinesField = Base & { type: 'lines'; default: string[]; maxItems?: number }
export type ImageField = Base & { type: 'image'; default: string }
export type UrlField = Base & { type: 'url'; default: string }
export type ScalarField = TextField | TextareaField | LinesField | ImageField | UrlField
export type ListField<F extends Record<string, ScalarField> = Record<string, ScalarField>> = Base & {
  type: 'list'
  item: F
  itemLabel: string
  maxItems?: number
  default: { [K in keyof F]: F[K]['default'] }[]
}
export type Field = ScalarField | ListField

const text = (label: string, d: string, o: Partial<TextField> = {}): TextField => ({ type: 'text', label, default: d, max: 200, ...o })
const area = (label: string, d: string, o: Partial<TextareaField> = {}): TextareaField => ({ type: 'textarea', label, default: d, max: 3000, ...o })
const lines = (label: string, d: string[], o: Partial<LinesField> = {}): LinesField => ({ type: 'lines', label, default: d, maxItems: 4, ...o })
const image = (label: string, d: string, o: Partial<ImageField> = {}): ImageField => ({ type: 'image', label, default: d, ...o })
const url = (label: string, d: string, o: Partial<UrlField> = {}): UrlField => ({ type: 'url', label, default: d, ...o })
function list<F extends Record<string, ScalarField>>(
  label: string,
  itemLabel: string,
  item: F,
  d: { [K in keyof F]: F[K]['default'] }[],
  o: Partial<Base & { maxItems: number }> = {}
): ListField<F> {
  return { type: 'list', label, itemLabel, item, default: d, maxItems: 30, ...o }
}

type Section<F extends Record<string, Field>> = { title: string; group: string; description: string; page?: string; fields: F }
const section = <F extends Record<string, Field>>(s: Section<F>) => s

const LINES_HELP = 'Each line is shown on its own row, so long words never break mid-line.'
const LONDON_STILL = 'https://img.youtube.com/vi/0jxRD456j_w/maxresdefault.jpg'

export const CONTENT = {
  site: section({
    title: 'Contact details & footer',
    group: 'Site-wide',
    description: 'Contact details appear in the footer, the booking section and the contact page.',
    fields: {
      tagline: text('Motto', 'Blessed & Highly Favoured.'),
      footerBlurb: area('Footer description', 'Gospel saxophonist and music minister from Lagos, Nigeria. Blessed and highly favoured.', { rows: 3, max: 300 }),
      location: text('Location', 'Lagos, Nigeria'),
      phone: text('Phone (as shown)', '+234 80 5898 2828'),
      email: text('Booking email', 'booking@beejaysax.com'),
      bookLabel: text('“Book” button label', 'Book BeeJay', { max: 40 }),
      newsletterTitle: text('Mailing list heading', 'Hear it first', { max: 60, help: 'Shown above the signup form in the footer.' }),
      newsletterText: area('Mailing list text', 'New music, concert dates and early tickets, straight to your inbox. No spam.', { rows: 2, max: 200 }),
      socials: list(
        'Social links',
        'Link',
        { label: text('Name', ''), url: url('Link', '') },
        [
          { label: 'Instagram', url: 'https://instagram.com/beejaysax' },
          { label: 'YouTube', url: 'https://youtube.com/@beejaysax' },
          { label: 'Facebook', url: 'https://facebook.com/beejaysax' },
          { label: 'Spotify', url: 'https://open.spotify.com' },
          { label: 'TikTok', url: 'https://tiktok.com/@beejaysax' },
        ],
        { maxItems: 10 }
      ),
    },
  }),
  seo: section({
    title: 'Search & sharing',
    group: 'Site-wide',
    description: 'What Google and link previews (WhatsApp, X, Facebook) show for the home page.',
    fields: {
      title: text('Site title', 'BeeJay Sax — Gospel Saxophonist & Music Minister', { max: 70, help: 'Under 60 characters works best in Google.' }),
      description: area(
        'Description',
        'Official website of BeeJay Sax — Nigerian gospel saxophonist, convener of BeeJay Sax Live Concert, and music minister. Blessed & Highly Favoured.',
        { rows: 3, max: 300, help: 'About 150 characters works best.' }
      ),
      shareImage: image('Link preview image', '', { help: 'Shown when the site is shared. 1200 × 630 works best.' }),
      twitter: text('X (Twitter) handle', '@beejaysaxbolaji', { max: 40 }),
    },
  }),
  homeHero: section({
    title: 'Home: top section',
    group: 'Home page',
    page: '/',
    description: 'The first thing visitors see.',
    fields: {
      kicker: text('Line above the name', 'Gospel saxophonist and music minister'),
      titleLines: lines('Big name', ['BeeJay', 'Sax'], { help: LINES_HELP }),
      tagline: text('Motto under the name', 'Blessed & Highly Favoured.'),
      intro: area('Short introduction', 'Spirit-filled saxophone from Lagos to London. Concerts, worship nights and ministry on three continents.', { rows: 3, max: 300 }),
      primaryLabel: text('Gold button', 'Get concert tickets', { max: 40 }),
      secondaryLabel: text('Outline button', 'Listen to the music', { max: 40 }),
      cutout: image('Leaping photo (background removed)', '/images/beejay-leap.webp', {
        help: 'A PNG or WebP with a transparent background, taller than wide, cropped close around him. He is shown jumping out of a golden arch, so arms or feet may stick out past it.',
      }),
      imageAlt: text('Photo description', 'BeeJay Sax leaping in the air, saxophone in hand', { help: 'Read aloud to blind visitors.' }),
    },
  }),
  homeAbout: section({
    title: 'Home: about BeeJay',
    group: 'Home page',
    page: '/',
    description: 'The light section introducing BeeJay.',
    fields: {
      titleLines: lines('Heading', ['A sound that', 'moves heaven'], { help: LINES_HELP }),
      body: area(
        'Text',
        "Abolaji David Banjoko, known to the world as BeeJay Sax, is one of Nigeria's most distinctive gospel saxophonists. A Mechanical Engineering graduate who traded blueprints for full-time ministry, he has shared stages with Donnie McClurkin, Nathaniel Bassey and Travis Greene.",
        { rows: 5 }
      ),
      facts: list('Quick facts', 'Fact', { value: text('Number', '', { max: 10 }), label: text('Label', '', { max: 40 }) }, [
        { value: '20+', label: 'years in ministry' },
        { value: '3', label: 'continents' },
        { value: '2', label: 'albums' },
      ], { maxItems: 4 }),
      buttonLabel: text('Button', 'Read his story', { max: 40 }),
      image: image('Photo', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&q=80'),
      imageAlt: text('Photo description', 'Microphone on stage under warm lights'),
    },
  }),
  homeSections: section({
    title: 'Home: section headings',
    group: 'Home page',
    page: '/',
    description: 'Headings and links for the events, video and photo sections.',
    fields: {
      eventsTitle: lines('Events heading', ['Catch BeeJay', 'live'], { help: LINES_HELP }),
      eventsLink: text('Events link', 'See all events', { max: 40 }),
      eventsEmptyTitle: text('When there are no events: heading', 'New dates are coming'),
      eventsEmptyText: area('When there are no events: text', 'Follow BeeJay on social media to hear first, or get in touch to book him for your event.', { rows: 2, max: 300 }),
      videosTitle: lines('Video heading', ['Watch him', 'minister'], { help: LINES_HELP }),
      videosLink: text('Video link label', 'More on YouTube', { max: 40 }),
      videosUrl: url('Video link', 'https://youtube.com/@beejaysax'),
      momentsTitle: text('Photos heading', 'Moments', { max: 60 }),
      momentsLink: text('Photos link', 'Open the gallery', { max: 40 }),
      momentsFallback: list(
        'Placeholder photos',
        'Photo',
        { url: image('Photo', '') },
        [
          'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=900&q=80',
          'https://images.unsplash.com/photo-1501612780327-45045538702b?w=900&q=80',
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&q=80',
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
          'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=900&q=80',
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&q=80',
          'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=900&q=80',
        ].map((u) => ({ url: u })),
        { help: 'Shown only until the gallery has at least 4 photos.', maxItems: 12 }
      ),
    },
  }),
  homeTestimonials: section({
    title: 'Home: testimonials',
    group: 'Home page',
    page: '/',
    description: 'What people say about BeeJay.',
    fields: {
      title: text('Heading', 'What people say after the music'),
      items: list(
        'Testimonials',
        'Testimonial',
        { quote: area('Quote', '', { rows: 3, max: 400 }), name: text('Who said it', '', { max: 80 }), role: text('Where / role', '', { max: 80 }) },
        [
          { quote: 'BeeJay Sax carries a rare gift. When he plays, heaven draws near.', name: 'Pastor', role: 'Night of Worship' },
          { quote: "One of the most spirit-led saxophonists we've hosted at The Experience.", name: 'Event organiser', role: 'The Experience' },
          { quote: "His Online Praise Party became our family's weekly sanctuary during lockdown.", name: 'Audience member', role: 'United Kingdom' },
        ],
        { maxItems: 6 }
      ),
    },
  }),
  homeBooking: section({
    title: 'Booking section',
    group: 'Home page',
    page: '/',
    description: 'The terracotta “bring the sound to your event” section (also at the bottom of About).',
    fields: {
      title: text('Heading', 'Bring the sound to your event'),
      text: area('Text', "Concerts, church services, conferences, weddings and corporate events, in Nigeria and abroad. Tell us the date and we'll take it from there.", { rows: 3, max: 400 }),
      messageLabel: text('Second button', 'Send a message', { max: 40 }),
    },
  }),
  about: section({
    title: 'About page',
    group: 'Pages',
    page: '/about',
    description: 'BeeJay’s story, the artists he has shared stages with, and the timeline.',
    fields: {
      kicker: text('Line above the name', 'Known to the world as BeeJay Sax'),
      nameLines: lines('Name', ['Abolaji David', 'Banjoko'], { help: LINES_HELP }),
      intro: area('Introduction', 'Gospel saxophonist, music minister and convener of Beejay Sax Live. In ministry since 2000.', { rows: 2, max: 300 }),
      image: image('Portrait photo', LONDON_STILL),
      imageAlt: text('Photo description', 'BeeJay Sax performing in London'),
      imagePosition: text('Photo focus point', '50% 30%', { max: 20 }),
      storyLead: area('Story: large opening line', 'From blueprints to a calling that fills halls with worship.', { rows: 2, max: 200 }),
      story: area(
        'Story',
        'BeeJay trained as a Mechanical Engineer. Then the saxophone, first an instrument and later a ministry, took over. Today he carries a sound that moves heaven and stirs hearts across continents.\n\nHis roots are in the Redeemed Christian Church of God, and his ministry is built on decades of faithfulness. The saxophone is an extension of prayer; every note is an offering.\n\nHe convenes Beejay Sax Live, hosts the Online Praise Party, and keeps releasing music that anchors believers in praise wherever they are in the world.',
        { rows: 10, help: 'Leave a blank line between paragraphs.', max: 5000 }
      ),
      sharedLabel: text('Artists heading', 'He has shared the stage with'),
      sharedNames: lines('Artists', ['Donnie McClurkin', 'Nathaniel Bassey', 'Travis Greene'], { maxItems: 8, help: 'One name per line.' }),
      stages: list(
        'Stages & appearances',
        'Appearance',
        { title: text('Name', ''), when: text('When', '', { max: 30 }), description: text('Short description', '', { max: 160 }) },
        [
          { title: 'The Experience', when: 'Recurring', description: "Ministry on one of Africa's largest gospel stages." },
          { title: 'Night of Worship', when: 'Recurring', description: 'Spirit-led worship nights across Nigeria.' },
          { title: 'Indigo at The O2, London', when: '2023', description: 'Beejay Sax Live, international worship in the UK.' },
          { title: 'House on the Rock, TAPE', when: '2022', description: 'A major gospel gathering in Lagos.' },
          { title: 'Online Praise Party', when: '2020', description: 'A weekly sanctuary for families during lockdown.' },
          { title: 'Eko Hotels and Suites', when: '2026', description: "Beejay Sax Live, the flagship concert at one of Lagos' finest venues." },
        ],
        { maxItems: 12 }
      ),
      journeyTitle: lines('Timeline heading', ['The journey', 'so far'], { help: LINES_HELP }),
      milestones: list(
        'Timeline',
        'Milestone',
        { year: text('Year', '', { max: 10 }), text: text('What happened', '', { max: 200 }) },
        [
          { year: '2010', text: 'Performs on the Busta Rhymes stage at CARNIRIV, the Rivers State Carnival' },
          { year: '2010', text: 'Lagos Kuramo International Conference' },
          { year: '2012', text: 'Releases his debut album' },
          { year: '2020', text: 'Starts the Online Praise Party during the pandemic' },
          { year: '2022', text: 'Beejay Sax Live at House on the Rock (TAPE 2022)' },
          { year: '2023', text: 'Beejay Sax Live in London, Indigo at The O2' },
          { year: '2026', text: 'Beejay Sax Live Concert, Eko Hotels and Suites' },
        ],
        { maxItems: 30, help: 'List them in order, oldest first.' }
      ),
      buttonLabel: text('Timeline button', 'See upcoming events', { max: 40 }),
    },
  }),
  pageHeaders: section({
    title: 'Page headers',
    group: 'Pages',
    description: 'The big heading and introduction at the top of the Events, Music and Gallery pages.',
    fields: {
      eventsTitle: text('Events: heading', 'On stage', { max: 60 }),
      eventsIntro: area('Events: introduction', 'Concerts and worship nights with BeeJay Sax. Buy your ticket here and it arrives by email with a QR code for the door.', { rows: 2, max: 300 }),
      musicTitle: text('Music: heading', 'The music', { max: 60 }),
      musicIntro: area('Music: introduction', 'Albums, singles and EPs of gospel saxophone. Stream them wherever you listen.', { rows: 2, max: 300 }),
      galleryTitle: text('Gallery: heading', 'Moments', { max: 60 }),
      galleryIntro: area('Gallery: introduction', 'On stage, backstage and in worship. Tap any photo to see it full size.', { rows: 2, max: 300 }),
    },
  }),
  contact: section({
    title: 'Contact page',
    group: 'Pages',
    page: '/contact',
    description: 'Contact details themselves are under “Contact details & footer”.',
    fields: {
      titleLines: lines('Heading', ["Let's", 'talk'], { help: LINES_HELP }),
      intro: area(
        'Introduction',
        'Booking BeeJay for a concert, service or event? Planning a collaboration or interview? Send the details and the team will get back to you.',
        { rows: 3, max: 400 }
      ),
      note: area('Note for international bookings', 'For international bookings, include your country, the type of event and your preferred dates.', { rows: 2, max: 300 }),
      thanks: text('Message after sending', 'Message sent. The team will reply by email, usually within two working days.', { max: 200 }),
    },
  }),
} as const

export type ContentKey = keyof typeof CONTENT
type FieldValue<F> = F extends { default: infer D } ? D : never
export type ContentOf<K extends ContentKey> = { -readonly [P in keyof (typeof CONTENT)[K]['fields']]: FieldValue<(typeof CONTENT)[K]['fields'][P]> }

export const CONTENT_KEYS = Object.keys(CONTENT) as ContentKey[]
