import Link from 'next/link'
import { fmt } from '@/lib/time'
import { Ticket } from 'lucide-react'
import Adire from '@/components/ui/Adire'
import GoldButton from '@/components/ui/GoldButton'
import OutlineButton from '@/components/ui/OutlineButton'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { getContent } from '@/lib/content/store'
import { HeroScene, Leaper } from './HeroScene'
import s from './Hero.module.css'

const delay = (seconds: number) => ({ animationDelay: `${seconds}s` })

export default async function Hero() {
  const c = await getContent('homeHero')
  const next = await safeDb(
    () => prisma.event.findFirst({ where: { status: 'UPCOMING' }, orderBy: { eventDate: 'asc' } }),
    null
  )
  // First line sits behind him in outline, the rest in front of him in gold.
  const [first = '', ...rest] = c.titleLines

  return (
    <HeroScene className={s.hero}>
      <Adire variant="field" color="var(--gold)" opacity={0.05} />
      <div aria-hidden className={s.sun}>
        <div className={s.rays} />
      </div>

      <h1 className="sr-only">{c.titleLines.join(' ')}</h1>
      <p aria-hidden className={s.nameBack}>
        {first}
      </p>

      <div className={s.stage}>
        <div className={s.stageInner}>
          <svg aria-hidden viewBox="0 0 200 200" className={s.halo}>
            <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="0.1 7.6" strokeLinecap="round" />
          </svg>
          <div aria-hidden className={s.archLine} />
          <div aria-hidden className={s.arch} />
          <div aria-hidden className={s.shadow} />
          <Leaper src={c.cutout} alt={c.imageAlt} />
        </div>
      </div>

      {rest.length > 0 && (
        <p aria-hidden className={s.nameFront}>
          {rest.join(' ')}
        </p>
      )}

      <div className={`${s.copy} site-shell min-[960px]:!px-0`}>
        <p className={`${s.rise} font-body text-base font-medium text-gold md:text-lg`} style={delay(0.7)}>
          {c.kicker}
        </p>
        <p className={`${s.rise} mt-3 font-display text-[clamp(26px,2.6vw,36px)] leading-tight`} style={delay(0.8)}>
          {c.tagline}
        </p>
        <p className={`${s.rise} mt-3 max-w-[46ch] font-body text-[17px] leading-relaxed text-ivory/75`} style={delay(0.9)}>
          {c.intro}
        </p>

        <div className={`${s.rise} mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap`} style={delay(1)}>
          <GoldButton href="/events" className="w-full sm:w-auto">
            {c.primaryLabel}
          </GoldButton>
          <OutlineButton href="/releases" className="w-full sm:w-auto">
            {c.secondaryLabel}
          </OutlineButton>
        </div>

        {next && (
          <Link
            href={`/events/${next.id}`}
            className={`${s.rise} group mt-6 inline-flex max-w-full items-center gap-4 rounded-full border border-line bg-night/40 py-2 pr-6 pl-2 no-underline backdrop-blur-sm transition-colors hover:border-gold`}
            style={delay(1.1)}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-white">
              <Ticket className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 font-body text-sm leading-snug">
              <span className="block truncate font-semibold text-ivory group-hover:text-gold">{next.title}</span>
              <span className="block truncate text-ivory/60">
                {fmt(next.eventDate, 'd MMMM yyyy')}, {next.venue}
              </span>
            </span>
          </Link>
        )}
      </div>

      <div className={s.band}>
        <Adire variant="band" color="var(--gold)" opacity={0.7} height={40} />
      </div>
    </HeroScene>
  )
}
