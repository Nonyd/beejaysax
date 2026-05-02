'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import {
  registerGSAP,
  animateCounter,
  slideInFromLeft,
  slideInFromRight,
  fadeUpOnScroll,
} from '@/lib/animations'
import { HOMEPAGE_ABOUT_STATS } from '@/lib/homepage-stats'

const WORDS_L1 = ['A', 'Sound', 'That']
const WORDS_L2 = ['Moves', 'Heaven.']

export default function AboutTeaser() {
  const imageRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const s1 = useRef<HTMLSpanElement>(null)
  const s2 = useRef<HTMLSpanElement>(null)
  const s3 = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    const img = imageRef.current
    const heading = headingRef.current
    const textBlock = textRef.current
    if (img) slideInFromLeft(img)
    if (textBlock) slideInFromRight(textBlock)
    if (heading) fadeUpOnScroll(heading)
    const { albums, yearsMinistry, yearsMinistrySuffix, continents } = HOMEPAGE_ABOUT_STATS
    if (s1.current) animateCounter(s1.current, albums, 2)
    if (s2.current) animateCounter(s2.current, yearsMinistry, 2, { suffix: yearsMinistrySuffix })
    if (s3.current) animateCounter(s3.current, continents, 2)
  }, [])

  return (
    <section className="bg-bjs-black py-24 md:py-32 lg:py-40">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 md:px-8 lg:grid-cols-2 lg:gap-24 lg:px-12">
        <div ref={imageRef} className="group relative aspect-[3/4] overflow-hidden">
          <span className="absolute left-0 top-0 z-10 h-full w-[2px] bg-bjs-gold" aria-hidden />
          <Image
            src="https://images.unsplash.com/photo-1519892300558-c31723655541?q=80&w=1200&auto=format&fit=crop"
            alt="BeeJay Sax performing saxophone on stage"
            fill
            className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
            sizes="(max-width:1024px) 100vw, 50vw"
          />
        </div>

        <div ref={textRef}>
          <SectionLabel>The Artist</SectionLabel>
          <h2 ref={headingRef} className="h2-text mt-4 text-bjs-white">
            <span className="block">
              {WORDS_L1.map((w) => (
                <span key={w} className="inline-block whitespace-nowrap">
                  {w}{' '}
                </span>
              ))}
            </span>
            <span className="mt-1 block">
              {WORDS_L2.map((w) => (
                <span key={w} className="inline-block whitespace-nowrap">
                  {w}{' '}
                </span>
              ))}
            </span>
          </h2>
          <span className="gold-rule my-6 block" />

          <div className="body-text max-w-md space-y-6">
            <p>
              Abolaji David Banjoko — known to the world as BeeJay Sax — is one of Nigeria&apos;s most distinctive gospel
              saxophonists. His spirit-filled tone doesn&apos;t just fill rooms; it moves hearts.
            </p>
            <p>
              A Mechanical Engineering graduate who traded blueprints for ministry, BeeJay has graced the stages of The
              Experience and Night of Worship alongside Donnie McClurkin, Nathaniel Bassey, and Travis Greene.
            </p>
          </div>

          <div className="mt-10 flex border-y border-bjs-border">
            <div className="flex flex-1 flex-col border-r border-bjs-gold/40 py-6 text-center first:border-l-0">
              <span ref={s1} className="font-serif text-[clamp(40px,5vw,64px)] font-bold leading-none text-bjs-gold">
                0
              </span>
              <span className="mt-1 font-sans text-[10px] uppercase tracking-[0.2em] text-bjs-muted">Albums</span>
            </div>
            <div className="flex flex-1 flex-col border-r border-bjs-gold/40 py-6 text-center">
              <span ref={s2} className="font-serif text-[clamp(40px,5vw,64px)] font-bold leading-none text-bjs-gold">
                0
              </span>
              <span className="mt-1 font-sans text-[10px] uppercase tracking-[0.2em] text-bjs-muted">Years</span>
            </div>
            <div className="flex flex-1 flex-col py-6 text-center">
              <span ref={s3} className="font-serif text-[clamp(40px,5vw,64px)] font-bold leading-none text-bjs-gold">
                0
              </span>
              <span className="mt-1 font-sans text-[10px] uppercase tracking-[0.2em] text-bjs-muted">Continents</span>
            </div>
          </div>

          <Link
            href="/about"
            className="group/link mt-8 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.15em] text-bjs-gold transition-colors hover:text-bjs-gold-lt"
          >
            Full Story{' '}
            <span className="transition-transform duration-300 group-hover/link:translate-x-1" aria-hidden>
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
