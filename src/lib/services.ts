// Typed access to src/data/services.json, the single source for service copy
// (SERVICES-UPDATE.md). Edit the JSON, not the components.
import data from '../data/services.json';
import type { IconName } from '../components/Icon.astro';

export type ServiceItem = {
  id: string;
  title: string;
  text: string;
  /** Photo card when set; icon card otherwise. */
  image?: string;
  alt?: string;
  icon?: IconName;
  featured?: boolean;
  link?: { label: string; href: string };
};

export type ServiceGroup = {
  id: string;
  title: string;
  badge?: string;
  heading?: string;
  intro: string;
  image?: string;
  alt?: string;
  cta?: { label: string; href: string };
  items: ServiceItem[];
};

export const groups = data.groups as ServiceGroup[];
export const group = (id: string) => {
  const g = groups.find((x) => x.id === id);
  if (!g) throw new Error(`Missing service group: ${id}`);
  return g;
};

export const footerLinks = data.footerLinks;

const { _last, ...optionGroups } = data.quoteFormOptions;
/** Quote form <optgroup>s in order, then the final standalone option. */
export const quoteOptionGroups = Object.entries(optionGroups) as [string, string[]][];
export const quoteLastOption = _last;
/** Every valid value of the form's `service` field (validated server-side). */
export const quoteServiceValues = [...quoteOptionGroups.flatMap(([, opts]) => opts), _last];
