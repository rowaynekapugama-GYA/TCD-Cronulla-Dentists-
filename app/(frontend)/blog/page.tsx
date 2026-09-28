import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from '@/components/Img';
import { posts, postRoute, canonical, BLOG_ROUTE } from '@/lib/content';
import { SITE_CONFIG } from '@/site.config';
import { OG_IMAGE } from '@/lib/meta';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';
import { CtaBand } from '@/components/Cta';
import { formatDate } from '@/components/PostBody';

const crumbs = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: BLOG_ROUTE },
];

export const metadata: Metadata = {
  title: `Dental advice and news | ${SITE_CONFIG.name}`,
  description: `Articles from the team at ${SITE_CONFIG.name}, ${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.suburb}: practical dental information for the Sutherland Shire.`,
  alternates: { canonical: canonical(BLOG_ROUTE) },
  openGraph: { title: `Dental advice and news | ${SITE_CONFIG.name}`, url: canonical(BLOG_ROUTE), siteName: SITE_CONFIG.name, locale: 'en_AU', type: 'website', images: [OG_IMAGE] },
};

/** The blog index exists only once the practice has published an article. */
export default function BlogIndex() {
  const list = posts();
  if (!list.length) notFound();
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <header className="hero-band">
        <div className="wrap">
          <Breadcrumb items={crumbs} />
          <h1 className="h-display">Dental advice and news</h1>
          <p className="lede">Practical information from the team at {SITE_CONFIG.address.street}.</p>
        </div>
      </header>
      <section className="section section-white" style={{ paddingTop: '2rem' }}>
        <div className="grid grid-3">
          {list.map((p) => (
            <Link key={p.slug} href={postRoute(p.slug)} className="card reveal" style={{ padding: 0, overflow: 'hidden' }}>
              {p.featuredImage && (
                <div className="photo" style={{ borderRadius: 0, boxShadow: 'none', aspectRatio: '16/10' }}>
                  <Image src={p.featuredImage.src} alt={p.featuredImage.alt} fill sizes="(max-width: 640px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '1.6rem 1.6rem 1.8rem' }}>
                <span className="kicker">{formatDate(p.publishedAt)}</span>
                <h2 style={{ fontSize: '1.2rem', marginTop: '0.4rem' }}>{p.title}</h2>
                <p>{p.excerpt}</p>
                <span className="text-link">Read more</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
