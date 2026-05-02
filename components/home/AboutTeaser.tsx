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
  revealHeading,
} from '@/lib/animations'

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
    if (heading) revealHeading(heading)
    if (s1.current) animateCounter(s1.current, 2, 2)
    if (s2.current) animateCounter(s2.current, 20, 2)
    if (s3.current) animateCounter(s3.current, 3, 2)
  }, [])

  return (
    <section className="bg-bjs-black py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-8 lg:grid-cols-2">
        <div ref={imageRef} className="relative aspect-[3/4] overflow-hidden border-l-[3px] border-bjs-gold">
          <Image
            src="https://images.unsplash.com/photo-1519892300558-c31723655541?q=80&w=1200&auto=format&fit=crop"
            alt="BeeJay Sax performing saxophone on stage"
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 50vw"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bjs-black to-transparent" />
        </div>

        <div ref={textRef}>
          <SectionLabel>The Artist</SectionLabel>
          <h2 ref={headingRef} className="mt-6 font-serif text-[clamp(38px,6vw,80px)] font-semibold leading-[0.95] tracking-[-0.01em] text-bjs-white">
            A Sound That Moves Heaven.
          </h2>
          <span className="gold-rule my-8 block" />

          <p className="font-sans text-base leading-[1.75] text-bjs-white/90">
            Abolaji David Banjoko — known to the world as BeeJay Sax — is one of Nigeria&apos;s most distinctive gospel saxophonists.
            His spirit-filled tone doesn&apos;t just fill rooms; it moves hearts.
          </p>
          <p className="mt-6 font-sans text-base leading-[1.75] text-bjs-white/90">
            A graduate of Mechanical Engineering who traded blueprints for ministry, BeeJay has graced the stages of The Experience and
            Night of Worship alongside Donnie McClurkin, Nathaniel Bassey, and Travis Greene.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <div>
              <span ref={s1} className="block font-serif text-[clamp(48px,7vw,96px)] font-bold leading-none text-bjs-gold">
                0
              </span>
              <span className="mt-2 block font-sans text-[11px] uppercase tracking-wide text-bjs-muted">Albums</span>
            </div>
            <div>
              <span ref={s2} className="block font-serif text-[clamp(48px,7vw,96px)] font-bold leading-none text-bjs-gold">
                0
              </span>
              <span className="mt-2 block font-sans text-[11px] uppercase tracking-wide text-bjs-muted">Years in Ministry</span>
            </div>
            <div>
              <span ref={s3} className="block font-serif text-[clamp(48px,7vw,96px)] font-bold leading-none text-bjs-gold">
                0
              </span>
              <span className="mt-2 block font-sans text-[11px] uppercase tracking-wide text-bjs-muted">Continents</span>
            </div>
          </div>

          <Link
            href="/about"
            className="mt-10 inline-flex items-center gap-2 font-sans text-sm text-bjs-gold underline-offset-4 transition-colors hover:text-bjs-gold-lt hover:underline"
          >
            Full Story <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
