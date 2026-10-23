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
export const APE_OG_IMAGE = { src: '/images/ape/social-share.jpg', width: 1200, height: 630, alt: 'The Anxious Patient Experience at The Cronulla Dentists' };
