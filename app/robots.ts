import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

// Private and one-off pages: admin, APIs, personal tickets and orders, door check-in, checkout steps.
const PRIVATE = ['/admin/', '/api/', '/tickets/', '/checkin/', '/unsubscribe', '/maintenance', '/events/*/purchase']

// AI search and assistant crawlers are welcome on the public pages, so the site can be cited in
// ChatGPT, Perplexity, Claude, Gemini and Copilot answers. Listed by name to make that explicit.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: ['/', '/llms.txt'], disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
