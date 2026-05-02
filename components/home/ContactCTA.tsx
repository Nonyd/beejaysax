import SectionLabel from '@/components/ui/SectionLabel'
import GoldButton from '@/components/ui/GoldButton'
import OutlineButton from '@/components/ui/OutlineButton'
import Marquee from '@/components/ui/Marquee'
import { Mail, MapPin, Phone } from 'lucide-react'

export default function ContactCTA() {
  return (
    <section className="border-t border-bjs-border bg-bjs-black py-32">
      <div className="mx-auto max-w-7xl px-8 text-center">
        <SectionLabel className="inline-block">Get In Touch</SectionLabel>
        <h2 className="mt-8 font-serif text-[clamp(52px,9vw,120px)] font-bold leading-[0.9] text-bjs-white">
          Let&apos;s Create
          <br />
          <span className="text-bjs-gold">Something Sacred.</span>
        </h2>
        <p className="mx-auto mt-8 max-w-lg font-sans text-base leading-[1.75] text-bjs-white/80">
          Available for concerts, corporate events, gospel conferences, and collaborations — within Nigeria and internationally.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <GoldButton href="/contact?inquiry=booking" size="lg">
            Book BeeJay
          </GoldButton>
          <OutlineButton href="/contact" size="lg">
            Send a Message
          </OutlineButton>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 font-sans text-[13px] text-bjs-muted">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-bjs-gold" aria-hidden />
            Lagos, Nigeria
          </span>
          <span className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4 text-bjs-gold" aria-hidden />
            +234 80 5898 2828
          </span>
          <span className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4 text-bjs-gold" aria-hidden />
            booking@beejaysax.com
          </span>
        </div>
      </div>

      <div className="mt-16 border-t border-bjs-border bg-bjs-surface/80 py-3">
        <Marquee text="BEEJAY SAX · GOSPEL SAXOPHONIST · MUSIC MINISTER · BLESSED & HIGHLY FAVOURED ·" />
      </div>
    </section>
  )
}
