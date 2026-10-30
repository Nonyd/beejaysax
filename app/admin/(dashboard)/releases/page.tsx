import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import AdminPageHeader, { adminPrimaryLinkStyle } from '@/components/admin/AdminPageHeader'
import SyncPanel from '@/components/admin/SyncPanel'
import { getSetting } from '@/lib/settings'
import { getSyncStatus } from '@/lib/sync/run'

export const dynamic = 'force-dynamic'

export default async function AdminReleasesPage() {
  await requireAdmin('releases')
  const [releases, status, id, secret, artist] = await Promise.all([
    prisma.release.findMany({ orderBy: [{ isHidden: 'asc' }, { releaseDate: 'desc' }, { createdAt: 'desc' }] }),
    getSyncStatus('spotify'),
    getSetting('spotify.clientId'),
    getSetting('spotify.clientSecret'),
    getSetting('spotify.artistId'),
  ])

  return (
    <div>
      <AdminPageHeader
        eyebrow="Releases"
        title="Discography"
        subtitle="Releases come from Spotify automatically, with Apple Music links found for you. Edit any release to override what Spotify says; your edits are kept on the next sync."
        action={
          <Link href="/admin/releases/new" style={adminPrimaryLinkStyle()}>
            + New Release
          </Link>
        }
      />

      <SyncPanel source="spotify" label="Spotify & Apple Music" configured={Boolean(id && secret && artist)} status={status} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {releases.map((release) => (
          <div
            key={release.id}
            className={`group border ${release.isHidden ? 'opacity-50 ' : ''} border-ivory/12 bg-ink transition hover:border-gold`}
          >
            <div className="relative aspect-square overflow-hidden bg-surface-2">
              {release.coverImage ? (
                <Image
                  src={release.coverImage}
                  alt={release.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gold" style={{ fontSize: 48 }}>
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
                  background: 'color-mix(in srgb, var(--gold) 90%, transparent)',
                  color: 'var(--night)',
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
                    background: 'color-mix(in srgb, var(--night) 80%, transparent)',
                    color: 'var(--gold)',
                    border: '1px solid color-mix(in srgb, var(--gold) 40%, transparent)',
                    padding: '2px 6px',
                  }}
                >
                  FEATURED
                </span>
              )}
            </div>
            <div className="p-4">
              <p style={{ fontSize: 14, color: 'var(--ivory)', fontWeight: 500 }}>{release.title}</p>
              <p className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-ivory/60">
                {release.spotifyAlbumId ? <span className="text-success">From Spotify</span> : <span>Added by hand</span>}
                {release.isHidden && <span className="text-warn">Hidden</span>}
                {release.lockedFields.length > 0 && <span title={release.lockedFields.join(', ')}>Edited</span>}
              </p>
              {release.releaseDate && (
                <p style={{ fontSize: 12, color: 'color-mix(in srgb, var(--ivory) 55%, transparent)', marginTop: 2 }}>
                  {new Date(release.releaseDate).getFullYear()}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/admin/releases/${release.id}/edit`}
                  className="rounded-full border border-ivory/20 px-4 py-1.5 text-sm text-ivory transition hover:border-gold hover:text-gold"
                >
                  Edit
                </Link>
                <AdminDeleteButton
                  endpoint={`/api/releases/${release.id}`}
                  label={release.spotifyAlbumId ? 'Hide' : 'Delete'}
                  confirmMessage={release.spotifyAlbumId ? 'Hide this release from the site? Releases from Spotify are hidden rather than deleted, so they don’t come back on the next sync.' : undefined}
                />
              </div>
            </div>
          </div>
        ))}

        {releases.length === 0 && (
          <div className="col-span-4 border border-ivory/12 bg-ink p-16 text-center">
            <p style={{ color: 'color-mix(in srgb, var(--ivory) 45%, transparent)', fontSize: 14 }}>No releases yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
