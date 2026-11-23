// Service pages (/services/<key>): SEO values here (src/data/service-pages.json); each page body is
// src/components/pages/service-<key>.astro. The order of `servicePages` is the order everywhere:
// header dropdown, footer, Services page groups and each page's "Other services". Since update 10 the
// 14 services come in two groups, Build then Care, shown as columns / headings in the menus and footer.
import data from '../data/service-pages.json';

export type ServicePage = {
  key: string;
  /** Name in menus, footer and "Other services" ("Commercial services"). */
  menu: string;
  /** Menu and footer group: Build (construction work) or Care (maintenance and services). */
  group: 'build' | 'care';
  /** Breadcrumb and JSON-LD name ("Commercial property services"). */
  name: string;
  serviceType: string;
  /** 'counties': JSON-LD areaServed is the three counties instead of the town list (Landscape lighting, Drainage). */
  areaServed?: 'counties';
  title: string;
  description: string;
  /** Meta description while NEW_CLIENT_OFFER_ON is false, when `description` mentions the offer (Cleanups). */
  descriptionNoOffer?: string;
};

export const servicePages = data as ServicePage[];

/** The services by group, in menu order, for the header dropdown, mobile menu and footer. */
export const serviceGroups: { key: ServicePage['group']; label: string; pages: ServicePage[] }[] = [
  { key: 'build', label: 'Build', pages: servicePages.filter((s) => s.group === 'build') },
  { key: 'care', label: 'Care', pages: servicePages.filter((s) => s.group === 'care') },
];

export const serviceHref = (key: string) => `/services/${key}`;

/** Hidden `source` value of a service page's quote form; /api/lead accepts only these. */
export const serviceSource = (key: string) => `service-${key}`;
export const SERVICE_SOURCES = servicePages.map((s) => serviceSource(s.key));
