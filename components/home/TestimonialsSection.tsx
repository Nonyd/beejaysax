import SectionLabel from '@/components/ui/SectionLabel'

const QUOTES = [
  {
    quote: 'BeeJay Sax carries a rare gift — when he plays, heaven draws near.',
    by: 'Pastor at Night of Worship',
  },
  {
    quote: 'One of the most spirit-led saxophonists we’ve hosted at The Experience.',
    by: 'Event Organiser, The Experience',
  },
  {
    quote: 'His Online Praise Party became our family’s weekly sanctuary during lockdown.',
    by: 'Fan, UK',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="bg-bjs-surface py-32">
      <div className="mx-auto max-w-7xl px-8">
        <SectionLabel>They Say</SectionLabel>
        <h2 className="mt-6 font-serif text-[clamp(38px,6vw,80px)] font-semibold text-bjs-white">The Sound Speaks</h2>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-10">
          {QUOTES.map((q) => (
            <blockquote
              key={q.by}
              className="bjs-testimonial-card relative isolate flex min-h-0 w-full min-w-0 max-w-full flex-col overflow-x-clip overflow-y-visible border border-bjs-border bg-bjs-surface2 px-6 py-10 pt-12 transition-colors hover:border-bjs-gold md:px-7 md:py-12 md:pt-14"
            >
              <span
                className="pointer-events-none absolute left-3 top-2 select-none font-serif text-[64px] leading-none text-bjs-gold/12 md:left-5 md:top-3 md:text-[88px]"
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="relative z-[1] min-w-0 max-w-full hyphens-none font-serif text-[clamp(17px,2.4vw,26px)] italic leading-snug text-bjs-white [-webkit-hyphens:none]">
                {q.quote}
              </p>
              <footer className="relative z-[1] mt-6 shrink-0 hyphens-none font-sans text-[11px] uppercase leading-relaxed tracking-wide text-bjs-gold md:text-[12px] [-webkit-hyphens:none]">
                {q.by}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
