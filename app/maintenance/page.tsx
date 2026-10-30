import type { Metadata } from 'next'
import Adire from '@/components/ui/Adire'
import { DEFAULT_MAINTENANCE_MESSAGE, getMaintenance } from '@/lib/maintenance'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Back soon', robots: { index: false, follow: false } }

/** Shown in place of every public page while maintenance mode is on (see proxy.ts). */
export default async function MaintenancePage() {
  const { message, until } = await getMaintenance()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6">
      <Adire variant="field" color="var(--gold)" opacity={0.06} />
      <div className="relative max-w-lg text-center">
        <p className="font-body text-[12px] font-semibold uppercase tracking-[0.28em] text-gold">BeeJay Sax</p>
        <h1 className="mt-6 font-display text-[clamp(40px,7vw,72px)] leading-[0.95] text-ivory">Back soon</h1>
        <p className="mx-auto mt-6 max-w-[42ch] whitespace-pre-line font-body text-lg text-ivory/75">
          {message || DEFAULT_MAINTENANCE_MESSAGE}
        </p>
        {until && <p className="mt-6 font-body text-[15px] font-semibold text-gold">{until}</p>}
        <p className="mt-10 font-body text-[14px] text-ivory/55">
          Have a ticket? Your ticket link still works and you can be checked in at the door as usual.
        </p>
      </div>
    </div>
  )
}
