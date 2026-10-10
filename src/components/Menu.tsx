import { AnimatePresence, m, type Variants } from 'framer-motion'
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { currency, menu, type MenuItem } from '../data/site'
import { firm, snappy, stagger } from '../lib/springs'
import { Img } from './Img'
import styles from './Menu.module.css'

const money = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)

const panel: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 56 }),
  center: { opacity: 1, x: 0, transition: firm },
  exit: (dir: number) => ({ opacity: 0, x: dir * -56, transition: snappy }),
}

export function Menu() {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const select = (i: number, focus = false) => {
    if (i === index) return
    setDir(i > index ? 1 : -1)
    setIndex(i)
    const tab = tabs.current[i]
    if (focus) tab?.focus()
    tab?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const last = menu.length - 1
    const next =
      e.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null
    if (next === null) return
    e.preventDefault()
    select(next, true)
  }

  const cat = menu[index]

  return (
    <section id="menu" className={`section ${styles.menu}`} aria-labelledby="menu-title">
      <div className="container">
        <div className="section-head">
          <p className="label">La carta</p>
          <h2 id="menu-title" className="display h2">
            Hungry yet?
          </h2>
          <p className="lede">
            Steaks off the parrilla, things to pick at, a little from the sea, and Malbec to wash it all down.
          </p>
        </div>

        <div className={styles.tabsWrap}>
          <div role="tablist" aria-label="Menu categories" className={styles.tabs} onKeyDown={onKeyDown}>
            {menu.map((c, i) => {
              const selected = i === index
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    tabs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${c.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${c.id}`}
                  tabIndex={selected ? 0 : -1}
                  className={styles.tab}
                  onClick={() => select(i)}
                >
                  {selected && <m.span layoutId="menu-pill" className={styles.pill} transition={snappy} />}
                  <span className={styles.tabLabel}>{c.label}</span>
                  <span className={styles.tabEnglish}>{c.english}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.panelWrap}>
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <m.div
              key={cat.id}
              role="tabpanel"
              id={`panel-${cat.id}`}
              aria-labelledby={`tab-${cat.id}`}
              tabIndex={0}
              className={styles.panel}
              custom={dir}
              variants={panel}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <figure className={styles.feature}>
                <div className={styles.featureArt} aria-hidden="true">
                  <span>{cat.label}</span>
                </div>
                <Img
                  image={cat.image}
                  sizes="(min-width: 900px) 40vw, 100vw"
                  className={styles.featureImg}
                  widths={[640, 960, 1400]}
                />
                <figcaption className={styles.caption}>
                  <span className={styles.captionKicker}>{cat.english}</span>
                  <span className={styles.captionTitle}>{cat.label}</span>
                  <span className={styles.captionBlurb}>{cat.blurb}</span>
                </figcaption>
              </figure>

              <ul className={styles.items} data-count={cat.items.length}>
                {cat.items.map((item, i) => (
                  <m.li
                    key={item.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={stagger(i, 0.05, 0.08)}
                  >
                    <MenuCard item={item} />
                  </m.li>
                ))}
              </ul>
            </m.div>
          </AnimatePresence>
        </div>

        <p className={styles.note}>Sample menu and prices for preview. To be confirmed.</p>
      </div>
    </section>
  )
}

function MenuCard({ item }: { item: MenuItem }) {
  const [hot, setHot] = useState(false)
  const timer = useRef<number>(undefined)

  const track = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  // Touch has no hover, so a tap heats the card up for a moment.
  const tap = (e: PointerEvent<HTMLElement>) => {
    track(e)
    if (e.pointerType === 'mouse') return
    setHot(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setHot(false), 1600)
  }

  return (
    <m.article
      className={styles.card}
      data-hot={hot}
      onPointerMove={track}
      onPointerDown={tap}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      transition={snappy}
    >
      <span className={styles.cardGlow} aria-hidden="true" />
      <div className={styles.cardTop}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.prices}>
          {item.prices.map((p) => (
            <span key={p.amount} className={styles.price}>
              {p.label && <small>{p.label}</small>}
              {money(p.amount)}
            </span>
          ))}
        </p>
      </div>
      {item.english && <p className={styles.english}>{item.english}</p>}
      <p className={styles.desc}>{item.description}</p>
      {item.tag && <span className={styles.tag}>{item.tag}</span>}
    </m.article>
  )
}
