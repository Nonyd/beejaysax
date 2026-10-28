const QUOTES = [
  {
    quote: 'BeeJay Sax carries a rare gift. When he plays, heaven draws near.',
    name: 'Pastor',
    role: 'Night of Worship',
  },
  {
    quote: "One of the most spirit-led saxophonists we've hosted at The Experience.",
    name: 'Event organiser',
    role: 'The Experience',
  },
  {
    quote: "His Online Praise Party became our family's weekly sanctuary during lockdown.",
    name: 'Audience member',
    role: 'United Kingdom',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="bg-ivory py-24 text-ink md:py-32">
      <div className="site-shell">
        <h2 className="max-w-[16ch] font-display text-[clamp(44px,6vw,84px)] leading-[0.95] tracking-[-0.02em]">
          What people say after the music
        </h2>

        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-0">
          {QUOTES.map((q, i) => (
            <figure
              key={q.name}
              className={`flex flex-col ${i > 0 ? 'md:border-l md:border-ink/15 md:pl-10' : ''} ${i < QUOTES.length - 1 ? 'md:pr-10' : ''}`}
            >
              <span aria-hidden className="block h-12 font-display text-[96px] leading-[0.9] text-clay">
                &ldquo;
              </span>
              <blockquote className="mt-4 flex-1 font-display text-[clamp(22px,2.1vw,28px)] leading-[1.3]">{q.quote}</blockquote>
              <figcaption className="mt-8 border-t border-ink/15 pt-5 font-body">
                <span className="block text-base font-semibold">{q.name}</span>
                <span className="block text-sm text-ink/65">{q.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
