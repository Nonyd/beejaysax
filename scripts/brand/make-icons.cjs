// Rebuilds the share image and icons from the logo: public/og.jpg, app/favicon.ico, app/icon.png,
// app/apple-icon.png and public/brand/icon-*.png. Run from the project root:
//   chrome --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=8000 --screenshot=scripts/brand/og.png scripts/brand/og.html
//   node scripts/brand/make-icons.cjs scripts/brand
const sharp = require('sharp'), fs = require('fs')
const BROWN = '#79270E', out = process.argv[2]
const roundedSquare = (n, r) => Buffer.from(`<svg width="${n}" height="${n}"><rect width="${n}" height="${n}" rx="${r}" fill="${BROWN}"/></svg>`)
async function onSquare(glyph, n, glyphH, rounded) {
  const g = await sharp(glyph).resize({ height: glyphH }).toBuffer()
  const m = await sharp(g).metadata()
  const base = rounded ? sharp(roundedSquare(n, Math.round(n * 0.22))) : sharp({ create: { width: n, height: n, channels: 4, background: BROWN } })
  return base.composite([{ input: g, left: Math.round((n - m.width) / 2), top: Math.round((n - m.height) / 2) }]).png().toBuffer()
}
;(async () => {
  const { data, info } = await sharp('public/brand/logo-white.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = info.width, H = info.height, keep = new Uint8Array(W * H), st = []; for (let x = 0; x < 100; x++) if (data[(150 * W + x) * 4 + 3] > 128) { st.push([x, 150]); break }
  while (st.length) { const [x, y] = st.pop(); if (x < 0 || y < 0 || x >= W || y >= H) continue; const i = y * W + x; if (keep[i] || data[i * 4 + 3] <= 128) continue; keep[i] = 1; st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]) }
  for (let i = 0; i < W * H; i++) if (!keep[i]) data[i * 4 + 3] = 0
  const B = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).extract({ left: 0, top: 5, width: 180, height: 279 }).png().toBuffer()
  const sizes = [16, 32, 48]
  const pngs = await Promise.all(sizes.map((n) => onSquare(B, n, Math.round(n * 0.68), true)))
  // ICO with embedded PNGs
  const head = Buffer.alloc(6 + 16 * sizes.length); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4)
  let off = head.length
  sizes.forEach((n, i) => { const e = 6 + 16 * i; head[e] = n; head[e + 1] = n; head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6); head.writeUInt32LE(pngs[i].length, e + 8); head.writeUInt32LE(off, e + 12); off += pngs[i].length })
  fs.writeFileSync('app/favicon.ico', Buffer.concat([head, ...pngs]))
  fs.writeFileSync('app/icon.png', await onSquare(B, 96, 66, true))
  const logo = 'public/brand/logo-white.png'
  fs.writeFileSync('app/apple-icon.png', await onSquare(logo, 180, 92, false))
  fs.writeFileSync('public/brand/icon-192.png', await onSquare(logo, 192, 98, false))
  fs.writeFileSync('public/brand/icon-512.png', await onSquare(logo, 512, 262, false))
  await sharp(out + '/og.png').jpeg({ quality: 88, mozjpeg: true }).toFile('public/og.jpg')
})()
