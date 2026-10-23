import { navServicePages, getPage, isLive, allPages, posts, BLOG_ROUTE } from '@/lib/content';
import type { ServicePage, ServicesHubPage } from '@/content/types';
import { featureOn } from '@/site.config';
import { imageAlt } from '@/lib/image-alt';
import { APE_ROUTE } from '@/lib/ape';

export interface NavLink {
  label: string;
  href: string;
  /** Mobile menu: list this link straight after Home instead of in its desktop position. */
  mobileFirst?: boolean;
}

/** The Anxious Patient Experience (TM) link, shown in the top menu after Contact and first in the mobile menu. */
const APE_LINK: NavLink = { label: 'The Anxious Patient Experience', href: APE_ROUTE, mobileFirst: true };
const APE_CARD = { image: '/images/ape/home-hero-calm-smile.webp', alt: 'A woman with long dark hair smiling warmly at home' };
export interface NavGroup {
  label: string;
  links: NavLink[];
}
export interface FeaturedService extends NavLink {
  image: string;
  alt: string;
}

const GROUPS: { key: ServicePage['category']; label: string }[] = [
  { key: 'general', label: 'General & Children' },
  { key: 'children', label: 'General & Children' },
  { key: 'cosmetic', label: 'Cosmetic' },
  { key: 'restorative', label: 'Restorative' },
  { key: 'gum', label: 'Gum Health' },
  { key: 'other', label: 'Sleep & Comfort' },
];

/** Services mega-menu, grouped, built from live content only. */
export function serviceGroups(): NavGroup[] {
  const pages = navServicePages();
  const map = new Map<string, NavLink[]>();
  for (const g of GROUPS) if (!map.has(g.label)) map.set(g.label, []);
  for (const p of pages) {
    const label = GROUPS.find((g) => g.key === (p.category || 'other'))!.label;
    map.get(label)!.push({ label: p.meta.title, href: p.meta.route });
  }
  return [...map.entries()].filter(([, l]) => l.length).map(([label, links]) => ({ label, links }));
}

/**
 * The image cards across the top of the Services mega-menu.
 * Order matters — edit this list to change what is featured.
 * Any slug whose feature flag is off is dropped automatically.
 *
 * `image` overrides the card thumbnail only; the service page keeps its own
 * image. Use it when a photo suits the small menu card but not the page.
 */
const FEATURED: { slug: string; image?: string }[] = [
  { slug: 'general-dentistry-cronulla' },
  { slug: 'childrens-dentistry-cronulla' },
  { slug: 'cosmetic-dentistry-cronulla' },
  { slug: 'teeth-whitening-cronulla' },
  { slug: 'dental-implants-cronulla' },
  { slug: 'dental-crowns-bridges-cronulla' },
];

export function featuredServices(): FeaturedService[] {
  return FEATURED.map(({ slug, image }) => {
    const p = getPage<ServicePage>(slug);
    if (!isLive(p.meta)) return null;
    return { label: p.meta.title, href: p.meta.route, image: image ?? p.image.src, alt: p.image.alt };
  }).filter((x): x is FeaturedService => Boolean(x));
}

/**
 * Drives the mega-menu footer line. Uses the client's own service list from the
 * Services Hub copy (15 items) rather than the page count — several pages cover
 * one service (the gum-health cluster) and some are not treatments at all
 * (Dental Anxiety), so the page count would overstate it.
 */
export function serviceCount(): number {
  const hub = getPage<ServicesHubPage>('services');
  return hub.serviceList.length;
}

/**
 * The pill nav. 'About' and 'Services' both open an image-card panel. The APE
 * link sits after Contact (before the phone number and Book online) and only
 * appears while the dental anxiety page is live.
 */
export function primaryNav(): NavLink[] {
  const links: NavLink[] = [
    { label: 'About', href: '/about/' },
    { label: 'Services', href: '/services/' },
    { label: 'Finances', href: '/finances/' },
    { label: 'Contact', href: '/contact/' },
  ];
  if (allPages().some((p) => isLive(p.meta) && p.meta.route === APE_ROUTE)) links.push(APE_LINK);
  return links;
}

/** Image cards in the About panel — same treatment as the Services panel. */
export function aboutFeatured(): FeaturedService[] {
  const cards: FeaturedService[] = [
    { label: 'The practice', href: '/about/', image: '/images/menu-practice.jpg', alt: imageAlt('/images/menu-practice.jpg') },
    { label: 'Meet the team', href: '/about/#meet-the-team', image: '/images/dentists.jpg', alt: imageAlt('/images/dentists.jpg') },
    { label: 'The Anxious Patient Experience™', href: APE_ROUTE, image: APE_CARD.image, alt: APE_CARD.alt },
    { label: 'Parking & getting here', href: '/parking-information/', image: '/images/cronulla-beach.jpg', alt: imageAlt('/images/cronulla-beach.jpg') },
  ];
  // Drop anything whose page is gated off.
  return cards.filter((c) => allPages().some((p) => isLive(p.meta) && c.href.split('#')[0] === p.meta.route));
}

export function footerLinks(): { label: string; links: NavLink[] }[] {
  const patients: NavLink[] = [
    { label: 'About the practice', href: '/about/' },
    { label: 'Finances & health funds', href: '/finances/' },
    { label: 'Payment plans', href: '/payment-plans/' },
    { label: 'Parking & getting here', href: '/parking-information/' },
    { label: 'The Anxious Patient Experience™', href: APE_ROUTE },
    { label: 'Contact', href: '/contact/' },
  ];
  if (featureOn('cdbs'))
    patients.splice(2, 0, { label: getPage('kids-gap-free-dentistry-cronulla').meta.title, href: '/kids-gap-free-dentistry-cronulla/' });
  // The blog link appears once the practice has published an article from the dashboard.
  if (posts().length) patients.splice(patients.length - 1, 0, { label: 'Dental advice and news', href: BLOG_ROUTE });
  return [{ label: 'Patients', links: patients }];
}

/** Ordered list of all live service links (for the services hub check-list). */
export function allServiceLinks(): NavLink[] {
  return navServicePages().map((p) => ({ label: p.meta.title, href: p.meta.route }));
}
