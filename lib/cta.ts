import { SITE_CONFIG, isOpen, telHref } from '@/site.config';

/**
 * Can people book yet?
 *
 * Deliberately separate from `isOpen()`. The practice opens in late November,
 * but bookings for those first weeks open earlier. Tying the CTAs to `mode`
 * would force a choice between two wrong answers: keep "Register your interest"
 * when real bookings are available, or flip the whole site to "Now taking new
 * patients" / open-mode copy before the doors are actually open. Keying the CTAs
 * off the booking link instead means: booking link set → Book online + Call,
 * while the opening-date messaging stays exactly as it is.
 */
export const bookingOpen = () => Boolean(SITE_CONFIG.bookingUrl) || isOpen();

/**
 * Primary conversion path.
 *  booking link set → "Book online" → Core Practice (new tab)
 *  otherwise        → "Register your interest" → /register/ (the old EOI flow)
 */
export function primaryCta() {
  if (bookingOpen()) {
    return {
      label: 'Book online',
      /** Nav bar on narrow screens. */
      short: 'Book',
      href: SITE_CONFIG.bookingUrl || '/contact/',
      external: Boolean(SITE_CONFIG.bookingUrl),
    };
  }
  return { label: 'Register your interest', short: 'Register', href: '/register/', external: false };
}

/** The phone is the second way to book, shown wherever bookings are open. */
export function secondaryCta() {
  if (!bookingOpen()) return null;
  return { label: `Call ${SITE_CONFIG.phone}`, short: 'Call', href: telHref(), external: false };
}

/** Where "book online" links in running copy resolve to. */
export function ctaHref() {
  return primaryCta().href;
}

export function heroBadge() {
  return isOpen() ? 'Now taking new patients' : `Opening ${SITE_CONFIG.openingDateLabel}`;
}

export type BookingLocation = { name: string; address: string; url: string; note: string };

/**
 * The practices offered in the "Book online" pop-up, with blank links and notes
 * filled in. Returns an empty list (no pop-up) unless the chooser is switched on
 * and at least two locations have a booking link.
 */
export function bookingLocations(): BookingLocation[] {
  if (!SITE_CONFIG.bookingChooser || !bookingOpen()) return [];
  const list = (SITE_CONFIG.bookingLocations || [])
    .map((l, i) => ({
      name: l.name,
      address: l.address || '',
      url: l.url || (i === 0 ? SITE_CONFIG.bookingUrl : ''),
      note: l.note || (i === 0 && !isOpen() ? `Opening ${SITE_CONFIG.openingDateLabel}` : ''),
    }))
    .filter((l) => l.name && l.url);
  return list.length > 1 ? list : [];
}
