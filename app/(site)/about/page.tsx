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

export default function AboutPage() {
  return (
    <>
      <section
        style={{
          height: 480,
          position: 'relative',
          overflow: 'hidden',
          background: '#0F0F0F',
          borderBottom: '1px solid #1E1E1E',
        }}
      >
        <div style={{ position: 'absolute', bottom: 56, left: 0, right: 0 }}>
          <div className="site-shell">
            <SectionLabel>The Artist</SectionLabel>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(48px,8vw,96px)',
                fontWeight: 700,
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
                color: '#F5F0E8',
                margin: 0,
              }}
            >
              <span style={{ display: 'block' }}>Abolaji David</span>
              <span style={{ display: 'block', color: '#C9A84C', fontStyle: 'italic' }}>Banjoko.</span>
            </h1>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="site-shell">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  marginBottom: 16,
                }}
              >
                The Origin
              </p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: '#C9A84C', marginBottom: 4 }}>Since 2000</p>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 96,
                  lineHeight: 1,
                  fontStyle: 'italic',
                  color: 'rgba(201,168,76,0.1)',
                  margin: 0,
                }}
              >
                2000
              </p>
            </div>
            <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: 'rgba(245,240,232,0.75)',
                  margin: 0,
                }}
              >
                Mechanical Engineering graduate — a journey from blueprints to a calling that fills arenas with worship.
                Known globally as BeeJay Sax, Abolaji David Banjoko carries a sound that moves heaven and stirs hearts
                across continents.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: 'rgba(245,240,232,0.75)',
                  margin: 0,
                }}
              >
                From RCCG roots to stages shared with gospel greats, his ministry is built on decades of faithfulness —
                the saxophone an extension of prayer, every note an offering.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: 'rgba(245,240,232,0.75)',
                  margin: 0,
                }}
              >
                Today he convenes Beejay Sax Live, hosts the Online Praise Party, and continues to release music that
                anchors believers in praise wherever they are in the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          background: '#0F0F0F',
          borderTop: '1px solid #1E1E1E',
          borderBottom: '1px solid #1E1E1E',
          paddingTop: 96,
          paddingBottom: 96,
        }}
      >
        <div className="site-shell">
          <SectionLabel>Notable Performances</SectionLabel>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(28px,4vw,44px)',
              fontWeight: 600,
              color: '#F5F0E8',
              margin: '16px 0 40px',
            }}
          >
            Shared The Stage With
          </h2>
          <div style={{ overflow: 'hidden', borderTop: '1px solid #1E1E1E', borderBottom: '1px solid #1E1E1E', padding: '24px 0' }}>
            <Marquee
              text="DONNIE McCLURKIN · NATHANIEL BASSEY · TRAVIS GREENE · SPIRIT-FILLED SOUND · HEAVEN-DRIVEN PRAISE ·"
              speed="slow"
            />
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PERFORMANCES.map((p) => (
              <article
                key={p.title}
                style={{
                  background: '#080808',
                  border: '1px solid #1E1E1E',
                  padding: 24,
                  transition: 'transform 200ms, border-color 200ms',
                }}
              >
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: '#F5F0E8', margin: 0 }}>{p.title}</p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    margin: '8px 0 0',
                  }}
                >
                  {p.year}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: 'rgba(245,240,232,0.6)',
                    margin: '12px 0 0',
                  }}
                >
                  {p.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div className="site-shell">
          <SectionLabel>Milestones</SectionLabel>
          <ul
            style={{
              marginTop: 40,
              paddingLeft: 32,
              borderLeft: '2px solid #C9A84C',
              listStyle: 'none',
            }}
          >
            {[
              '2010 — Buster Rhymes Stage, Canirivs Rivers State Carnival',
              '2010 — Lagos Kuramo International Conference',
              '2012 — Debut Album Release',
              '2020 — Online Praise Party (Pandemic Initiative)',
              '2022 — Beejay Sax Live at House on the Rock (TAPE 2022)',
              '2023 — Beejay Sax Live in London, Indigo O2',
              '2026 — Beejay Sax Live Concert, Eko Hotels and Suites',
            ].map((line) => (
              <li
                key={line}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  color: 'rgba(245,240,232,0.9)',
                  marginBottom: 24,
                }}
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ paddingTop: 64, paddingBottom: 64, textAlign: 'center' }}>
        <div className="site-shell">
          <SectionLabel>The Event</SectionLabel>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px,5vw,56px)',
              fontWeight: 600,
              color: '#F5F0E8',
              margin: '24px 0 16px',
            }}
          >
            Beejay Sax Live.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              lineHeight: 1.8,
              color: 'rgba(245,240,232,0.6)',
              maxWidth: 560,
              margin: '0 auto 32px',
            }}
          >
            The annual gathering for ethical, Godly music — serene atmosphere, unforgettable ministry.
          </p>
          <GoldButton href="/events">Buy Tickets</GoldButton>
        </div>
      </section>

      <ContactCTA />
    </>
  )
}
