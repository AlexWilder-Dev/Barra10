# Barra10

Website for **Barra10**, an Argentinian parrilla inside Broadway Market, Tooting.

Live: https://alexwilder-dev.github.io/Barra10/

## The idea

The look comes from *fileteado porteño*, the painted sign-work you see on parrillas, shopfronts and old
buses in Buenos Aires: pinstriped frames that curl into spirals at the corners, heavy shaded lettering,
ribbons and the sun, in red, gold and sky blue on black. The menu is a painted board in the green of the
restaurant's own room, and the address sits on a London enamel street sign, because this is Buenos Aires
landing on Tooting High Street.

There are no stock photos. The page stands up on lettering and ornament alone, like a painted sign.

## Files

```
index.html            all content
assets/styles.css     styles
assets/app.js         open-now status, today's hours, top bar (optional; the page works without it)
assets/fonts/         Ultra and Archivo (Google Fonts, SIL Open Font License)
assets/img/           frame, divider and sun ornaments, favicon
tools/ornaments.py    regenerates the ornaments: python3 tools/ornaments.py assets/img
```

No build step and no dependencies. To preview locally:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Deploy

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages on every push to `main`.
In **Settings → Pages** the source must be **GitHub Actions**.

## Editing

- **Hours**: the hours table in `index.html` drives the "Open now" status and the "Hoy" (today) marker.
  Also update the structured data (`application/ld+json`) at the top of the page.
- **Menu**: plain HTML in the `#carta` section. Deals with prices are the two tickets above the list.
- **Photos**: the oval cameo in "La familia" is the natural place for a photo of the chef at the grill.

## Sources and things to confirm

Venue details come from the restaurant's own site (barra10.co.uk) and public listings, checked October 2026.
Everything marked `VERIFY` in `index.html` should be confirmed with the restaurant:

- Address and postcode: Unit 16, Broadway Market, Tooting High Street, London SW17 0RL (one listing says SW17 0SP)
- Hours: Tue–Thu 17:30–22:00, Fri 17:30–23:00, Sat 12:00–23:00, Sun & Mon closed (listings disagree on Saturday's start)
- Deals: flank steak £15; bavette & entraña to share £33
- Menu items, from the official site and reviews
- Story: chef-patron Dani Cives, Argentinian, with his Mexican wife; wood-and-charcoal grill; open since 2018
- Instagram: @barra10uk
