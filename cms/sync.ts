/**
 * Two-way mapping between the website's JSON content model (content/types.ts,
 * which the page templates render) and the Payload documents the dashboard
 * edits. Same field names on both sides wherever the shape allows it.
 *
 *   toDoc(page)   JSON page  -> Payload document   (import / seed)
 *   fromDoc(doc)  Payload doc -> JSON page          (build-time pull)
 *
 * Arrays of plain strings become arrays of { value } rows (Payload arrays hold
 * objects), tables become "cell | cell" lines, and images become
 * { upload, path, alt } so an editor can swap a built-in photo for a library one.
 */
import type { Card, HomePage, Node, Page, PageMeta, ProsePage, Section, ServicePage, ServicesHubPage, ContactPage } from '@/content/types';
import { IMAGE_ALT } from '@/lib/image-alt';
import { sanitiseHtml } from '@/lib/sanitise';

type Row = { value: string };
type Media = { url?: string | null; alt?: string | null; width?: number | null; height?: number | null } | number | string | null | undefined;
type ImageDoc = { upload?: Media; path?: string | null; alt?: string | null } | null | undefined;

const rows = (list?: string[] | null): Row[] => (list || []).map((value) => ({ value }));
const values = (list?: Row[] | null): string[] => (list || []).map((r) => r.value).filter((v) => typeof v === 'string');
const clean = <T extends object>(o: T): T => {
  for (const k of Object.keys(o) as (keyof T)[]) if (o[k] === undefined || o[k] === null || o[k] === '') delete o[k];
  return o;
};

/** Root-relative for our own /api/media files, absolute for Blob, so it resolves on any host. */
export function mediaUrl(m: Media): string | undefined {
  if (!m || typeof m !== 'object' || !m.url) return undefined;
  const raw = m.url;
  if (/^https?:\/\//i.test(raw) && !raw.includes('/api/media/')) return raw;
  try {
    const u = new URL(raw, 'http://local.invalid');
    return u.pathname.replace(/\/+$/, '') + u.search;
  } catch {
    return raw;
  }
}

// ---------------------------------------------------------------- nodes
function nodeToDoc(n: Node) {
  const base: Record<string, unknown> = { type: n.type, gate: n.gate };
  if (n.type === 'p') return clean({ ...base, text: n.text, mode: n.mode });
  if (n.type === 'h4') return clean({ ...base, text: n.text });
  if (n.type === 'ul') return clean({ ...base, items: rows(n.items) });
  return clean({ ...base, rowsText: n.rows.map((r) => r.join(' | ')).join('\n') });
}
function nodeFromDoc(d: any): Node | null {
  const gate = d.gate || undefined;
  if (d.type === 'p') return clean({ type: 'p', text: d.text || '', gate, mode: d.mode || undefined }) as Node;
  if (d.type === 'h4') return clean({ type: 'h4', text: d.text || '', gate }) as Node;
  if (d.type === 'ul') return clean({ type: 'ul', items: values(d.items), gate }) as Node;
  if (d.type === 'table') {
    const r = String(d.rowsText || '')
      .split(/\r?\n/)
      .filter((l) => l.trim())
      .map((l) => l.split('|').map((c) => c.trim()));
    return clean({ type: 'table', rows: r, gate }) as Node;
  }
  return null;
}
const nodesToDoc = (ns?: Node[]) => (ns || []).map(nodeToDoc);
const nodesFromDoc = (ds?: any[]) => (ds || []).map(nodeFromDoc).filter((n): n is Node => Boolean(n));

const sectionsToDoc = (ss?: Section[]) => (ss || []).map((s) => clean({ heading: s.heading, gate: s.gate, nodes: nodesToDoc(s.nodes) }));
const sectionsFromDoc = (ds?: any[]): Section[] => (ds || []).map((d) => clean({ heading: d.heading || '', gate: d.gate || undefined, nodes: nodesFromDoc(d.nodes) }) as Section);

// ---------------------------------------------------------------- images
function imageToDoc(src?: string, alt?: string) {
  if (!src && !alt) return undefined;
  return clean({ path: src, alt: alt ?? (src ? IMAGE_ALT[src] : undefined) });
}
function imageFromDoc(d: ImageDoc): { src: string; alt: string } | undefined {
  if (!d) return undefined;
  const up = mediaUrl(d.upload);
  const src = up || d.path || '';
  if (!src) return undefined;
  const upAlt = d.upload && typeof d.upload === 'object' ? d.upload.alt : undefined;
  return { src, alt: d.alt || (up ? upAlt : undefined) || IMAGE_ALT[src] || '' };
}

// ---------------------------------------------------------------- cards
function cardToDoc(c: Card, tileImage?: (href?: string) => string | undefined): Record<string, unknown> {
  const img = tileImage ? tileImage(c.href) : undefined;
  return clean({
    title: c.title,
    text: c.text,
    href: c.href,
    icon: c.icon,
    gate: c.gate,
    fallback: c.fallback ? cardToDoc(c.fallback) : undefined,
    image: c.image ? imageToDoc(c.image.src, c.image.alt) : img ? imageToDoc(img) : undefined,
  });
}
function cardFromDoc(d: any): Card {
  const c: Card = clean({
    title: d.title || '',
    text: d.text || '',
    href: d.href || undefined,
    icon: d.icon || undefined,
    gate: d.gate || undefined,
    fallback: d.fallback && d.fallback.title ? cardFromDoc(d.fallback) : undefined,
    image: undefined,
  }) as Card;
  // Only a library upload, or alt text that differs from the built-in wording, counts as an override.
  const ov = overrideImage(d.image);
  if (ov) c.image = ov;
  return c;
}
const cardsToDoc = (cs?: Card[], tileImage?: (href?: string) => string | undefined) => (cs || []).map((c) => cardToDoc(c, tileImage));
const cardsFromDoc = (ds?: any[]) => (ds || []).map(cardFromDoc);

const tilePath = (href?: string) => (href ? `/images/tiles/${href.replace(/\//g, '')}.jpg` : undefined);

// ---------------------------------------------------------------- pages
export function toDoc(page: Page): Record<string, unknown> {
  const m = page.meta;
  const doc: Record<string, unknown> = {
    title: m.title,
    kind: page.kind,
    slug: m.slug,
    route: m.route,
    metaTitle: m.metaTitle,
    metaDescription: m.metaDescription,
    metaTitleGated: m.metaTitleGated,
    metaDescriptionGated: m.metaDescriptionGated,
    noindex: Boolean(m.noindex),
    primaryKeyword: m.primaryKeyword,
    canonical: m.canonical,
    gate: m.gate,
    _status: 'published',
  };
  if (page.kind === 'service') {
    Object.assign(doc, {
      h1: page.h1,
      breadcrumb: rows(page.breadcrumb),
      eyebrow: page.eyebrow,
      h2: page.h2,
      hook: page.hook,
      body: nodesToDoc(page.body),
      ctaBand: page.ctaBand,
      details: sectionsToDoc(page.details),
      closingCta: page.closingCta,
      gatedText: page.gatedText,
      category: page.category,
      image: imageToDoc(page.image?.src, page.image?.alt),
    });
  } else if (page.kind === 'prose') {
    Object.assign(doc, {
      h1: page.h1,
      intro: rows(page.intro),
      sections: sectionsToDoc(page.sections),
      breadcrumb: rows(page.breadcrumb),
      dentistsImage: m.slug === 'about' ? imageToDoc(page.dentistsImage?.src || '/images/dentists.jpg', page.dentistsImage?.alt) : undefined,
    });
  } else if (page.kind === 'home') {
    Object.assign(doc, {
      h1: page.h1,
      h2: page.h2,
      h3: page.h3,
      slides: page.slides.map((s) => clean({ ...s })),
      providers: rows(page.providers),
      pillars: cardsToDoc(page.pillars),
      ctaBand: page.ctaBand,
      welcome: { h2: page.welcome.h2, h3: page.welcome.h3, paragraphs: rows(page.welcome.paragraphs) },
      categoryCards: cardsToDoc(page.categoryCards),
      treatments: { h2: page.treatments.h2, h3: page.treatments.h3, tiles: cardsToDoc(page.treatments.tiles, tilePath) },
      iconBlocks: cardsToDoc(page.iconBlocks),
      paymentBand: { h2: page.paymentBand.h2, lines: rows(page.paymentBand.lines), logo: page.paymentBand.logo },
      note: { h2: page.note.h2, h3: page.note.h3, paragraphs: rows(page.note.paragraphs), signoff: page.note.signoff },
      heroImage: imageToDoc(page.heroImage?.src || '/images/cronulla-beach.jpg', page.heroImage?.alt),
      welcomeImage: imageToDoc(page.welcomeImage?.src || '/images/welcome.jpg', page.welcomeImage?.alt || 'Aerial view of Cronulla Beach and the Cronulla peninsula, a short walk from the practice on Cronulla Street'),
      dentistsImage: imageToDoc(page.dentistsImage?.src || '/images/dentists.jpg', page.dentistsImage?.alt),
    });
  } else if (page.kind === 'hub') {
    Object.assign(doc, {
      h1: page.h1,
      introLine: page.intro,
      serviceList: rows(page.serviceList),
      closingLine: page.closingLine,
      featured: cardsToDoc(page.featured, tilePath),
      blurbs: cardsToDoc(page.blurbs),
      categoryCards: cardsToDoc(page.categoryCards),
      closing: { h2: page.closing.h2, paragraphs: rows(page.closing.paragraphs), closingLine: page.closing.closingLine },
    });
  } else if (page.kind === 'contact') {
    Object.assign(doc, { h1: page.h1, sections: sectionsToDoc(page.sections) });
  }
  return clean(doc);
}

export function fromDoc(d: any): Page {
  const meta = clean({
    slug: d.slug,
    route: d.route || `/${d.slug}/`,
    title: d.title,
    metaTitle: d.metaTitle || d.title,
    metaDescription: d.metaDescription || '',
    metaTitleGated: d.metaTitleGated || undefined,
    metaDescriptionGated: d.metaDescriptionGated || undefined,
    noindex: d.noindex ? true : undefined,
    gate: d.gate || undefined,
    primaryKeyword: d.primaryKeyword || undefined,
    canonical: d.canonical || undefined,
    ogImage: d.ogImage && typeof d.ogImage === 'object' && mediaUrl(d.ogImage) ? clean({ src: mediaUrl(d.ogImage) as string, width: d.ogImage.width, height: d.ogImage.height, alt: d.ogImage.alt }) : undefined,
  }) as PageMeta;
  if (d.kind === 'service') {
    const p: ServicePage = {
      kind: 'service',
      meta,
      h1: d.h1 || d.title,
      breadcrumb: values(d.breadcrumb),
      eyebrow: d.eyebrow || '',
      h2: d.h2 || '',
      hook: d.hook || '',
      body: nodesFromDoc(d.body),
      ctaBand: d.ctaBand || '',
      details: sectionsFromDoc(d.details),
      closingCta: d.closingCta || '',
      image: imageFromDoc(d.image) || { src: '', alt: '' },
    };
    if (d.gatedText && (d.gatedText.hook || d.gatedText.bodyIntro)) p.gatedText = clean({ hook: d.gatedText.hook, bodyIntro: d.gatedText.bodyIntro });
    if (d.category) p.category = d.category;
    return p;
  }
  if (d.kind === 'prose') {
    const p: ProsePage = clean({
      kind: 'prose',
      meta,
      h1: d.h1 || d.title,
      intro: d.intro?.length ? values(d.intro) : undefined,
      sections: sectionsFromDoc(d.sections),
      breadcrumb: d.breadcrumb?.length ? values(d.breadcrumb) : undefined,
      dentistsImage: overrideImage(d.dentistsImage),
    }) as ProsePage;
    return p;
  }
  if (d.kind === 'home') {
    const p: HomePage = clean({
      kind: 'home',
      meta,
      slides: (d.slides || []).map((s: any) => clean({ headline: s.headline, sub: s.sub || '', linkText: s.linkText, linkHref: s.linkHref, gate: s.gate })),
      providers: values(d.providers),
      h1: d.h1 || '',
      h2: d.h2 || '',
      h3: d.h3 || '',
      pillars: cardsFromDoc(d.pillars),
      ctaBand: d.ctaBand || '',
      welcome: { h2: d.welcome?.h2 || '', h3: d.welcome?.h3 || '', paragraphs: values(d.welcome?.paragraphs) },
      categoryCards: cardsFromDoc(d.categoryCards),
      treatments: { h2: d.treatments?.h2 || '', h3: d.treatments?.h3 || '', tiles: cardsFromDoc(d.treatments?.tiles) },
      iconBlocks: cardsFromDoc(d.iconBlocks),
      paymentBand: { h2: d.paymentBand?.h2 || '', lines: values(d.paymentBand?.lines), logo: d.paymentBand?.logo || '' },
      note: { h2: d.note?.h2 || '', h3: d.note?.h3 || '', paragraphs: values(d.note?.paragraphs), signoff: d.note?.signoff || '' },
      heroImage: overrideImage(d.heroImage),
      welcomeImage: overrideImage(d.welcomeImage),
      dentistsImage: overrideImage(d.dentistsImage),
    }) as HomePage;
    return p;
  }
  if (d.kind === 'hub') {
    const p: ServicesHubPage = {
      kind: 'hub',
      meta,
      h1: d.h1 || d.title,
      intro: d.introLine || '',
      serviceList: values(d.serviceList),
      closingLine: d.closingLine || '',
      featured: cardsFromDoc(d.featured),
      blurbs: cardsFromDoc(d.blurbs),
      categoryCards: cardsFromDoc(d.categoryCards),
      closing: { h2: d.closing?.h2 || '', paragraphs: values(d.closing?.paragraphs), closingLine: d.closing?.closingLine || '' },
    };
    return p;
  }
  const p: ContactPage = { kind: 'contact', meta, h1: d.h1 || d.title, sections: sectionsFromDoc(d.sections) };
  return p;
}

/**
 * A built-in photo counts as overridden only when a library upload is chosen or
 * the alt text differs from the wording in lib/image-alt.ts. Otherwise the JSON
 * stays exactly as the template's own default, so an untouched page round-trips
 * byte for byte.
 */
function overrideImage(d: ImageDoc): { src: string; alt: string } | undefined {
  if (!d) return undefined;
  const img = imageFromDoc(d);
  if (!img) return undefined;
  const isUpload = d.upload && typeof d.upload === 'object';
  if (isUpload) return img;
  if (!d.alt || !d.path) return undefined;
  const builtIn = IMAGE_ALT[d.path] ?? BUILT_IN_ALT[d.path];
  return d.alt === builtIn ? undefined : img;
}
/** Built-in alts for photos the templates hard-code but the brief's alt map does not cover. */
const BUILT_IN_ALT: Record<string, string> = {
  '/images/welcome.jpg': 'Aerial view of Cronulla Beach and the Cronulla peninsula, a short walk from the practice on Cronulla Street',
};

// ---------------------------------------------------------------- site settings
export function settingsToDoc(cfg: any): Record<string, unknown> {
  return clean({
    name: cfg.name,
    phone: cfg.phone,
    phoneE164: cfg.phoneE164,
    email: cfg.email,
    address: { street: cfg.address.street, suburb: cfg.address.suburb, state: cfg.address.state, postcode: cfg.address.postcode },
    geo: { lat: cfg.geo?.lat, lng: cfg.geo?.lng },
    gbpShareUrl: cfg.gbpShareUrl,
    hours: (cfg.hours || []).map((h: any) => clean({ day: h.day, closed: !h.open, open: h.open || undefined, close: h.close || undefined, label: h.open ? h.label : undefined })),
    hooks: cfg.hooks,
    mode: cfg.mode,
    openingDateLabel: cfg.openingDateLabel,
    openingDate: cfg.openingDate,
    openingDateTime: cfg.openingDateTime,
    bookingUrl: cfg.bookingUrl,
    bookingChooser: cfg.bookingChooser,
    bookingLocations: (cfg.bookingLocations || []).map((l: any) => clean({ name: l.name, address: l.address, url: l.url, note: l.note })),
    payment: rows(cfg.payment),
    features: cfg.features,
    teamNamesConfirmed: cfg.teamNamesConfirmed,
    parkingNotes: rows(cfg.parkingNotes),
    privacyLastUpdated: cfg.privacyLastUpdated,
    ga4Id: cfg.ga4Id,
    gtmId: cfg.gtmId,
    metaPixelId: cfg.metaPixelId,
    sameAs: { facebook: cfg.sameAs?.facebook, instagram: cfg.sameAs?.instagram },
    sister: { name: cfg.sister?.name, url: cfg.sister?.url, heritage: cfg.sister?.heritage },
  });
}

export function settingsFromDoc(d: any, team: any[]): Record<string, unknown> {
  const out: Record<string, unknown> = clean({
    name: d.name,
    phone: d.phone,
    phoneE164: d.phoneE164,
    email: d.email,
    address: d.address ? clean({ street: d.address.street, suburb: d.address.suburb, state: d.address.state, postcode: d.address.postcode }) : undefined,
    geo: d.geo && typeof d.geo.lat === 'number' && typeof d.geo.lng === 'number' ? { lat: d.geo.lat, lng: d.geo.lng } : undefined,
    gbpShareUrl: d.gbpShareUrl ?? undefined,
    hours: d.hours?.length === 7
      ? d.hours.map((h: any) => (h.closed ? { day: h.day, open: null, close: null, label: 'Closed' } : { day: h.day, open: h.open || null, close: h.close || null, label: h.label || '' }))
      : undefined,
    hooks: d.hooks ? clean({ lateMonday: d.hooks.lateMonday, earlyFriday: d.hooks.earlyFriday }) : undefined,
    mode: d.mode,
    openingDateLabel: d.openingDateLabel ?? undefined,
    openingDate: d.openingDate ?? undefined,
    openingDateTime: d.openingDateTime ?? '',
    bookingUrl: d.bookingUrl ?? '',
    bookingChooser: typeof d.bookingChooser === 'boolean' ? d.bookingChooser : undefined,
    bookingLocations: Array.isArray(d.bookingLocations) && d.bookingLocations.length
      ? d.bookingLocations.map((l: any) => ({ name: l.name || '', address: l.address || '', url: l.url || '', note: l.note || '' }))
      : undefined,
    payment: d.payment?.length ? values(d.payment) : undefined,
    features: d.features ? { emergency: Boolean(d.features.emergency), cdbs: Boolean(d.features.cdbs), zipAfterpay: Boolean(d.features.zipAfterpay) } : undefined,
    teamNamesConfirmed: typeof d.teamNamesConfirmed === 'boolean' ? d.teamNamesConfirmed : undefined,
    parkingNotes: d.parkingNotes ? values(d.parkingNotes) : undefined,
    privacyLastUpdated: d.privacyLastUpdated ?? '',
    ga4Id: d.ga4Id ?? '',
    gtmId: d.gtmId ?? '',
    metaPixelId: d.metaPixelId ?? '',
    sameAs: clean({ googleMaps: d.gbpShareUrl ?? undefined, facebook: d.sameAs?.facebook ?? '', instagram: d.sameAs?.instagram ?? '' }),
    sister: d.sister ? clean({ name: d.sister.name, url: d.sister.url, heritage: d.sister.heritage }) : undefined,
  });
  if (d.logo && typeof d.logo === 'object' && d.logo.url && d.logo.width && d.logo.height) {
    out.logo = { src: mediaUrl(d.logo), width: d.logo.width, height: d.logo.height };
  }
  if (d.colours && (d.colours.navy || d.colours.cyan)) out.colours = clean({ navy: d.colours.navy, cyan: d.colours.cyan });
  const visible = team.filter((t) => !t.hidden);
  if (visible.length) {
    out.team = visible.map((t) =>
      clean({
        id: t.key || t.givenName?.toLowerCase(),
        shortName: t.shortName,
        fullName: t.fullName,
        givenName: t.givenName,
        familyName: t.familyName,
        title: t.title,
        image: mediaUrl(t.photo) || t.photoPath || '/images/placeholder-team.jpg',
        alumniOf: t.alumniOf || '',
        credentials: values(t.credentials),
        knowsAbout: values(t.knowsAbout),
        sameAs: t.sameAs || '',
        ahpra: t.ahpra || '',
        bio: paragraphs(t.bio),
      }),
    );
  }
  return out;
}

/** "Para one.\n\nPara two." -> ['Para one.', 'Para two.'] */
export function paragraphs(text?: string | null): string[] {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

export function teamToDocs(cfg: any, bios: Record<string, string> = {}): Record<string, unknown>[] {
  return (cfg.team || []).map((t: any, i: number) =>
    clean({
      key: t.id,
      bio: bios[t.id] || (t.bio || []).join('\n\n') || undefined,
      hidden: Boolean(t.hidden),
      shortName: t.shortName,
      fullName: t.fullName,
      givenName: t.givenName,
      familyName: t.familyName,
      title: t.title,
      photoPath: t.image,
      order: i + 1,
      alumniOf: t.alumniOf,
      credentials: rows(t.credentials),
      knowsAbout: rows(t.knowsAbout),
      sameAs: t.sameAs,
      ahpra: t.ahpra,
    }),
  );
}

// ---------------------------------------------------------------- posts
export function postFromDoc(d: any) {
  const fi = d.featuredImage && typeof d.featuredImage === 'object' ? d.featuredImage : null;
  return clean({
    id: d.id,
    title: d.title,
    slug: d.slug,
    excerpt: d.excerpt || '',
    featuredImage: fi && fi.url ? { src: mediaUrl(fi), alt: fi.alt || d.title, width: fi.width, height: fi.height } : undefined,
    body: sanitiseHtml(typeof d.body === 'string' ? d.body : ''),
    author: d.author || '',
    categories: (d.categories || []).filter((c: any) => c && typeof c === 'object').map((c: any) => ({ title: c.title, slug: c.slug })),
    publishedAt: d.publishedAt || d.createdAt,
    updatedAt: d.updatedAt,
    metaTitle: d.metaTitle || undefined,
    metaDescription: d.metaDescription || undefined,
    ogImage: d.ogImage && typeof d.ogImage === 'object' && d.ogImage.url ? { src: mediaUrl(d.ogImage), alt: d.ogImage.alt || d.title, width: d.ogImage.width, height: d.ogImage.height } : undefined,
    noindex: d.noindex ? true : undefined,
  });
}
