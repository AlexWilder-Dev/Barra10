import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'
import { directionsUrl, venue } from '../data/site'
import { firm } from '../lib/springs'
import styles from './MobileBar.module.css'

/** Sticky Book / Call / Directions bar for small screens, after the hero. */
export function MobileBar() {
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setShow(v > window.innerHeight * 0.6))

  return (
    <AnimatePresence>
      {show && (
        <m.nav
          className={styles.bar}
          aria-label="Quick actions"
          initial={{ y: '120%' }}
          animate={{ y: '0%' }}
          exit={{ y: '120%' }}
          transition={firm}
        >
          <a className={styles.item} href={`tel:${venue.phone.tel}`}>
            <PhoneIcon />
            Call
          </a>
          <a className={styles.item} href={directionsUrl} target="_blank" rel="noopener noreferrer">
            <PinIcon />
            Directions
          </a>
          <a className={`btn btn--primary ${styles.book}`} href="#book">
            Book
          </a>
        </m.nav>
      )}
    </AnimatePresence>
  )
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
