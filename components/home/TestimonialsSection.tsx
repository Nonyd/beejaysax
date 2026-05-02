'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionLabel from '@/components/ui/SectionLabel'
import { registerGSAP } from '@/lib/animations'

const QUOTES = [
  {
    quote: 'BeeJay Sax carries a rare gift — when he plays, heaven draws near.',
    name: 'Pastor',
    role: 'Night of Worship',
  },
  {
    quote: 'One of the most spirit-led saxophonists we’ve hosted at The Experience.',
    name: 'Event Organiser',
    role: 'The Experience',
  },
  {
    quote: 'His Online Praise Party became our family’s weekly sanctuary during lockdown.',
    name: 'Audience Member',
    role: 'United Kingdom',
  },
]

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    gsap.registerPlugin(ScrollTrigger)
    const cards = sectionRef.current?.querySelectorAll('[data-quote-card]')
    if (!cards?.length) return
    const ctx = gsap.context(() => {
      gsap.from(cards, {
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="border-t border-bjs-border bg-bjs-surface py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-6 md:px-8 lg:px-12">
        <SectionLabel>They Say</SectionLabel>
        <h2 className="h2-text mt-3 text-bjs-white">The Sound Speaks</h2>

        <div className="mt-16 grid grid-cols-1 gap-px border border-bjs-border bg-bjs-border md:grid-cols-3">
          {QUOTES.map((q) => (
            <blockquote
              key={q.name}
              data-quote-card
              className="relative bg-bjs-surface px-8 py-10 md:px-10 md:py-12"
            >
              <span
                className="pointer-events-none absolute right-6 top-6 select-none font-serif text-[80px] leading-none text-[rgba(201,168,76,0.06)]"
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="relative z-[1] font-serif text-[17px] italic leading-[1.7] text-[rgba(245,240,232,0.8)]">
                {q.quote}
              </p>
              <footer className="relative z-[1] mt-6">
                <span className="mb-4 block h-px w-6 bg-bjs-gold" />
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-bjs-gold">{q.name}</p>
                <p className="mt-1 font-sans text-[10px] text-bjs-muted">{q.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
