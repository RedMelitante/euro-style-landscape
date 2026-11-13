// Google rating, review count and the six featured reviews (handoff update 6 §5), from src/data/reviews.json.
// Real reviews from the client's Google Business Profile, quoted word for word. No review/rating schema.
import data from '../data/reviews.json';

export interface Review {
  id: string;
  tag: string;
  name: string;
  /** Review text as HTML (entities and the ellipses that mark where it continues on Google). */
  html: string;
}

export const RATING = data.rating;
export const REVIEW_COUNT = data.count;
/** "Read all 87 on Google" / "Review on Google". A Google Maps search until the client sends the Business Profile reviews link. */
export const REVIEWS_URL = data.url;
export const STAR_SVG = data.star;
export const reviews: Review[] = data.reviews;
export const reviewById = (id: string) => {
  const r = reviews.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown review: ${id}`);
  return r;
};
