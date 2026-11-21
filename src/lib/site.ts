// Contact details used across the site (HANDOFF §7).
export const PHONE_DISPLAY = '(732) 803-9646';
export const PHONE_HREF = 'tel:+17328039646';
export const EMAIL = 'seannachajski@eurostylelandscape.com';
/** Street address, approved for the website on 2026-11-21. It stays hidden on the Google Business Profile
 * (service-area business), so don't add it there. Matches the NJ HIC registration and GoHighLevel. */
export const STREET_ADDRESS = '66 Douglas St';
export const CITY = 'Sayreville';
export const REGION = 'NJ';
export const POSTAL_CODE = '08872';
/** Full address shown in footers, the contact page and the legal pages. */
export const LOCATION = `${STREET_ADDRESS}, ${CITY}, ${REGION} ${POSTAL_CODE}`;
export const SERVICE_AREA = 'Based in Sayreville, NJ · serving Middlesex County';
/** Map pin for the street address (Google Maps), used in the JSON-LD `geo`. */
export const GEO = { latitude: 40.4649374, longitude: -74.3412849 };

/** NJ home improvement contractor registration (Division of Consumer Affairs, active, expires 2027-03-31).
 * NJ law requires it on all advertisements. */
export const LICENSE_NO = '13VH14095400';
export const LICENSE = `NJ HIC #${LICENSE_NO}`;

/** Opening hours as on the Google Business Profile (every day, 7 AM to 10 PM). */
export const HOURS = { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '07:00', closes: '22:00' };

/**
 * The Google Business Profile (Maps CID link). The address links here, in a new tab (UPDATE-5-SITE.md §5):
 * footer, the "Areas we serve" tiles, the contact strip on town and service pages, and the privacy policy.
 */
export const GBP_URL = 'https://maps.google.com/?cid=15316004437343488950';
export const MAPS_URL = GBP_URL;

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
