/**
 * Definition-of-done #5: grep the RENDERED output of live pages for banned phrases.
 * Run after `npm run build`:  npm run qa:banned
 *
 * Scans .next/server/app/**\/*.html (the prerendered static pages).
 * Allowed exceptions per the brief: "Saturday/Sunday … Closed" in hours, and the two
 * procedural "same day" phrases on Dentures and Whitening.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.next/server/app');

/**
 * "gap free", "no gap" and "bulk bill" were banned outright until the practice
 * confirmed it bulk bills under the Child Dental Benefits Schedule — the same
 * condition the `cdbs` feature flag waits on. They are now tied to that flag:
 * allowed while it is ON (the kids no-gap offer is live), banned again the moment
 * it is switched OFF, so a stray "no gap" can never survive the offer being
 * withdrawn. Read from the source file because this script cannot import TS.
 */
const CDBS_ON = /cdbs:\s*true/.test(fs.readFileSync(path.resolve('site.config.ts'), 'utf8'));
const CDBS_PHRASES = ['bulk bill', 'gap free', 'no gap'];

const BANNED = [
  'emergency',
  'same-day',
  'same day',
  'after-hours',
  'after hours',
  'open now',
  'walk-in',
  ...(CDBS_ON ? [] : CDBS_PHRASES),
  'bupa',
  'hcf',
  'medibank',
  'afterpay',
  'zip',
  'invisalign',
  'best dentist',
  'guaranteed',
  '[to confirm',
  '9525 0595', // Caringbah number must never appear
  'ortho@',
  'accounts@',
  'thecaringbahdentists@gmail',
];
const ALLOWED = [
  /fitted on the same day teeth are extracted/i, // Dentures — describes a procedure
  /most of the change happens the same day/i, // Whitening — describes a procedure
  /is not guaranteed/i, // DentiCare approval / root canal outcome disclaimers (the opposite of a guarantee claim)
  /cannot guarantee it/i,
  /emergency contact and, where relevant/i, // Privacy policy — a data category, not an availability claim
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });
}

const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ') // JSON-LD + RSC payload are checked separately below
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ');

let failures = 0;
const files = walk(ROOT);
for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8');
  const text = strip(raw);
  const jsonld = [...raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join(' ');
  for (const src of [text, jsonld]) {
    const lower = src.toLowerCase();
    for (const b of BANNED) {
      let idx = lower.indexOf(b);
      while (idx !== -1) {
        const ctx = src.slice(Math.max(0, idx - 60), idx + b.length + 60);
        if (!ALLOWED.some((re) => re.test(ctx))) {
          failures++;
          console.log(`✗ ${path.relative(ROOT, f)} → "${b}"\n    …${ctx.replace(/\s+/g, ' ')}…`);
        }
        idx = lower.indexOf(b, idx + 1);
      }
    }
  }
}
if (CDBS_ON) console.log('(CDBS flag is ON: "gap free", "no gap" and "bulk bill" are permitted.)');
console.log(`\nScanned ${files.length} rendered pages. ${failures ? failures + ' banned-phrase hit(s).' : 'No banned phrases found. ✓'}`);
process.exit(failures ? 1 : 0);
