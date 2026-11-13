// JSON-LD helpers for the website pages. No review/rating markup (update 6 §5).
import faqData from '../data/faqs.json';
import { NEW_CLIENT_OFFER_ON } from './campaigns';
import { SAME_AS } from './site';

type Faq = { q: string; a: string; offer?: boolean };
const faqs = faqData as Record<string, Faq[]>;

/** The business, with the social profiles as sameAs. streetAddress stays out until the client approves publishing it. */
export function business(site: URL, extra: Record<string, unknown> = {}) {
  return {
    '@type': 'LandscapingBusiness',
    name: 'Euro Style Landscape',
    url: site.href,
    telephone: '+1-732-803-9646',
    address: { '@type': 'PostalAddress', addressLocality: 'Sayreville', addressRegion: 'NJ', postalCode: '08872', addressCountry: 'US' },
    sameAs: SAME_AS,
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
