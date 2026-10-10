import { hours, timeZone, type DayHours } from '../data/site'

const DAY_MS = 24 * 60

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const fromMinutes = (mins: number) => {
  const m = ((mins % DAY_MS) + DAY_MS) % DAY_MS
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** Opening span for a day in minutes; close is pushed past 1440 for late finishes. */
export function span(day: DayHours | undefined) {
  if (!day?.session) return null
  const open = toMinutes(day.session.open)
  let close = toMinutes(day.session.close)
  if (close <= open) close += DAY_MS
  return { open, close }
}

export const hoursFor = (weekday: number) => hours.find((h) => h.day === weekday)

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Weekday + minutes-since-midnight for `date` in the venue's time zone. */
export function venueClock(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return {
    weekday: WEEKDAYS.indexOf(get('weekday')),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}

export type OpenStatus =
  | { open: true; closesAt: string; closingSoon: boolean }
  | { open: false; opensAt: string; when: 'today' | 'tomorrow' | string }

export function openStatus(date: Date): OpenStatus {
  const { weekday, minutes } = venueClock(date)

  // Still inside yesterday's late session?
  const yesterday = span(hoursFor((weekday + 6) % 7))
  if (yesterday && yesterday.close > DAY_MS && minutes < yesterday.close - DAY_MS) {
    const left = yesterday.close - DAY_MS - minutes
    return { open: true, closesAt: fromMinutes(yesterday.close), closingSoon: left <= 60 }
  }

  const today = span(hoursFor(weekday))
  if (today && minutes >= today.open && minutes < today.close) {
    return { open: true, closesAt: fromMinutes(today.close), closingSoon: today.close - minutes <= 60 }
  }
  if (today && minutes < today.open) {
    return { open: false, opensAt: fromMinutes(today.open), when: 'today' }
  }

  for (let i = 1; i <= 7; i++) {
    const d = (weekday + i) % 7
    const s = span(hoursFor(d))
    if (s) {
      return {
        open: false,
        opensAt: fromMinutes(s.open),
        when: i === 1 ? 'tomorrow' : (hoursFor(d)?.label ?? ''),
      }
    }
  }
  return { open: false, opensAt: '', when: '' }
}

/** Today's weekday in the venue's time zone. */
export const venueWeekday = (date: Date) => venueClock(date).weekday

/** Formats a session for display, e.g. "12:00 – 23:00". */
export function sessionLabel(day: DayHours) {
  if (!day.session) return 'Closed'
  return `${day.session.open} – ${day.session.close}`
}
