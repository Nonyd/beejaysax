/**
 * Adire motifs: Yoruba indigo resist-dye patterns drawn as SVG tiles.
 * - "band": a horizontal strip (zigzag stitching, rings, diamonds) used as a section divider
 * - "field": an all-over pattern laid behind content at low opacity
 * Pattern ids are derived from props, so identical patterns on one page share one definition.
 */
type Props = {
  variant?: 'band' | 'field'
  /** Any CSS colour; motifs are drawn as strokes/fills in this colour */
  color?: string
  opacity?: number
  /** Band height in px (band only) */
  height?: number
  className?: string
}

function BandTile({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="0,5 7,1 14,5 21,1 28,5 35,1 42,5 49,1 56,5" />
      <polyline points="0,43 7,47 14,43 21,47 28,43 35,47 42,43 49,47 56,43" />
      <circle cx={14} cy={24} r={9} />
      <circle cx={14} cy={24} r={4.5} />
      <circle cx={14} cy={24} r={1.6} fill={color} stroke="none" />
      <path d="M42 15 L51 24 L42 33 L33 24 Z" />
      <path d="M38 24 L46 24 M42 20 L42 28" />
    </g>
  )
}

function FieldTile({ color }: { color: string }) {
  const diamond = (x: number, y: number) => <path key={`${x}-${y}`} d={`M${x} ${y - 9} L${x + 9} ${y} L${x} ${y + 9} L${x - 9} ${y} Z`} />
  return (
    <g fill="none" stroke={color} strokeWidth={1.3} strokeLinecap="round">
      <path d="M0 0 H88 M0 0 V88" strokeDasharray="3 5" />
      <circle cx={44} cy={44} r={18} />
      <circle cx={44} cy={44} r={11} />
      <circle cx={44} cy={44} r={3.5} fill={color} stroke="none" />
      {[0, 88].flatMap((x) => [0, 88].map((y) => diamond(x, y)))}
      {[
        [44, 10],
        [44, 78],
        [10, 44],
        [78, 44],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.8} fill={color} stroke="none" />
      ))}
    </g>
  )
}

export default function Adire({ variant = 'band', color = '#E3B23C', opacity = 1, height = 48, className }: Props) {
  const id = `adire-${variant}-${color.replace(/[^a-z0-9]/gi, '')}`
  const isBand = variant === 'band'
  const w = isBand ? 56 : 88
  const h = isBand ? 48 : 88

  return (
    <svg
      aria-hidden
      className={className}
      width="100%"
      height={isBand ? height : '100%'}
      style={{ opacity, display: 'block', ...(isBand ? {} : { position: 'absolute', inset: 0 }) }}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={id}
          width={w}
          height={h}
          patternUnits="userSpaceOnUse"
          patternTransform={isBand ? `scale(${height / 48})` : undefined}
        >
          {isBand ? <BandTile color={color} /> : <FieldTile color={color} />}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
