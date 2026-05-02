import SectionLabel from '@/components/ui/SectionLabel'
import GoldButton from '@/components/ui/GoldButton'
import OutlineButton from '@/components/ui/OutlineButton'
import Marquee from '@/components/ui/Marquee'
import { MapPin, Phone } from 'lucide-react'

export default function ContactCTA() {
  return (
    <section className="border-t border-bjs-border bg-bjs-black py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-4xl px-6 text-center md:px-8 lg:px-12">
        <SectionLabel className="inline-block">Get In Touch</SectionLabel>
        <h2 className="mt-4">
          <span className="h1-text block whitespace-nowrap text-bjs-white">Let&apos;s Create</span>
          <span className="h1-text block whitespace-nowrap font-serif italic text-bjs-gold">Something Sacred.</span>
        </h2>

        <span className="gold-rule mx-auto my-8 block" />

        <p className="body-text mx-auto max-w-lg">
          Available for concerts, corporate events, gospel conferences, and collaborations — within Nigeria and internationally.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <GoldButton href="/contact?inquiry=booking" size="lg">
            Book BeeJay
          </GoldButton>
          <OutlineButton href="/contact" size="lg">
            Send a Message
          </OutlineButton>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 font-sans text-[13px] text-bjs-muted">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-bjs-gold" aria-hidden />
            Lagos, Nigeria
          </span>
          <span className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-bjs-gold" aria-hidden />
            +234 80 5898 2828
          </span>
        </div>
      </div>

      <div className="mt-16 border-t border-bjs-border py-2 opacity-40">
        <Marquee
          speed="slow"
          text="BLESSED & HIGHLY FAVOURED · GOSPEL SAXOPHONIST · MUSIC MINISTER · BEEJAY SAX LIVE CONCERT · SPIRIT-FILLED SOUND ·"
        />
      </div>
    </section>
  )
}
