import {
  m,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useRef, useState, type ReactNode } from 'react'
import { fireStory } from '../data/site'
import { usePrefersReducedMotion } from '../lib/hooks'
import { firm, scrub } from '../lib/springs'
import { CoalBed, Flames, Plate, Steam } from './FireArt'
import { Img } from './Img'
import styles from './FireStory.module.css'

type Beat = (typeof fireStory.beats)[number]

const ART: Record<string, ReactNode> = {
  charcoal: <CoalBed />,
  flame: <Flames />,
  plate: (
    <>
      <Plate />
      <Steam />
    </>
  ),
}

/** Scroll progress at which each beat's photo starts downloading. */
const LOAD_AT = [-1, 0.01, 0.3]

/** Scroll windows for each beat: [fade in start, fully in, start out, fully out]. */
const WINDOWS: [number, number, number, number][] = [
  [-1, 0, 0.29, 0.39],
  [0.29, 0.39, 0.61, 0.71],
  [0.61, 0.71, 1, 2],
]

export function FireStory() {
  const reduced = usePrefersReducedMotion()
  return reduced ? <FireStoryStatic /> : <FireStoryPinned />
}

function FireStoryPinned() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, scrub)
  const [reach, setReach] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = LOAD_AT.filter((at) => v > at).length - 1
    if (next > reach) setReach(next)
  })

  const glowA = useTransform(p, [0, 0.5, 1], [0.45, 0.85, 0.55])
  const glowHue = useTransform(p, [0, 0.5, 1], [6, 22, 34])
  const glowSize = useTransform(p, [0, 0.5, 1], [55, 85, 65])
  const glow = useMotionTemplate`radial-gradient(${glowSize}% 60% at 50% 100%, hsla(${glowHue}, 100%, 52%, ${glowA}), transparent 70%)`

  return (
    <section ref={ref} id="fire" className={styles.story} aria-labelledby="fire-title">
      <div className={styles.sticky}>
        <div className={styles.stage}>
          {fireStory.beats.map((beat, i) => (
            <BeatVisual key={beat.key} beat={beat} p={p} window={WINDOWS[i]} load={i <= reach} />
          ))}
          <m.div className={styles.glow} style={{ background: glow }} aria-hidden="true" />
          <div className={styles.vignette} aria-hidden="true" />
        </div>

        <div className={`container ${styles.copy}`}>
          <div className={styles.head}>
            <p className="label">{fireStory.label}</p>
            <h2 id="fire-title" className={styles.title}>
              {fireStory.title}
            </h2>
          </div>
          <div className={styles.beats}>
            {fireStory.beats.map((beat, i) => (
              <BeatCopy key={beat.key} beat={beat} p={p} window={WINDOWS[i]} />
            ))}
          </div>
        </div>

        <Rail p={p} />
      </div>
    </section>
  )
}

function BeatVisual({
  beat,
  p,
  window: w,
  load,
}: {
  beat: Beat
  p: MotionValue<number>
  window: number[]
  load: boolean
}) {
  const opacity = useTransform(p, w, [0, 1, 1, 0])
  const scale = useTransform(p, [w[0], w[3]], [1.18, 1])
  return (
    <m.div className={styles.visual} data-beat={beat.key} style={{ opacity }}>
      <m.div className={styles.layer} style={{ scale }}>
        {ART[beat.key]}
        {load && <Img image={beat.image} sizes="100vw" className={styles.photo} widths={[800, 1280, 1920]} decorative />}
      </m.div>
    </m.div>
  )
}

function BeatCopy({ beat, p, window: w }: { beat: Beat; p: MotionValue<number>; window: number[] }) {
  const opacity = useTransform(p, w, [0, 1, 1, 0])
  const y = useTransform(p, w, ['40%', '0%', '0%', '-40%'])
  const lineY = useTransform(p, w, [40, 0, 0, -24])
  const blur = useTransform(p, w, [12, 0, 0, 8])
  const filter = useMotionTemplate`blur(${blur}px)`
  return (
    <m.div className={styles.beat} style={{ opacity }}>
      <p className={styles.step}>
        <span>{beat.step}</span> / 03 · {beat.word}
      </p>
      <m.h3 className={styles.word} style={{ y, filter }}>
        {beat.label}
      </m.h3>
      <m.p className={styles.line} style={{ y: lineY }}>
        {beat.line}
      </m.p>
    </m.div>
  )
}

function Rail({ p }: { p: MotionValue<number> }) {
  const fill = useTransform(p, [0, 1], [0.04, 1])
  return (
    <div className={styles.rail} aria-hidden="true">
      <div className={styles.track}>
        <m.div className={styles.fill} style={{ scaleY: fill }} />
      </div>
      {fireStory.beats.map((b, i) => (
        <RailStep key={b.key} p={p} at={[0, 0.5, 1][i]} label={b.step} />
      ))}
    </div>
  )
}

function RailStep({ p, at, label }: { p: MotionValue<number>; at: number; label: string }) {
  const on = useTransform(p, [at - 0.2, at - 0.05], [0.35, 1])
  return (
    <m.span className={styles.railStep} style={{ opacity: on, top: `${at * 100}%` }}>
      {label}
    </m.span>
  )
}

/** Reduced-motion version: three calm panels, no pinning or scrubbing. */
function FireStoryStatic() {
  return (
    <section id="fire" className={`section ${styles.static}`} aria-labelledby="fire-title">
      <div className="container">
        <div className="section-head">
          <p className="label">{fireStory.label}</p>
          <h2 id="fire-title" className="display h2">
            {fireStory.title}
          </h2>
        </div>
        <div className={styles.staticList}>
          {fireStory.beats.map((beat) => (
            <m.article
              key={beat.key}
              className={styles.staticBeat}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={firm}
            >
              <div className={styles.staticVisual} data-beat={beat.key}>
                {ART[beat.key]}
                <Img image={beat.image} sizes="(min-width: 900px) 60vw, 100vw" className={styles.photo} decorative />
              </div>
              <div className={styles.staticCopy}>
                <p className={styles.step}>
                  <span>{beat.step}</span> / 03 · {beat.word}
                </p>
                <h3 className={styles.word}>{beat.label}</h3>
                <p className={styles.line}>{beat.line}</p>
              </div>
            </m.article>
          ))}
        </div>
      </div>
    </section>
  )
}
