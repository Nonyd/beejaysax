export default function PlatformStreamPills({
  platforms,
  tone = 'dark',
}: {
  platforms: { label: string; url: string }[]
  /** 'dark' for indigo backgrounds, 'light' for ivory */
  tone?: 'dark' | 'light'
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {platforms.map((p) => (
        <a
          key={p.label}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className={
            tone === 'dark'
              ? 'rounded-full border border-ivory/30 px-5 py-2.5 font-body text-sm font-medium text-ivory no-underline transition-colors hover:border-gold hover:text-gold'
              : 'rounded-full border border-ink/30 px-5 py-2.5 font-body text-sm font-medium text-ink no-underline transition-colors hover:border-clay hover:text-clay'
          }
        >
          {p.label}
        </a>
      ))}
    </div>
  )
}
