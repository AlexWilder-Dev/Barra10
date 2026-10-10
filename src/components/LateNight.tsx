import { m, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, type PointerEvent } from 'react'
import { hours, lateNight } from '../data/site'
import { usePrefersReducedMotion } from '../lib/hooks'
import { span } from '../lib/hours'
import { firm, stagger, tilt } from '../lib/springs'
import { Img } from './Img'
import styles from './LateNight.module.css'

type Card = (typeof lateNight.cards)[number]

/** "Fri & Sat till midnight", derived from the latest closing time in site.ts. */
function lateNote() {
  const spans = hours.map((h) => ({ h, s: span(h) })).filter((x) => x.s)
  const latest = Math.max(...spans.map((x) => x.s!.close))
  const days = spans.filter((x) => x.s!.close === latest).map((x) => x.h.label.slice(0, 3))
  const hh = latest % 1440
  const time = hh === 0 ? 'midnight' : `${String(Math.floor(hh / 60)).padStart(2, '0')}:${String(hh % 60).padStart(2, '0')}`
  const list = days.length > 1 ? `${days.slice(0, -1).join(', ')} & ${days[days.length - 1]}` : days[0]
  return `${list} till ${time}`
}

export function LateNight() {
  const ref = useRef<HTMLElement>(null)
  const lit = useInView(ref, { once: true, amount: 0.35 })
  const line = [...lateNight.marquee, ...lateNight.marquee]

  return (
    <section ref={ref} id="late" className={styles.late} aria-labelledby="late-title" data-lit={lit}>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.track}>
          {line.map((word, i) => (
            <span key={i}>
              {word}
              <i>✦</i>
            </span>
          ))}
        </div>
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={styles.head}>
          <p className="label label--sky">{lateNight.label}</p>
          <h2 id="late-title" className={styles.neon}>
            {lateNight.title}
          </h2>
          <p className="lede">{lateNight.line}</p>
          <p className={styles.note}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="currentColor" />
            </svg>
            {lateNote()}
          </p>
        </div>

        <div className={styles.cards}>
          {lateNight.cards.map((card, i) => (
            <m.div
              key={card.key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={stagger(i, 0.12)}
            >
              <TiltCard card={card} tone={i === 0 ? 'sky' : 'ember'} />
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TiltCard({ card, tone }: { card: Card; tone: 'sky' | 'ember' }) {
  const reduced = usePrefersReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, tilt)
  const sy = useSpring(py, tilt)
  const rotateY = useTransform(sx, [0, 1], [-9, 9])
  const rotateX = useTransform(sy, [0, 1], [7, -7])
  const glareX = useTransform(sx, [0, 1], ['10%', '90%'])
  const glareY = useTransform(sy, [0, 1], ['10%', '90%'])

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const reset = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <m.article
      className={styles.card}
      data-tone={tone}
      onPointerMove={reduced ? undefined : onMove}
      onPointerLeave={reset}
      style={reduced ? undefined : { rotateX, rotateY }}
      whileHover={{ scale: 1.015 }}
      transition={firm}
    >
      <div className={styles.cardArt} aria-hidden="true">
        {card.key === 'malbec' ? <WineGlass /> : <Tumbler />}
      </div>
      <Img image={card.image} sizes="(min-width: 900px) 40vw, 100vw" className={styles.cardImg} widths={[640, 960, 1400]} />
      <m.span className={styles.glare} style={{ left: glareX, top: glareY }} aria-hidden="true" />
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{card.title}</h3>
        <p className={styles.cardLine}>{card.line}</p>
      </div>
    </m.article>
  )
}

function WineGlass() {
  return (
    <svg viewBox="0 0 200 260" className={styles.glass}>
      <path d="M58 30h84c4 48-6 92-42 100-36-8-46-52-42-100Z" className={styles.tube} />
      <path d="M62 78h76c-4 26-16 44-38 48-22-4-34-22-38-48Z" className={styles.fill} />
      <path d="M100 130v86M66 222h68" className={styles.tube} />
    </svg>
  )
}

function Tumbler() {
  return (
    <svg viewBox="0 0 200 260" className={styles.glass}>
      <path d="M52 70h96l-10 140H62L52 70Z" className={styles.tube} />
      <path d="M57 130h86l-6 76H63l-6-76Z" className={styles.fill} />
      <rect x="78" y="112" width="34" height="34" rx="6" className={styles.tube} transform="rotate(-12 95 129)" />
      <path d="M120 48c18 4 30 16 34 30" className={styles.tube} />
    </svg>
  )
}
