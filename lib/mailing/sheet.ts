import { strFromU8, unzipSync } from 'fflate'

/** Reads the first sheet of an .xlsx file or a .csv file into rows of cell strings. */
export function readSheet(file: Uint8Array, filename: string): string[][] {
  if (/\.xlsx$/i.test(filename)) return readXlsx(file)
  if (/\.(csv|txt)$/i.test(filename)) return readCsv(strFromU8(file).replace(/^﻿/, ''))
  throw new Error('Upload an Excel (.xlsx) or CSV file.')
}

const decode = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')

const texts = (xml: string) => [...xml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => decode(m[1])).join('')

/** Column letters → 0-based index ("A" → 0, "AB" → 27). */
const colIndex = (letters: string) => [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1

function readXlsx(file: Uint8Array): string[][] {
  let files: Record<string, Uint8Array>
  try {
    files = unzipSync(file, { filter: (f) => f.name === 'xl/sharedStrings.xml' || /^xl\/worksheets\/sheet\d+\.xml$/.test(f.name) })
  } catch {
    throw new Error('That file isn’t a readable Excel workbook.')
  }
  const sheetName = Object.keys(files)
    .filter((n) => n.startsWith('xl/worksheets/'))
    .sort((a, b) => Number(a.match(/\d+/)![0]) - Number(b.match(/\d+/)![0]))[0]
  if (!sheetName) throw new Error('The workbook has no sheets.')

  const shared = files['xl/sharedStrings.xml']
    ? [...strFromU8(files['xl/sharedStrings.xml']).matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => texts(m[1]))
    : []
  const rows: string[][] = []
  for (const r of strFromU8(files[sheetName]).matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const row: string[] = []
    for (const c of r[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const [, col, attrs, inner = ''] = c
      const type = attrs.match(/t="(\w+)"/)?.[1]
      const raw = inner.match(/<v>([\s\S]*?)<\/v>/)?.[1]
      const value = type === 's' ? shared[Number(raw)] : type === 'inlineStr' ? texts(inner) : raw !== undefined ? decode(raw) : ''
      row[colIndex(col)] = (value ?? '').trim()
    }
    rows.push(Array.from(row, (v) => v ?? ''))
  }
  return rows
}

function readCsv(text: string): string[][] {
  const delimiter = (text.split('\n')[0].match(/;/g)?.length ?? 0) > (text.split('\n')[0].match(/,/g)?.length ?? 0) ? ';' : ','
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') (cell += '"'), i++
      else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === delimiter) row.push(cell.trim()), (cell = '')
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell.trim())
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  if (cell || row.length) rows.push([...row, cell.trim()])
  return rows.filter((r) => r.some(Boolean))
}
