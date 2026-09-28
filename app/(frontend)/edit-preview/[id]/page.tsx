import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Page } from '@/content/types';
import { db, getUser } from '@/dashboard/lib/auth';
import { fromDoc } from '@/cms/sync';
import { SITE_CONFIG } from '@/site.config';
import { HomeTemplate } from '@/components/templates/HomeTemplate';
import { ServicesTemplate } from '@/components/templates/ServicesTemplate';
import { ContactTemplate } from '@/components/templates/ContactTemplate';
import { ServiceTemplate } from '@/components/ServiceTemplate';
import { ProseTemplate } from '@/components/ProseTemplate';
import EditorBridge from '@/components/EditorBridge';
import { DRAFT_KEY } from '@/lib/preview';

/**
 * The page as the dashboard's visual editor shows it: the real template, the
 * real header and footer, rendered on request from the saved page (or from the
 * editor's unsaved draft with ?draft=1). Logged-in dashboard users only; for
 * anyone else it is a plain 404. Never cached, never indexed, and analytics are
 * switched off before they load so editing does not count as visits.
 */
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Page preview', robots: { index: false, follow: false } };

function render(page: Page) {
  switch (page.kind) {
    case 'home':
      return <HomeTemplate page={page} />;
    case 'hub':
      return <ServicesTemplate page={page} />;
    case 'contact':
      return <ContactTemplate page={page} />;
    case 'service':
      return <ServiceTemplate page={page} />;
    case 'prose':
      return <ProseTemplate page={page} />;
    default:
      return null;
  }
}

/** Runs while the HTML is parsed, before the analytics scripts (afterInteractive) start. */
const NO_TRACKING = [
  SITE_CONFIG.ga4Id ? `window['ga-disable-${SITE_CONFIG.ga4Id}']=true;` : '',
  // The Meta Pixel snippet returns early when fbq already exists.
  'window.fbq=window.fbq||function(){};',
].join('');

export default async function EditPreview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await getUser();
  if (!user) notFound();
  const { id } = await params;
  const sp = await searchParams;
  const payload = await db();
  let doc: any = await payload.findByID({ collection: 'pages', id, depth: 1, overrideAccess: true }).catch(() => null);
  if (!doc) notFound();

  if (sp.draft) {
    const pref = await payload
      .find({
        collection: 'payload-preferences',
        where: { and: [{ key: { equals: DRAFT_KEY(id) } }, { 'user.value': { equals: user.id } }, { 'user.relationTo': { equals: 'users' } }] },
        depth: 0,
        limit: 1,
        overrideAccess: true,
      })
      .catch(() => null);
    const draft = pref?.docs?.[0]?.value as any;
    if (draft && typeof draft === 'object') doc = { ...doc, ...draft, id: doc.id, kind: draft.kind || doc.kind };
  }

  let page: Page;
  try {
    page = fromDoc(doc);
  } catch {
    notFound();
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: NO_TRACKING }} />
      {render(page)}
      <EditorBridge />
    </>
  );
}
