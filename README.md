# Barra10

Speculative demo site for **Barra10**, an Argentinian grill inside Tooting Broadway Market, London SW17.

Live demo: https://alexwilder-dev.github.io/Barra10/

Front-end only: everything runs on static data. There is no CMS, database, payments, analytics or booking
backend. The booking form is a **demo**: it never sends anything anywhere.

## Run it

Requires Node 22.12 or newer.

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
npm run build      # type-check, build and prerender to dist/
npm run preview    # serve the production build at http://localhost:4173
```

## Deploy (GitHub Pages)

The workflow in `.github/workflows/deploy.yml` builds and publishes `dist/` on every push to `main`
(or run it manually from the Actions tab).

1. Push the repo to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions** (not "Deploy from a branch", which
   publishes the unbuilt source and shows a blank page).
3. Push to `main`. The site appears at `https://<user>.github.io/<repo>/`.

The site's base path comes from the `BASE_PATH` environment variable at build time. The workflow sets it to
`/<repo>/` automatically. For a custom domain, add a repository variable `BASE_PATH` with the value `/`.
To build for a sub-path locally:

```bash
BASE_PATH=/Barra10/ npm run build
```

## Editing content

All content lives in **`src/data/site.ts`**: venue details, opening hours, menu items and prices, section copy
and image paths. Every unconfirmed value has a `// VERIFY` comment. Search for `VERIFY` before going live.

The live "Open now / Opens at" badge, the hours table, the late-night note and the fake booking slots are all
computed from the `hours` array in that file (London time).

### Swapping in real photos

1. Put the venue's photos in `public/images/` (e.g. `public/images/steak.jpg`).
2. In `src/data/site.ts`, replace the placeholder `src` with `local('images/steak.jpg')` and update the `alt`
   text.

Every image slot sits on top of procedural artwork (glowing coals, flames, a plated steak, neon glasses),
so the page still looks finished if a photo is missing or fails to load.

## Placeholder images

Free-licence photos from Unsplash ([Unsplash License](https://unsplash.com/license)), loaded from Unsplash
at runtime. Replace them with the venue's own photos before launch.

| Slot | Photo | Photographer |
| --- | --- | --- |
| Fire story: charcoal | https://unsplash.com/photos/glowing-hot-embers-and-coals-in-a-fire-5w2hjEJ06b0 | Alican Leblebici |
| Fire story: flame | https://unsplash.com/photos/D9MDpAjlJ6k | Martin Adams |
| Fire story: plate | https://unsplash.com/photos/O67LZfeyYBk | Jason Leung |
| Menu: A la parrilla (steak on the grill) | https://unsplash.com/photos/Xm8XD2b9AUs | Philipp Kämmerer |
| Menu: Para picar (empanadas) | https://unsplash.com/photos/EGmwwDzme6s | Kristina Tripkovic |
| Menu: Del mar (octopus) | https://unsplash.com/photos/grilled-octopus-dishes--7ZtWjzo-68 | Elle Hughes |
| Menu: Postres (ice cream) | https://unsplash.com/photos/1AO-fS1eGAY | Ellie Enchantée |
| Menu: Bebidas + Late night: Malbec | https://unsplash.com/photos/clear-wine-glass-with-red-wine-dR8t0L8YXsI | See source page |
| Late night: cocktail | https://unsplash.com/photos/clear-drinking-glass-with-orange-juice-qhfe60zL8-Q | Paige Ledford |

The empanadas photo shows them being folded rather than cooked; a plated shot from the venue will be better.

## Fonts

[Unbounded](https://fonts.google.com/specimen/Unbounded) (display) and
[Inter](https://fonts.google.com/specimen/Inter) (body) from Google Fonts, both under the SIL Open Font
License. They are self-hosted from `public/fonts/` (latin subset) so the first paint doesn't wait on a
third-party stylesheet.

## How it's built

- **Vite + React + TypeScript + Framer Motion.** No other runtime dependencies.
- **Prerendered.** `npm run build` renders the page to static HTML (`scripts/prerender.mjs`) and inlines the
  CSS, so content paints before JavaScript loads. React then hydrates it.
- **Motion.** Every spring comes from `src/lib/springs.ts`. Tune the feel there, not in components.
- **Hero embers** are a 2D canvas (`src/components/EmberCanvas.tsx`) that pauses when off-screen or when the
  tab is hidden, and uses fewer particles on small screens.
- **Reduced motion.** With `prefers-reduced-motion`, the embers, heat shimmer and scroll-scrubbed fire story
  are switched off. Layout stays the same and simple fades remain.
- **Booking** (`src/components/Booking.tsx`) is demo-only and clearly marked in code. Replace its `submit`
  handler with a real booking integration before taking reservations.

```
src/
  data/site.ts          all content (VERIFY markers)
  lib/springs.ts        spring presets
  lib/hours.ts          open-now logic, London time
  components/           one component + CSS module per section
  entry-server.tsx      build-time prerender entry
scripts/prerender.mjs   injects prerendered HTML + inlines CSS
```
