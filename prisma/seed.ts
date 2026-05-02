import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@beejaysax.com',
      passwordHash: await hash('BeejaySax2026!', 12),
      name: 'Admin',
    },
  })

  await prisma.event.upsert({
    where: { id: 'seed-event-1' },
    update: {},
    create: {
      id: 'seed-event-1',
      title: 'Beejay Sax Live Concert 2026',
      description:
        'The annual gospel event gathering individuals from all walks of life to enjoy ethical, Godly music in a serene atmosphere.',
      venue: 'Eko Hotels and Suites',
      address: 'Plot 1415, Adetokunbo Ademola Street, Victoria Island',
      city: 'Lagos',
      country: 'Nigeria',
      eventDate: new Date('2026-05-24T17:00:00'),
      eventTime: '5:00 PM',
      isFree: false,
      ticketPrice: 5000,
      isFeatured: true,
      status: 'UPCOMING',
    },
  })

  await prisma.release.upsert({
    where: { slug: 'praise-session-1' },
    update: {},
    create: {
      title: 'Praise Session 1',
      slug: 'praise-session-1',
      releaseType: 'ALBUM',
      description: 'A soul-stirring collection of powerful gospel melodies.',
      isFeatured: true,
    },
  })

  await prisma.release.upsert({
    where: { slug: 'modupeoluwa' },
    update: {},
    create: {
      title: 'Modupeoluwa',
      slug: 'modupeoluwa',
      releaseType: 'SINGLE',
      description: 'A beautiful fusion of African rhythms and soulful gospel melodies.',
    },
  })

  await prisma.release.upsert({
    where: { slug: 'joyful-praise' },
    update: {},
    create: {
      title: 'Joyful Praise',
      slug: 'joyful-praise',
      releaseType: 'ALBUM',
      description: 'Pure joy captured in gospel saxophone and song.',
    },
  })

  await prisma.video.upsert({
    where: { id: 'seed-video-1' },
    update: {},
    create: {
      id: 'seed-video-1',
      title: 'BeeJay Sax Live in London, Indigo O2',
      youtubeId: '0jxRD456j_w',
      isFeatured: true,
      sortOrder: 1,
    },
  })

  await prisma.video.upsert({
    where: { id: 'seed-video-2' },
    update: {},
    create: {
      id: 'seed-video-2',
      title: 'BeeJay Sax at House on the Rock (TAPE 2022)',
      youtubeId: 'z4saapf2BrA',
      isFeatured: true,
      sortOrder: 2,
    },
  })

  console.log('✅ Seed complete. Admin login: admin / BeejaySax2026!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
