import { AnimatePresence, m, useMotionValueEvent, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { doneness } from '../data/site'
import { doneness as donenessSpring, firm } from '../lib/springs'
import styles from './Doneness.module.css'

const STOPS = [0, 1, 2, 3]
// Colour stories for each level: centre, blend ring, outer cooked band.
const CENTRE = ['#9c1030', '#cf2b42', '#df7f7a', '#8c5c4b']
const BLEND = ['#7a1a28', '#ad3a45', '#bf7466', '#80553f']
const BAND = ['#5a2a22', '#6f3528', '#80493a', '#74503f']
const EXTENT = [0.66, 0.52, 0.3, 0]

export function Doneness() {
  const [level, setLevel] = useState(1)
  const stop = doneness.stops[level]

  const v = useSpring(level, donenessSpring)
  useEffect(() => v.set(level), [level, v])

  const centre = useTransform(v, STOPS, CENTRE)
  const blend = useTransform(v, STOPS, BLEND)
  const band = useTransform(v, STOPS, BAND)
  const extent = useTransform(v, STOPS, EXTENT)
  const blendAt = useTransform(extent, (e) => Math.min(0.97, e + 0.24))
  const marbling = useTransform(v, STOPS, [0.2, 0.28, 0.38, 0.48])
  const juice = useTransform(v, STOPS, [0.75, 0.45, 0.12, 0])
  const sheen = useTransform(v, STOPS, [0.55, 0.45, 0.32, 0.18])
  const steam = useTransform(v, STOPS, [0.35, 0.5, 0.7, 0.85])

  const [temp, setTemp] = useState(doneness.stops[1].temp)
  const tempMv = useTransform(
    v,
    STOPS,
    doneness.stops.map((s) => s.temp),
  )
  useMotionValueEvent(tempMv, 'change', (t) => setTemp(Math.round(t)))

  return (
    <section id="doneness" className={`section ${styles.section}`} aria-labelledby="doneness-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.art}>
          <m.div className={styles.steam} style={{ opacity: steam }} aria-hidden="true">
            <span />
            <span />
            <span />
          </m.div>
          <svg viewBox="0 0 480 330" className={styles.steak} role="img" aria-label={`Steak cross-section cooked ${stop.name} (${stop.english})`}>
            <defs>
              <radialGradient id="meat" cx="50%" cy="56%" r="58%">
                <m.stop offset={0} stopColor={centre} />
                <m.stop offset={extent} stopColor={centre} />
                <m.stop offset={blendAt} stopColor={blend} />
                <m.stop offset={1} stopColor={band} />
              </radialGradient>
              <linearGradient id="fat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff4dc" />
                <stop offset="1" stopColor="#e3caa2" />
              </linearGradient>
              <linearGradient id="crust" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#3b1a0e" />
                <stop offset="1" stopColor="#1d0c07" />
              </linearGradient>
              <radialGradient id="sheen" cx="35%" cy="30%" r="45%">
                <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="plate-shadow" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#000" stopOpacity="0.7" />
                <stop offset="1" stopColor="#000" stopOpacity="0" />
              </radialGradient>
              <filter id="grain" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="2" seed="4" />
                <feColorMatrix values="0 0 0 0 0.15  0 0 0 0 0.02  0 0 0 0 0.03  0 0 0 1.4 -0.45" />
              </filter>
              <clipPath id="steak-clip">
                <path d={MEAT} />
              </clipPath>
            </defs>

            <ellipse cx="244" cy="292" rx="210" ry="26" fill="url(#plate-shadow)" />

            {/* Crust (seared outside) */}
            <path d={OUTER} fill="url(#crust)" />
            {/* Fat cap along the top edge */}
            <path d={FAT} fill="url(#fat)" />
            {/* The cut face */}
            <path d={MEAT} fill="url(#meat)" />

            <g clipPath="url(#steak-clip)">
              <m.g style={{ opacity: marbling }} stroke="#fff3e6" fill="none" strokeLinecap="round">
                <path d="M120 150c30-12 52 8 86-2s40-22 70-14" strokeWidth="2.4" />
                <path d="M170 196c24 6 40-10 64-4s30 18 58 12" strokeWidth="1.6" />
                <path d="M248 128c18 10 30 4 48 14s26 24 52 20" strokeWidth="1.8" />
                <path d="M96 200c14-6 22 6 36 2" strokeWidth="1.4" />
                <path d="M300 214c16-4 28 6 44 0" strokeWidth="1.4" />
              </m.g>
              <rect x="40" y="60" width="420" height="230" filter="url(#grain)" opacity="0.22" />
              <m.ellipse cx="200" cy="140" rx="150" ry="70" fill="url(#sheen)" style={{ opacity: sheen }} />
            </g>

            {/* A little juice pooling at the base when it's rare */}
            <m.path
              style={{ opacity: juice }}
              d="M150 270c40 8 140 10 210 2c10 4 12 10-4 14c-60 8-150 8-206-2c-12-4-10-12 0-14z"
              fill="#8e1024"
            />
          </svg>
          <div className={styles.temp} aria-hidden="true">
            <span className={styles.tempValue}>≈ {temp}°C</span>
            <span className={styles.tempLabel}>core</span>
          </div>
        </div>

        <div className={styles.copy}>
          <p className="label">{doneness.label}</p>
          <h2 id="doneness-title" className="display h2">
            {doneness.title}
          </h2>

          <div className={styles.readout} aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <m.div
                key={stop.key}
                className={styles.readoutInner}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={firm}
              >
                <p className={styles.name}>{stop.name}</p>
                <p className={styles.english}>{stop.english}</p>
                <p className={styles.line}>{stop.line}</p>
              </m.div>
            </AnimatePresence>
          </div>

          <div className={styles.control}>
            <label htmlFor="doneness-range" className="visually-hidden">
              Doneness
            </label>
            <input
              id="doneness-range"
              className={styles.range}
              type="range"
              min={0}
              max={3}
              step={1}
              value={level}
              aria-valuetext={`${stop.name}, ${stop.english}`}
              onChange={(e) => setLevel(Number(e.target.value))}
            />
            <div className={styles.ticks}>
              {doneness.stops.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={styles.tick}
                  data-active={i === level}
                  data-pos={i}
                  aria-pressed={i === level}
                  onClick={() => setLevel(i)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <p className={styles.footnote}>Temperatures are a general guide. Ask your server how they cook it.</p>
        </div>
      </div>
    </section>
  )
}

const OUTER =
  'M52 150C50 104 96 74 160 70C214 66 252 58 316 62C384 66 434 96 438 146C442 196 430 240 384 262C334 284 254 282 184 280C118 278 62 266 52 222C46 196 53 176 52 150Z'
const FAT =
  'M66 140C70 104 110 84 162 80C214 76 254 68 314 72C376 76 420 102 426 140C410 116 372 98 314 94C256 90 216 98 164 102C116 106 82 118 66 140Z'
const MEAT =
  'M70 156C72 124 112 104 164 100C216 96 256 90 314 94C374 98 414 122 418 154C422 196 410 230 372 248C326 268 254 266 186 264C126 262 80 252 72 216C68 196 69 176 70 156Z'
