import { m, useInView } from 'framer-motion'
import { useRef } from 'react'
import { addressLines, directionsUrl, findUs, hours, venue } from '../data/site'
import { useNow } from '../lib/hooks'
import { sessionLabel, venueWeekday } from '../lib/hours'
import { heavy } from '../lib/springs'
import { OpenBadge } from './OpenBadge'
import styles from './FindUs.module.css'

export function FindUs() {
  const now = useNow()
  const today = now ? venueWeekday(now) : -1

  return (
    <section id="find" className={`section ${styles.section}`} aria-labelledby="find-title">
      <div className="container">
        <div className="section-head">
          <p className="label">{findUs.label}</p>
          <h2 id="find-title" className="display h2">
            {findUs.title}
          </h2>
          <p className="lede">
            {venue.tube.walk}: {venue.tube.station} ({venue.tube.line}). {findUs.line}
          </p>
        </div>

        <div className={styles.grid}>
          <MarketMap />

          <div className={styles.info}>
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Address</h3>
              <address className={styles.address}>
                <strong>{venue.name}</strong>
                {addressLines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </address>
              <div className={styles.actions}>
                <a className="btn btn--primary" href={directionsUrl} target="_blank" rel="noopener noreferrer">
                  Get directions
                  <span aria-hidden="true">↗</span>
                  <span className="visually-hidden">(opens Google Maps)</span>
                </a>
                <a className="btn btn--ghost" href={`tel:${venue.phone.tel}`}>
                  Call {venue.phone.display}
                </a>
              </div>
            </div>

            <div className={styles.block}>
              <div className={styles.hoursHead}>
                <h3 className={styles.blockTitle}>Hours</h3>
                <OpenBadge />
              </div>
              <table className={styles.hours}>
                <caption className="visually-hidden">Opening hours (London time)</caption>
                <tbody>
                  {hours.map((d) => (
                    <tr key={d.day} data-today={d.day === today}>
                      <th scope="row">
                        {d.label}
                        {d.day === today && <span className={styles.today}>Today</span>}
                      </th>
                      <td>{sessionLabel(d)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Stylised, not-to-scale map. Street positions are approximate. // VERIFY
 * placement of the market and station against the real street layout.
 */
const ROUTE = 'M362 176C344 192 326 206 306 222S284 248 292 262'

function MarketMap() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <div ref={ref} className={styles.map}>
      <svg
        viewBox="0 -40 600 500"
        role="img"
        aria-label={`Stylised map: ${venue.name} is inside ${venue.address.building} on Tooting High Street, a short walk south-west of Tooting Broadway station.`}
      >
        <defs>
          <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(246,238,228,0.07)" />
          </pattern>
          <radialGradient id="market-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ff7a1f" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff7a1f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="market-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffb23f" />
            <stop offset="1" stopColor="#f0531c" />
          </linearGradient>
        </defs>

        <rect y="-40" width="600" height="500" fill="#120f0e" />
        <rect y="-40" width="600" height="500" fill="url(#dots)" />

        {/* City blocks */}
        <g fill="#1d1816" stroke="rgba(246,238,228,0.05)">
          <path d="M20 -10h110l90 100-60 80H20z" />
          <path d="M240 -20h140l-10 130-60 30-70-50z" />
          <path d="M480 -20h110v190l-70-10-30-60z" />
          <path d="M460 230l130 30v190H430l-40-110z" />
          <path d="M40 220l100-20 60 60-80 110H40z" />
          <path d="M230 360l60-60 70 40-10 110H210z" />
        </g>

        {/* Roads */}
        <g fill="none" strokeLinecap="round">
          <g stroke="#2e2724" strokeWidth="34">
            <path d="M400 150L-20 470" />
            <path d="M400 150L493 -60" />
            <path d="M400 150L620 215" />
            <path d="M400 150L125 -60" />
          </g>
          <g stroke="#3a322e" strokeWidth="26">
            <path d="M400 150L-20 470" />
            <path d="M400 150L493 -60" />
            <path d="M400 150L620 215" />
            <path d="M400 150L125 -60" />
          </g>
          <g stroke="rgba(246,238,228,0.14)" strokeWidth="1.5" strokeDasharray="10 12">
            <path d="M400 150L-20 470" />
            <path d="M400 150L493 -60" />
            <path d="M400 150L620 215" />
            <path d="M400 150L125 -60" />
          </g>
        </g>

        {/* Street labels */}
        <g className={styles.street}>
          <text transform="translate(92 402) rotate(-37.3)">TOOTING HIGH ST</text>
          <text transform="translate(462 176) rotate(16.5)">MITCHAM RD</text>
          <text transform="translate(432 118) rotate(-66)">UPPER TOOTING RD</text>
          <text transform="translate(222 28) rotate(37.8)">GARRATT LN</text>
        </g>

        {/* Market */}
        <g transform="translate(306 300) rotate(-37.3)">
          <ellipse rx="140" ry="90" fill="url(#market-glow)" className={styles.marketGlow} />
          <rect x="-82" y="-36" width="164" height="72" rx="10" fill="url(#market-fill)" />
          <rect x="-82" y="-36" width="164" height="72" rx="10" fill="none" stroke="#ffe1a8" strokeOpacity="0.6" />
          <g stroke="rgba(26,10,4,0.35)" strokeWidth="2">
            <path d="M-50 -36v72M-18 -36v72M14 -36v72M46 -36v72" />
          </g>
        </g>
        <text x="306" y="384" textAnchor="middle" className={styles.marketLabel}>
          TOOTING BROADWAY MARKET
        </text>

        {/* Walking route from the station: a dotted line revealed by an animated mask */}
        <mask id="route-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="460">
          <m.path
            d={ROUTE}
            fill="none"
            stroke="#fff"
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ ...heavy, delay: 0.3 }}
          />
        </mask>
        <path
          d={ROUTE}
          mask="url(#route-mask)"
          fill="none"
          stroke="#75aadb"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray="0.1 11"
          className={styles.route}
        />

        {/* Station */}
        <g transform="translate(362 158)">
          <circle r="21" fill="#75aadb" className={styles.station} />
          <g fill="none" stroke="#0e0c0b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="-8" y="-11" width="16" height="17" rx="4" />
            <path d="M-8 -1h16M-4 10l-3 4M4 10l3 4" />
          </g>
          <g fill="#0e0c0b">
            <circle cx="-4" cy="2.5" r="1.4" />
            <circle cx="4" cy="2.5" r="1.4" />
          </g>
          <text x="-38" y="-28" textAnchor="end" className={styles.stationLabel}>
            TOOTING BROADWAY
          </text>
          <text x="-38" y="-10" textAnchor="end" className={styles.stationSub}>
            Northern line
          </text>
        </g>

        {/* Pin */}
        <m.g
          initial={{ y: -30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ ...heavy, delay: 0.7 }}
        >
          <g transform="translate(306 290)">
            <circle r="26" className={styles.ping} />
            <path d="M0 0c-14-18-22-28-22-40a22 22 0 0 1 44 0c0 12-8 22-22 40z" fill="#0e0c0b" stroke="#ffd889" strokeWidth="2.5" />
            <text y="-34" textAnchor="middle" className={styles.pinText}>
              10
            </text>
          </g>
        </m.g>

        {/* Compass */}
        <g transform="translate(564 -6)" className={styles.compass}>
          <circle r="18" fill="none" stroke="rgba(246,238,228,0.25)" />
          <path d="M0 -12l6 14h-12z" fill="#ffb23f" />
          <text y="-24" textAnchor="middle">N</text>
        </g>
      </svg>
      <p className={styles.mapNote}>Stylised map, not to scale.</p>
    </div>
  )
}
