/**
 * Content corrections applied to the dashboard database at build time (scripts/pull-content.ts), so a
 * change the practice asked for reaches the live site even though the live wording now lives in the
 * database rather than in the repo's JSON files. Every fix is idempotent: once applied, it finds
 * nothing to change on later builds. Edits made in the dashboard afterwards are left alone.
 *
 * 23 Oct 2026: nib removed per client request (Ram), pending nib provider approval for Cronulla.
 * Reinstate when confirmed: delete NIB_FIXES below, then put the wording back in the dashboard (or
 * restore the 2.2.3 content files and run Import > Reset from files) and restore the logo files.
 */
import type { Payload } from 'payload';

type Rule = [RegExp, string];

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
  let changed = 0;
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
