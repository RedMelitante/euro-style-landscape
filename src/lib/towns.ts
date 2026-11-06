// Service-area town pages (/service-areas/<slug>, UPDATE-4-SITE.md §2): one template,
// src/pages/service-areas/[town].astro, and this data, pulled from the service-area-*.dc.html
// designs. Paragraphs and FAQ answers may hold links to other town pages (trusted HTML).
import data from '../data/towns.json';

export type Photo = { src: string; alt: string };

export type Town = {
  slug: string;
  /** "South Amboy" */
  name: string;
  /** "South Amboy, NJ": breadcrumb and JSON-LD areaServed. */
  place: string;
  /** "Middlesex County" (UPDATE-4-SITE.md §2), shown on /service-areas. */
  county: string;
  title: string;
  description: string;
  hero: { eyebrow: string; h1: string; lede: string; check: string; photos: Photo[] };
  intro: { h2: string; paras: string[]; chipsTitle: string; chips: string[]; zips: string[] };
  services: { h2: string; photos: Photo[] };
  local: { kicker: string; h2: string; paras: string[]; points: { title: string; text: string }[] };
  work: (Photo & { caption: string })[];
  faq: { h2: string; first: { q: string; a: string } };
  /** Line under the phone number in the quote section, e.g. "Based next door in Sayreville, NJ 08872". */
  based: string;
};

/** In footer order (UPDATE-4-SITE.md §2). */
export const towns = data as Town[];

export const townHref = (slug: string) => `/service-areas/${slug}`;

/** Hidden `source` value of a town page's quote form; /api/lead accepts only these. */
export const townSource = (slug: string) => `service-area-${slug}`;
export const TOWN_SOURCES = towns.map((t) => townSource(t.slug));
