// Settings shared by the ad campaign pages in src/pages/lp/ and by /api/lead, plus the new client
// offer switch that the main site follows too.

/** "First month free" offer on /lp/landscape-cleanup-quote. Stays off until the client confirms it in writing. */
export const OFFER_ON = false;

/**
 * New client special: 20% off the first cleanup or refresh, on all eight campaign pages (matches the ads),
 * and on Home, Services, Contact and the service-area town pages (src/components/offer/).
 * Set to false when the client ends it after the season: every offer piece and the offer FAQ disappear,
 * the pages go back to their regular wording, and the forms send `offer: none`.
 */
export const NEW_CLIENT_OFFER_ON = true;

/** The offer's terms on the main site and town pages (Home, Services, Contact: UPDATE-4-SITE.md §4). */
export const NEW_CLIENT_OFFER_TERMS =
  '*New clients only. Valid on your first property cleanup, leaf cleanup, landscape cleanup or property refresh with Euro Style Landscape.';

/** Hidden `offer` value the lead forms send while the new client offer is on (shown in the GoHighLevel note). */
export const NEW_CLIENT_OFFER_CODE = 'new-client-20-off';

/** Value of the hidden `source` field on each lead page. Other values are ignored by /api/lead. */
export const CAMPAIGN_SOURCES = [
  'fb-fall-cleanup-landing',
  'fb-leaf-cleanup-landing',
  'fb-fall-yard-cleanup-landing',
  'fb-rebuild-refresh-landing',
] as const;

/** Service options on the campaign forms, accepted by /api/lead alongside the main site's list. */
export const CAMPAIGN_SERVICES = [
  'Fall property cleanup',
  'Lawn mowing & maintenance',
  'Aeration & fertilization',
  'Planting & bed refresh',
  'Other',
  'One-time leaf cleanup',
  'Seasonal leaf cleanups',
  'Leaf + bed cleanup',
  'Full fall property cleanup',
  'Not sure yet',
  'Fall yard cleanup',
  'Leaf & debris cleanup',
  'Landscape bed refresh',
  'Final mow & aeration',
  'Ongoing maintenance',
  'Paver patio',
  'Retaining wall',
  'Outdoor kitchen',
  'Fire pit & seating wall',
  'Decks',
  'Full backyard design',
  'Fall cleanup',
  'Planting & landscape install',
  'Garden bed refresh',
  'Lawn maintenance',
  'Fencing & gates',
] as const;
