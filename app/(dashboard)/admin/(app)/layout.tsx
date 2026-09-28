import { redirect } from 'next/navigation';
import { getUser } from '@/dashboard/lib/auth';
import { Shell } from '@/dashboard/ui/Shell';
import { SITE_CONFIG } from '@/site.config';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/admin/login');
  return (
    <Shell user={user} siteName={SITE_CONFIG.name} siteUrl={SITE_CONFIG.domain}>
      {children}
    </Shell>
  );
}
