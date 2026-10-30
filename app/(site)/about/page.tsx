import type { Metadata } from 'next'
import { artistJsonLd, breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import ContactCTA from '@/components/home/ContactCTA'
import Adire from '@/components/ui/Adire'
import ArchPhoto from '@/components/ui/ArchPhoto'
import GoldButton from '@/components/ui/GoldButton'
import { getContent, paragraphs } from '@/lib/content/store'

export const metadata: Metadata = pageMetadata({
  title: 'About BeeJay Sax — Abolaji David Banjoko',
  description:
    "Abolaji David Banjoko (BeeJay Sax) is a Nigerian gospel saxophonist, music minister and convener of the Beejay Sax Live Concert. From engineering graduate to one of Nigeria's finest saxophonists.",
  path: '/about',
  shareTitle: 'About BeeJay Sax',
  shareDescription: 'From engineering to ministry: the story of Abolaji David Banjoko.',
  type: 'profile',
})

// Rendered per request; see app/(site)/layout.tsx.
export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const [c, site] = await Promise.all([getContent('about'), getContent('site')])

  return (
    <>
      <JsonLd
        data={[
          ...artistJsonLd({ description: `${c.intro} ${c.storyLead}`, socials: site.socials, image: c.image.startsWith("/") ? c.image : undefined }),
          breadcrumbJsonLd([{ name: "About", path: "/about" }]),
        ]}
      />
      {/* header */}
      <section className="relative -mt-[72px] overflow-hidden bg-ink pt-[72px]">
        <Adire variant="field" color="var(--gold)" opacity={0.06} />
        <div className="site-shell relative grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-w-0">
            <p className="font-body text-lg font-medium text-gold">{c.kicker}</p>
            <h1 className="mt-5 font-display text-[clamp(52px,6.6vw,96px)] leading-[0.92] tracking-[-0.03em] text-ivory">
              {c.nameLines.map((l, i) => (
                <span key={i} className="block">
                  {l}
                </span>
              ))}
            </h1>
            <p className="mt-8 max-w-[48ch] font-body text-lg leading-relaxed text-ivory/75">{c.intro}</p>
          </div>
          <div className="mx-auto w-full max-w-[300px] lg:max-w-[380px]">
            <ArchPhoto src={c.image} alt={c.imageAlt} sizes="(max-width:1024px) 300px, 380px" priority objectPosition={c.imagePosition} />
          </div>
        </div>
        <Adire variant="band" color="var(--gold)" opacity={0.6} height={32} />
      </section>

      {/* story */}
      <section className="bg-ivory py-24 text-ink md:py-32">
        <div className="site-shell grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <p className="font-display text-[clamp(32px,3.8vw,52px)] leading-[1.08] tracking-[-0.015em]">{c.storyLead}</p>
          <div className="max-w-[62ch] space-y-6 font-body text-lg leading-relaxed text-ink/80">
            {paragraphs(c.story).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* shared the stage */}
      <section className="bg-night py-24 md:py-32">
        <div className="site-shell">
          <p className="font-body text-lg font-medium text-gold">{c.sharedLabel}</p>
          <ul className="mt-6 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-8">
            {c.sharedNames.map((name, i) => (
              <li key={i} className="flex items-center gap-8">
                <span className="font-display text-[clamp(40px,5.6vw,80px)] leading-[1] tracking-[-0.02em] text-ivory">{name}</span>
                {i < c.sharedNames.length - 1 && <span aria-hidden className="hidden h-3 w-3 rotate-45 bg-clay md:block" />}
              </li>
            ))}
          </ul>

          {c.stages.length > 0 && (
            <div className="mt-20 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {c.stages.map((s, i) => (
                <div key={i} className="rounded-[24px] border border-line bg-ink/50 p-8">
                  <p className="font-body text-sm font-semibold text-gold">{s.when}</p>
                  <h2 className="mt-2 font-display text-[28px] leading-[1.1] text-ivory">{s.title}</h2>
                  <p className="mt-3 font-body text-base leading-relaxed text-ivory/70">{s.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* milestones: a real sequence, so it gets a timeline */}
      {c.milestones.length > 0 && (
        <section className="bg-ink py-24 md:py-32">
          <div className="site-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <h2 className="font-display text-[clamp(44px,6vw,84px)] leading-[0.95] tracking-[-0.02em] text-ivory">
                {c.journeyTitle.map((l, i) => (
                  <span key={i} className="block">
                    {l}
                  </span>
                ))}
              </h2>
              <GoldButton href="/events" className="mt-10">
                {c.buttonLabel}
              </GoldButton>
            </div>

            <ol className="relative border-l-2 border-gold/40 pl-10">
              {c.milestones.map((m, i) => (
                <li key={i} className="relative pb-10 last:pb-0">
                  <span aria-hidden className="absolute top-2 -left-[49px] h-4 w-4 rounded-full border-4 border-ink bg-gold" />
                  <p className="font-display text-3xl leading-none text-gold">{m.year}</p>
                  <p className="mt-2 max-w-[48ch] font-body text-lg leading-snug text-ivory/85">{m.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <ContactCTA />
    </>
  )
}
