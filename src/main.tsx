import './styles/global.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'
import { injectStructuredData } from './lib/structured-data'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The production build prerenders the page into #root, so hydrate it.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)

injectStructuredData()
