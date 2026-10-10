import { m } from 'framer-motion'
import { heavy } from '../lib/springs'
import styles from './Wordmark.module.css'

type Props = {
  size?: 'header' | 'hero' | 'footer'
  /** Letters rise out of the heat on first render (hero only). */
  intro?: boolean
  /** Glow behind the "10". */
  glow?: boolean
  className?: string
}

const LETTERS = ['B', 'A', 'R', 'R', 'A']

/** "BARRA" + an ember-lit "10". Decorative: callers provide the accessible name. */
export function Wordmark({ size = 'header', intro = false, glow = true, className }: Props) {
  const rise = (i: number) =>
    intro
      ? {
          initial: { y: '0.32em', filter: 'blur(10px)' },
          animate: { y: '0em', filter: 'blur(0px)' },
          transition: { ...heavy, delay: 0.08 + i * 0.05 },
        }
      : {}

  return (
    <span className={[styles.wordmark, styles[size], className].filter(Boolean).join(' ')} aria-hidden="true">
      <span className={styles.barra}>
        {LETTERS.map((l, i) => (
          <m.span key={i} className={styles.letter} {...rise(i)}>
            {l}
          </m.span>
        ))}
      </span>
      <m.span
        className={glow ? styles.ten : `${styles.ten} ${styles.noGlow}`}
        data-text="10"
        {...(intro
          ? {
              initial: { y: '0.32em', filter: 'blur(14px) brightness(0.4)' },
              animate: { y: '0em', filter: 'blur(0px) brightness(1)' },
              transition: { ...heavy, delay: 0.42 },
            }
          : {})}
      >
        10
      </m.span>
    </span>
  )
}
