import SectionLabel from '@/components/ui/SectionLabel'
import GoldButton from '@/components/ui/GoldButton'
import OutlineButton from '@/components/ui/OutlineButton'
import Marquee from '@/components/ui/Marquee'
import { MapPin, Phone } from 'lucide-react'
import { bodyTextStyle, contactCtaHeadingStyle, goldRuleStyle } from '@/lib/typography-styles'

export default function ContactCTA() {
  return (
    <section className="border-t border-bjs-border bg-bjs-black py-20 md:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center md:px-12">
        <SectionLabel className="inline-block">Get In Touch</SectionLabel>
        <div className="mt-4" style={{ textAlign: 'center' }}>
          <h2
            style={{
              ...contactCtaHeadingStyle,
              color: '#F5F0E8',
              whiteSpace: 'nowrap',
            }}
          >
            Let&apos;s Create
          </h2>
          <h2
            style={{
              ...contactCtaHeadingStyle,
              fontStyle: 'italic',
              color: '#C9A84C',
              whiteSpace: 'nowrap',
            }}
          >
            Something Sacred.
          </h2>
        </div>

        <span className="mx-auto my-8 block" style={goldRuleStyle} />

        <p className="mx-auto max-w-lg" style={bodyTextStyle}>
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
