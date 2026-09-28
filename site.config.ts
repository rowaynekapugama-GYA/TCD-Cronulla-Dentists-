/**
 * SINGLE SOURCE OF TRUTH for The Cronulla Dentists website.
 * Every component reads contact details, hours, mode and feature flags from here.
 * Never hard-code any of these values inside a component.
 *
 * Since the dashboard (Payload at /admin) was added, the values below are the
 * DEFAULTS. Site Settings saved in the dashboard are written to
 * content/site-settings.json by scripts/pull-content.ts before every build and
 * merged over these defaults (see the bottom of this file). Edit here for the
 * fallback; edit in the dashboard for the live site.
 */
import overrides from './content/site-settings.json';

export type SiteMode = 'pre-opening' | 'open';

const DEFAULTS = {
  name: 'The Cronulla Dentists',
  legalName: 'The Cronulla Dentists', // TODO: full legal entity name + ABN for privacy policy
  domain: 'https://www.thecronulladentists.com.au',

  /** 'pre-opening' → EOI/register CTAs + countdown. 'open' → Book/Call CTAs. */
  mode: 'pre-opening' as SiteMode,
  /** Partial ISO date while only the month is confirmed — restore the full
   *  YYYY-MM-DD (and openingDateTime, which re-enables the countdown) once the
   *  client locks the exact day. */
  openingDate: '2026-11',
  openingDateTime: '', // empty = no confirmed day yet -> countdown hidden
  openingDateLabel: 'late November 2026',

  // ---- Contact (confirmed) ----
  phone: '(02) 8599 9815',
  phoneE164: '+61285999815',
  email: 'reception@thecronulladentists.com.au', // the ONLY public email
  address: {
    street: '13 Cronulla Street',
    suburb: 'Cronulla',
    state: 'NSW',
    postcode: '2230',
    country: 'AU',
  },
  geo: { lat: -34.0559, lng: 151.1522 }, // TODO: verify against final Google Maps pin

  /**
   * Logo lockup, used by the nav, the footer and the Dentist schema.
   * `src` is the file in /public; `width`/`height` are its intrinsic pixel size,
   * used for the aspect ratio only — update both if you swap in a differently
   * proportioned file. Rendered heights live in app/globals.css
   * (`.nav-brand img` / `.footer-logo img`) because they change per breakpoint.
   */
  logo: {
    src: '/images/logo-primary.jpg',
    width: 1400,
    height: 392,
  },
  /** Dashboard overrides for the two brand colours. Empty = the palette in app/globals.css. */
  colours: { navy: '', cyan: '' },

  // ---- TODO values (swap when supplied) ----
  /**
   * Core Practice online booking. Setting this is what switches every CTA on the
   * site from "Register your interest" to "Book online" + "Call" — see lib/cta.ts.
   * Clear it to go back to the expression-of-interest flow.
   */
  bookingUrl: 'https://www.corepractice.is/practices/tcd/the-cronulla-dentists#/',
  /**
   * "Book online" asks which practice first (client request 28 Sep 2026). A
   * leave-blank `url` means "use bookingUrl above"; a blank `note` on the first
   * location shows the opening wording while the practice is pre-opening.
   * Switch `bookingChooser` off to send Book online straight to bookingUrl again.
   */
  bookingChooser: true,
  bookingLocations: [
    { name: 'The Cronulla Dentists', address: '13 Cronulla Street, Cronulla', url: '', note: '' },
    { name: 'The Caringbah Dentists', address: '172A Willarong Rd, Caringbah', url: 'https://www.corepractice.is/practices/tcd/the-caringbah-dentists', note: '50 years in the Shire' },
  ] as { name: string; address: string; url: string; note: string }[],
  gtmId: '', // Optional GTM container ID (GTM-XXXXXXX). Separate from ga4Id below — leave blank unless a container is actually set up.
  /**
   * GA4 measurement ID. This is the gtag.js property, not a Tag Manager
   * container, so it loads on its own and does not need gtmId to be set.
   */
  ga4Id: 'G-XDZHHZLVYL',
  /** Meta (Facebook) Pixel ID. Loads only when set. */
  metaPixelId: '',
  /**
   * Keyless Google Maps embed resolved by the exact GBP name + address, so the
   * iframe shows the practice's own pin/listing card, not a bare address point.
   */
  mapEmbedUrl:
    'https://www.google.com/maps?q=' +
    encodeURIComponent('The Cronulla Dentists, 13 Cronulla Street, Cronulla NSW 2230') +
    '&output=embed',
  /** The practice's Google Business Profile share link (from the client). */
  gbpShareUrl: 'https://share.google/SLFCaIODkAf6DOcKH',
  /** Parking section on /parking-information/ — fill from the client's own knowledge of the site. Empty → section hidden. */
  parkingNotes: [] as string[],
  /** Shown at the top of the privacy policy once the client publishes it. Empty → hidden. */
  privacyLastUpdated: '',
  sameAs: {
    googleMaps: 'https://share.google/SLFCaIODkAf6DOcKH', // GBP share link from the client
    facebook: '', // TODO
    instagram: '', // TODO
  },

  // ---- Team (titles / AHPRA registration wording pending) ----
  team: [
    {
      id: 'ram',
      shortName: 'Dr Ram',
      fullName: 'Dr Ram Nathwani',
      givenName: 'Ram',
      familyName: 'Nathwani',
      title: 'Principal Dentist', // per the SEO strategy docs (Doc 03)
      image: '/images/team-ram.jpg',
      /** Public profile linked from the Person schema on /about/ (SEO brief v1.1). */
      sameAs: 'https://www.linkedin.com/in/ram-nathwani-3601a627b/',
      // The three fields below are drawn from the approved /about/ bio copy.
      alumniOf: 'University of Sydney',
      credentials: ['Bachelor of Dental Surgery, University of Sydney (2009)', 'Graduate Diploma in Implant Surgery, Charles Sturt University (2018)'],
      knowsAbout: ['General Dentistry', 'Prosthodontics', 'Endodontics', 'Dental Implants', 'Restorative Dentistry'],
      ahpra: '', // from the AHPRA public register, when the client supplies it
      bio: [] as string[], // filled from the dashboard; the About page copy is the fallback
      hidden: false,
    },
    {
      id: 'lorna',
      shortName: 'Dr Lorna',
      fullName: 'Dr Lorna Gladwin',
      givenName: 'Lorna',
      familyName: 'Gladwin',
      title: 'Principal Dentist', // per the SEO strategy docs (Doc 03)
      image: '/images/team-lorna.jpg',
      sameAs: '', // none supplied — omitted from the schema when empty
      alumniOf: 'University of Sheffield',
      credentials: ['Bachelor of Dental Surgery, University of Sheffield (2019)'],
      knowsAbout: ['Restorative Dentistry', 'Endodontics', 'Root Canal Therapy', 'General Dentistry', 'Dental Anxiety Care'],
      ahpra: '',
      bio: [] as string[],
      hidden: false,
    },
  ],
  /**
   * Full names in <meta> / schema. Turned ON per the SEO strategy docs (Doc 02
   * launch checklist #17, Doc 03 Schema 2), which require Person schema for both
   * practitioners; the names, photos and bios are already published on /about/.
   */
  teamNamesConfirmed: true,

  // ---- Sister practice ----
  sister: {
    name: 'The Caringbah Dentists',
    url: 'https://thecaringbahdentists.com.au',
    utm: '?utm_source=cronulla-site',
    heritage: '50 years in the Shire',
  },

  // ---- Hours (exact) ----
  hours: [
    { day: 'Monday', open: '09:00', close: '19:00', label: '9:00am to 7:00pm' },
    { day: 'Tuesday', open: '08:00', close: '17:00', label: '8:00am to 5:00pm' }, // open from 22 Sep 2026 client update
    { day: 'Wednesday', open: '08:00', close: '17:00', label: '8:00am to 5:00pm' },
    { day: 'Thursday', open: '08:00', close: '17:00', label: '8:00am to 5:00pm' },
    { day: 'Friday', open: '07:00', close: '15:00', label: '7:00am to 3:00pm' },
    { day: 'Saturday', open: null, close: null, label: 'Closed' },
    { day: 'Sunday', open: null, close: null, label: 'Closed' },
  ],
  /** The two marketing differentiators. */
  hooks: {
    lateMonday: 'Open until 7pm Mondays',
    earlyFriday: 'Early appointments from 7am Fridays',
  },

  // ---- Health funds / payment (ONLY these three) ----
  payment: ['nib preferred provider', 'HICAPS claimed on the spot', 'DentiCare payment plans'],

  // ---- Feature flags: build everything, ship it OFF ----
  features: {
    /** Emergency Dentistry page + all emergency language. OFF until client confirms. */
    emergency: false,
    /** Kids' Gap Free page + CDBS blocks on Children's/Finances. OFF until bulk billing confirmed in writing. */
    cdbs: true, // ON 21 Sep 2026: client asked for the no-gap kids check-up & clean as the lead hero slide.
    /** Zip & Afterpay sections on /payment-plans/. OFF until confirmed. */
    zipAfterpay: false,
  },
};

type Config = typeof DEFAULTS;

/**
 * Merge the dashboard's Site Settings over the defaults. Objects merge one
 * level deep (address, features, hooks, sister, sameAs, logo); arrays (hours,
 * team, payment, parkingNotes) are replaced whole when the dashboard supplies
 * them. An empty overlay leaves everything exactly as written above.
 */
function mergeSettings(base: Config, over: Record<string, unknown>): Config {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (v === undefined || v === null) continue;
    const cur = (base as Record<string, unknown>)[k];
    if (cur && typeof cur === 'object' && !Array.isArray(cur) && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = { ...(cur as object), ...(v as object) };
    } else {
      out[k] = v;
    }
  }
  return out as Config;
}

export const SITE_CONFIG: Config = mergeSettings(DEFAULTS, overrides as Record<string, unknown>);

export type FeatureFlag = keyof typeof SITE_CONFIG.features;

export const isOpen = () => SITE_CONFIG.mode === 'open';
export const featureOn = (flag: FeatureFlag) => SITE_CONFIG.features[flag] === true;

export const fullAddress = () =>
  `${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.suburb} ${SITE_CONFIG.address.state} ${SITE_CONFIG.address.postcode}`;

export const telHref = () => `tel:${SITE_CONFIG.phoneE164}`;
/** "on 16 November 2026" when an exact date is set, "in late November 2026" otherwise. */
export const openingWhen = () => (/^\d/.test(SITE_CONFIG.openingDateLabel) ? 'on ' : 'in ') + SITE_CONFIG.openingDateLabel;
