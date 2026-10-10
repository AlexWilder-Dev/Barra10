import { addressLines, hours, venue } from '../data/site'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** schema.org Restaurant data, built from site.ts so it never drifts from the page. */
export function injectStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: venue.name,
    servesCuisine: 'Argentinian',
    telephone: venue.phone.tel,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${addressLines[0]}, ${venue.address.street}`,
      addressLocality: venue.address.city,
      postalCode: venue.address.postcode,
      addressCountry: 'GB',
    },
    openingHoursSpecification: hours
      .filter((h) => h.session)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: DAYS[h.day],
        opens: h.session!.open,
        closes: h.session!.close,
      })),
    acceptsReservations: true,
  }
  const el = document.createElement('script')
  el.type = 'application/ld+json'
  el.textContent = JSON.stringify(data)
  document.head.appendChild(el)
}
