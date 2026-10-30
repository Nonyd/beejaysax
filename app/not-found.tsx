import Link from 'next/link'
import Adire from '@/components/ui/Adire'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6">
      <Adire variant="field" color="var(--gold)" opacity={0.06} />
      <div className="relative max-w-lg text-center">
        <p className="font-display text-[clamp(120px,22vw,240px)] leading-none text-gold/25 select-none" aria-hidden>
          404
        </p>
        <h1 className="-mt-6 font-display text-[clamp(40px,7vw,72px)] leading-[0.95] text-ivory">This page isn&apos;t here</h1>
        <p className="mx-auto mt-6 max-w-[40ch] font-body text-lg text-ivory/75">
          The link may be old or mistyped. Try the home page, or find the next concert.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-gold px-7 py-3.5 font-body text-[15px] font-semibold text-night no-underline transition-colors hover:bg-gold-lt"
          >
            Go to home page
          </Link>
          <Link
            href="/events"
            className="rounded-full border border-ivory/40 px-7 py-3.5 font-body text-[15px] font-semibold text-ivory no-underline transition-colors hover:border-gold hover:text-gold"
          >
            See upcoming events
          </Link>
        </div>
      </div>
    </div>
  )
}
