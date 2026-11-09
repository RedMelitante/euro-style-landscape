// Service pages (/services/<key>, UPDATE-5-SITE.md §2): one template, src/pages/services/[service].astro,
// and this data, pulled from the service-*.dc.html designs. The order of `servicePages` is the order
// everywhere: header dropdown, footer, Services jump links and each page's "Other services".
import data from '../data/service-pages.json';
import type { IconName } from '../components/Icon.astro';

type Photo = { src: string; alt: string };

export type ServicePage = {
  key: string;
  /** Name in menus, footer and "Other services" ("Commercial services"). */
  menu: string;
  /** Breadcrumb and page name ("Commercial property services"). */
  name: string;
  serviceType: string;
  title: string;
  description: string;
  /** Meta description while NEW_CLIENT_OFFER_ON is false, when `description` mentions the offer (Cleanups). */
  descriptionNoOffer?: string;
  hero: {
    eyebrow: string;
    h1: string;
    lede: string;
    cta: string;
    checks: string[];
  } & (
    | { type: 'mosaic'; photos: Photo[]; label: string }
    | { type: 'panel'; title: string; items: { icon: IconName; title: string; text: string }[] }
  );
  /** NEW CLIENT OFFER hero pill and band (Cleanups), shown while NEW_CLIENT_OFFER_ON is true. */
  offer: boolean;
  items: { kicker: string; h2: string; side: string; cards: ({ title: string; text: string } & ({ src: string; alt: string } | { icon: IconName }))[] };
  process: { kicker: string; h2: string; steps: { n: string; title: string; text: string }[] };
  /** Hidden when null (Snow removal: no photos yet). */
  work: null | {
    h2: string;
    beforeAfter: null | { title: string; text: string; before: string; after: string; beforeSrc: string; afterSrc: string; beforeLabel: string; afterLabel: string; ratio: string };
    gallery: (Photo & { caption: string })[];
  };
  why: { kicker: string; h2: string; points: { title: string; text: string }[] };
  /** Answers are trusted HTML (entities escaped). `offer` items show only while NEW_CLIENT_OFFER_ON is true. */
  faq: { h2: string; items: { q: string; a: string; offer?: boolean }[] };
  /** `service` / `propertyType` are preselected in the quote form. */
  quote: { kicker: string; h2: string; lede: string; service: string | null; propertyType: string | null };
  townsTitle: string;
};

export const servicePages = data as ServicePage[];

export const serviceHref = (key: string) => `/services/${key}`;

/** Hidden `source` value of a service page's quote form; /api/lead accepts only these. */
export const serviceSource = (key: string) => `service-${key}`;
export const SERVICE_SOURCES = servicePages.map((s) => serviceSource(s.key));
