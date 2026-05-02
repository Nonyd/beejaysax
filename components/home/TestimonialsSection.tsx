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

        <div ref={root} className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {QUOTES.map((q) => (
            <blockquote
              key={q.by}
              data-quote-card
              className="relative border border-bjs-border bg-bjs-surface2 p-10 transition-colors hover:border-bjs-gold"
            >
              <span className="pointer-events-none absolute right-6 top-4 font-serif text-[120px] leading-none text-bjs-gold/20">&ldquo;</span>
              <p className="relative font-serif text-[clamp(20px,3vw,32px)] italic leading-[1.5] text-bjs-white">{q.quote}</p>
              <footer className="relative mt-6 font-sans text-[12px] uppercase tracking-wide text-bjs-gold">{q.by}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
