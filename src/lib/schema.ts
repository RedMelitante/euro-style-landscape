// JSON-LD helpers for the website pages. No review/rating markup (update 6 §5).
import faqData from '../data/faqs.json';
import townData from '../data/towns.json';
import { NEW_CLIENT_OFFER_ON } from './campaigns';
import { CITY, EMAIL, GBP_URL, GEO, HOURS, LICENSE_NO, POSTAL_CODE, REGION, SAME_AS, STREET_ADDRESS } from './site';

type Faq = { q: string; a: string; offer?: boolean };
const faqs = faqData as Record<string, Faq[]>;

/** The three counties plus the 19 town pages (src/data/towns.json). */
export const COUNTIES = ['Middlesex County, NJ', 'Monmouth County, NJ', 'Union County, NJ'];
export function areaServed() {
  return [
    ...COUNTIES.map((name) => ({ '@type': 'AdministrativeArea', name })),
    ...(townData as { place: string }[]).map((t) => ({ '@type': 'City', name: t.place })),
  ];
}

/**
 * The business: name and address as on the NJ HIC registration, hours as on the Google Business Profile,
 * the profile itself as hasMap and in sameAs. Still no review/rating markup (update 6 §5).
 */
export function business(site: URL, extra: Record<string, unknown> = {}) {
  const logo = new URL('/logo.webp', site).href;
  return {
    '@type': 'LandscapingBusiness',
    '@id': new URL('/#business', site).href,
    name: 'Eurostyle Landscape',
    legalName: 'SN Landscaping LLC',
    url: site.href,
    telephone: '+1-732-803-9646',
    email: EMAIL,
    logo,
    image: logo,
    address: {
      '@type': 'PostalAddress',
      streetAddress: STREET_ADDRESS,
      addressLocality: CITY,
      addressRegion: REGION,
      postalCode: POSTAL_CODE,
      addressCountry: 'US',
    },
    geo: { '@type': 'GeoCoordinates', latitude: GEO.latitude, longitude: GEO.longitude },
    hasMap: GBP_URL,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: HOURS.days.map((d) => `https://schema.org/${d}`),
        opens: HOURS.opens,
        closes: HOURS.closes,
      },
    ],
    areaServed: areaServed(),
    foundingDate: '2024',
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'license',
      name: 'New Jersey Home Improvement Contractor registration',
      identifier: LICENSE_NO,
      recognizedBy: { '@type': 'GovernmentOrganization', name: 'New Jersey Division of Consumer Affairs' },
    },
    sameAs: [...SAME_AS, GBP_URL],
    ...extra,
  };
}

/** FAQPage from the questions shown on the page (src/data/faqs.json, generated from the designs). */
export function faqPage(key: string) {
  const items = (faqs[key] ?? []).filter((f) => !f.offer || NEW_CLIENT_OFFER_ON);
  if (!items.length) throw new Error(`No FAQ for ${key}`);
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

/** BreadcrumbList from [name, path] pairs, starting after Home. */
export function breadcrumbs(site: URL, ...items: [string, string][]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [['Home', '/'] as [string, string], ...items].map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: new URL(path, site).href,
    })),
  };
}
