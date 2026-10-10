/**
 * Barra10: all site content lives in this file.
 *
 * Anything marked `// VERIFY` is a placeholder or has not been confirmed with
 * the venue. Check every one before this goes live.
 *
 * Images: every photo is a free-licence Unsplash placeholder (sources are also
 * listed in the README). To swap in the venue's own photos, drop the files in
 * `public/images/` and replace the `src` with `local('images/your-file.jpg')`.
 */

const base = import.meta.env.BASE_URL

/** Path to a file in /public, respecting the configured `base`. */
export const local = (path: string) => `${base}${path.replace(/^\//, '')}`

/** Unsplash download endpoint for a photo id (sized via `?w=` at render time). */
const unsplash = (id: string) => `https://unsplash.com/photos/${id}/download`

export type SiteImage = {
  src: string
  alt: string
  /** Photographer credit, for placeholders. */
  credit?: string
  /** Original source page, for placeholders. */
  source?: string
}

/* -------------------------------------------------------------------------- */
/* Venue                                                                       */
/* -------------------------------------------------------------------------- */

export const venue = {
  name: 'Barra10',
  cuisine: 'Argentinian grill',
  tagline: 'Argentine fire. Tooting Broadway.',
  intro: 'Chargrilled steaks, empanadas and Malbec. Lunch through late, inside Tooting Broadway Market.',
  address: {
    unit: 'Unit 16', // VERIFY
    building: 'Tooting Broadway Market', // VERIFY
    street: 'Tooting High St', // VERIFY
    city: 'London',
    postcode: 'SW17 0RL', // VERIFY
  },
  phone: {
    display: '020 7946 0000', // VERIFY placeholder (Ofcom-reserved fictional number)
    tel: '+442079460000', // VERIFY placeholder
  },
  email: 'hola@barra10.example', // VERIFY placeholder
  instagram: {
    handle: '@barra10', // VERIFY placeholder
    url: 'https://www.instagram.com/barra10/', // VERIFY placeholder
  },
  tube: {
    station: 'Tooting Broadway',
    line: 'Northern line',
    walk: 'A short walk from the tube', // VERIFY exact walking time
  },
  credit: { label: 'Site by AlexWilder-Dev', url: 'https://github.com/AlexWilder-Dev' },
}

export const addressLines = [
  `${venue.address.unit}, ${venue.address.building}`,
  venue.address.street,
  `${venue.address.city} ${venue.address.postcode}`,
]

export const addressOneLine = `${venue.address.unit}, ${venue.address.building}, ${venue.address.street}, ${venue.address.city} ${venue.address.postcode}`

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${venue.name}, ${venue.address.building}, ${venue.address.street}, ${venue.address.city} ${venue.address.postcode}`,
)}`

/* -------------------------------------------------------------------------- */
/* Opening hours                                                               */
/* `day` uses JS numbering: 0 = Sunday … 6 = Saturday. Times are 24h, London.  */
/* A close time at or before the open time means "past midnight".              */
/* -------------------------------------------------------------------------- */

export type Session = { open: string; close: string }
export type DayHours = { day: number; label: string; session: Session | null }

export const hours: DayHours[] = [
  { day: 1, label: 'Monday', session: { open: '12:00', close: '22:00' } }, // VERIFY
  { day: 2, label: 'Tuesday', session: { open: '12:00', close: '22:00' } }, // VERIFY
  { day: 3, label: 'Wednesday', session: { open: '12:00', close: '22:00' } }, // VERIFY
  { day: 4, label: 'Thursday', session: { open: '12:00', close: '23:00' } }, // VERIFY
  { day: 5, label: 'Friday', session: { open: '12:00', close: '00:00' } }, // VERIFY
  { day: 6, label: 'Saturday', session: { open: '12:00', close: '00:00' } }, // VERIFY
  { day: 0, label: 'Sunday', session: { open: '12:00', close: '21:00' } }, // VERIFY
]

export const timeZone = 'Europe/London'

/* -------------------------------------------------------------------------- */
/* Hero + fire story                                                           */
/* -------------------------------------------------------------------------- */

export const hero = {
  label: 'Bienvenidos',
  ctaPrimary: 'Book a table',
  ctaSecondary: 'See the menu',
}

export const fireStory = {
  label: 'El fuego',
  title: 'From charcoal to plate',
  beats: [
    {
      key: 'charcoal',
      step: '01',
      label: 'Carbón',
      word: 'Charcoal',
      line: 'It starts low and slow: coals burned down to a steady glow.',
      image: {
        src: unsplash('5w2hjEJ06b0'),
        alt: 'Glowing embers and coals',
        credit: 'Alican Leblebici',
        source: 'https://unsplash.com/photos/glowing-hot-embers-and-coals-in-a-fire-5w2hjEJ06b0',
      },
    },
    {
      key: 'flame',
      step: '02',
      label: 'Fuego',
      word: 'Flame',
      line: 'Then the parrilla does the talking.',
      image: {
        src: unsplash('D9MDpAjlJ6k'),
        alt: 'Orange flames against a black background',
        credit: 'Martin Adams',
        source: 'https://unsplash.com/photos/D9MDpAjlJ6k',
      },
    },
    {
      key: 'plate',
      step: '03',
      label: 'Al plato',
      word: 'Plate',
      line: 'Off the grill, onto your plate. No detours.',
      image: {
        src: unsplash('O67LZfeyYBk'),
        alt: 'Sliced medium-rare steak on a white plate',
        credit: 'Jason Leung',
        source: 'https://unsplash.com/photos/O67LZfeyYBk',
      },
    },
  ],
} satisfies {
  label: string
  title: string
  beats: { key: string; step: string; label: string; word: string; line: string; image: SiteImage }[]
}

/* -------------------------------------------------------------------------- */
/* Menu (all items, descriptions and prices are mock data)                     */
/* -------------------------------------------------------------------------- */

/** `label` renders as a small caption before the amount, e.g. "Glass £8.50". */
export type Price = { amount: number; label?: string }
export type MenuItem = {
  name: string
  english?: string
  description: string
  prices: Price[]
  tag?: string
}
export type MenuCategory = {
  id: string
  label: string
  english: string
  blurb: string
  image: SiteImage
  items: MenuItem[]
}

export const currency = 'GBP'

export const menu: MenuCategory[] = [
  {
    id: 'parrilla',
    label: 'A la parrilla',
    english: 'From the grill',
    blurb: 'Chargrilled steaks with chimichurri. Tell us how you like it.', // VERIFY
    image: {
      src: unsplash('Xm8XD2b9AUs'),
      alt: 'Steak on a charcoal grill with flames',
      credit: 'Philipp Kämmerer',
      source: 'https://unsplash.com/photos/Xm8XD2b9AUs',
    },
    items: [
      { name: 'Bife de chorizo', english: 'Sirloin', description: 'Sirloin off the grill, chimichurri on the side.', prices: [{ amount: 26 }] }, // VERIFY
      { name: 'Ojo de bife', english: 'Ribeye', description: 'Ribeye with a proper char. Rich, juicy, generous.', prices: [{ amount: 29 }] }, // VERIFY
      { name: 'Entraña', english: 'Skirt steak', description: 'Loose-grained and full of flavour. Best jugoso.', prices: [{ amount: 22 }] }, // VERIFY
      { name: 'Vacío', english: 'Flank', description: 'Crisp edges, tender middle, sliced to share.', prices: [{ amount: 23 }] }, // VERIFY
      { name: 'Parrillada para dos', english: 'Mixed grill for two', description: 'A board of cuts and chorizo off the grill, with sides.', prices: [{ amount: 62 }], tag: 'To share' }, // VERIFY
    ],
  },
  {
    id: 'picar',
    label: 'Para picar',
    english: 'To pick at',
    blurb: 'Small plates for the table while the grill gets going.', // VERIFY
    image: {
      src: unsplash('EGmwwDzme6s'),
      alt: 'Empanadas being folded by hand',
      credit: 'Kristina Tripkovic',
      source: 'https://unsplash.com/photos/EGmwwDzme6s',
    },
    items: [
      { name: 'Empanadas', english: 'Ask for today’s fillings', description: 'Golden pastry parcels. One is never enough.', prices: [{ amount: 4.5, label: 'Each' }, { amount: 12, label: 'Three' }] }, // VERIFY
      { name: 'Choripán', english: 'Chorizo roll', description: 'Grilled chorizo in crusty bread with chimichurri.', prices: [{ amount: 9.5 }] }, // VERIFY
      { name: 'Ox cheek nuggets', english: 'Crispy bites', description: 'Tender ox cheek, crumbed and fried crisp.', prices: [{ amount: 10 }] }, // VERIFY
    ],
  },
  {
    id: 'mar',
    label: 'Del mar',
    english: 'From the sea',
    blurb: 'Not everything here is beef.', // VERIFY
    image: {
      src: unsplash('-7ZtWjzo-68'),
      alt: 'Grilled octopus dishes',
      credit: 'Elle Hughes',
      source: 'https://unsplash.com/photos/grilled-octopus-dishes--7ZtWjzo-68',
    },
    items: [
      { name: 'Pulpo a la parrilla', english: 'Grilled octopus', description: 'Tender, charred at the edges, finished simply.', prices: [{ amount: 18 }] }, // VERIFY
      { name: 'Ceviche', english: 'Citrus-cured fish', description: 'Bright, sharp and cold. The perfect foil to the grill.', prices: [{ amount: 14 }] }, // VERIFY
    ],
  },
  {
    id: 'postres',
    label: 'Postres',
    english: 'Desserts',
    blurb: 'Save room. Seriously.', // VERIFY
    image: {
      src: unsplash('1AO-fS1eGAY'),
      alt: 'A scoop of ice cream',
      credit: 'Ellie Enchantée',
      source: 'https://unsplash.com/photos/1AO-fS1eGAY',
    },
    items: [
      { name: 'Helado de dulce de leche', english: 'Dulce de leche ice cream', description: 'Rich, slow caramel flavour. The classic way to finish.', prices: [{ amount: 7 }] }, // VERIFY
    ],
  },
  {
    id: 'bebidas',
    label: 'Bebidas',
    english: 'Drinks',
    blurb: 'Malbec first. Then whatever you fancy.', // VERIFY
    image: {
      src: unsplash('dR8t0L8YXsI'),
      alt: 'A glass of red wine',
      credit: 'Unsplash',
      source: 'https://unsplash.com/photos/clear-wine-glass-with-red-wine-dR8t0L8YXsI',
    },
    items: [
      { name: 'Malbec', english: 'By the glass or bottle', description: 'Argentina’s signature red. Made for steak.', prices: [{ amount: 8.5, label: 'Glass' }, { amount: 34, label: 'Bottle' }] }, // VERIFY
      { name: 'Argentinian wines', english: 'Reds, whites & rosé', description: 'A short list from across Argentina. Ask what’s open.', prices: [{ amount: 30, label: 'Bottles from' }] }, // VERIFY
      { name: 'Cócteles', english: 'Cocktails', description: 'Classics and house twists, shaken late.', prices: [{ amount: 11 }] }, // VERIFY
      { name: 'Cerveza', english: 'Beer', description: 'Cold lager and bottles.', prices: [{ amount: 5.5 }] }, // VERIFY
      { name: 'Café', english: 'Coffee', description: 'Espresso, cortado, the works.', prices: [{ amount: 3 }] }, // VERIFY
    ],
  },
]

/* -------------------------------------------------------------------------- */
/* ¿Cómo lo querés? Doneness                                                   */
/* Core temperatures are general cooking guides, not venue specifications.    */
/* -------------------------------------------------------------------------- */

export const doneness = {
  label: '¿Cómo lo querés?',
  title: 'How do you like it?',
  stops: [
    { key: 'vuelta', name: 'Vuelta y vuelta', english: 'Blue / very rare', temp: 48, line: 'One quick turn each side. Charred outside, cool and crimson within.' },
    { key: 'jugoso', name: 'Jugoso', english: 'Rare to medium-rare', temp: 54, line: 'Juicy, warm and red at the heart. All the flavour, all the bite.' },
    { key: 'punto', name: 'A punto', english: 'Medium', temp: 60, line: 'Rosy pink through the middle. Right on point.' },
    { key: 'cocido', name: 'Cocido', english: 'Well done', temp: 71, line: 'Cooked all the way through. Still smoky from the grill.' },
  ],
}

/* -------------------------------------------------------------------------- */
/* Late night                                                                  */
/* -------------------------------------------------------------------------- */

export const lateNight = {
  label: 'De noche',
  title: 'Late, and getting later',
  line: 'Malbec by the glass or bottle, cocktails and cold beer. Lunch runs through late.', // VERIFY
  marquee: ['Malbec', 'Cócteles', 'Cerveza', 'Vino argentino', 'Café'],
  cards: [
    {
      key: 'malbec',
      title: 'Malbec',
      line: 'Deep, dark and made for the grill.',
      image: {
        src: unsplash('dR8t0L8YXsI'),
        alt: 'Red wine in a glass',
        credit: 'Unsplash',
        source: 'https://unsplash.com/photos/clear-wine-glass-with-red-wine-dR8t0L8YXsI',
      },
    },
    {
      key: 'cocktails',
      title: 'Cócteles',
      line: 'Stirred, shaken, poured late.',
      image: {
        src: unsplash('qhfe60zL8-Q'),
        alt: 'An old fashioned cocktail with orange peel on a black background',
        credit: 'Paige Ledford',
        source: 'https://unsplash.com/photos/clear-drinking-glass-with-orange-juice-qhfe60zL8-Q',
      },
    },
  ] satisfies { key: string; title: string; line: string; image: SiteImage }[],
}

/* -------------------------------------------------------------------------- */
/* Find us + booking                                                           */
/* -------------------------------------------------------------------------- */

export const findUs = {
  label: 'Encontranos',
  title: 'Inside Tooting Broadway Market',
  line: 'Head into the market from Tooting High St and follow the smoke.', // VERIFY entrance directions
}

export const booking = {
  label: 'Reservá',
  title: 'Book a table',
  line: 'Walk-ins welcome, booking recommended.',
  daysAhead: 14,
  slotMinutes: 30,
  /** Last booking this many minutes before close. */
  lastBookingBeforeClose: 90, // VERIFY
  maxParty: 12,
  /** Parties above this size are asked to call instead. */
  largeParty: 8, // VERIFY
}

export const nav = [
  { href: '#menu', label: 'Menu' },
  { href: '#doneness', label: 'Doneness' },
  { href: '#late', label: 'Late night' },
  { href: '#find', label: 'Find us' },
]
