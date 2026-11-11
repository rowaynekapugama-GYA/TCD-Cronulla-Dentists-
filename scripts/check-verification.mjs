/**
 * Site verification files that must stay in public/ for good.
 *
 * Google Search Console re-checks its HTML file from time to time, and removing
 * or changing it unverifies the property. This runs at the start of every build
 * (scripts/build.mjs) and as `npm run qa:verification`, and fails if a file is
 * missing or its content differs from what Google issued.
 *
 * Added 11 Nov 2026 (v2.4.1). To add another verification file, add a line below.
 */
import { readFileSync, existsSync } from 'node:fs';

const FILES = [
  // Google Search Console, URL-prefix property for the live site.
  ['public/google4e7c6f675ceaec49.html', 'google-site-verification: google4e7c6f675ceaec49.html\n'],
];

let failed = false;
for (const [path, expected] of FILES) {
  if (!existsSync(path)) {
    console.error(`[verification] MISSING: ${path}. Restore it exactly or Search Console will unverify the site.`);
    failed = true;
    continue;
  }
  const actual = readFileSync(path, 'utf8');
  if (actual !== expected) {
    console.error(`[verification] CHANGED: ${path}. Expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}.`);
    failed = true;
    continue;
  }
  console.log(`[verification] ok: ${path}`);
}
if (failed) process.exit(1);
