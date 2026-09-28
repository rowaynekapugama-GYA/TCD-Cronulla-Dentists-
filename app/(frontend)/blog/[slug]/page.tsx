import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from '@/components/Img';
import { posts, postRoute, canonical, BLOG_ROUTE } from '@/lib/content';
import { SITE_CONFIG } from '@/site.config';
import { OG_IMAGE } from '@/lib/meta';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, ORG_ID } from '@/lib/schema';
import { CtaBand } from '@/components/Cta';
import { PostBody, formatDate } from '@/components/PostBody';

// Unknown slugs fall through to notFound() so the site's own 404 page (not-found.tsx in this route group) renders.
export const dynamicParams = true;

export function generateStaticParams() {
  return posts().map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = posts().find((x) => x.slug === slug);
  if (!p) return {};
  const title = p.metaTitle || `${p.title} | ${SITE_CONFIG.name}`;
  const description = p.metaDescription || p.excerpt;
  const pic = p.ogImage || p.featuredImage;
  const image = pic ? { url: pic.src, width: pic.width || 1200, height: pic.height || 630, alt: pic.alt } : OG_IMAGE;
  return {
    title,
    description,
    alternates: { canonical: canonical(postRoute(p.slug)) },
    openGraph: { title, description, url: canonical(postRoute(p.slug)), siteName: SITE_CONFIG.name, locale: 'en_AU', type: 'article', publishedTime: p.publishedAt, images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
    ...(p.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const p = posts().find((x) => x.slug === slug);
  if (!p) notFound();
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: BLOG_ROUTE },
    { name: p.title, href: postRoute(p.slug) },
  ];
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.excerpt,
    datePublished: p.publishedAt,
    dateModified: p.updatedAt || p.publishedAt,
    author: { '@type': 'Organization', name: p.author || SITE_CONFIG.name },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: canonical(postRoute(p.slug)),
    ...(p.featuredImage ? { image: p.featuredImage.src.startsWith('http') ? p.featuredImage.src : `${SITE_CONFIG.domain}${p.featuredImage.src}` } : {}),
  };
  return (
    <>
      <JsonLd data={[breadcrumbSchema(crumbs), article]} />
      <header className="hero-band">
        <div className="wrap">
          <Breadcrumb items={crumbs} />
          <h1 className="h-display">{p.title}</h1>
          <p className="lede">
            {formatDate(p.publishedAt)}
            {p.author ? ` · ${p.author}` : ''}
          </p>
        </div>
      </header>
      <article className="section section-white" style={{ paddingTop: '2rem' }}>
        <div className="wrap-narrow">
          {p.featuredImage && (
            <div className="photo reveal" style={{ marginBottom: '2rem' }}>
              <Image src={p.featuredImage.src} alt={p.featuredImage.alt} fill sizes="(max-width: 980px) 100vw, 760px" style={{ objectFit: 'cover' }} priority />
            </div>
          )}
          <div className="prose">
            <PostBody data={p.body} />
          </div>
        </div>
      </article>
      <CtaBand />
    </>
  );
}
