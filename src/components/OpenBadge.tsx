import { useNow } from '../lib/hooks'
import { openStatus } from '../lib/hours'
import styles from './OpenBadge.module.css'

/** Live "Open now / Opens at" pill, computed from the hours in site.ts (London time). */
export function OpenBadge({ className }: { className?: string }) {
  const now = useNow()

  if (!now) {
    return (
      <span className={[styles.badge, className].filter(Boolean).join(' ')} data-state="pending">
        <span className={styles.dot} aria-hidden="true" />
        Lunch through late
      </span>
    )
  }

  const s = openStatus(now)
  let text: string
  if (s.open) text = s.closingSoon ? `Closing soon · ${s.closesAt}` : `Open now · until ${s.closesAt}`
  else if (s.when === 'today') text = `Closed · opens at ${s.opensAt}`
  else if (s.when === 'tomorrow') text = `Closed · opens tomorrow ${s.opensAt}`
  else text = `Closed · opens ${s.when} ${s.opensAt}`

  return (
    <span className={[styles.badge, className].filter(Boolean).join(' ')} data-state={s.open ? 'open' : 'closed'}>
      <span className={styles.dot} aria-hidden="true" />
      {text}
    </span>
  )
}
