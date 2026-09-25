/**
 * Image alt text — the single source for every image that is rendered in more
 * than one place (mega-menu cards, home/services tiles, the practice photos).
 *
 * Wording is from the client's SEO Implementation Brief v1.1 (24 Sep 2026) and
 * must be used verbatim. Service-page hero images keep their alt in
 * content/pages/<slug>.json (`image.alt`), which the Services mega-menu also
 * reads, so those are not duplicated here.
 */
export const IMAGE_ALT: Record<string, string> = {
  // Home page tiles (six) and Services hub tiles (three)
  '/images/tiles/general-dentistry-cronulla.jpg': 'Check-ups, Cleans and Everyday Dental Care',
  '/images/tiles/childrens-dentistry-cronulla.jpg': 'Children’s Dentistry in Cronulla',
  '/images/tiles/cosmetic-dentistry-cronulla.jpg': 'Lady smiling after a cosmetic surgery in Cronulla',
  '/images/tiles/dental-crowns-bridges-cronulla.jpg': 'Crowns & Bridges in Cronulla',
  '/images/tiles/dental-anxiety-cronulla.jpg': 'Family Dentistry in Cronulla',
  '/images/tiles/tooth-coloured-fillings-cronulla.jpg': 'Tooth Coloured Fillings in Cronulla',
  '/images/tiles/periodontal-treatment-cronulla.jpg': 'Periodontal Treatment in Cronulla',
  '/images/tiles/wisdom-teeth-removal-cronulla.jpg': 'Wisdom Teeth Removal in Cronulla',
  '/images/tiles/root-canal-therapy-cronulla.jpg': 'Root Canal Therapy in Cronulla',

  // About mega-menu cards, home page and About page
  '/images/menu-practice.jpg': 'Cronulla Dentists, 13 Cronulla Street',
  '/images/cronulla-beach.jpg': '13 Cronulla Street, Cronulla NSW',
  '/images/dentists.jpg': 'Dr Ram Nathwani and Dr Lorna Gladwin',
  '/images/services/dental-anxiety-cronulla.jpg': 'Dentist in Cronulla',
};

/** Alt text for an image path, or `fallback` when the brief has no wording for it. */
export function imageAlt(src: string, fallback = ''): string {
  return IMAGE_ALT[src] ?? fallback;
}
