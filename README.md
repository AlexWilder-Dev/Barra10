# Barra10

Website for **Barra10**, an independent Argentinian steakhouse inside Broadway Market, Tooting.

Live: https://alexwilder-dev.github.io/Barra10/

## What's here

A single static page with no build step and no dependencies.

```
index.html            all content: hero, menu, story, visit, booking, footer
assets/css/site.css   styles
assets/js/site.js     small enhancements: open-now status, mobile nav, map, image fallbacks
assets/fonts/         Fraunces, Barlow, Barlow Condensed (Google Fonts, SIL Open Font License)
assets/img/           favicon and monogram
```

## Run it locally

Any static server works:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages on every push to `main`.
In **Settings → Pages**, the source must be **GitHub Actions**.

## Editing

- **Opening hours** live in the hours table in `index.html`. The "Open now" status, the "Today" highlight
  and everything else read from that table, so change it there. Also update the footer summary and the
  structured data (`application/ld+json`) at the top of the page.
- **Menu** is plain HTML in the `#menu` section.
- **Photos**: replace the `src`/`srcset` of the `<img>` tags with the restaurant's own photos (e.g. put them in
  `assets/img/`). Each photo frame has a designed fallback, so a missing image never shows a broken icon.

## Content sources and things to confirm

Venue details come from the restaurant's site (barra10.co.uk) and public listings, checked October 2026.
Items marked `VERIFY` in `index.html` should be confirmed with the restaurant:

- Address and postcode: Unit 16, Broadway Market, Tooting High Street, London SW17 0RL (one listing says SW17 0SP)
- Opening hours: Tue–Thu 17:30–22:00, Fri 17:30–23:00, Sat 12:00–23:00, Sun & Mon closed (listings disagree on Saturday's start time)
- Steak deals: flank steak £15; bavette & entraña to share £33
- Menu items, taken from the official site and reviews; no prices are shown apart from the deals
- Instagram: @barra10uk
- Story: chef-patron Dani Cives; Argentinian chef and Mexican wife; wood-and-charcoal grill

## Placeholder photos (Unsplash)

Free to use under the [Unsplash License](https://unsplash.com/license). Swap for the restaurant's own photos.

| Where | Source | Photographer |
| --- | --- | --- |
| Hero | https://unsplash.com/photos/Xm8XD2b9AUs | Philipp Kämmerer |
| Our story | https://unsplash.com/photos/close-up-photo-of-grilled-meat-B6kciNEJgN8 | Deby Rodriguez |
| Strip: steak | https://unsplash.com/photos/XY-V_o-ykuk | José Ignacio Pompé |
| Strip: octopus | https://unsplash.com/photos/grilled-octopus-dishes--7ZtWjzo-68 | Elle Hughes |
| Strip: tacos | https://unsplash.com/photos/JiRSy0GfqPA | Tai's Captures |
| Strip: wine | https://unsplash.com/photos/clear-wine-glass-with-red-wine-dR8t0L8YXsI | see source |
