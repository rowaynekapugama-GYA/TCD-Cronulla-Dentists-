import { db, requireUser } from '@/dashboard/lib/auth';
import { TeamManager } from '@/dashboard/editors/TeamManager';

export default async function TeamPage() {
  await requireUser();
  const payload = await db();
  const { docs } = await payload.find({ collection: 'team', limit: 50, depth: 1, sort: 'order', overrideAccess: true });
  return (
    <>
      <div className="d-page-head">
        <div>
          <h1>Team</h1>
          <p>The dentists shown on the About page and in Google's listing of the practice. Drag to reorder, hide someone who is away, or edit their photo and bio. Names, titles and qualifications come from the practice and the AHPRA register.</p>
        </div>
      </div>
      <TeamManager initial={docs as any[]} />
    </>
  );
}
