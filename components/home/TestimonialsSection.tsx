'use client'

import { useEffect, useRef } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGSAP } from '@/lib/animations'

const QUOTES = [
  {
    quote: 'BeeJay Sax carries a rare gift — when he plays, heaven draws near.',
    by: 'Pastor at Night of Worship',
  },
  {
    quote: 'One of the most spirit-led saxophonists we’ve hosted at The Experience.',
    by: 'Event Organiser, The Experience',
  },
  {
    quote: 'His Online Praise Party became our family’s weekly sanctuary during lockdown.',
    by: 'Fan, UK',
  },
]

export default function TestimonialsSection() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    gsap.registerPlugin(ScrollTrigger)
    const cards = root.current?.querySelectorAll('[data-quote-card]')
    if (cards?.length) {
      gsap.from(cards, {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: root.current,
          start: 'top 85%',
          once: true,
        },
      })
    }
  }, [])

  return (
    <section className="bg-bjs-surface py-32">
      <div className="mx-auto max-w-7xl px-8">
        <SectionLabel>They Say</SectionLabel>
        <h2 className="mt-6 font-serif text-[clamp(38px,6vw,80px)] font-semibold text-bjs-white">The Sound Speaks</h2>

        <div
          ref={root}
          className="mt-14 grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-3 md:gap-6"
        >
          {QUOTES.map((q) => (
            <blockquote
              key={q.by}
              data-quote-card
              className="relative flex min-h-0 min-w-0 flex-col overflow-hidden border border-bjs-border bg-bjs-surface2 p-8 pt-14 transition-colors hover:border-bjs-gold md:p-10 md:pt-16"
            >
              <span
                className="pointer-events-none absolute left-2 top-2 select-none font-serif text-[72px] leading-none text-bjs-gold/15 md:left-4 md:top-3 md:text-[100px]"
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="relative z-10 min-w-0 flex-1 font-serif text-[clamp(18px,2.8vw,28px)] italic leading-snug text-bjs-white">
                {q.quote}
              </p>
              <footer className="relative z-10 mt-6 shrink-0 font-sans text-[12px] uppercase leading-relaxed tracking-wide text-bjs-gold">
                {q.by}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
