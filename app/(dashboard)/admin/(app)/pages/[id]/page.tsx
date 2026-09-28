import { notFound } from 'next/navigation';
import { db, requireUser } from '@/dashboard/lib/auth';
import { VisualPageEditor } from '@/dashboard/editors/visual/VisualPageEditor';
import { SITE_CONFIG, telHref } from '@/site.config';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const payload = await db();
  const doc = await payload.findByID({ collection: 'pages', id, depth: 1, overrideAccess: true }).catch(() => null);
  if (!doc) notFound();
  return (
    <VisualPageEditor
      initial={doc}
      siteUrl={SITE_CONFIG.domain}
      siteName={SITE_CONFIG.name}
      isAdmin={user.role === 'admin'}
      cfg={{ phone: SITE_CONFIG.phone, email: SITE_CONFIG.email, tel: telHref() }}
    />
  );
}
