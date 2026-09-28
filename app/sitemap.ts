import type { MetadataRoute } from 'next';
import { livePages, canonical, posts, postRoute, BLOG_ROUTE } from '@/lib/content';
import { bookingOpen } from '@/lib/cta';

/** Live pages only — gated pages are excluded while their flag is OFF. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = livePages()
    .filter((p) => !p.meta.noindex)
    .map((p) => ({
      url: canonical(p.meta.route),
      lastModified: now,
      changeFrequency: (p.meta.route === '/' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: p.meta.route === '/' ? 1 : p.kind === 'service' ? 0.8 : 0.6,
    }));
  const list = posts();
  if (list.length) {
    pages.push({ url: canonical(BLOG_ROUTE), lastModified: now, changeFrequency: 'weekly', priority: 0.6 });
    for (const p of list) if (!p.noindex) pages.push({ url: canonical(postRoute(p.slug)), lastModified: new Date(p.updatedAt || p.publishedAt), changeFrequency: 'monthly', priority: 0.5 });
  }
  if (!bookingOpen()) pages.push({ url: canonical('/register/'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 });
  return pages;
}
