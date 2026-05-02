import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminReleasesPage() {
  const releases = await prisma.release.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8' }}>Releases</h2>
          <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Manage discography</p>
        </div>
        <Link
          href="/admin/releases/new"
          className="bg-[#C9A84C] px-6 py-2.5 font-semibold text-[#080808] transition hover:bg-[#E8C96D]"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          + New Release
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {releases.map((release) => (
          <div
            key={release.id}
            className="group border border-[#1E1E1E] bg-[#0F0F0F] transition hover:border-[#C9A84C]"
          >
            <div className="relative aspect-square overflow-hidden bg-[#161616]">
              {release.coverImage ? (
                <Image
                  src={release.coverImage}
                  alt={release.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#C9A84C]" style={{ fontSize: 48 }}>
                  ♪
                </div>
              )}
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: 'rgba(201,168,76,0.9)',
                  color: '#080808',
                  padding: '2px 6px',
                  fontWeight: 600,
                }}
              >
                {release.releaseType}
              </span>
              {release.isFeatured && (
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontSize: 9,
                    background: 'rgba(8,8,8,0.8)',
                    color: '#C9A84C',
                    border: '1px solid rgba(201,168,76,0.4)',
                    padding: '2px 6px',
                  }}
                >
                  FEATURED
                </span>
              )}
            </div>
            <div className="p-4">
              <p style={{ fontSize: 14, color: '#F5F0E8', fontWeight: 500 }}>{release.title}</p>
              {release.releaseDate && (
                <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                  {new Date(release.releaseDate).getFullYear()}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/admin/releases/${release.id}/edit`}
                  className="border border-[#2A2A2A] px-3 py-1.5 text-xs text-white transition hover:border-[#C9A84C] hover:text-[#C9A84C]"
                  style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  Edit
                </Link>
                <AdminDeleteButton endpoint={`/api/releases/${release.id}`} />
              </div>
            </div>
          </div>
        ))}

        {releases.length === 0 && (
          <div className="col-span-4 border border-[#1E1E1E] bg-[#0F0F0F] p-16 text-center">
            <p style={{ color: '#444', fontSize: 14 }}>No releases yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
