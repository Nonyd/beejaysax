import type { MetadataRoute } from 'next'

/** Name, colours and home-screen icons when the site is saved to a phone. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BeeJay Sax — Gospel Saxophonist & Music Minister',
    short_name: 'BeeJay Sax',
    description: 'Official website of BeeJay Sax: music, videos, concerts and bookings.',
    start_url: '/',
    display: 'standalone',
    background_color: '#11142f',
    theme_color: '#79270E',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
