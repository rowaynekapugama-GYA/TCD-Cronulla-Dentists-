import Link from 'next/link';
import { db, requireUser } from '@/dashboard/lib/auth';
import { KIND_LABEL } from '@/dashboard/editors/pageSchema';
import { SITE_CONFIG } from '@/site.config';

const fmt = (iso: string) => new Date(iso).toLocaleString('en-AU', { timeZone: 'Australia/Sydney', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const ORDER: Record<string, number> = { home: 0, hub: 1, service: 2, prose: 3, contact: 4 };

export default async function PagesList() {
  await requireUser();
  const payload = await db();
  const { docs } = await payload.find({ collection: 'pages', limit: 200, depth: 0, sort: 'title', overrideAccess: true });
  const pages = [...docs].sort((a: any, b: any) => (ORDER[a.kind] ?? 9) - (ORDER[b.kind] ?? 9) || a.title.localeCompare(b.title));
  return (
    <>
      <div className="d-page-head">
        <div>
          <h1>Pages</h1>
          <p>Every page on the website. Open a page to edit its wording, photos and search settings. Changes go live after you Publish website.</p>
        </div>
      </div>
      <div className="d-card tight">
        <table className="d-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Type</th>
              <th>Last edited</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p: any) => (
              <tr key={p.id}>
                <td>
                  <Link className="title" href={`/admin/pages/${p.id}`}>
                    {p.title}
                  </Link>
                  <div className="muted">{p.route}</div>
                </td>
                <td>
                  <span className="d-badge">{KIND_LABEL[p.kind] || p.kind}</span>
                  {p.gate && (
                    <span className="d-badge warn" style={{ marginLeft: 6 }}>
                      Needs feature on
                    </span>
                  )}
                </td>
                <td className="muted">{fmt(p.updatedAt)}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <Link className="d-btn sm" href={`/admin/pages/${p.id}`}>
                    Edit
                  </Link>{' '}
                  <a className="d-btn sm ghost" href={`${SITE_CONFIG.domain}${p.route}`} target="_blank" rel="noopener">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
