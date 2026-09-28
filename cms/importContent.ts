/**
 * Loads the website's content files (content/pages/*.json, site.config.ts) into
 * the dashboard. Idempotent: run it as often as you like.
 *
 *   overwrite = false  (default) creates anything missing and leaves existing
 *                      dashboard edits alone. Safe to run at any time.
 *   overwrite = true   replaces every page, the team and the settings with the
 *                      files in the repo. Use after a developer content update.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Payload } from 'payload';
import type { Page } from '@/content/types';
import { settingsToDoc, teamToDocs, toDoc } from './sync';

export interface ImportReport {
  pagesCreated: string[];
  pagesUpdated: string[];
  pagesSkipped: string[];
  teamCreated: string[];
  teamUpdated: string[];
  settings: 'created' | 'updated' | 'skipped';
}

export async function importContent(payload: Payload, { overwrite = false }: { overwrite?: boolean } = {}): Promise<ImportReport> {
  const report: ImportReport = { pagesCreated: [], pagesUpdated: [], pagesSkipped: [], teamCreated: [], teamUpdated: [], settings: 'skipped' };
  const dir = path.join(process.cwd(), 'content', 'pages');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));

  for (const f of files) {
    const page = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as Page;
    const data = toDoc(page);
    const existing = await payload.find({ collection: 'pages', where: { slug: { equals: page.meta.slug } }, limit: 1, depth: 0, overrideAccess: true });
    if (existing.docs.length) {
      if (!overwrite) {
        report.pagesSkipped.push(page.meta.slug);
        continue;
      }
      await payload.update({ collection: 'pages', id: existing.docs[0].id, data: data as any, depth: 0, overrideAccess: true, context: { importing: true } });
      report.pagesUpdated.push(page.meta.slug);
    } else {
      await payload.create({ collection: 'pages', data: data as any, depth: 0, overrideAccess: true, context: { importing: true } });
      report.pagesCreated.push(page.meta.slug);
    }
  }

  // site.config.ts is the source for settings and team. Import it here (not at
  // module top) so the config's JSON overlay is whatever is on disk right now.
  const { SITE_CONFIG } = await import('@/site.config');

  // Bios come from the About page's "Meet the team" copy: a **Name** line followed by paragraphs.
  const bios: Record<string, string> = {};
  try {
    const about = JSON.parse(fs.readFileSync(path.join(dir, 'about.json'), 'utf8'));
    const team = (about.sections || []).find((s: any) => s.heading === 'Meet the team');
    let current: string | null = null;
    for (const n of team?.nodes || []) {
      if (n.type !== 'p') continue;
      const m = String(n.text).match(/^\*\*(.+)\*\*$/);
      if (m) {
        current = SITE_CONFIG.team.find((t) => m[1].includes(t.shortName))?.id || null;
        continue;
      }
      if (current) bios[current] = (bios[current] ? bios[current] + '\n\n' : '') + n.text;
    }
  } catch {
    /* no About page in the files */
  }

  for (const t of teamToDocs(SITE_CONFIG, bios)) {
    const existing = await payload.find({ collection: 'team', where: { key: { equals: t.key } }, limit: 1, depth: 0, overrideAccess: true });
    if (existing.docs.length) {
      if (overwrite) {
        await payload.update({ collection: 'team', id: existing.docs[0].id, data: t as any, depth: 0, overrideAccess: true });
        report.teamUpdated.push(String(t.fullName));
      }
    } else {
      await payload.create({ collection: 'team', data: t as any, depth: 0, overrideAccess: true });
      report.teamCreated.push(String(t.fullName));
    }
  }

  const current = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true });
  if (!current?.name || overwrite) {
    await payload.updateGlobal({ slug: 'site-settings', data: settingsToDoc(SITE_CONFIG) as any, depth: 0, overrideAccess: true });
    report.settings = current?.name ? 'updated' : 'created';
  }

  await payload.updateGlobal({ slug: 'site-status', data: { lastImportAt: new Date().toISOString() }, overrideAccess: true }).catch(() => undefined);
  return report;
}
