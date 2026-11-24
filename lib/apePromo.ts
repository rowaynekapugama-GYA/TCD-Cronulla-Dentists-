/**
 * The Anxious Patient Experience (TM) launch promotion: shared rules for the
 * homepage banner and the Book online pop-up panel.
 *
 * Everything date-related runs in the visitor's browser against Sydney time, so
 * the promotion starts and stops on the right day without a rebuild. The same
 * rules are also written out as a tiny inline script (bannerBootScript) that
 * runs before the banner is painted, so it never flashes or shifts the page.
 */
import { SITE_CONFIG } from '@/site.config';

export type ApePromo = typeof SITE_CONFIG.apePromo;
export type PromoPlacement = 'banner' | 'book-now-tab' | 'ape-page' | 'homepage-link';

/** localStorage key: the time (ms) until which the dismissed banner stays hidden. */
export const DISMISS_KEY = 'tcd-ape-banner-hidden-until';
export const DISMISS_DAYS = 7;

/** The APE address with this placement's UTM tags, unless the link already carries its own. */
export function promoHref(link: string, placement: PromoPlacement): string {
  const base = link || SITE_CONFIG.ape.url;
  if (/[?&]utm_/i.test(base)) return base;
  const tags = `utm_source=cronulla-website&utm_medium=referral&utm_campaign=ape-launch&utm_content=${placement}`;
  return `${base}${base.includes('?') ? '&' : '?'}${tags}`;
}

/** Today's date in Sydney as YYYY-MM-DD. */
export function sydneyToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

const isDate = (d: unknown): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);

/** Inside the promotion window (dates inclusive; a blank date means no limit on that side). */
export function inWindow(p: Pick<ApePromo, 'startDate' | 'endDate'>, today: string): boolean {
  if (isDate(p.startDate) && today < p.startDate) return false;
  if (isDate(p.endDate) && today > p.endDate) return false;
  return true;
}

/** Panel wording: "opening 2 December ..." before openDate, "now available ..." from it. */
export function panelTail(p: ApePromo, today: string): string {
  return isDate(p.openDate) && today < p.openDate ? p.panelBefore : p.panelAfter;
}

/** Push the click to Google Tag Manager's dataLayer. No new tags are loaded. */
export function trackPromoClick(placement: PromoPlacement) {
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: 'ape_promo_click', placement });
  } catch {
    /* tracking must never break the link */
  }
}

/** Should the banner show in this browser right now? Used by the client component. */
export function bannerShouldShow(p: ApePromo, now: Date = new Date()): boolean {
  if (!p.bannerEnabled || !inWindow(p, sydneyToday(now))) return false;
  try {
    const until = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
    if (until && now.getTime() < until) return false;
  } catch {
    /* storage blocked: show the banner */
  }
  return true;
}

/**
 * The same check as bannerShouldShow, as a self-contained inline script. It sets
 * <html data-ape-promo="on"> before the banner is parsed, and the CSS only shows
 * the banner (and reserves its height) when that attribute is present.
 */
export function bannerBootScript(p: ApePromo): string {
  const cfg = JSON.stringify({ s: p.startDate || '', e: p.endDate || '', k: DISMISS_KEY });
  return `(function(){try{var c=${cfg};var t=new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());var d=/^\\d{4}-\\d{2}-\\d{2}$/;if(d.test(c.s)&&t<c.s)return;if(d.test(c.e)&&t>c.e)return;var u=0;try{u=Number(localStorage.getItem(c.k)||0)}catch(x){}if(u&&Date.now()<u)return;document.documentElement.setAttribute('data-ape-promo','on')}catch(x){}})();`;
}
