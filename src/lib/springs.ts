import type { SpringOptions, Transition } from 'framer-motion'

/**
 * Every spring on the site comes from here, so the whole thing moves with one
 * physical "feel": quick to respond, settles without wobbling about.
 * Tune these, not individual components.
 */

/** Tabs, chips, toggles, small UI that should snap into place. */
export const snappy: Transition = { type: 'spring', stiffness: 520, damping: 38, mass: 0.7 }

/** Default for content entering, panels sliding, cards lifting. */
export const firm: Transition = { type: 'spring', stiffness: 300, damping: 32, mass: 1 }

/** Large, heavy things: overlays, the hero wordmark settling. */
export const heavy: Transition = { type: 'spring', stiffness: 170, damping: 28, mass: 1.4 }

/** A touch of overshoot for moments of delight (booking confirmed). */
export const bouncy: Transition = { type: 'spring', stiffness: 420, damping: 16, mass: 0.8 }

/** Follower for scroll- and pointer-linked values (pass to useSpring). */
export const scrub: SpringOptions = { stiffness: 240, damping: 40, mass: 0.35, restDelta: 0.0005 }

/** Pointer-driven tilt / parallax (pass to useSpring). */
export const tilt: SpringOptions = { stiffness: 260, damping: 24, mass: 0.6 }

/** Steak doneness morph (pass to useSpring). */
export const doneness: SpringOptions = { stiffness: 140, damping: 22, mass: 1 }

/** Stagger helper for lists that enter together. */
export const stagger = (i: number, step = 0.045, delay = 0): Transition => ({
  ...firm,
  delay: delay + i * step,
})
