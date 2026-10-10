# Barra10

Website for **Barra10**, an independent Argentinian steakhouse in Broadway Market, Tooting.

Live: https://alexwilder-dev.github.io/Barra10/

## Direction

Dark, smoke and fire, handled with restraint. The page sits on near-black with smoke rising through it,
lit from below by embers. That's a small WebGL shader, not an illustration. Type is Cormorant for the
voice and Jost in spaced capitals for detail, with a single ember accent and hairline rules. The menu is set like a
fine-dining card. The copy is short and factual, built from what the restaurant says about itself.

## Files

```
index.html          all content
assets/site.css     styles
assets/site.js      smoke shader, live opening status, header and mobile menu, reveals
assets/fonts/       Cormorant and Jost (Google Fonts, SIL Open Font License)
assets/favicon.svg
```

No build step and no dependencies. Preview locally with any static server:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Deploy

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages on every push to `main`.
In **Settings → Pages** the source must be **GitHub Actions**.

## Booking form

The "Reserve a table" form has no backend. It follows the restaurant's own booking process (name, number of
diners, date and time, contact number; up to eight per table). On submit, it writes the request into a
**WhatsApp** message or an **email** for the guest to send, and the restaurant replies to confirm.

- Times are generated from the hours table: every 30 minutes from opening until 90 minutes before closing.
- Sundays and Mondays are refused, and "More than 8" asks the guest to call.
- WhatsApp number and email are at the top of the booking section in `assets/site.js`.

## How the smoke behaves

- Rendered at reduced resolution (smoke is soft), about 30fps, paused when the tab is hidden.
- The ember glow is strongest under the hero and settles as you scroll.
- Runs only on a hardware GPU. Devices that would fall back to software rendering, and anything without
  WebGL, get a still ember glow instead.
- With reduced motion turned on, one still frame is drawn and nothing animates.

## Photos

The kitchen photo and the three-image reel are **placeholders from Unsplash**, loaded from Unsplash. Replace
them with the restaurant's own photography (put files in `assets/` and update the `src`/`srcset`). Any photo
that fails to load is removed cleanly, and if all three reel photos fail, the reel is removed.

| Where | Source |
| --- | --- |
| Kitchen | https://unsplash.com/photos/Xm8XD2b9AUs (Philipp Kämmerer) |
| Reel: steak | https://unsplash.com/photos/XY-V_o-ykuk (José Ignacio Pompé) |
| Reel: embers | https://unsplash.com/photos/glowing-hot-embers-and-coals-in-a-fire-5w2hjEJ06b0 (Alican Leblebici) |
| Reel: octopus | https://unsplash.com/photos/grilled-octopus-dishes--7ZtWjzo-68 (Elle Hughes) |

## Sources and things to confirm

From barra10.co.uk and public listings, October 2026. Items marked `VERIFY` in `index.html`:

- Address: Unit 16, Broadway Market, Tooting High Street, London SW17 0RL (one listing says SW17 0SP)
- Hours: Tue–Thu 17:30–22:00, Fri 17:30–23:00, Sat 12:00–23:00, Sun & Mon closed
- Steak nights (dated September 2026): Tue & Wed flank £15; Thu steaks to share £33; Sat before 18:00 steaks to share £33
- 13.5% service charge
- Team: Dani Cives (founder, chef patron), Marion (co-owner, front of house), plus grill chef, FOH supervisor, kitchen porter and ceviche master
- WhatsApp number +44 7466 305313 (from a public listing, not the restaurant's own site)
- Booking rules: up to eight per table; tables held about 1.5 hours on busy nights
- Email barra10uk@gmail.com, phone 020 8617 0100, Instagram @barra10uk
