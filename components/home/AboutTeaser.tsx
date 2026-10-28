import ArchPhoto from '@/components/ui/ArchPhoto'
import OutlineButton from '@/components/ui/OutlineButton'
import { getContent } from '@/lib/content/store'

/** Ivory section: the page's light, warm pause between indigo blocks. */
export default async function AboutTeaser() {
  const c = await getContent('homeAbout')
  return (
    <section className="bg-ivory py-24 text-ink md:py-32">
      <div className="site-shell grid items-center gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div className="mx-auto w-full max-w-[340px] lg:max-w-[400px]">
          <ArchPhoto
            src={c.image}
            alt={c.imageAlt}
            sizes="(max-width:1024px) 340px, 400px"
          />
        </div>

        <div className="min-w-0">
          <h2 className="font-display text-[clamp(40px,5.4vw,72px)] leading-[0.98] tracking-[-0.02em]">
            {c.titleLines.map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </h2>
          <p className="mt-8 max-w-[58ch] font-body text-lg leading-relaxed text-ink/80">{c.body}</p>

          <dl className="mt-10 grid max-w-[520px] grid-cols-3 border-y border-ink/15">
            {c.facts.map((f, i) => (
              <div key={i} className={i > 0 ? 'border-l border-ink/15 py-6 pl-5' : 'py-6 pr-5'}>
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-display text-[clamp(40px,4.5vw,56px)] leading-none text-clay">{f.value}</dd>
                <dd className="mt-2 font-body text-sm text-ink/70">{f.label}</dd>
              </div>
            ))}
          </dl>

          <OutlineButton
            href="/about"
            className="mt-10 border-ink/40 text-ink hover:border-clay hover:bg-transparent hover:text-clay"
          >
            {c.buttonLabel}
          </OutlineButton>
        </div>
      </div>
    </section>
  )
}
