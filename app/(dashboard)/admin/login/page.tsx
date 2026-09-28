import { redirect } from 'next/navigation';
import { db, getUser } from '@/dashboard/lib/auth';
import { LoginForm } from '@/dashboard/ui/LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const user = await getUser();
  if (user) redirect('/admin');
  const { expired } = await searchParams;
  // Brand-new install: no accounts yet. The very first one is created in Payload at /cms.
  let noUsers = false;
  try {
    const payload = await db();
    noUsers = (await payload.count({ collection: 'users', overrideAccess: true })).totalDocs === 0;
  } catch {
    /* database not reachable: show the normal form */
  }
  return (
    <div className="d-login">
      <div className="d-login-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="logo" src="/images/logo-primary.jpg" alt="The Cronulla Dentists" />
        <h1>Website dashboard</h1>
        {expired && <div className="d-notice warn">Your session ended. Please sign in again.</div>}
        {noUsers && (
          <div className="d-notice info">
            <div className="grow">
              <strong>No accounts yet.</strong>
              <small>
                Create the first GYA admin account at <a href="/cms">/cms</a>, then sign in here.
              </small>
            </div>
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
