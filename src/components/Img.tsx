import { useEffect, useRef, useState } from 'react'
import type { SiteImage } from '../data/site'
import { imageSources } from '../lib/images'

type Props = {
  image: SiteImage
  sizes: string
  className?: string
  widths?: number[]
  /** Decorative images get an empty alt. */
  decorative?: boolean
}

/**
 * Image that only starts downloading when it is about a screen away, fades in
 * on load, and removes itself if it fails, so the procedural artwork behind it
 * shows through instead of a broken icon.
 */
export function Img({ image, sizes, className, widths, decorative }: Props) {
  const sentinel = useRef<HTMLSpanElement>(null)
  const ref = useRef<HTMLImageElement>(null)
  const [near, setNear] = useState(false)
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading')

  useEffect(() => {
    const el = sentinel.current
    if (!el || near) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '90% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [near])

  // Covers images served from cache that finished before handlers attached.
  useEffect(() => {
    const el = ref.current
    if (el?.complete) setState(el.naturalWidth > 0 ? 'loaded' : 'failed')
  }, [near])

  if (state === 'failed') return null
  if (!near) return <span ref={sentinel} className={className} data-state="pending" aria-hidden="true" />

  const { src, srcSet } = imageSources(image.src, widths)
  return (
    <img
      ref={ref}
      className={className}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={decorative ? '' : image.alt}
      decoding="async"
      data-state={state}
      onLoad={() => setState('loaded')}
      onError={() => setState('failed')}
    />
  )
}
