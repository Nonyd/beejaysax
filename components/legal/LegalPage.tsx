import PageHero from '@/components/ui/PageHero'

export type LegalSection = { id: string; title: string }

// Readable long-form text on the night background. Headings come from <LegalHeading>.
const prose =
  'max-w-[70ch] font-body text-[16px] leading-[1.75] text-ivory/80 [&_a]:font-semibold [&_a]:text-gold [&_a]:underline [&_a]:decoration-gold/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-gold [&_h3]:mt-8 [&_h3]:font-body [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ivory [&_li]:mt-2 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-4 [&_strong]:text-ivory [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6'

/**
 * Shared layout for the Privacy, Cookie, Terms and Ticket terms pages: page header with the
 * "Last updated" date, a contents list linking to each section, and a ~70ch text column.
 */
export default function LegalPage({
  title,
  intro,
  lastUpdated,
  sections,
  children,
}: {
  title: string[]
  intro?: string
  lastUpdated: string
  sections: LegalSection[]
  children: React.ReactNode
}) {
  return (
    <>
      <PageHero title={title} intro={intro}>
        <p className="mt-6 font-body text-sm font-semibold text-gold">Last updated {lastUpdated}</p>
      </PageHero>

      <div className="bg-night py-16 md:py-24">
        <div className="site-shell grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <nav aria-labelledby="legal-contents" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p id="legal-contents" className="mb-4 font-body text-sm font-semibold text-gold">
              Contents
            </p>
            <ol className="space-y-2 border-l border-line pl-4">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="font-body text-[15px] leading-snug text-ivory/70 no-underline transition-colors hover:text-gold">
                    <span className="mr-2 text-ivory/40">{i + 1}.</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className={prose}>{children}</div>
        </div>
      </div>
    </>
  )
}

/** One numbered section; its id must match an entry in `sections`. */
export function LegalHeading({ section, n }: { section: LegalSection; n: number }) {
  return (
    <h2 id={section.id} className="mt-14 scroll-mt-28 font-display text-[clamp(28px,3.4vw,40px)] leading-tight text-ivory first:mt-0">
      <span className="mr-3 text-gold">{n}.</span>
      {section.title}
    </h2>
  )
}

/** Simple responsive table for the cookie list and similar. Scrolls sideways on phones instead of squashing. */
export function LegalTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-[16px] border border-line">
      <table className="w-full min-w-[640px] border-collapse text-left text-[14px] leading-snug">
        <thead className="bg-ink">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold text-ivory">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line align-top">
              {r.map((c, j) => (
                <td key={j} className={j === 0 ? 'px-4 py-3 font-mono text-[13px] text-ivory' : 'px-4 py-3 text-ivory/75'}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
