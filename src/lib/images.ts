import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/*.jpg', { eager: true });

/** Placeholder colour shown behind a photo while it loads (from the designs). */
const BG: Record<string, string> = {
  'side-patio.jpg': '#6F6556',
  'covered-patio-wall.jpg': '#66705C',
  'backyard-deck-progress.jpg': '#5A7354',
  'front-entry-after.jpg': '#6F6556',
  'raised-patio-design.jpg': '#6F6556',
  'stone-pillars-gate.jpg': '#8A8F92',
  'front-lawn-beds.jpg': '#5A7354',
  'front-lawn-tree.jpg': '#66705C',
  'backyard-after.jpg': '#4C6A4B',
  'deck-pavers-backyard.jpg': '#5A7354',
};
export const photoBg = (name: string) => BG[name] ?? '#4C6A4B';

/** Look up a project photo by file name, e.g. photo('side-patio.jpg'). */
export function photo(name: string): ImageMetadata {
  const file = files[`../assets/images/${name}`];
  if (!file) throw new Error(`Missing image: src/assets/images/${name}`);
  return file.default;
}
