import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'

/** Used at build time to prerender the page to static HTML. */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
