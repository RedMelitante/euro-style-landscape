// Contact details used across the site (HANDOFF §7).
export const PHONE_DISPLAY = '(732) 803-9646';
export const PHONE_HREF = 'tel:+17328039646';
export const EMAIL = 'seannachajski@eurostylelandscape.com';
export const LOCATION = 'Sayreville, NJ 08872';
export const SERVICE_AREA = 'Based in Sayreville, NJ · serving Middlesex County';

/**
 * "Sayreville, NJ 08872" links here, in a new tab (UPDATE-5-SITE.md §5): footer, the "Areas we serve" tiles,
 * the contact strip on town and service pages, and the privacy policy. Replace it with the client's Google
 * Business Profile share link when they send it. The ad landing pages keep the address as plain text.
 */
export const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Euro+Style+Landscape%2C+Sayreville%2C+NJ+08872';

export type NavKey = 'home' | 'about' | 'services' | 'commercial' | 'who' | 'work' | 'areas' | 'contact' | 'none';

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

/**
 * GoHighLevel chat widget (Sites → Chat Widget → Get code: the `data-widget-id` value). Public, like any
 * embed code. Empty = no chat anywhere. When set, it shows on the main site and town pages only, never on
 * ad landing pages (/lp/*, /free-design-consultation).
 */
export const GHL_CHAT_WIDGET_ID = '6aee2b493c83530a42d5c594';

/** Social profiles: footer icons and `sameAs` in the LandscapingBusiness JSON-LD (UPDATE-6-REDESIGN.md §6). */
export const SOCIAL = [
  { name: 'Facebook', href: 'https://www.facebook.com/p/EuroStyle-Landscape-61579931630985/' },
  { name: 'Instagram', href: 'https://www.instagram.com/eurostylelandscape' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@eurostylelandscape' },
  { name: 'YouTube', href: 'https://www.youtube.com/@eurostylelandscape' },
] as const;
export const SAME_AS = SOCIAL.map((s) => s.href);
