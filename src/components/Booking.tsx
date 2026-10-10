/**
 * DEMO ONLY: this booking form never sends data anywhere. There is no booking
 * backend, API call, email or storage. Availability is faked from the opening
 * hours in site.ts. Replace `submit` with a real booking integration before
 * taking real reservations.
 */
import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { booking, venue } from '../data/site'
import { usePrefersReducedMotion, useNow } from '../lib/hooks'
import { fromMinutes, hoursFor, span, venueClock } from '../lib/hours'
import { bouncy, firm, snappy, stagger } from '../lib/springs'
import styles from './Booking.module.css'

type Day = { key: string; date: Date; weekday: number; top: string; num: string; month: string }
type Slot = { time: string; available: boolean }
type Confirmed = { day: Day; time: string; party: number }

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', opts)
const weekdayFmt = fmt({ weekday: 'short' })
const monthFmt = fmt({ month: 'short' })
const longFmt = fmt({ weekday: 'long', day: 'numeric', month: 'long' })

function nextDays(now: Date, count: number): Day[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      date,
      weekday: date.getDay(),
      top: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : weekdayFmt.format(date),
      num: String(date.getDate()),
      month: monthFmt.format(date),
    }
  })
}

/** Small deterministic hash so fake availability is stable between renders. */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return ((h >>> 0) % 1000) / 1000
}

function slotsFor(day: Day | undefined, party: number, now: Date | null, isToday: boolean): Slot[] {
  const s = span(day ? hoursFor(day.weekday) : undefined)
  if (!day || !s) return []
  const last = s.close - booking.lastBookingBeforeClose
  const earliest = isToday && now ? venueClock(now).minutes + 45 : 0
  const out: Slot[] = []
  for (let t = s.open; t <= last; t += booking.slotMinutes) {
    if (t < earliest) continue
    const peak = t >= 19 * 60 && t <= 20 * 60 + 30 ? 0.22 : 0
    const busy = 0.18 + party * 0.035 + peak
    out.push({ time: fromMinutes(t), available: hash(`${day.key}|${t}|${party}`) > busy })
  }
  return out
}

export function Booking() {
  const now = useNow()
  const dayKey = now?.toDateString()
  const days = useMemo(() => (now ? nextDays(now, booking.daysAhead) : []), [dayKey])
  const [dayIndex, setDayIndex] = useState(0)
  const [party, setParty] = useState(2)
  const [time, setTime] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null)

  const day = days[dayIndex]
  const large = party > booking.largeParty
  const slots = useMemo(() => slotsFor(day, party, now, dayIndex === 0), [day, party, now, dayIndex])
  const lunch = slots.filter((s) => s.time >= '06:00' && s.time < '17:00')
  const evening = slots.filter((s) => !(s.time >= '06:00' && s.time < '17:00'))

  // Drop a chosen time if it stops being available.
  useEffect(() => {
    if (time && !slots.some((s) => s.time === time && s.available)) setTime(null)
  }, [slots, time])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!day || !time) {
      setError(true)
      return
    }
    // DEMO ONLY: no request is made. We only show a confirmation.
    setConfirmed({ day, time, party })
  }

  const reset = () => {
    setConfirmed(null)
    setTime(null)
    setError(false)
  }

  return (
    <section id="book" className={`section ${styles.section}`} aria-labelledby="book-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <p className="label">{booking.label}</p>
          <h2 id="book-title" className="display h2">
            {booking.title}
          </h2>
          <p className="lede">{booking.line}</p>
          <p className={styles.call}>
            Rather talk to a human? <a href={`tel:${venue.phone.tel}`}>{venue.phone.display}</a>
          </p>
        </div>

        <div className={styles.card}>
          <AnimatePresence mode="wait" initial={false}>
            {confirmed ? (
              <Confirmation key="done" booking={confirmed} onReset={reset} />
            ) : (
              <m.form
                key="form"
                className={styles.form}
                onSubmit={submit}
                noValidate
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={firm}
              >
                <fieldset className={styles.fieldset}>
                  <legend className={styles.legend}>Date</legend>
                  <div className={styles.dates}>
                    {days.length === 0
                      ? Array.from({ length: 7 }, (_, i) => <span key={i} className={styles.dateSkeleton} />)
                      : days.map((d, i) => (
                          <label key={d.key} className={styles.date} data-checked={i === dayIndex}>
                            <input
                              type="radio"
                              name="date"
                              value={d.key}
                              checked={i === dayIndex}
                              onChange={() => setDayIndex(i)}
                              className="visually-hidden"
                              aria-label={longFmt.format(d.date)}
                            />
                            <span className={styles.dateTop} aria-hidden="true">
                              {d.top}
                            </span>
                            <span className={styles.dateNum} aria-hidden="true">
                              {d.num}
                            </span>
                            <span className={styles.dateMonth} aria-hidden="true">
                              {d.month}
                            </span>
                          </label>
                        ))}
                  </div>
                </fieldset>

                <fieldset className={styles.fieldset}>
                  <legend className={styles.legend}>Guests</legend>
                  <div className={styles.party}>
                    <button
                      type="button"
                      className={styles.step}
                      onClick={() => setParty((p) => Math.max(1, p - 1))}
                      disabled={party <= 1}
                      aria-label="Fewer guests"
                    >
                      −
                    </button>
                    <output className={styles.partyValue} aria-live="polite">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <m.span
                          key={party}
                          initial={{ y: 14, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -14, opacity: 0 }}
                          transition={snappy}
                        >
                          {party}
                        </m.span>
                      </AnimatePresence>
                      <span className={styles.partyUnit}>{party === 1 ? 'guest' : 'guests'}</span>
                    </output>
                    <button
                      type="button"
                      className={styles.step}
                      onClick={() => setParty((p) => Math.min(booking.maxParty, p + 1))}
                      disabled={party >= booking.maxParty}
                      aria-label="More guests"
                    >
                      +
                    </button>
                  </div>
                </fieldset>

                <fieldset className={styles.fieldset}>
                  <legend className={styles.legend}>Time</legend>
                  {large ? (
                    <p className={styles.large}>
                      For groups over {booking.largeParty}, give us a call on{' '}
                      <a href={`tel:${venue.phone.tel}`}>{venue.phone.display}</a> and we’ll sort you out.
                    </p>
                  ) : slots.length === 0 ? (
                    <p className={styles.large}>{days.length ? 'No tables left today. Try another day.' : 'Loading times…'}</p>
                  ) : (
                    <div className={styles.slotGroups}>
                      {[
                        { name: 'Lunch', list: lunch },
                        { name: 'Evening', list: evening },
                      ]
                        .filter((g) => g.list.length)
                        .map((g) => (
                          <div key={g.name} className={styles.slotGroup}>
                            <p className={styles.slotGroupName} aria-hidden="true">
                              {g.name}
                            </p>
                            <div className={styles.slots}>
                              {g.list.map((s, i) => (
                                <m.label
                                  key={`${day?.key}-${party}-${s.time}`}
                                  className={styles.slot}
                                  data-available={s.available}
                                  data-checked={time === s.time}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={stagger(i, 0.015)}
                                >
                                  <input
                                    type="radio"
                                    name="time"
                                    value={s.time}
                                    disabled={!s.available}
                                    checked={time === s.time}
                                    onChange={() => {
                                      setTime(s.time)
                                      setError(false)
                                    }}
                                    className="visually-hidden"
                                    aria-label={`${s.time}${s.available ? '' : ', fully booked'}`}
                                  />
                                  <span aria-hidden="true">{s.time}</span>
                                </m.label>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </fieldset>

                <div className={styles.submitRow}>
                  <p className={styles.summary} aria-live="polite">
                    {error ? (
                      <span className={styles.error}>Pick a time to continue.</span>
                    ) : day && time ? (
                      <>
                        {weekdayFmt.format(day.date)} {day.num} {day.month} · {time} · {party}{' '}
                        {party === 1 ? 'guest' : 'guests'}
                      </>
                    ) : (
                      'Choose a date, party size and time.'
                    )}
                  </p>
                  <m.button
                    type="submit"
                    className="btn btn--primary"
                    disabled={large}
                    whileTap={{ scale: 0.96 }}
                    transition={snappy}
                  >
                    Reserve table
                  </m.button>
                </div>
              </m.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Confirmation({ booking: b, onReset }: { booking: Confirmed; onReset: () => void }) {
  const reduced = usePrefersReducedMotion()
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [])

  return (
    <m.div
      className={styles.done}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={bouncy}
      role="status"
    >
      <div className={styles.badge} aria-hidden="true">
        {!reduced &&
          Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2
            const d = 70 + (i % 3) * 18
            return (
              <m.span
                key={i}
                className={styles.spark}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d, opacity: 0, scale: 0.4 }}
                transition={{ ...firm, delay: 0.15 }}
              />
            )
          })}
        <svg viewBox="0 0 80 80" width="80" height="80">
          <m.circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="url(#done-grad)"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={firm}
          />
          <m.path
            d="M26 41l9 9 19-20"
            fill="none"
            stroke="#ffd889"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...bouncy, delay: 0.2 }}
          />
          <defs>
            <linearGradient id="done-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffc34d" />
              <stop offset="1" stopColor="#f0531c" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h3 ref={heading} tabIndex={-1} className={styles.doneTitle}>
        ¡Listo! See you soon.
      </h3>

      <dl className={styles.ticket}>
        <div>
          <dt>Date</dt>
          <dd>{longFmt.format(b.day.date)}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{b.time}</dd>
        </div>
        <div>
          <dt>Guests</dt>
          <dd>{b.party}</dd>
        </div>
      </dl>

      <p className={styles.demo}>Demo preview: no booking has been made and nothing was sent.</p>

      <button type="button" className="btn btn--ghost" onClick={onReset}>
        Make another booking
      </button>
    </m.div>
  )
}
