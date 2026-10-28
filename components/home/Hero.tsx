import Link from 'next/link'
import { format } from 'date-fns'
import { Ticket } from 'lucide-react'
import Adire from '@/components/ui/Adire'
import ArchPhoto from '@/components/ui/ArchPhoto'
import GoldButton from '@/components/ui/GoldButton'
import OutlineButton from '@/components/ui/OutlineButton'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { SITE_IMAGES } from '@/lib/site-images'

const rise = (delay: number) => ({ animation: `rise 0.9s cubic-bezier(.2,.7,.2,1) ${delay}s both` })

export default async function Hero() {
  const next = await safeDb(
    () => prisma.event.findFirst({ where: { status: 'UPCOMING' }, orderBy: { eventDate: 'asc' } }),
    null
  )

  return (
    <section className="relative -mt-[72px] overflow-hidden bg-ink pt-[72px]">
      <Adire variant="field" color="#E3B23C" opacity={0.06} />
      {/* warm glow behind the portrait */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 h-[720px] w-[720px] rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(196,88,58,0.45) 0%, rgba(196,88,58,0) 65%)' }}
      />

      <div className="site-shell relative grid min-h-[calc(100svh-72px-40px)] items-center gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:py-20">
        <div className="min-w-0">
          <p className="font-body text-base font-medium text-gold md:text-lg" style={rise(0.05)}>
            Gospel saxophonist and music minister
          </p>
          <h1
            className="mt-5 font-display text-[clamp(76px,13vw,176px)] leading-[0.86] tracking-[-0.03em] text-ivory"
            style={rise(0.15)}
          >
            <span className="block">BeeJay</span>
            <span className="block pl-[0.5em]">Sax</span>
          </h1>
          <p className="mt-8 font-display text-[clamp(24px,2.6vw,34px)] leading-tight text-gold" style={rise(0.3)}>
            Blessed &amp; Highly Favoured.
          </p>
          <p className="mt-4 max-w-[46ch] font-body text-[17px] leading-relaxed text-ivory/75" style={rise(0.38)}>
            Spirit-filled saxophone from Lagos to London. Concerts, worship nights and ministry on three continents.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={rise(0.46)}>
            <GoldButton href="/events" className="w-full sm:w-auto">
              Get concert tickets
            </GoldButton>
            <OutlineButton href="/releases" className="w-full sm:w-auto">
              Listen to the music
            </OutlineButton>
          </div>

          {next && (
            <Link
              href={`/events/${next.id}`}
              className="group mt-10 inline-flex max-w-full items-center gap-4 rounded-full border border-line bg-night/40 py-2 pr-6 pl-2 no-underline transition-colors hover:border-gold"
              style={rise(0.56)}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-ivory">
                <Ticket className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 font-body text-sm leading-snug">
                <span className="block truncate font-semibold text-ivory group-hover:text-gold">{next.title}</span>
                <span className="block truncate text-ivory/60">
                  {format(next.eventDate, 'd MMMM yyyy')}, {next.venue}
                </span>
              </span>
            </Link>
          )}
        </div>

        <div className="mx-auto w-full max-w-[300px] pt-6 sm:max-w-[360px] lg:max-w-[440px] lg:pt-0" style={rise(0.25)}>
          <ArchPhoto
            src={SITE_IMAGES.hero}
            alt="BeeJay Sax playing the saxophone on stage"
            sizes="(max-width:1024px) 360px, 440px"
            priority
            halo
            objectPosition={SITE_IMAGES.heroPosition}
          />
        </div>
      </div>

      <Adire variant="band" color="#E3B23C" opacity={0.7} height={40} />
    </section>
  )
}
