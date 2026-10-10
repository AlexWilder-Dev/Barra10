const UNSPLASH = 'https://unsplash.com/photos/'

/**
 * Builds `src`/`srcSet` for an image path. Unsplash placeholders are sized
 * via their `w` parameter; local files are used as-is.
 */
export function imageSources(src: string, widths = [640, 1080, 1600]) {
  if (src.startsWith(UNSPLASH)) {
    const at = (w: number) => `${src}?force=true&w=${w}`
    return {
      src: at(widths[Math.min(1, widths.length - 1)]),
      srcSet: widths.map((w) => `${at(w)} ${w}w`).join(', '),
    }
  }
  return { src, srcSet: undefined }
}
