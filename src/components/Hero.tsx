import { m, useInView, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { hero, venue } from '../data/site'
import { useMediaQuery, usePrefersReducedMotion } from '../lib/hooks'
import { firm } from '../lib/springs'
import { EmberCanvas } from './EmberCanvas'
import { OpenBadge } from './OpenBadge'
import { Wordmark } from './Wordmark'
import styles from './Hero.module.css'

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { ...firm, delay },
})

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const reduced = usePrefersReducedMotion()
  const small = useMediaQuery('(max-width: 700px)')
  const inView = useInView(ref)
  const [shimmerReady, setShimmerReady] = useState(false)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-22%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const grateY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])

  // Heat shimmer kicks in after the wordmark has settled, and only runs while visible.
  useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => setShimmerReady(true), 1400)
    return () => window.clearTimeout(id)
  }, [reduced])

  const shimmer = shimmerReady && inView && !reduced
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    if (shimmer) svg.unpauseAnimations()
    else svg.pauseAnimations()
  }, [shimmer])

  return (
    <section ref={ref} id="top" className={styles.hero} aria-labelledby="hero-title">
      {/* Heat-shimmer filter for the wordmark */}
      <svg ref={svgRef} className={styles.defs} aria-hidden="true" focusable="false">
        <filter id="heat-shimmer" x="-5%" y="-25%" width="110%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.03" numOctaves="1" seed="7" result="noise">
            <animate
              attributeName="baseFrequency"
              dur="5s"
              values="0.006 0.03;0.008 0.042;0.006 0.03"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={small ? 6 : 9} xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation={small ? 1.2 : 1.6} />
        </filter>
      </svg>

      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.heat} />
        <div className={styles.smoke}>
          <span />
          <span />
          <span />
        </div>
        <m.div className={styles.grateWrap} style={reduced ? undefined : { y: grateY }}>
          <div className={styles.grate} />
        </m.div>
        <div className={styles.bed} />
      </div>

      {!reduced && <EmberCanvas />}

      <m.div className={styles.content} style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}>
        <m.p className="label label--sky" {...fadeUp(0.05)}>
          {hero.label}
        </m.p>

        <h1 id="hero-title" className={styles.title}>
          <span className="visually-hidden">{venue.name}</span>
          <span className={styles.mark}>
            <Wordmark size="hero" intro />
            {/* Heat haze: a softened, wavering copy over the crisp wordmark */}
            {shimmerReady && (
              <span className={styles.haze} data-on={shimmer} aria-hidden="true">
                <Wordmark size="hero" glow={false} />
              </span>
            )}
          </span>
        </h1>

        <m.p className={styles.tagline} {...fadeUp(0.55)}>
          {venue.tagline}
        </m.p>
        <m.p className={styles.intro} {...fadeUp(0.65)}>
          {venue.intro}
        </m.p>

        <m.div className={styles.ctas} {...fadeUp(0.75)}>
          <a className="btn btn--primary" href="#book">
            {hero.ctaPrimary}
            <Arrow />
          </a>
          <a className="btn btn--ghost" href="#menu">
            {hero.ctaSecondary}
          </a>
        </m.div>
      </m.div>

      <div className={`${styles.footer} container`}>
        <p className={styles.where}>
          Inside {venue.address.building} · {venue.address.city} {venue.address.postcode.split(' ')[0]}
        </p>
        <a href="#fire" className={styles.cue}>
          <span className="visually-hidden">Scroll to the story</span>
          <span className={styles.cueLine} aria-hidden="true" />
        </a>
        <OpenBadge className={styles.badge} />
      </div>
    </section>
  )
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
