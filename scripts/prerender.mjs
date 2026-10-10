// Renders the app to static HTML at build time and injects it into dist/index.html,
// so the page paints before any JavaScript runs. The client then hydrates it.
// The stylesheet is inlined too, saving a render-blocking request on first load.
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve('dist')
const ssrDir = resolve('dist-ssr')
const { render } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href)

let html = readFileSync(resolve(dist, 'index.html'), 'utf8')
if (!html.includes('<!--app-->')) throw new Error('Missing <!--app--> placeholder in index.html')
html = html.replace('<!--app-->', () => render())

html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g, (tag, href) => {
  const file = resolve(dist, href.replace(/^.*?assets\//, 'assets/'))
  return `<style>${readFileSync(file, 'utf8')}</style>`
})

writeFileSync(resolve(dist, 'index.html'), html)
rmSync(ssrDir, { recursive: true, force: true })
console.log('Prerendered dist/index.html')
