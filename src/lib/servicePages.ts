// Service pages (/services/<key>): SEO values here (src/data/service-pages.json); each page body is
// src/components/pages/service-<key>.astro. The order of `servicePages` is the order everywhere:
// header dropdown, footer, Services page groups and each page's "Other services".
import data from '../data/service-pages.json';

export type ServicePage = {
  key: string;
  /** Name in menus, footer and "Other services" ("Commercial services"). */
  menu: string;
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

export const serviceHref = (key: string) => `/services/${key}`;

/** Hidden `source` value of a service page's quote form; /api/lead accepts only these. */
export const serviceSource = (key: string) => `service-${key}`;
export const SERVICE_SOURCES = servicePages.map((s) => serviceSource(s.key));
