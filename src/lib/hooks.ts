import { useEffect, useState, useSyncExternalStore } from 'react'

/**
 * Media query hook that is safe for prerendering: the server (and the
 * hydration pass) always sees `serverValue`, then the client corrects itself.
 */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  )
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/** True only after the first client render, for time- or device-dependent UI. */
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

/** Re-renders every `ms` (aligned to the minute by default) and returns now. */
export function useNow(ms = 60_000) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    let interval: number | undefined
    const align = window.setTimeout(() => {
      setNow(new Date())
      interval = window.setInterval(() => setNow(new Date()), ms)
    }, ms - (Date.now() % ms))
    return () => {
      window.clearTimeout(align)
      window.clearInterval(interval)
    }
  }, [ms])
  return now
}

/** Is the page tab visible? */
export function usePageVisible() {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange)
      return () => document.removeEventListener('visibilitychange', onChange)
    },
    () => document.visibilityState === 'visible',
    () => true,
  )
}
