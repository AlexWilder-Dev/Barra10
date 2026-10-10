/**
 * Procedural artwork for the three fire-story beats. It sits under the photo
 * slots so each beat looks finished before (or without) real photography.
 * Everything is deterministic so prerendered markup matches the client.
 */
import styles from './FireStory.module.css'

function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Irregular closed chunk through jittered points around a centre. */
function blob(cx: number, cy: number, rx: number, ry: number, rot: number, r: () => number, n = 6) {
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.5
    const k = 0.68 + r() * 0.42
    const x = Math.cos(a) * rx * k
    const y = Math.sin(a) * ry * k
    pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)])
  }
  // Quadratic curves through edge midpoints: rounded but still chunky.
  const mid = (a: [number, number], b: [number, number]) =>
    `${((a[0] + b[0]) / 2).toFixed(1)},${((a[1] + b[1]) / 2).toFixed(1)}`
  let d = `M${mid(pts[n - 1], pts[0])}`
  for (let i = 0; i < n; i++) {
    const p = pts[i]
    d += `Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${mid(p, pts[(i + 1) % n])}`
  }
  return d + 'Z'
}

type Coal = { d: string; kind: 'ash' | 'dark' | 'hot' }

const coals: Coal[] = (() => {
  const r = rng(1010)
  const out: Coal[] = []
  const cols = 15
  const rows = 11
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = (col + 0.5 + (r() - 0.5) * 0.35 + (row % 2) * 0.5) * (860 / cols) - 30
      const cy = (row + 0.5 + (r() - 0.5) * 0.35) * (640 / rows) - 10
      const rx = 28 + r() * 12
      const ry = 22 + r() * 10
      const roll = r()
      out.push({ d: blob(cx, cy, rx, ry, r() * Math.PI, r), kind: roll < 0.2 ? 'hot' : roll < 0.62 ? 'ash' : 'dark' })
    }
  }
  return out
})()

const hotspots = (() => {
  const r = rng(77)
  return Array.from({ length: 34 }, () => ({
    cx: r() * 800,
    cy: 140 + r() * 480,
    rx: 4 + r() * 12,
    ry: 2 + r() * 6,
    o: 0.4 + r() * 0.5,
  }))
})()

export function CoalBed() {
  return (
    <svg className={styles.art} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="coal-bg" cx="50%" cy="72%" r="80%">
          <stop offset="0" stopColor="#ffc35a" />
          <stop offset="0.25" stopColor="#ff7a1f" />
          <stop offset="0.55" stopColor="#c8261b" />
          <stop offset="0.85" stopColor="#4a0c0a" />
          <stop offset="1" stopColor="#1a0807" />
        </radialGradient>
        <linearGradient id="coal-ash" x1="0.2" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#5b5350" />
          <stop offset="0.35" stopColor="#2c2523" />
          <stop offset="1" stopColor="#0d0908" />
        </linearGradient>
        <linearGradient id="coal-dark" x1="0.2" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#2a2321" />
          <stop offset="1" stopColor="#0a0706" />
        </linearGradient>
        <radialGradient id="coal-hot" cx="50%" cy="70%" r="70%">
          <stop offset="0" stopColor="#ff6a1f" />
          <stop offset="0.35" stopColor="#a8250f" />
          <stop offset="0.8" stopColor="#2a0f09" />
          <stop offset="1" stopColor="#120a08" />
        </radialGradient>
        <filter id="coal-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <linearGradient id="coal-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0e0c0b" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#0e0c0b" stopOpacity="0.2" />
          <stop offset="1" stopColor="#0e0c0b" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect className={styles.coalGlow} width="800" height="600" fill="url(#coal-bg)" />
      <g>
        {coals.map((c, i) => (
          <path
            key={i}
            d={c.d}
            fill={`url(#coal-${c.kind})`}
            stroke={c.kind === 'hot' ? 'rgba(255,150,60,0.55)' : 'rgba(255,90,30,0.22)'}
            strokeWidth={c.kind === 'hot' ? 1.4 : 1}
          />
        ))}
      </g>
      <g filter="url(#coal-soft)" className={styles.coalSpots}>
        {hotspots.map((h, i) => (
          <ellipse key={i} cx={h.cx} cy={h.cy} rx={h.rx} ry={h.ry} fill="#ff8a2a" opacity={h.o} />
        ))}
      </g>
      <rect width="800" height="600" fill="url(#coal-fade)" />
    </svg>
  )
}

export function Flames() {
  return (
    <div className={styles.flames} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  )
}

// Shingled slices: each overlaps the last, like a steak sliced against the grain.
const slices = Array.from({ length: 9 }, (_, i) => ({
  x: 176 + i * 27,
  y: 196 + Math.abs(i - 4) * 5,
  rot: -7 + i * 1.6,
  h: 172 - Math.abs(i - 4) * 10,
}))

const herbs = (() => {
  const r = rng(2024)
  // Chimichurri spooned across the middle of the slices, plus a few strays.
  return Array.from({ length: 70 }, (_, i) => {
    const stray = i > 54
    const a = r() * Math.PI * 2
    const d = stray ? 120 + r() * 80 : r() * 46
    return {
      x: (stray ? 300 : 300) + Math.cos(a) * d * 1.9,
      y: (stray ? 300 : 286) + Math.sin(a) * d * 0.5,
      w: 1.2 + r() * 2.6,
      h: 0.8 + r() * 1.4,
      rot: r() * 180,
      c: r() < 0.45 ? '#4f7f25' : r() < 0.6 ? '#7aa43a' : '#c43a1c',
    }
  })
})()

const salt = (() => {
  const r = rng(99)
  return Array.from({ length: 22 }, () => ({ x: 200 + r() * 240, y: 200 + r() * 150, s: 0.8 + r() * 1.4 }))
})()

export function Plate() {
  return (
    <svg className={styles.art} viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="plate-bg" cx="50%" cy="40%" r="75%">
          <stop offset="0" stopColor="#4a2414" />
          <stop offset="0.55" stopColor="#1c0f0a" />
          <stop offset="1" stopColor="#0b0807" />
        </radialGradient>
        <radialGradient id="plate" cx="42%" cy="34%" r="70%">
          <stop offset="0" stopColor="#3c3531" />
          <stop offset="0.7" stopColor="#211c19" />
          <stop offset="1" stopColor="#14100e" />
        </radialGradient>
        <linearGradient id="slice-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f0d07" />
          <stop offset="0.05" stopColor="#3b1a0e" />
          <stop offset="0.1" stopColor="#7d3f30" />
          <stop offset="0.2" stopColor="#c04c56" />
          <stop offset="0.5" stopColor="#d65c66" />
          <stop offset="0.8" stopColor="#c04c56" />
          <stop offset="0.9" stopColor="#7d3f30" />
          <stop offset="0.95" stopColor="#3b1a0e" />
          <stop offset="1" stopColor="#1f0d07" />
        </linearGradient>
        <linearGradient id="slice-gloss" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="plate-light" cx="38%" cy="22%" r="62%">
          <stop offset="0" stopColor="#ffcf8a" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ffcf8a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="plate-shade" cx="50%" cy="55%" r="50%">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <rect width="600" height="600" fill="url(#plate-bg)" />
      <ellipse cx="300" cy="318" rx="262" ry="250" fill="rgba(0,0,0,0.5)" />
      <circle cx="300" cy="300" r="250" fill="url(#plate)" />
      <circle cx="300" cy="300" r="240" fill="none" stroke="rgba(255,236,210,0.1)" strokeWidth="2" />
      <circle cx="300" cy="300" r="186" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="8" />
      <circle cx="300" cy="300" r="250" fill="url(#plate-shade)" />

      {/* Sliced steak, cut faces up */}
      <g>
        {slices.map((s, i) => (
          <g key={i} transform={`rotate(${s.rot} ${s.x + 20} ${s.y + s.h / 2})`}>
            <rect x={s.x - 4} y={s.y + 4} width="40" height={s.h} rx="6" fill="rgba(0,0,0,0.35)" />
            <rect x={s.x} y={s.y} width="40" height={s.h} rx="6" fill="url(#slice-face)" />
            <rect x={s.x} y={s.y} width="40" height={s.h} rx="6" fill="url(#slice-gloss)" />
          </g>
        ))}
      </g>

      <g>
        {herbs.map((h, i) => (
          <rect
            key={i}
            x={h.x}
            y={h.y}
            width={h.w}
            height={h.h}
            rx={h.h / 2}
            fill={h.c}
            transform={`rotate(${h.rot.toFixed(0)} ${h.x} ${h.y})`}
          />
        ))}
      </g>
      <g fill="rgba(255,250,240,0.85)">
        {salt.map((p, i) => (
          <rect key={i} x={p.x} y={p.y} width={p.s} height={p.s} transform={`rotate(45 ${p.x} ${p.y})`} />
        ))}
      </g>
      <circle cx="300" cy="300" r="250" fill="url(#plate-light)" />
    </svg>
  )
}

export function Steam() {
  return (
    <div className={styles.steam} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  )
}
