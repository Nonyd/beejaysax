import SectionLabel from '@/components/ui/SectionLabel'
import { bodyTextStyle, h1TextStyle, h2TextStyle } from '@/lib/typography-styles'
import ContactCTA from '@/components/home/ContactCTA'
import Marquee from '@/components/ui/Marquee'
import GoldButton from '@/components/ui/GoldButton'
import Image from 'next/image'
import type { Metadata } from 'next'

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

const PERFORMANCES = [
  {
    title: 'The Experience',
    year: 'Recurring',
    description: 'Ministry on one of Africa’s largest gospel stages.',
  },
  {
    title: 'Night of Worship',
    year: 'Recurring',
    description: 'Spirit-led worship nights across Nigeria.',
  },
  {
    title: 'Indigo O2, London',
    year: '2023',
    description: 'Beejay Sax Live — international worship in the UK.',
  },
  {
    title: 'House on the Rock — TAPE',
    year: '2022',
    description: 'Major gospel gathering in Lagos.',
  },
  {
    title: 'Online Praise Party',
    year: '2020',
    description: 'Weekly sanctuary for families during lockdown.',
  },
  {
    title: 'Beejay Sax Live — Eko Hotels',
    year: '2026',
    description: 'Flagship concert — Lagos’ finest venue.',
  },
]

const HERO_IMG =
  'https://images.unsplash.com/photo-1519892300558-c31723655541?q=80&w=1600&auto=format&fit=crop'

export default function AboutPage() {
  return (
    <>
      <section className="relative flex min-h-[60vh] overflow-hidden" style={{ paddingTop: 72 }}>
        <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-bjs-black" />
          <div className="relative hidden min-h-[40vh] lg:block">
            <Image src={HERO_IMG} alt="BeeJay Sax" fill className="object-cover object-center" sizes="50vw" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-bjs-black via-bjs-black/40 to-transparent lg:from-bjs-black/80" />
          </div>
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-end px-6 pb-16 pt-32 md:px-12">
          <SectionLabel>The Artist</SectionLabel>
          <h1 className="mt-3">
            <span className="block whitespace-nowrap text-bjs-white" style={h1TextStyle}>
              Abolaji David
            </span>
            <span className="block whitespace-nowrap text-bjs-gold" style={h1TextStyle}>
              Banjoko.
            </span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <SectionLabel>The Origin</SectionLabel>
            <p className="relative mt-6 font-serif text-sm text-bjs-gold">Since 2000</p>
            <p className="relative -mt-2 font-serif text-[96px] leading-none italic text-bjs-gold/10">2000</p>
          </div>
          <div className="space-y-6 lg:col-span-2" style={bodyTextStyle}>
            <p>
              Mechanical Engineering graduate — a journey from blueprints to a calling that fills arenas with worship.
              Known globally as BeeJay Sax, Abolaji David Banjoko carries a sound that moves heaven and stirs hearts across
              continents.
            </p>
            <p>
              From RCCG roots to stages shared with gospel greats, his ministry is built on decades of faithfulness — the
              saxophone an extension of prayer, every note an offering.
            </p>
            <p>
              Today he convenes Beejay Sax Live, hosts the Online Praise Party, and continues to release music that
              anchors believers in praise wherever they are in the world.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-bjs-border bg-bjs-surface py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <SectionLabel>Notable Performances</SectionLabel>
          <h2 className="mt-4 text-bjs-white" style={h2TextStyle}>
            Shared The Stage With
          </h2>
          <div className="mt-10 overflow-hidden border-y border-bjs-border py-6">
            <Marquee
              text="DONNIE McCLURKIN · NATHANIEL BASSEY · TRAVIS GREENE · SPIRIT-FILLED SOUND · HEAVEN-DRIVEN PRAISE ·"
              className="[&_span]:font-serif [&_span]:text-[clamp(24px,4vw,40px)] [&_span]:italic [&_span]:text-[rgba(245,240,232,0.15)] [&_span]:tracking-normal"
            />
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PERFORMANCES.map((p) => (
              <article
                key={p.title}
                className="border border-bjs-border bg-bjs-black p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-bjs-gold"
              >
                <p className="font-serif text-lg text-bjs-white">{p.title}</p>
                <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.15em] text-bjs-gold">{p.year}</p>
                <p className="mt-3 text-sm" style={{ ...bodyTextStyle, fontSize: 14 }}>
                  {p.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:px-12">
        <SectionLabel>Milestones</SectionLabel>
        <ul className="mt-10 space-y-6 border-l-2 border-bjs-gold pl-8 font-sans text-bjs-white/90">
          <li>2010 — Buster Rhymes Stage, Canirivs Rivers State Carnival</li>
          <li>2010 — Lagos Kuramo International Conference</li>
          <li>2012 — Debut Album Release</li>
          <li>2020 — Online Praise Party (Pandemic Initiative)</li>
          <li>2022 — Beejay Sax Live at House on the Rock (TAPE 2022)</li>
          <li>2023 — Beejay Sax Live in London, Indigo O2</li>
          <li>2026 — Beejay Sax Live Concert, Eko Hotels and Suites</li>
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 text-center md:px-12">
        <SectionLabel>The Event</SectionLabel>
        <h2 className="mt-6 text-bjs-white" style={h2TextStyle}>
          Beejay Sax Live.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl" style={bodyTextStyle}>
          The annual gathering for ethical, Godly music — serene atmosphere, unforgettable ministry.
        </p>
        <div className="mt-10 flex justify-center">
          <GoldButton href="/events">Buy Tickets</GoldButton>
        </div>
      </section>

      <ContactCTA />
    </>
  )
}
