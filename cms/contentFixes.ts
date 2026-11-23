/**
 * Content corrections applied to the dashboard database at build time (scripts/pull-content.ts), so a
 * change the practice asked for reaches the live site even though the live wording now lives in the
 * database rather than in the repo's JSON files. Every fix is idempotent: once applied, it finds
 * nothing to change on later builds. Edits made in the dashboard afterwards are left alone.
 *
 * 23 Oct 2026: nib removed per client request (Ram), pending nib provider approval for Cronulla.
 * Reinstate when confirmed: delete NIB_FIXES below, then put the wording back in the dashboard (or
 * restore the 2.2.3 content files and run Import > Reset from files) and restore the logo files.
 *
 * 23 Oct 2026: the dental anxiety page moved from /dental-anxiety-cronulla/ to /dental-anxiety/ for
 * The Anxious Patient Experience (TM). applyApeRename() below renames the page once (slug, route,
 * SEO title and description) and points every link in the other pages at the new address.
 *
 * 5 Nov 2026: Google Tag Manager container GTM-TNWQ82NH (Brian, Google Ads). applyGtmContainer()
 * fills the Site Settings > Tracking field once when it is blank; a different ID typed in the
 * dashboard is left alone. To remove GTM later, also blank GTM_CONTAINER below, or the next build
 * fills the field again.
 *
 * 23 Nov 2026: Dr Lorna Gladwin is an Associate Dentist at Cronulla, not a principal (Alex). The site
 * said Principal Dentist on her Team record and "led by Dr Ram Nathwani and Dr Lorna Gladwin" on the
 * homepage and About page. applyLornaAssociate() corrects both once; later dashboard edits are kept.
 */
import type { Payload } from 'payload';
import { APE_OLD_SLUG, APE_ROUTE, APE_SLUG } from '../lib/ape';

type Rule = [RegExp, string];

const GTM_CONTAINER = 'GTM-TNWQ82NH';

async function applyGtmContainer(payload: Payload, context: Record<string, unknown>): Promise<number> {
  if (!GTM_CONTAINER) return 0;
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })) as any;
  if (!settings || (settings.gtmId || '').trim()) return 0;
  await payload.updateGlobal({ slug: 'site-settings', data: { gtmId: GTM_CONTAINER } as any, depth: 0, overrideAccess: true, context });
  console.log(`[content-fixes] Google Tag Manager container ${GTM_CONTAINER} added to Site Settings`);
  return 1;
}

/** The SEO wording set when the page is renamed. Edits made in the dashboard afterwards are kept. */
const APE_META = {
  metaTitle: 'Dental Anxiety and Phobia | Trustable Dentist in Sutherland Shire',
  metaDescription:
    'Scared of the dentist? The Cronulla Dentists offer The Anxious Patient Experience™, a dedicated dental anxiety pathway for nervous patients in Cronulla.',
  primaryKeyword: 'dental anxiety Cronulla, anxious patient dentist Sutherland Shire, nervous patients dentist Cronulla',
};
const OLD_ROUTE_RE = new RegExp(`/${APE_OLD_SLUG}/`, 'g');

function relink(value: any): any {
  if (typeof value === 'string') return value.replace(OLD_ROUTE_RE, APE_ROUTE);
  if (Array.isArray(value)) return value.map(relink);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = SKIP_KEYS.has(k) ? v : relink(v);
    return out;
  }
  return value;
}

async function applyApeRename(payload: Payload, context: Record<string, unknown>): Promise<number> {
  let changed = 0;
  const pages = await payload.find({ collection: 'pages', limit: 500, depth: 0, overrideAccess: true });
  const docs = pages.docs as any[];
  const old = docs.find((d) => d.slug === APE_OLD_SLUG);
  const already = docs.find((d) => d.slug === APE_SLUG);
  if (old && !already) {
    await payload.update({
      collection: 'pages',
      id: old.id,
      data: { slug: APE_SLUG, route: APE_ROUTE, ...APE_META, _status: 'published' } as any,
      depth: 0,
      overrideAccess: true,
      context,
    });
    console.log(`[content-fixes] dental anxiety page moved to ${APE_ROUTE} (The Anxious Patient Experience)`);
    changed++;
  }
  // Links in the other pages (home slide, services hub, about, contact) follow the page.
  for (const doc of docs) {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(doc)) {
      if (SKIP_KEYS.has(k)) continue;
      const r = relink(v);
      if (JSON.stringify(r) !== JSON.stringify(v)) patch[k] = r;
    }
    if (!Object.keys(patch).length) continue;
    await payload.update({ collection: 'pages', id: doc.id, data: { ...patch, _status: 'published' } as any, depth: 0, overrideAccess: true, context });
    console.log(`[content-fixes] links to the dental anxiety page updated on "${doc.slug}" (${Object.keys(patch).join(', ')})`);
    changed++;
  }
  return changed;
}

const LORNA_ROLE = 'Associate Dentist';
const LORNA_RULES: Rule[] = [
  [/The practice is led by Dr Ram Nathwani and Dr Lorna Gladwin\.\s*Between them/g,
    'The practice is led by Principal Dentist Dr Ram Nathwani, and Dr Lorna Gladwin joins him as Associate Dentist. Between them'],
  [/The practice is led by Dr Ram Nathwani and Dr Lorna Gladwin,\s*who between them bring/g,
    'The practice is led by Principal Dentist Dr Ram Nathwani, and Dr Lorna Gladwin joins him as Associate Dentist. Between them they bring'],
];
const isLorna = (t: any) => t?.key === 'lorna' || /lorna\s+gladwin/i.test(t?.fullName || '');

function lornaText(value: any): any {
  if (typeof value === 'string') return LORNA_RULES.reduce((s, [re, to]) => s.replace(re, to), value);
  if (Array.isArray(value)) return value.map(lornaText);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = SKIP_KEYS.has(k) ? v : lornaText(v);
    return out;
  }
  return value;
}

/** Wording that still puts Dr Lorna alongside Dr Ram as a principal or co-lead, reported rather than guessed at. */
function lornaLeftovers(value: any, path: string, out: string[]) {
  if (typeof value === 'string') {
    for (const sentence of value.split(/(?<=[.!?])\s+/)) {
      if (/lorna|gladwin/i.test(sentence) && /principal|co-?owner|led by dr ram nathwani and/i.test(sentence) && !/Associate Dentist/.test(sentence)) {
        out.push(`${path}: ${sentence.slice(0, 120)}`);
      }
    }
  } else if (Array.isArray(value)) value.forEach((v, i) => lornaLeftovers(v, `${path}.${i}`, out));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) if (!SKIP_KEYS.has(k)) lornaLeftovers(v, `${path}.${k}`, out);
}

async function applyLornaAssociate(payload: Payload, context: Record<string, unknown>): Promise<number> {
  let changed = 0;
  const team = await payload.find({ collection: 'team', limit: 50, depth: 0, overrideAccess: true });
  for (const t of team.docs as any[]) {
    if (!isLorna(t) || !/principal/i.test(t.title || '')) continue;
    await payload.update({ collection: 'team', id: t.id, data: { title: LORNA_ROLE } as any, depth: 0, overrideAccess: true, context });
    console.log(`[content-fixes] ${t.fullName}: role "${t.title}" changed to "${LORNA_ROLE}"`);
    changed++;
  }
  const pages = await payload.find({ collection: 'pages', limit: 500, depth: 0, overrideAccess: true });
  for (const doc of pages.docs as any[]) {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(doc)) {
      if (SKIP_KEYS.has(k)) continue;
      const r = lornaText(v);
      if (JSON.stringify(r) !== JSON.stringify(v)) patch[k] = r;
    }
    if (!Object.keys(patch).length) continue;
    await payload.update({ collection: 'pages', id: doc.id, data: { ...patch, _status: 'published' } as any, depth: 0, overrideAccess: true, context });
    console.log(`[content-fixes] Dr Lorna shown as Associate Dentist on "${doc.slug}" (${Object.keys(patch).join(', ')})`);
    changed++;
  }
  const left: string[] = [];
  const pagesAfter = await payload.find({ collection: 'pages', limit: 500, depth: 0, overrideAccess: true });
  for (const doc of pagesAfter.docs as any[]) lornaLeftovers(doc, `pages/${doc.slug}`, left);
  const teamAfter = await payload.find({ collection: 'team', limit: 50, depth: 0, overrideAccess: true });
  for (const t of teamAfter.docs as any[]) if (isLorna(t)) lornaLeftovers({ title: t.title, bio: t.bio }, `team/${t.key || t.id}`, left);
  if (left.length) console.warn(`[content-fixes] WARNING: check Dr Lorna's role in this dashboard wording:\n  ${left.join('\n  ')}`);
  return changed;
}

/** Sentence-level removals; everything else in each sentence is kept word for word. */
const NIB_RULES: Rule[] = [
  [/We are an nib preferred provider\.\s*We also use HICAPS/gi, 'We use HICAPS'],
  [/We are an nib preferred provider,\s*and we use HICAPS/gi, 'We use HICAPS'],
  [/,?\s+nib preferred provider,/gi, ','],
];
/** Whole list items to drop (home page provider list, Site Settings payment lines). */
const NIB_ITEM = /^\s*nib(\s+preferred provider)?\s*$/i;

const SKIP_KEYS = new Set(['id', 'createdAt', 'updatedAt', '_status', 'slug', 'route', 'kind']);

function clean(value: any): any {
  if (typeof value === 'string') return NIB_RULES.reduce((s, [re, to]) => s.replace(re, to), value);
  if (Array.isArray(value)) {
    return value
      .filter((row) => !(row && typeof row === 'object' && typeof row.value === 'string' && NIB_ITEM.test(row.value)))
      .map((row) => clean(row));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = SKIP_KEYS.has(k) ? v : clean(v);
    return out;
  }
  return value;
}

/** Top-level fields whose cleaned value differs from the stored one. */
function changedFields(doc: Record<string, any>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doc)) {
    if (SKIP_KEYS.has(k)) continue;
    const c = clean(v);
    if (JSON.stringify(c) !== JSON.stringify(v)) patch[k] = c;
  }
  return patch;
}

function leftovers(value: any, path: string, out: string[]) {
  if (typeof value === 'string') {
    if (/\bnib\b/i.test(value)) out.push(`${path}: ${value.slice(0, 90)}`);
  } else if (Array.isArray(value)) value.forEach((v, i) => leftovers(v, `${path}.${i}`, out));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) if (!SKIP_KEYS.has(k)) leftovers(v, `${path}.${k}`, out);
}

export async function applyContentFixes(payload: Payload): Promise<void> {
  const context = { skipMarkChanged: true };
  let changed = await applyApeRename(payload, context);
  changed += await applyGtmContainer(payload, context);
  changed += await applyLornaAssociate(payload, context);
  const pages = await payload.find({ collection: 'pages', limit: 500, depth: 0, overrideAccess: true });
  for (const doc of pages.docs as any[]) {
    const patch = changedFields(doc);
    if (!Object.keys(patch).length) continue;
    await payload.update({ collection: 'pages', id: doc.id, data: { ...patch, _status: 'published' } as any, depth: 0, overrideAccess: true, context });
    console.log(`[content-fixes] nib removed from page "${doc.slug}" (${Object.keys(patch).join(', ')})`);
    changed++;
  }
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })) as any;
  if (settings) {
    const payment = clean(settings.payment || []);
    if (JSON.stringify(payment) !== JSON.stringify(settings.payment || [])) {
      await payload.updateGlobal({ slug: 'site-settings', data: { payment } as any, depth: 0, overrideAccess: true, context });
      console.log('[content-fixes] nib removed from Site Settings payment lines');
      changed++;
    }
  }
  // Anything a rule could not cover (for example wording rewritten in the dashboard) is reported, not guessed at.
  const after = await payload.find({ collection: 'pages', limit: 500, depth: 0, overrideAccess: true });
  const left: string[] = [];
  for (const doc of after.docs as any[]) leftovers(doc, `pages/${doc.slug}`, left);
  if (settings) leftovers((await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })) as any, 'site-settings', left);
  if (left.length) console.warn(`[content-fixes] WARNING: "nib" still appears in the dashboard content:\n  ${left.join('\n  ')}`);
  console.log(`[content-fixes] ${changed ? `${changed} item(s) updated` : 'nothing to change'}${left.length ? '' : '; no nib references left'}`);
}
