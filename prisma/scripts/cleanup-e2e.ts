/**
 * Removes data created by the end-to-end tests: "E2E …" events (with tiers, orders, tickets,
 * coupons by cascade), e2e-*@example.com email logs and suppressions, and "E2E …" videos.   npx tsx prisma/scripts/cleanup-e2e.ts
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
  const logs = await prisma.emailLog.deleteMany({ where: { to: { startsWith: 'e2e-' }, AND: { to: { endsWith: '@example.com' } } } })
  const sup = await prisma.emailSuppression.deleteMany({ where: { email: { startsWith: 'e2e-' } } })
  const vids = await prisma.video.deleteMany({ where: { title: { startsWith: 'E2E ' } } })
  console.log(`${logs.count} test email log(s), ${sup.count} suppression(s), ${vids.count} video(s) removed`)
}

main().finally(() => prisma.$disconnect())
