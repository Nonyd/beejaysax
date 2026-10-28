import type { Metadata } from 'next'
import ContactCTA from '@/components/home/ContactCTA'
import Adire from '@/components/ui/Adire'
import ArchPhoto from '@/components/ui/ArchPhoto'
import GoldButton from '@/components/ui/GoldButton'
import { SITE_IMAGES } from '@/lib/site-images'

export const metadata: Metadata = {
  title: { absolute: 'About — BeeJay Sax' },
  description:
    "Abolaji David Banjoko — gospel saxophonist, music minister, and convener of the Beejay Sax Live Concert. From engineering graduate to one of Nigeria's finest saxophonists.",
  openGraph: {
    title: 'About BeeJay Sax',
    description: 'From engineering to ministry — the story of Abolaji David Banjoko.',
    url: 'https://beejaysax.com/about',
  },
}

const SHARED_STAGE = ['Donnie McClurkin', 'Nathaniel Bassey', 'Travis Greene']

const STAGES = [
  { title: 'The Experience', when: 'Recurring', description: "Ministry on one of Africa's largest gospel stages." },
  { title: 'Night of Worship', when: 'Recurring', description: 'Spirit-led worship nights across Nigeria.' },
  { title: 'Indigo at The O2, London', when: '2023', description: 'Beejay Sax Live, international worship in the UK.' },
  { title: 'House on the Rock, TAPE', when: '2022', description: 'A major gospel gathering in Lagos.' },
  { title: 'Online Praise Party', when: '2020', description: 'A weekly sanctuary for families during lockdown.' },
  { title: 'Eko Hotels and Suites', when: '2026', description: "Beejay Sax Live, the flagship concert at one of Lagos' finest venues." },
]

// Chronological. Confirm the 2010 carnival entry with the client (was spelled "Buster Rhymes Stage, Canirivs").
const MILESTONES = [
  { year: '2010', text: 'Performs on the Busta Rhymes stage at CARNIRIV, the Rivers State Carnival' },
  { year: '2010', text: 'Lagos Kuramo International Conference' },
  { year: '2012', text: 'Releases his debut album' },
  { year: '2020', text: 'Starts the Online Praise Party during the pandemic' },
  { year: '2022', text: 'Beejay Sax Live at House on the Rock (TAPE 2022)' },
  { year: '2023', text: 'Beejay Sax Live in London, Indigo at The O2' },
  { year: '2026', text: 'Beejay Sax Live Concert, Eko Hotels and Suites' },
]

export default function AboutPage() {
  return (
    <>
      {/* header */}
      <section className="relative -mt-[72px] overflow-hidden bg-ink pt-[72px]">
        <Adire variant="field" color="#E3B23C" opacity={0.06} />
        <div className="site-shell relative grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-w-0">
            <p className="font-body text-lg font-medium text-gold">Known to the world as BeeJay Sax</p>
            <h1 className="mt-5 font-display text-[clamp(52px,6.6vw,96px)] leading-[0.92] tracking-[-0.03em] text-ivory">
              <span className="block">Abolaji David</span>
              <span className="block">Banjoko</span>
            </h1>
            <p className="mt-8 max-w-[48ch] font-body text-lg leading-relaxed text-ivory/75">
              Gospel saxophonist, music minister and convener of Beejay Sax Live. In ministry since 2000.
            </p>
          </div>
          <div className="mx-auto w-full max-w-[300px] lg:max-w-[380px]">
            <ArchPhoto
              src={SITE_IMAGES.aboutPage}
              alt="BeeJay Sax performing in London"
              sizes="(max-width:1024px) 300px, 380px"
              priority
              objectPosition={SITE_IMAGES.aboutPagePosition}
            />
          </div>
        </div>
        <Adire variant="band" color="#E3B23C" opacity={0.6} height={32} />
      </section>

      {/* story */}
      <section className="bg-ivory py-24 text-ink md:py-32">
        <div className="site-shell grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <p className="font-display text-[clamp(32px,3.8vw,52px)] leading-[1.08] tracking-[-0.015em]">
            From blueprints to a calling that fills halls with worship.
          </p>
          <div className="max-w-[62ch] space-y-6 font-body text-lg leading-relaxed text-ink/80">
            <p>
              BeeJay trained as a Mechanical Engineer. Then the saxophone, first an instrument and later a ministry, took
              over. Today he carries a sound that moves heaven and stirs hearts across continents.
            </p>
            <p>
              His roots are in the Redeemed Christian Church of God, and his ministry is built on decades of faithfulness.
              The saxophone is an extension of prayer; every note is an offering.
            </p>
            <p>
              He convenes Beejay Sax Live, hosts the Online Praise Party, and keeps releasing music that anchors believers
              in praise wherever they are in the world.
            </p>
          </div>
        </div>
      </section>

      {/* shared the stage */}
      <section className="bg-night py-24 md:py-32">
        <div className="site-shell">
          <p className="font-body text-lg font-medium text-gold">He has shared the stage with</p>
          <ul className="mt-6 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-8">
            {SHARED_STAGE.map((name, i) => (
              <li key={name} className="flex items-center gap-8">
                <span className="font-display text-[clamp(40px,5.6vw,80px)] leading-[1] tracking-[-0.02em] text-ivory">{name}</span>
                {i < SHARED_STAGE.length - 1 && <span aria-hidden className="hidden h-3 w-3 rotate-45 bg-clay md:block" />}
              </li>
            ))}
          </ul>

          <div className="mt-20 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {STAGES.map((s) => (
              <div key={s.title} className="rounded-[24px] border border-line bg-ink/50 p-8">
                <p className="font-body text-sm font-semibold text-gold">{s.when}</p>
                <h2 className="mt-2 font-display text-[28px] leading-[1.1] text-ivory">{s.title}</h2>
                <p className="mt-3 font-body text-base leading-relaxed text-ivory/70">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* milestones: a real sequence, so it gets a timeline */}
      <section className="bg-ink py-24 md:py-32">
        <div className="site-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <h2 className="font-display text-[clamp(44px,6vw,84px)] leading-[0.95] tracking-[-0.02em] text-ivory">
              <span className="block">The journey</span>
              <span className="block">so far</span>
            </h2>
            <GoldButton href="/events" className="mt-10">
              See upcoming events
            </GoldButton>
          </div>

          <ol className="relative border-l-2 border-gold/40 pl-10">
            {MILESTONES.map((m) => (
              <li key={m.text} className="relative pb-10 last:pb-0">
                <span aria-hidden className="absolute top-2 -left-[49px] h-4 w-4 rounded-full border-4 border-ink bg-gold" />
                <p className="font-display text-3xl leading-none text-gold">{m.year}</p>
                <p className="mt-2 max-w-[48ch] font-body text-lg leading-snug text-ivory/85">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ContactCTA />
    </>
  )
}
