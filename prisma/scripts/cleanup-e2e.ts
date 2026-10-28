/**
 * Removes events created by the end-to-end tests ("E2E …" titles) with their tiers,
 * orders, tickets and coupons (cascade).   npx tsx prisma/scripts/cleanup-e2e.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const events = await prisma.event.findMany({ where: { title: { startsWith: 'E2E ' } }, select: { id: true, title: true } })
  for (const e of events) {
    await prisma.event.delete({ where: { id: e.id } })
    console.log(`deleted ${e.title} (${e.id})`)
  }
  console.log(`${events.length} test event(s) removed`)
}

main().finally(() => prisma.$disconnect())
