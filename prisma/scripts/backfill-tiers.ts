/**
 * One-off: give events created before ticket tiers existed a "General admission" tier at
 * their old single price, a URL slug, and link their existing tickets to that tier.
 * Safe to re-run: events that already have tiers are skipped.
 *   npx tsx prisma/scripts/backfill-tiers.ts
 */
import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'

const prisma = new PrismaClient()

async function main() {
  const events = await prisma.event.findMany({ include: { _count: { select: { tiers: true } } } })
  for (const e of events) {
    if (e._count.tiers > 0) {
      console.log(`skip  ${e.title} (already has tiers)`)
      continue
    }
    const tier = await prisma.ticketTier.create({
      data: { eventId: e.id, name: 'General admission', price: e.isFree ? 0 : (e.ticketPrice ?? 0), sortOrder: 0 },
    })
    const linked = await prisma.ticket.updateMany({
      where: { eventId: e.id, tierId: null },
      data: { tierId: tier.id, tierName: tier.name },
    })
    const slug = e.slug ?? (slugify(e.title, { lower: true, strict: true }) || null)
    if (!e.slug && slug) await prisma.event.update({ where: { id: e.id }, data: { slug } })
    console.log(`done  ${e.title}: tier ${tier.name} at ${tier.price}, ${linked.count} ticket(s) linked, slug ${slug}`)
  }
}

main().finally(() => prisma.$disconnect())
