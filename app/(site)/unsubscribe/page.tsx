import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Adire from '@/components/ui/Adire'
import UnsubscribeForm from '@/components/mailing/UnsubscribeForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Email preferences', robots: { index: false, follow: false } }

/** "j***@gmail.com": enough for people to recognise their address without exposing it to anyone holding the link. */
function mask(email: string) {
  const [local, domain] = email.split('@')
  return `${local.slice(0, 1)}${'*'.repeat(Math.max(2, Math.min(local.length - 1, 6)))}@${domain}`
}

/** Where the "Unsubscribe" link in campaign emails lands. Unsubscribing takes one click here. */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = '' } = await searchParams
  const contact = t ? await prisma.contact.findUnique({ where: { token: t }, select: { email: true, status: true } }) : null

  return (
    <section className="relative -mt-[72px] min-h-[80vh] overflow-hidden bg-ink pt-[72px]">
      <Adire variant="field" color="var(--gold)" opacity={0.05} />
      <div className="relative mx-auto max-w-[560px] px-6 py-16 md:py-24">
        <div className="rounded-[32px] bg-ivory p-8 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-12">
          {contact ? (
            <UnsubscribeForm token={t} email={mask(contact.email)} initialStatus={contact.status} />
          ) : (
            <>
              <h1 className="font-display text-[clamp(32px,5vw,44px)] leading-[0.95]">This link has expired</h1>
              <p className="mt-4 font-body text-base text-ink/70">
                We couldn’t find this subscription. If you still get emails from us, reply to one and ask to be removed.
              </p>
              <Link href="/" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 font-body text-sm font-semibold text-ivory no-underline">
                Go to the homepage
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
