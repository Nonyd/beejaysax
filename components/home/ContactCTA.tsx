import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import Adire from '@/components/ui/Adire'
import { getContent } from '@/lib/content/store'

export default async function ContactCTA() {
  const [c, site] = await Promise.all([getContent('homeBooking'), getContent('site')])
  const tel = site.phone.replace(/[^\d+]/g, '')
  return (
    <section className="relative overflow-hidden bg-clay-deep py-24 text-ivory md:py-32">
      <Adire variant="field" color="var(--ivory)" opacity={0.09} />
      <div className="site-shell relative">
        <h2 className="max-w-[14ch] font-display text-[clamp(48px,7.5vw,112px)] leading-[0.92] tracking-[-0.025em]">
          {c.title}
        </h2>
        <p className="mt-8 max-w-[52ch] font-body text-lg leading-relaxed text-ivory/85">
          {c.text}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contact?inquiry=booking"
            className="inline-flex justify-center rounded-full bg-night px-8 py-4 font-body text-base font-semibold text-ivory no-underline transition-colors hover:bg-ink"
          >
            {site.bookLabel}
          </Link>
          <Link
            href="/contact"
            className="inline-flex justify-center rounded-full border border-ivory/50 px-8 py-4 font-body text-base font-semibold text-ivory no-underline transition-colors hover:border-ivory hover:bg-ivory/10"
          >
            {c.messageLabel}
          </Link>
        </div>

        <ul className="mt-14 flex flex-col gap-4 border-t border-ivory/25 pt-8 font-body text-base sm:flex-row sm:flex-wrap sm:gap-x-10">
          <li className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-gold" aria-hidden />
            {site.location}
          </li>
          <li>
            <a href={`tel:${tel}`} className="flex items-center gap-3 text-ivory no-underline hover:underline">
              <Phone className="h-4 w-4 text-gold" aria-hidden />
              {site.phone}
            </a>
          </li>
          <li>
            <a href={`mailto:${site.email}`} className="flex items-center gap-3 text-ivory no-underline hover:underline">
              <Mail className="h-4 w-4 text-gold" aria-hidden />
              {site.email}
            </a>
          </li>
        </ul>
      </div>
    </section>
  )
}
