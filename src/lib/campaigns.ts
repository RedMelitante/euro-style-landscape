// Settings shared by the ad campaign pages in src/pages/lp/ and by /api/lead.

/** "First month free" offer on /lp/landscape-cleanup-quote. Stays off until the client confirms it in writing. */
export const OFFER_ON = false;

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
