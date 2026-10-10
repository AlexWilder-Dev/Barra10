import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

/**
 * Rising embers for the hero. Plain 2D canvas with additive blending and
 * pre-rendered glow sprites. Runs only while visible and the tab is active.
 * Not rendered at all when the user prefers reduced motion.
 */

const EMBER = 0
const SPARK = 1
const BOKEH = 2

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  seed: number
  kind: number
}

function sprite(stops: [number, string][], size = 64) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  for (const [o, col] of stops) grad.addColorStop(o, col)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

export function EmberCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const hot = sprite([
      [0, 'rgba(255,252,235,1)'],
      [0.12, 'rgba(255,214,130,0.95)'],
      [0.32, 'rgba(255,140,40,0.35)'],
      [1, 'rgba(255,90,20,0)'],
    ])
    const warm = sprite([
      [0, 'rgba(255,230,170,1)'],
      [0.12, 'rgba(255,140,40,0.9)'],
      [0.34, 'rgba(240,83,28,0.28)'],
      [1, 'rgba(200,38,27,0)'],
    ])
    const cool = sprite([
      [0, 'rgba(255,160,90,0.9)'],
      [0.14, 'rgba(220,50,25,0.75)'],
      [0.36, 'rgba(160,20,20,0.2)'],
      [1, 'rgba(120,10,10,0)'],
    ])
    const bokeh = sprite([
      [0, 'rgba(255,170,80,0.9)'],
      [0.55, 'rgba(255,100,30,0.45)'],
      [0.8, 'rgba(220,60,20,0.12)'],
      [1, 'rgba(200,40,20,0)'],
    ])

    let w = 0
    let h = 0
    let dpr = 1
    let target = 0
    const particles: Particle[] = []
    const rand = Math.random

    const spawn = (p: Particle, initial: boolean) => {
      const r = rand()
      p.kind = r < 0.05 ? BOKEH : r < 0.3 ? SPARK : EMBER
      // Triangular distribution: denser in the middle of the bed.
      p.x = w * ((rand() + rand()) / 2) * 1.2 - w * 0.1
      p.y = initial ? h * (0.35 + rand() * 0.7) : h + 8 + rand() * 24
      p.vx = (rand() - 0.5) * 24
      p.vy = -(28 + rand() * 64) * (p.kind === SPARK ? 2.1 : p.kind === BOKEH ? 0.5 : 1)
      p.max = p.kind === SPARK ? 1.1 + rand() * 1.5 : p.kind === BOKEH ? 5 + rand() * 4 : 2.6 + rand() * 4.8
      p.life = initial ? p.max * rand() : p.max
      p.size = p.kind === BOKEH ? 18 + rand() * 34 : p.kind === SPARK ? 0.9 + rand() * 0.9 : 1.1 + rand() * 2.3
      p.seed = rand() * 1000
      return p
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      const small = w < 700
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const lowPower = (navigator.hardwareConcurrency || 8) <= 4
      target = Math.round(Math.min(170, Math.max(small ? 46 : 80, (w * h) / 8500)) * (lowPower ? 0.7 : 1))
      if (small) target = Math.min(target, 64)
      while (particles.length < target) particles.push(spawn({} as Particle, true))
      particles.length = target
    }

    // Pointer: a soft pocket of moving air that pushes and swirls embers.
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, active: false, t: 0 }
    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const now = performance.now()
      if (pointer.active) {
        const dt = Math.max(16, now - pointer.t) / 1000
        pointer.vx = pointer.vx * 0.6 + ((x - pointer.x) / dt) * 0.4
        pointer.vy = pointer.vy * 0.6 + ((y - pointer.y) / dt) * 0.4
      }
      pointer.x = x
      pointer.y = y
      pointer.t = now
      pointer.active = y > -50 && y < h + 50
    }
    const onLeave = () => (pointer.active = false)

    // Scroll: fanning the coals. Scroll speed briefly boosts lift.
    let lastScroll = window.scrollY
    let fan = 0

    let t = 0
    const R = 170
    const update = (dt: number) => {
      const scrollY = window.scrollY
      const speed = Math.abs(scrollY - lastScroll) / Math.max(dt, 1 / 120)
      lastScroll = scrollY
      fan += (Math.min(speed / 1400, 1) - fan) * Math.min(1, dt * 6)
      pointer.vx *= 1 - Math.min(1, dt * 5)
      pointer.vy *= 1 - Math.min(1, dt * 5)

      for (const p of particles) {
        p.life -= dt
        if (p.life <= 0 || p.y < -60 || p.x < -80 || p.x > w + 80) {
          spawn(p, false)
          continue
        }
        const lift = (p.kind === SPARK ? 34 : p.kind === BOKEH ? 6 : 18) * (1 + fan * 2.2)
        p.vy -= lift * dt
        const n1 = Math.sin(p.y * 0.011 + t * 1.15 + p.seed)
        const n2 = Math.cos(p.x * 0.008 - t * 0.7 + p.seed * 0.5)
        p.vx += (n1 * 36 + n2 * 14 + fan * Math.sin(t * 2 + p.seed) * 40) * dt

        if (pointer.active) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const d2 = dx * dx + dy * dy
          if (d2 < R * R) {
            const d = Math.sqrt(d2) + 0.001
            const f = (1 - d / R) ** 2
            const push = f * 520 * dt
            p.vx += (dx / d) * push - (dy / d) * push * 0.35 + pointer.vx * f * 0.9 * dt
            p.vy += (dy / d) * push * 0.7 + (dx / d) * push * 0.35 + pointer.vy * f * 0.9 * dt
          }
        }

        p.vx *= 1 - 1.05 * dt
        p.vy *= 1 - 0.16 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
      }
    }

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'

      for (const p of particles) {
        const heat = p.life / p.max
        const born = Math.min(1, (p.max - p.life) * 2.5)
        const flicker = 0.72 + 0.28 * Math.sin(t * 13 + p.seed)
        const a = heat ** 0.75 * born * flicker

        if (p.kind === SPARK) {
          ctx.globalAlpha = a
          ctx.strokeStyle = heat > 0.55 ? '#ffd890' : '#ff8a30'
          ctx.lineWidth = p.size
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045)
          ctx.stroke()
        } else if (p.kind === BOKEH) {
          ctx.globalAlpha = a * 0.13
          const s = p.size
          ctx.drawImage(bokeh, p.x - s / 2, p.y - s / 2, s, s)
        } else {
          ctx.globalAlpha = a
          const img = heat > 0.62 ? hot : heat > 0.3 ? warm : cool
          const s = p.size * 7 * (0.65 + 0.35 * heat)
          ctx.drawImage(img, p.x - s / 2, p.y - s / 2, s, s)
        }
      }
      ctx.globalAlpha = 1
    }

    let raf = 0
    let running = false
    let last = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min((now - last) / 1000, 1 / 24)
      last = now
      t += dt
      update(dt)
      draw()
    }
    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    let inView = true
    const reconcile = () => (inView && document.visibilityState === 'visible' ? start() : stop())
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      reconcile()
    })
    const ro = new ResizeObserver(() => resize())

    // Start after the page has painted so the canvas never competes with first load.
    let idle = 0
    const begin = () => {
      resize()
      for (let i = 0; i < 60; i++) update(1 / 30) // pre-warm so the air is already full
      ro.observe(canvas)
      io.observe(canvas)
      document.addEventListener('visibilitychange', reconcile)
      window.addEventListener('pointermove', onPointer, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
      canvas.dataset.live = 'true'
      reconcile()
    }
    const hasIdle = typeof window.requestIdleCallback === 'function'
    idle = hasIdle ? window.requestIdleCallback(begin, { timeout: 900 }) : window.setTimeout(begin, 120)

    return () => {
      if (hasIdle) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', reconcile)
      window.removeEventListener('pointermove', onPointer)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />
}
