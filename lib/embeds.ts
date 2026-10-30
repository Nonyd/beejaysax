/**
 * Turns streaming links into embeddable player URLs, so visitors can preview a release
 * without leaving the site. Returns null for links that can't be embedded.
 */
export type Player = { service: 'spotify' | 'apple'; label: string; src: string; height: number }

/** open.spotify.com/(intl-xx/)album|track|playlist/ID → open.spotify.com/embed/… */
export function spotifyPlayer(url: string | null | undefined): Player | null {
  const m = url?.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(album|track|playlist)\/([A-Za-z0-9]{22})/)
  if (!m) return null
  const single = m[1] === 'track'
  return { service: 'spotify', label: 'Spotify', src: `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`, height: single ? 152 : 352 }
}

/** music.apple.com/cc/album/name/ID(?i=track) → embed.music.apple.com/… (same path and query) */
export function applePlayer(url: string | null | undefined): Player | null {
  if (!url) return null
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return null
  }
  if (!/(^|\.)music\.apple\.com$/.test(u.hostname) || !/\/(album|song|playlist)\//.test(u.pathname)) return null
  const single = u.pathname.includes('/song/') || u.searchParams.has('i')
  return { service: 'apple', label: 'Apple Music', src: `https://embed.music.apple.com${u.pathname}${u.search}`, height: single ? 175 : 450 }
}

export function releasePlayers(r: { spotifyUrl: string | null; appleMusicUrl: string | null }): Player[] {
  return [spotifyPlayer(r.spotifyUrl), applePlayer(r.appleMusicUrl)].filter((p): p is Player => p !== null)
}
