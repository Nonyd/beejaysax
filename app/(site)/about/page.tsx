import SectionLabel from '@/components/ui/SectionLabel'
import ContactCTA from '@/components/home/ContactCTA'
import Marquee from '@/components/ui/Marquee'
import GoldButton from '@/components/ui/GoldButton'
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

export default function AboutPage() {
  return (
    <>
      <section className="relative flex min-h-[60vh] flex-col justify-end bg-gradient-to-br from-bjs-black via-bjs-surface to-bjs-black px-8 pb-16 pt-32">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-serif text-[clamp(52px,9vw,120px)] font-bold leading-[0.9] text-bjs-white">
            Abolaji David <span className="text-bjs-gold">Banjoko.</span>
          </h1>
          <p className="mt-4 font-serif text-xl italic text-bjs-white/70">Known as BeeJay Sax</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-8 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionLabel>The Origin</SectionLabel>
          <h2 className="mt-6 font-serif text-[clamp(38px,6vw,80px)] font-semibold leading-[0.95] text-bjs-white">
            From Engineering <br /> To Ministry.
          </h2>
          <span className="gold-rule my-8 block" />
          <p className="font-sans text-base leading-[1.75] text-bjs-white/85">
            Mechanical Engineering graduate, Ogun State University — a journey from blueprints to a calling that fills arenas with worship.
          </p>
          <span className="mt-6 inline-block rounded border border-bjs-gold bg-bjs-gold-dim px-4 py-2 font-sans text-[11px] uppercase tracking-wide text-bjs-gold">
            Since 2000
          </span>
        </div>
        <div className="aspect-[4/5] bg-gradient-to-br from-bjs-surface2 to-bjs-black" />
      </section>

      <section className="border-y border-bjs-border bg-bjs-surface py-24">
        <div className="mx-auto max-w-7xl px-8">
          <SectionLabel>The Ministry</SectionLabel>
          <h2 className="mt-6 font-serif text-[clamp(38px,6vw,80px)] font-semibold text-bjs-white">
            A Sound That Moves Heaven.
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              ['01', 'The Saxophone', 'A rich, spirit-filled tone unlike any other in Nigerian gospel.'],
              ['02', 'The Ministry', 'Over two decades in RCCG, leading worship in prayer and praise.'],
              ['03', 'The Reach', 'From Lagos to London, touching lives with the sound of heaven.'],
            ].map(([n, t, b]) => (
              <div key={t} className="border-t border-bjs-gold pt-6">
                <p className="font-serif text-4xl text-bjs-gold">{n}</p>
                <h3 className="mt-4 font-serif text-xl text-bjs-white">{t}</h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-bjs-muted">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 py-24">
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

      <section className="bg-bjs-black py-16">
        <Marquee text="DONNIE McCLURKIN · NATHANIEL BASSEY · TRAVIS GREENE · SPIRIT-FILLED SOUND ·" />
      </section>

      <section className="mx-auto max-w-7xl px-8 py-24 text-center">
        <SectionLabel>The Event</SectionLabel>
        <h2 className="mt-6 font-serif text-[clamp(38px,6vw,80px)] font-semibold text-bjs-white">Beejay Sax Live.</h2>
        <p className="mx-auto mt-6 max-w-2xl font-sans text-bjs-muted">
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
