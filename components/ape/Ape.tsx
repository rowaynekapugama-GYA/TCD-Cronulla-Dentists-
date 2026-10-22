import Link from 'next/link';
import Image from '@/components/Img';
import type { Node, Section, ServicePage } from '@/content/types';
import { SITE_CONFIG, telHref } from '@/site.config';
import { Inline, Nodes, sectionVisible, slugify } from '@/components/Inline';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/schema';
import { primaryCta } from '@/lib/cta';
import ape from '@/content/ape.json';
import { apeFontVars } from './fonts';

/**
 * The Anxious Patient Experience (APE) on the practice website: the dedicated APE page
 * (the practice's dental anxiety page, same URL and SEO copy, in the APE look and feel),
 * the home page call-out, and the APE logo used in the menu.
 * Styles: app/ape.css (every class starts with ape-). APE copy: content/ape.json.
 */

export const APE = {
  ...SITE_CONFIG.ape,
  logo: '/images/ape/ape-logo.webp',
  /** Route of the APE page on this site. */
  route: `/${SITE_CONFIG.ape.pageSlug}/`,
};

/** "*word*" → italic emphasis, as the APE site sets it. */
function Em({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <em key={i}>{p}</em> : p))}</>;
}

const ICON: Record<string, React.ReactNode> = {
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />,
  calendar: <path d="M4 6h16v14H4zM8 3v4M16 3v4M4 10h16" />,
  pause: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM10 9v6M14 9v6" />,
  chat: <path d="M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />,
  wave: <path d="M3 9c3-3 6 3 9 0s6 3 9 0M3 15c3-3 6 3 9 0s6 3 9 0" />,
  headphones: <path d="M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H4zM17 15h3v5h-3z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  out: <path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5" />,
};
const Svg = ({ name }: { name: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICON[name]}
  </svg>
);

/** Book on the APE website (deposit booking) and visit the APE website. */
function ApeButtons({ center = false, light = false }: { center?: boolean; light?: boolean }) {
  return (
    <div className="ape-btns" style={center ? { justifyContent: 'center' } : undefined}>
      <a href={APE.bookUrl} className="ape-btn" target="_blank" rel="noopener">
        Book Now
      </a>
      <a href={APE.url} className={`ape-btn-text${light ? ' light' : ''}`} target="_blank" rel="noopener">
        Discover the Experience <Svg name="out" />
      </a>
    </div>
  );
}

/** The APE logo mark, linking to the APE page on this site. Used in the menu. */
export function ApeMark({ size = 40 }: { size?: number }) {
  return <Image src={APE.logo} alt="" width={size} height={size} sizes={`${size}px`} className="ape-mark" />;
}

/* ------------------------------------------------------------------ */
/* Home page call-out                                                  */
/* ------------------------------------------------------------------ */
export function ApeHomeBand() {
  if (!SITE_CONFIG.features.ape) return null;
  return (
    <section className={`ape ape-band ${apeFontVars}`} aria-labelledby="ape-band-heading">
      <div className="ape-wrap ape-split">
        <div className="ape-arch reveal">
          <Image src="/images/ape/home-hero-calm-smile.webp" alt="Smiling woman relaxed at home" fill sizes="(max-width: 900px) 100vw, 480px" style={{ objectFit: 'cover' }} />
          <span className="ape-arch-badge">
            <Image src={APE.logo} alt="" width={56} height={56} sizes="56px" />
          </span>
        </div>
        <div className="reveal d1">
          <p className="ape-kicker">{ape.name}</p>
          <h2 id="ape-band-heading" className="ape-h2">
            {ape.question}
          </h2>
          <p className="ape-answer">{ape.answer}</p>
          <p className="ape-lead">{ape.tagline}</p>
          <p className="ape-lead">{ape.who.lead}</p>
          <ul className="ape-chips" aria-label="What we do differently">
            {ape.differently.items.map((i) => (
              <li key={i.title}>{i.title}</li>
            ))}
          </ul>
          <div className="ape-btns">
            <Link href={APE.route} className="ape-btn">
              Dental anxiety care at {SITE_CONFIG.name.replace(/^The /, 'the ')}
            </Link>
            <a href={APE.url} className="ape-btn-text" target="_blank" rel="noopener">
              Visit the APE website <Svg name="out" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The dedicated APE page (the practice's dental anxiety page)         */
/* ------------------------------------------------------------------ */
const isFaq = (s: Section) => /frequently asked|faq/i.test(s.heading);

/** h4 question + following nodes → accordion items. */
function faqItems(nodes: Node[]) {
  const out: { q: string; a: Node[] }[] = [];
  const tail: Node[] = [];
  for (const n of nodes) {
    if (n.type === 'h4') out.push({ q: n.text, a: [] });
    else if (out.length) out[out.length - 1].a.push(n);
    else tail.push(n);
  }
  return { items: out, intro: tail };
}

export function ApeAnxietyPage({ page }: { page: ServicePage }) {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services/' },
    { name: page.h1, href: page.meta.route },
  ];
  const details = page.details.filter(sectionVisible);
  const faq = details.filter(isFaq);
  const editorial = details.filter((s) => !isFaq(s));
  const book = primaryCta();

  return (
    <div className={`ape ${apeFontVars}`}>
      <JsonLd data={[breadcrumbSchema(crumbs), serviceSchema(page), faqSchema(page.details)]} />

      {/* Hero */}
      <header className="ape-hero">
        <div className="ape-wrap ape-split">
          <div>
            <Breadcrumb items={crumbs} />
            <p className="ape-eyebrow">{ape.eyebrow}</p>
            <h1 className="ape-h1">{page.h1}</h1>
            <p className="ape-question">{ape.question}</p>
            <p className="ape-answer">{ape.answer}</p>
            <ApeButtons />
          </div>
          <div className="ape-arch tall">
            <Image src="/images/ape/home-hero-calm-smile.webp" alt="Smiling woman relaxed at home" fill priority sizes="(max-width: 900px) 100vw, 520px" style={{ objectFit: 'cover' }} />
            <span className="ape-arch-badge">
              <Image src={APE.logo} alt="" width={64} height={64} sizes="64px" />
            </span>
          </div>
        </div>
      </header>

      {/* A different starting point */}
      <section className="ape-section ape-blush ape-center" aria-labelledby="ape-intro">
        <div className="ape-wrap">
          <p className="ape-kicker">{ape.introKicker}</p>
          <Image src={APE.logo} alt={ape.name} width={88} height={88} sizes="88px" className="ape-logo-lg" />
          <h2 id="ape-intro" className="ape-h2">
            {ape.name}
          </h2>
          <p className="ape-lead ape-mx">{ape.tagline}</p>
          <p className="ape-small ape-mx">
            Created by {ape.creator.name}
          </p>
        </div>
      </section>

      {/* The heart of the experience */}
      <section className="ape-section" aria-labelledby="ape-heart">
        <div className="ape-wrap ape-split">
          <div>
            <p className="ape-kicker">{ape.heart.kicker}</p>
            <h2 id="ape-heart" className="ape-h2">
              {ape.heart.h2}
            </h2>
            <div className="ape-photo reveal">
              <Image src="/images/ape/home-heart-aligner-smile.webp" alt="Smiling woman holding a clear aligner" fill sizes="(max-width: 900px) 100vw, 520px" style={{ objectFit: 'cover' }} />
            </div>
          </div>
          <div className="ape-card ape-quote reveal d1">
            {ape.heart.lines.map((l) => (
              <p key={l}>
                <Em text={l} />
              </p>
            ))}
            <p className="ape-note">{ape.heart.note}</p>
          </div>
        </div>
      </section>

      {/* The practice's own dental anxiety copy (kept word for word for search) */}
      <section className="ape-section ape-linen" aria-labelledby="ape-practice">
        <div className="ape-wrap ape-split ape-top">
          <div className="ape-sticky">
            {page.eyebrow && <p className="ape-kicker">{page.eyebrow}</p>}
            <h2 id="ape-practice" className="ape-h2">
              {page.h2}
            </h2>
            {page.image?.src && (
              <div className="ape-photo reveal" style={{ marginTop: '1.8rem' }}>
                <Image src={page.image.src} alt={page.image.alt} fill sizes="(max-width: 900px) 100vw, 520px" style={{ objectFit: 'cover' }} />
              </div>
            )}
          </div>
          <div className="ape-prose">
            <p className="ape-lead-strong">
              <Inline text={page.hook} />
            </p>
            <Nodes nodes={page.body} />
          </div>
        </div>
      </section>

      {/* What we do differently */}
      <section className="ape-section" aria-labelledby="ape-diff">
        <div className="ape-wrap">
          <div className="ape-center">
            <p className="ape-kicker">{ape.differently.kicker}</p>
            <h2 id="ape-diff" className="ape-h2">
              {ape.differently.h2}
            </h2>
          </div>
          <div className="ape-grid3">
            {ape.differently.items.map((i, k) => (
              <div key={i.title} className={`ape-card ape-feature reveal${k % 3 ? ` d${k % 3}` : ''}`}>
                <span className="ape-icon">
                  <Svg name={i.icon} />
                </span>
                <h3>{i.title}</h3>
                <p>{i.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* First visit */}
      <section className="ape-section ape-blush" aria-labelledby="ape-first">
        <div className="ape-wrap ape-split ape-top">
          <div>
            <p className="ape-kicker">{ape.firstVisit.kicker}</p>
            <h2 id="ape-first" className="ape-h2">
              {ape.firstVisit.h2}
            </h2>
          </div>
          <div className="ape-prose">
            <p className="ape-lead-serif">{ape.firstVisit.lead}</p>
            {ape.firstVisit.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <ApeButtons />
          </div>
        </div>
      </section>

      {/* The practice's detailed sections */}
      {editorial.length > 0 && (
        <section className="ape-section" aria-label="Dental anxiety in detail">
          <div className="ape-wrap ape-narrow">
            {editorial.map((s, i) => (
              <article key={s.heading || i} className="ape-detail reveal" aria-labelledby={`ape-d-${slugify(s.heading)}`}>
                <span className="ape-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h2 id={`ape-d-${slugify(s.heading)}`} className="ape-h3">
                    {s.heading}
                  </h2>
                  <div className="ape-prose">
                    <Nodes nodes={s.nodes} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Who it is for */}
      <section className="ape-section ape-linen" aria-labelledby="ape-who">
        <div className="ape-wrap ape-split">
          <div className="ape-photo reveal">
            <Image src="/images/ape/brushing-demo.webp" alt="Hands showing brushing technique on a dental model" fill sizes="(max-width: 900px) 100vw, 520px" style={{ objectFit: 'cover' }} />
          </div>
          <div className="ape-prose">
            <h2 id="ape-who" className="ape-h2">
              {ape.who.h2}
            </h2>
            <p className="ape-lead-serif">{ape.who.lead}</p>
            {ape.who.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <div className="ape-limits">
              {ape.who.limits.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creator */}
      <section className="ape-section" aria-labelledby="ape-creator">
        <div className="ape-wrap ape-split">
          <div className="ape-prose">
            <p className="ape-kicker">{ape.creator.kicker}</p>
            <h2 id="ape-creator" className="ape-h2">
              {ape.creator.name}
            </h2>
            <p className="ape-role">{ape.creator.role}</p>
            {ape.creator.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <a href={`${APE.url.replace(/\/$/, '')}/meet-the-team/`} className="ape-btn-text" target="_blank" rel="noopener">
              Meet the APE team <Svg name="out" />
            </a>
          </div>
          <div className="ape-photo reveal">
            <Image src="/images/ape/team-lorna-gladwin.webp" alt="Dr Lorna Gladwin" fill sizes="(max-width: 900px) 100vw, 520px" style={{ objectFit: 'cover', objectPosition: 'center 30%' }} />
          </div>
        </div>
      </section>

      {/* FAQs from the practice page */}
      {faq.map((s) => {
        const { items, intro } = faqItems(s.nodes);
        return (
          <section key={s.heading} className="ape-section ape-blush" aria-labelledby={`ape-${slugify(s.heading)}`}>
            <div className="ape-wrap ape-narrow">
              <div className="ape-center">
                <p className="ape-kicker">Questions</p>
                <h2 id={`ape-${slugify(s.heading)}`} className="ape-h2">
                  {s.heading}
                </h2>
              </div>
              <div className="ape-faq">
                {items.map((it) => (
                  <details key={it.q}>
                    <summary>
                      <Inline text={it.q} />
                    </summary>
                    <div className="ape-prose">
                      <Nodes nodes={it.a} />
                    </div>
                  </details>
                ))}
              </div>
              {intro.length > 0 && (
                <div className="ape-prose" style={{ marginTop: '1.6rem' }}>
                  <Nodes nodes={intro} />
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Closing */}
      <section className="ape-section" aria-labelledby="ape-close">
        <div className="ape-wrap">
          <div className="ape-closing">
            <p className="ape-kicker light">{ape.closing.kicker}</p>
            <h2 id="ape-close" className="ape-h2">
              {ape.closing.h2}
            </h2>
            <p className="ape-closing-text">{ape.closing.text}</p>
            <ApeButtons center light />
            <p className="ape-closing-practice">
              <Inline text={page.closingCta} />
            </p>
            <div className="ape-btns" style={{ justifyContent: 'center' }}>
              <Link href={book.href} className="ape-btn-outline">
                {book.label} at {SITE_CONFIG.name}
              </Link>
              <a href={telHref()} className="ape-btn-outline">
                Call {SITE_CONFIG.phone}
              </a>
            </div>
          </div>
          <p className="ape-disclaimer">{ape.disclaimer}</p>
        </div>
      </section>
    </div>
  );
}
