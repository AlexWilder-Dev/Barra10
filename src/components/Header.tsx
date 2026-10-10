import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { addressLines, directionsUrl, nav, venue } from '../data/site'
import { firm, heavy, snappy, stagger } from '../lib/springs'
import { OpenBadge } from './OpenBadge'
import { Wordmark } from './Wordmark'
import styles from './Header.module.css'

const SECTIONS = ['menu', 'doneness', 'late', 'find', 'book']

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids])
  return active
}

export function Header() {
  const { scrollY } = useScroll()
  const [condensed, setCondensed] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useScrollSpy(SECTIONS)
  const menuBtn = useRef<HTMLButtonElement>(null)

  useMotionValueEvent(scrollY, 'change', (v) => setCondensed(v > 24))
  useEffect(() => setCondensed(window.scrollY > 24), [])

  const close = () => {
    setOpen(false)
    menuBtn.current?.focus()
  }

  return (
    <>
      <header className={styles.header} data-condensed={condensed}>
        <m.div
          className={styles.bg}
          initial={false}
          animate={{ opacity: condensed ? 1 : 0, y: condensed ? 0 : -8 }}
          transition={firm}
          aria-hidden="true"
        />
        <m.div
          className={`container ${styles.inner}`}
          initial={false}
          animate={{ height: condensed ? 62 : 84 }}
          transition={firm}
        >
          <a href="#top" className={styles.brand} aria-label={`${venue.name}, back to top`}>
            <m.span
              style={{ display: 'inline-block', transformOrigin: '0% 50%' }}
              initial={false}
              animate={{ scale: condensed ? 0.9 : 1.08 }}
              transition={firm}
            >
              <Wordmark size="header" />
            </m.span>
          </a>

          <nav aria-label="Main" className={styles.nav}>
            <ul>
              {nav.map((item) => {
                const isActive = active === item.href.slice(1)
                return (
                  <li key={item.href}>
                    <a href={item.href} aria-current={isActive ? 'true' : undefined}>
                      {item.label}
                      {isActive && <m.span layoutId="nav-ember" className={styles.navEmber} transition={snappy} />}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <a className={`btn btn--primary btn--sm ${styles.cta}`} href="#book">
            Book a table
          </a>

          <button
            ref={menuBtn}
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <m.span className={styles.bar} animate={open ? { y: 4, rotate: 45 } : { y: -4, rotate: 0 }} transition={snappy} />
            <m.span className={styles.bar} animate={open ? { y: -4, rotate: -45 } : { y: 4, rotate: 0 }} transition={snappy} />
          </button>
        </m.div>
      </header>

      <AnimatePresence>{open && <MobileNav onClose={close} />}</AnimatePresence>
    </>
  )
}

function MobileNav({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.dataset.navOpen = 'true'
    ref.current?.querySelector<HTMLElement>('a')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
      // Keep focus inside the panel while it is open.
      if (e.key === 'Tab' && ref.current) {
        const items = [...ref.current.querySelectorAll<HTMLElement>('a, button')]
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      delete document.documentElement.dataset.navOpen
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const links = [...nav, { href: '#book', label: 'Book a table' }]

  return (
    <m.div
      ref={ref}
      id="mobile-nav"
      className={styles.sheet}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      initial={{ opacity: 0, clipPath: 'circle(0% at 92% 4%)' }}
      animate={{ opacity: 1, clipPath: 'circle(150% at 92% 4%)' }}
      exit={{ opacity: 0, clipPath: 'circle(0% at 92% 4%)' }}
      transition={heavy}
    >
      <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="Close menu">
        <span aria-hidden="true">×</span>
      </button>
      <nav aria-label="Mobile">
        <ul className={styles.sheetList}>
          {links.map((item, i) => (
            <m.li
              key={item.href}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={stagger(i, 0.05, 0.08)}
            >
              <a href={item.href} onClick={onClose}>
                <span className={styles.sheetIndex}>0{i + 1}</span>
                {item.label}
              </a>
            </m.li>
          ))}
        </ul>
      </nav>
      <m.div
        className={styles.sheetFoot}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...firm, delay: 0.3 }}
      >
        <OpenBadge />
        <address>
          {addressLines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </address>
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
          Get directions ↗
        </a>
      </m.div>
    </m.div>
  )
}
