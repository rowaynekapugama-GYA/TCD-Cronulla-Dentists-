import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload';

/**
 * Records that something on the website has changed since the last publish.
 * The dashboard reads this to show "changes waiting to be published". It never
 * throws: a failure here must not block a save.
 */
async function touch(payload: { updateGlobal: Function; logger: { warn: Function } }) {
  try {
    await payload.updateGlobal({
      slug: 'site-status',
      data: { lastChangedAt: new Date().toISOString() },
      overrideAccess: true,
    });
  } catch (e) {
    payload.logger.warn(`site-status not updated: ${(e as Error).message}`);
  }
}

export const markChanged: CollectionAfterChangeHook & CollectionAfterDeleteHook & GlobalAfterChangeHook = async ({ req, doc }: any) => {
  // Build-time content fixes (cms/contentFixes.ts) are part of a publish, so they are not "waiting".
  if (req?.context?.skipMarkChanged) return doc;
  await touch(req.payload);
  return doc;
};
