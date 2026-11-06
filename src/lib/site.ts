// Contact details used across the site (HANDOFF §7).
export const PHONE_DISPLAY = '(732) 803-9646';
export const PHONE_HREF = 'tel:+17328039646';
export const EMAIL = 'seannachajski@eurostylelandscape.com';
export const LOCATION = 'Sayreville, NJ 08872';
export const SERVICE_AREA = 'Based in Sayreville, NJ · serving Middlesex County';

export type NavKey = 'home' | 'about' | 'services' | 'work' | 'contact' | 'none';

export const NAV: { key: NavKey; href: string; label: string }[] = [
  { key: 'home', href: '/', label: 'Home' },
  { key: 'about', href: '/about', label: 'About us' },
  { key: 'services', href: '/services', label: 'Services' },
  { key: 'work', href: '/our-work', label: 'Our Work' },
  { key: 'contact', href: '/contact', label: 'Contact' },
];

// Quote form budget options (HANDOFF §6). Service options live in services.json.
export const TIMELINES = ['Right now', 'Just looking'] as const;

/** Quote form "Property type" (UPDATE-4-SITE.md §5). Required on the main site's forms. */
export const PROPERTY_TYPES = ['Home', 'Commercial property'] as const;

export const BUDGETS = ['Under $5k', '$5k – $15k', '$15k – $30k', '$30k+', 'Not sure yet'] as const;
