/**
 * Build-time content pull: dashboard (Payload / Postgres) -> the JSON files the
 * site is built from. Runs before every `next build` (see scripts/build.mjs).
 *
 *   content/pages/<slug>.json    every published page
 *   content/site-settings.json   Site Settings global + Team
 *   content/posts.json           published blog articles
 *   content/redirects.json       Redirects collection
 *
 * Safe by design: if DATABASE_URL is missing, the database is unreachable, or
 * the dashboard has never been seeded, the files already in the repo are left
 * untouched and the build carries on with them. It never fails a build.
 */
import fs from 'node:fs';
import path from 'node:path';
import './load-env';
import { getPayload } from 'payload';
import config from '../payload.config';
import { fromDoc, postFromDoc, settingsFromDoc } from '../cms/sync';

const ROOT = process.cwd();
const write = (rel: string, data: unknown) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
};

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('[pull-content] DATABASE_URL not set; building from the files in the repo.');
    return;
  }
  const payload = await getPayload({ config });
  try {
    const pages = await payload.find({ collection: 'pages', limit: 500, depth: 2, overrideAccess: true, where: { _status: { equals: 'published' } } });
    if (!pages.docs.length) {
      console.log('[pull-content] The dashboard has no published pages yet (run Import on the dashboard); building from the files in the repo.');
      return;
    }
    // Only slugs that exist as files are replaced; a page created in the dashboard is added.
    let n = 0;
    for (const doc of pages.docs) {
      const page = fromDoc(doc);
      write(`content/pages/${page.meta.slug}.json`, page);
      n++;
    }
    // A page deleted in the dashboard is removed from the build.
    const keep = new Set(pages.docs.map((d: any) => `${d.slug}.json`));
    for (const f of fs.readdirSync(path.join(ROOT, 'content', 'pages'))) {
      if (f.endsWith('.json') && !keep.has(f)) {
        fs.unlinkSync(path.join(ROOT, 'content', 'pages', f));
        console.log(`[pull-content] removed ${f} (deleted in the dashboard)`);
      }
    }
    console.log(`[pull-content] ${n} pages`);

    const team = await payload.find({ collection: 'team', limit: 50, depth: 1, sort: 'order', overrideAccess: true });
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1, overrideAccess: true });
    if (settings?.name) {
      write('content/site-settings.json', settingsFromDoc(settings, team.docs));
      console.log(`[pull-content] site settings + ${team.docs.length} team members`);
    } else {
      console.log('[pull-content] site settings not seeded; keeping site.config.ts defaults');
    }

    const posts = await payload.find({ collection: 'posts', limit: 500, depth: 2, sort: '-publishedAt', overrideAccess: true, where: { _status: { equals: 'published' } } });
    write('content/posts.json', posts.docs.map(postFromDoc));
    console.log(`[pull-content] ${posts.docs.length} blog articles`);

    const redirects = await payload.find({ collection: 'redirects', limit: 500, depth: 0, overrideAccess: true });
    write(
      'content/redirects.json',
      redirects.docs.map((r: any) => ({ from: r.from, to: r.to, type: r.type || '301' })),
    );
    console.log(`[pull-content] ${redirects.docs.length} redirects`);
  } finally {
    // Do not wait on pool.end(): it does not always drain, and main() is followed by process.exit.
    void (payload.db as any)?.pool?.end?.().catch(() => undefined);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.warn(`[pull-content] skipped: ${(e as Error).message}. Building from the files in the repo.`);
    process.exit(0);
  });
