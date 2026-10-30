import Adire from '@/components/ui/Adire'

/** Inner-page header: indigo field with Adire texture, big Gloock title, closing pattern band. */
export default function PageHero({
  title,
  intro,
  children,
}: {
  /** One string per line; each renders as its own block so words never break mid-line */
  title: string[]
  intro?: string
  children?: React.ReactNode
}) {
  return (
    <section className="relative -mt-[72px] overflow-hidden bg-ink pt-[72px]">
      <Adire variant="field" color="var(--gold)" opacity={0.06} />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--clay) 35%, transparent) 0%, color-mix(in srgb, var(--clay) 0%, transparent) 65%)' }}
      />
      <div className="site-shell relative pt-20 pb-16 md:pt-28 md:pb-20">
        <h1 className="font-display text-[clamp(56px,9vw,128px)] leading-[0.9] tracking-[-0.03em] text-ivory">
          {title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        {intro && <p className="mt-6 max-w-[52ch] font-body text-lg leading-relaxed text-ivory/75">{intro}</p>}
        {children}
      </div>
      <Adire variant="band" color="var(--gold)" opacity={0.6} height={32} />
    </section>
  )
}
