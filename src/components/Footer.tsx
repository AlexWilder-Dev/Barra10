import { addressLines, directionsUrl, nav, venue } from '../data/site'
import { Wordmark } from './Wordmark'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <a href="#top" className={styles.mark} aria-label={`${venue.name}, back to top`}>
          <Wordmark size="footer" />
        </a>

        <div className={styles.cols}>
          <div>
            <h2 className={styles.title}>Visit</h2>
            <address className={styles.address}>
              {addressLines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </address>
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
              Get directions ↗<span className="visually-hidden"> (opens Google Maps)</span>
            </a>
          </div>
          <div>
            <h2 className={styles.title}>Contact</h2>
            <ul className={styles.list}>
              <li>
                <a href={`tel:${venue.phone.tel}`}>{venue.phone.display}</a>
              </li>
              <li>
                <a href={`mailto:${venue.email}`}>{venue.email}</a>
              </li>
              <li>
                <a href={venue.instagram.url} target="_blank" rel="noopener noreferrer">
                  Instagram {venue.instagram.handle}
                </a>
              </li>
            </ul>
          </div>
          <nav aria-label="Footer">
            <h2 className={styles.title}>Explore</h2>
            <ul className={styles.list}>
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
              <li>
                <a href="#book">Book a table</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.base}>
          <p>
            © {venue.name}. {venue.tagline}
          </p>
          <p>Concept preview. Menu, prices and hours to be confirmed.</p>
          <p>
            <a href={venue.credit.url} target="_blank" rel="noopener noreferrer">
              {venue.credit.label}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
