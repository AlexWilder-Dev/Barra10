import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` is configurable so the site can live at a sub-path on GitHub Pages
// (e.g. https://<user>.github.io/<repo>/). Set BASE_PATH at build time:
//   BASE_PATH=/Barra10/ npm run build
// Defaults to "/" for local dev and custom domains.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base: base.endsWith('/') ? base : `${base}/`,
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
  },
})
