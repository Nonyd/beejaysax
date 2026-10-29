import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/** Used by the deploy workflow to confirm the new version is live and can reach the database. */
export async function GET() {
  let db = false
  try {
    await prisma.$queryRaw`SELECT 1`
    db = true
  } catch {
    db = false
  }
  return NextResponse.json(
    { ok: db, version: process.env.NEXT_PUBLIC_BUILD_SHA ?? 'dev', db },
    { status: db ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  )
}
