/** Accepts a Spotify artist link, URI or bare ID and returns the 22-char ID. */
export function parseSpotifyArtistId(input: string | undefined): string | null {
  if (!input) return null
  const s = input.trim()
  const m = s.match(/artist[/:]([A-Za-z0-9]{22})/) ?? s.match(/^([A-Za-z0-9]{22})$/)
  return m ? m[1] : null
}

/** Accepts a channel link, @handle or UC… ID. */
export function parseYouTubeChannel(input: string | undefined): { id?: string; handle?: string } | null {
  if (!input) return null
  const s = input.trim()
  const id = s.match(/(UC[A-Za-z0-9_-]{22})/)
  if (id) return { id: id[1] }
  const handle = s.match(/@([A-Za-z0-9._-]+)/)
  if (handle) return { handle: handle[1] }
  return null
}

/** Pulls the 11-char video ID out of any YouTube link (watch, youtu.be, shorts, embed) or a bare ID. */
export function parseYouTubeVideoId(input: string): string | null {
  const s = input.trim()
  const m = s.match(/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/) ?? s.match(/^([\w-]{11})$/)
  return m ? m[1] : null
}
