import { SITE_CONFIG } from '@/site.config';

/**
 * The Anxious Patient Experience (TM) page lives at SITE_CONFIG.ape.route
 * (/dental-anxiety/). It is an ordinary dashboard service page (slug
 * "dental-anxiety") rendered by components/ape/ApeTemplate.tsx instead of the
 * standard ServiceTemplate. The old address /dental-anxiety-cronulla/ redirects
 * here (next.config.mjs).
 */
export const APE_ROUTE = SITE_CONFIG.ape.route;
export const APE_SLUG = APE_ROUTE.replace(/^\/+|\/+$/g, '');
/** The address the page had before 23 Oct 2026, kept for the redirect and the content fix. */
export const APE_OLD_SLUG = 'dental-anxiety-cronulla';
export const isApePage = (slug: string) => slug === APE_SLUG;

/** The APE build's share image (1200 x 630), used as the page's OG image unless the dashboard sets one. */
export const APE_OG_IMAGE = {
  src: '/images/ape/social-share-armchair.jpg',
  width: 1200,
  height: 630,
  alt: 'A soft cream armchair beside a small wooden table with a white vase of olive branches and a lit candle, in warm afternoon light',
};

/**
 * The "15 and over" line (APE website v1.13.0, Book Now page). Shown on /dental-anxiety/ only when
 * Site Settings > APE promotion > "Show the 15 and over line" is on. Off: Dr Lorna Gladwin has not
 * approved it here, and the APE home page itself has no age line.
 */
export const APE_AGE_LINE = "The Anxious Patient Experience is for patients aged 15 and over. Patients under 18 need a parent or guardian's name to book.";
