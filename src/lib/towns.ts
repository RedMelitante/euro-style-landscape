// Service-area town pages (/service-areas/<slug>): SEO values here (src/data/towns.json); each page body is
// src/components/pages/town-<slug>.astro (from the service-area-*.dc.html designs, update 6-7).
import data from '../data/towns.json';

export type Town = {
  slug: string;
  /** "South Amboy" */
  name: string;
  /** "South Amboy, NJ": breadcrumb and JSON-LD areaServed. */
  place: string;
  /** "Middlesex County", shown on /service-areas. */
  county: string;
  title: string;
  description: string;
};

/** In footer order (UPDATE-4-SITE.md §2). */
export const towns = data as Town[];

export const townHref = (slug: string) => `/service-areas/${slug}`;

/** Hidden `source` value of a town page's quote form; /api/lead accepts only these. */
export const townSource = (slug: string) => `service-area-${slug}`;
export const TOWN_SOURCES = towns.map((t) => townSource(t.slug));
