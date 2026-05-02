# BeeJay Sax — Official Website

Built by [SonsHub Media Ltd.](https://sonshubmedia.com)

## Stack

Next.js 16 · TypeScript · Tailwind CSS v4 · Prisma 5 · Neon PostgreSQL
NextAuth v5 · GSAP 3 · Lenis · Cloudinary · Resend · QR Tickets

## Local Setup

1. Clone repo
2. `npm install`
3. Copy `.env.example` → `.env.local` and fill all values
4. `npx prisma db push`
5. `npx prisma db seed`
6. `npm run dev`

Open http://localhost:3000

Admin: http://localhost:3000/admin
Login: `admin` / `BeejaySax2026!` — **change immediately after first login**

## Deployment (Vercel — Staging)

1. Push repo to GitHub
2. Import project in Vercel dashboard
3. Add all env variables from `.env.example` in Vercel → Settings → Environment Variables
4. Set `NEXTAUTH_URL` to your Vercel preview URL first, then update to production domain
5. Deploy

## Migration to Webuzo VPS (Production)

When client approves the Vercel staging build:

1. SSH into Webuzo server
2. Install Node.js 20+, PM2, Nginx
3. Clone repo to `/var/www/beejaysax`
4. Copy `.env.local` with production values to server
5. `npm install && npm run build`
6. `pm2 start npm --name beejaysax -- start`
7. Configure Nginx reverse proxy to port 3000
8. Point beejaysax.com DNS to server IP
9. Enable SSL via Certbot

## Key Routes

| Route                         | Description                    |
| ----------------------------- | ------------------------------ |
| `/`                           | Homepage                       |
| `/events`                     | All events                     |
| `/events/[id]`                | Event detail + ticket purchase |
| `/events/[id]/purchase`       | Ticket registration form       |
| `/tickets/[token]`            | Digital ticket with QR code    |
| `/releases`                   | Discography                    |
| `/releases/[slug]`            | Release detail                 |
| `/gallery`                    | Photo gallery                  |
| `/about`                      | Artist biography               |
| `/contact`                    | Contact + booking form         |
| `/admin`                      | Dashboard (auth required)      |
| `/admin/events`               | Events CRUD                    |
| `/admin/releases`             | Releases CRUD                  |
| `/admin/gallery`              | Gallery manager                |
| `/admin/messages`             | Messages inbox                 |
| `/admin/events/[id]/tickets`  | Ticket list + QR scanner       |
| `/api/tickets/purchase`       | POST — create ticket           |
| `/api/tickets/[token]/verify` | POST — verify + admit ticket   |
| `/sitemap.xml`                | Auto-generated sitemap         |
| `/robots.txt`                 | Crawl rules                    |
