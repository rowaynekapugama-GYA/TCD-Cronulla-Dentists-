import Image from '@/components/Img';
import Link from 'next/link';
import type { ServicePage } from '@/content/types';
import ape from '@/content/ape.json';
import { SITE_CONFIG } from '@/site.config';
import { Inline, Nodes, sectionVisible } from '@/components/Inline';
import { CtaButtons, CtaBand } from '@/components/Cta';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, serviceSchema } from '@/lib/schema';
import { DetailSections } from '@/components/DetailSections';
import { RelatedServices } from '@/components/RelatedServices';
import { apeFontClass } from './fonts';

/**
 * /dental-anxiety/ : The Anxious Patient Experience (TM) at The Cronulla Dentists.
 *
 * The page is the APE website's homepage (build v1.2.5, 15 Oct 2026) rebuilt
 * inside the Cronulla site: same sections in the same order, same wording
 * (content/ape.json), same stylesheet ported with an `ape-` prefix (app/ape.css)
 * and the same photos (public/images/ape/). Two Cronulla blocks sit between the
 * APE "Book Now" quote band and "Meet the team": the practice's own dental
 * anxiety copy from the dashboard (eyebrow, heading, hook, body, photo) and the
 * numbered "in detail" sections, so the practice edits that part exactly like
 * any other service page.
 *
 * Differences from the APE build, on purpose:
 * - The APE header, footer, booking form and JS (FAQ carousel, read-more) are not
 *   used; the Cronulla header and footer wrap the page, the FAQ list is a plain
 *   accordion and Dr Lorna's full bio is shown in one piece.
 * - Only Dr Lorna Gladwin is listed under "Meet the team". The build's other two
 *   cards are marked TODO (no photo, "Bio coming soon"), so they are left out
 *   until the client supplies them.
 * - "Book Now" opens the APE website's booking page (site.config `ape.bookUrl`).
 *   "Talk to Alex" goes to the practice contact page.
 *
 * Styling note: everything sits in .ape-page, which carries the APE palette and
 * fonts. Nothing outside this page is affected.
 */

const crumbHref: Record<string, string> = { Home: '/', Services: '/services/' };

const IconArrowDown = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 3v10M4 9l4 4 4-4" />
  </svg>
);
const IconArrowRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/** The six "What we do differently" card icons, as drawn in the APE build. */
const CARD_ICONS: Record<string, React.ReactNode> = {
  person: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5c1.2-3.2 3.7-4.8 6.5-4.8s5.3 1.6 6.5 4.8" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M4 10h16M9 14.5l2 2 4-4" />
    </>
  ),
  pause: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M10 9v6M14 9v6" />
    </>
  ),
  chat: <path d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H11l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V8A1.5 1.5 0 0 1 5 6.5Z" />,
  waves: (
    <>
      <path d="M3 12c3-3 5-3 8 0s5 3 8 0" />
      <path d="M3 7c3-3 5-3 8 0s5 3 8 0" />
      <path d="M3 17c3-3 5-3 8 0s5 3 8 0" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3.5" y="13.5" width="4" height="6" rx="1.6" />
      <rect x="16.5" y="13.5" width="4" height="6" rx="1.6" />
    </>
  ),
};

function CardIcon({ name }: { name: string }) {
  return (
    <div className="ape-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {CARD_ICONS[name]}
      </svg>
    </div>
  );
}

/** A photo in one of the APE rounded frames. */
function Frame({ shape, img, sizes, priority = false }: { shape: string; img: { src: string; alt: string; pos?: string }; sizes: string; priority?: boolean }) {
  return (
    <div className={`ape-frame ${shape}`}>
      <Image src={img.src} alt={img.alt} fill sizes={sizes} priority={priority} style={{ objectFit: 'cover', objectPosition: img.pos }} />
    </div>
  );
}

/** FAQPage structured data from the APE questions. */
function apeFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ape.faqs.items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a.join(' ') },
    })),
  };
}

export function ApeTemplate({ page }: { page: ServicePage }) {
  const crumbs = page.breadcrumb.map((c, i) => ({ name: c, href: i === page.breadcrumb.length - 1 ? page.meta.route : crumbHref[c] || '/' }));
  const details = page.details.filter(sectionVisible);
  const im = ape.images;
  const bookUrl = SITE_CONFIG.ape.bookUrl;

  return (
    <div className={`ape-page ape-home ${apeFontClass}`}>
      <JsonLd data={[breadcrumbSchema(crumbs), serviceSchema(page), apeFaqSchema()]} />

      {/* Hero */}
      <header className="ape-hero ape-home-hero">
        <div className="ape-wrap ape-grid">
          <div>
            <Breadcrumb items={crumbs} />
            <p className="ape-eyebrow">{ape.hero.eyebrow}</p>
            <h1 className="ape-page-title">{page.h1}</h1>
            <p className="ape-hero-line">{ape.hero.line}</p>
            <p className="ape-sub">{ape.hero.sub}</p>
            <div className="ape-actions">
              <a className="ape-btn" href="#intro">
                {ape.hero.discover}
                <IconArrowDown />
              </a>
              <a className="ape-link-arrow" href={bookUrl} target="_blank" rel="noopener">
                {ape.hero.book}
                <IconArrowRight />
              </a>
            </div>
          </div>
          <div className="ape-hero-media reveal">
            <Frame shape="ape-arch ape-portrait" img={im.hero} sizes="(max-width: 900px) 100vw, 50vw" priority />
          </div>
        </div>
      </header>

      {/* A different starting point */}
      <section className="ape-intro-band ape-bg-linen ape-center" aria-labelledby="ape-intro-heading" id="intro">
        <div className="ape-wrap">
          <p className="ape-eyebrow">{ape.intro.eyebrow}</p>
          <h2 id="ape-intro-heading" className="reveal">
            {ape.intro.h2}
          </h2>
          <p className="reveal">{ape.intro.line}</p>
        </div>
      </section>

      {/* The heart of the experience */}
      <section className="ape-section ape-bg-blush" id="heart" aria-labelledby="ape-heart-heading">
        <div className="ape-wrap ape-heart">
          <div className="ape-heart-intro">
            <p className="ape-eyebrow">{ape.heart.eyebrow}</p>
            <h2 id="ape-heart-heading" className="reveal">
              {ape.heart.h2}
            </h2>
            <Frame shape="ape-heart-photo reveal" img={im.heart} sizes="(max-width: 1024px) 100vw, 40vw" />
          </div>
          <div className="ape-heart-card reveal">
            <div className="ape-quote-stack">
              {ape.heart.lines.map((l) => (
                <p key={l.em}>
                  {l.pre}
                  <em>{l.em}</em>
                  {l.post}
                </p>
              ))}
              <p className="ape-outcome">
                {ape.heart.outcome} <span className="ape-accent">{ape.heart.outcomeAccent}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote band */}
      <section className="ape-quote-band ape-two-tone" aria-label="Quote">
        <div className="ape-wrap">
          <p className="ape-two-tone-lines" style={{ margin: 0 }}>
            <span className="ape-l1 reveal">{ape.quote1.l1}</span>
            <span className="ape-rule reveal" aria-hidden="true" />
            <span className="ape-l2 reveal">{ape.quote1.l2}</span>
          </p>
        </div>
      </section>

      {/* What is The Anxious Patient Experience */}
      <section className="ape-section ape-bg-linen ape-what-is" id="understanding" aria-labelledby="ape-what-heading">
        <div className="ape-wrap ape-what-grid">
          <div className="ape-what-head">
            <p className="ape-eyebrow">{ape.what.eyebrow}</p>
            <h2 id="ape-what-heading" className="reveal">
              {ape.what.h2}
            </h2>
          </div>
          <div className="ape-what-body">
            <p className="ape-what-lead reveal">
              {ape.what.lead.pre}
              <strong>{ape.what.lead.strong}</strong>
              {ape.what.lead.post}
            </p>
            {ape.what.paragraphs.map((p) => (
              <p className="reveal" key={p.slice(0, 40)}>
                {p}
              </p>
            ))}
            <div className="ape-what-aim reveal">
              <p>{ape.what.aim}</p>
              <p>
                <span className="ape-accent">{ape.what.aimAccent}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What if your dental care started with understanding your anxiety first */}
      <section className="ape-section ape-understand-intro" aria-labelledby="ape-first-heading">
        <div className="ape-wrap ape-grid">
          <div>
            <h2 id="ape-first-heading" className="reveal">
              {ape.first.h2}
            </h2>
            <p className="ape-sub reveal">{ape.first.sub}</p>
          </div>
          <div className="ape-hero-media reveal">
            <Frame shape="ape-landscape" img={im.first} sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      {/* The nervous system */}
      <section className="ape-section ape-bg-blush" aria-labelledby="ape-body-heading" id="nervous-system">
        <div className="ape-wrap ape-two-col">
          <div>
            <p className="ape-eyebrow">{ape.body.eyebrow}</p>
            <h2 id="ape-body-heading" className="reveal" style={{ maxWidth: '16ch' }}>
              {ape.body.h2}
            </h2>
            <p className="ape-lead reveal" style={{ marginTop: 20 }}>
              {ape.body.lead}
            </p>
            <ul className="ape-soft-list">
              {ape.body.triggers.map((t) => (
                <li className="reveal" key={t}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="ape-feel-card reveal">
            <h2>{ape.body.feelH2}</h2>
            <p className="ape-lead">{ape.body.feelLead}</p>
            <ul className="ape-dot-list">
              {ape.body.feelings.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="ape-closing-line">
              {ape.body.closing} <span className="ape-accent">{ape.body.closingAccent}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Our approach */}
      <section className="ape-section" aria-labelledby="ape-approach-heading">
        <div className="ape-wrap ape-two-col" style={{ alignItems: 'center' }}>
          <div>
            <p className="ape-eyebrow">{ape.approach.eyebrow}</p>
            <h2 id="ape-approach-heading" className="ape-approach-head reveal">
              {ape.approach.h2} <span className="ape-accent">{ape.approach.h2Accent}</span>
            </h2>
            {ape.approach.paragraphs.map((p) => (
              <p className="ape-lead reveal" key={p.slice(0, 40)}>
                {p}
              </p>
            ))}
          </div>
          <div className="reveal">
            <Frame shape="ape-landscape" img={im.approach} sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      {/* What we do differently */}
      <section className="ape-section ape-bg-linen" aria-labelledby="ape-differently-heading" id="what-we-do-differently">
        <div className="ape-wrap">
          <div className="ape-section-head">
            <p className="ape-eyebrow">{ape.different.eyebrow}</p>
            <h2 id="ape-differently-heading" className="reveal">
              {ape.different.h2}
            </h2>
          </div>
          <div className="ape-card-grid ape-six">
            {ape.different.cards.map((c, i) => (
              <div className="ape-card reveal" key={c.title} style={{ transitionDelay: `${i * 60}ms` }}>
                <CardIcon name={c.icon} />
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="ape-section ape-who" id="who-is-it-for" aria-labelledby="ape-who-heading">
        <div className="ape-wrap ape-who-grid">
          <div className="ape-who-photo reveal">
            <Frame shape="ape-arch ape-portrait" img={im.who} sizes="(max-width: 900px) 100vw, 40vw" />
          </div>
          <div className="ape-who-text">
            <h2 id="ape-who-heading" className="reveal">
              {ape.who.h2}
            </h2>
            {ape.who.paragraphs.map((p) => (
              <p className="reveal" key={p.slice(0, 40)}>
                {p}
              </p>
            ))}
            <div className="ape-who-more reveal">
              {ape.who.more.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing quote band with Book Now */}
      <section className="ape-quote-band ape-two-tone ape-bg-blush" aria-label="Closing">
        <div className="ape-wrap">
          <p className="ape-two-tone-lines" style={{ margin: 0 }}>
            <span className="ape-l1 reveal">{ape.quote2.l1}</span>
            <span className="ape-rule reveal" aria-hidden="true" />
            <span className="ape-l2 reveal">{ape.quote2.l2}</span>
          </p>
          <div className="ape-actions reveal">
            <a className="ape-btn" href={bookUrl} target="_blank" rel="noopener">
              {ape.quote2.book}
            </a>
          </div>
        </div>
      </section>

      {/* The Cronulla copy (dashboard content: eyebrow, heading, hook, body, photo) */}
      <section className="ape-section ape-bg-linen ape-local" aria-labelledby="ape-local-heading" id="cronulla">
        <div className="ape-wrap ape-two-col" style={{ alignItems: 'center' }}>
          <div>
            <p className="ape-eyebrow">{page.eyebrow}</p>
            <h2 id="ape-local-heading" className="reveal">
              {page.h2}
            </h2>
            <p className="ape-hook reveal">
              <Inline text={page.hook} />
            </p>
            <div className="prose reveal">
              <Nodes nodes={page.body} />
            </div>
            <CtaButtons />
          </div>
          <div className="reveal">
            <Frame shape="ape-landscape" img={page.image} sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      {/* The numbered Cronulla sections (dashboard content) */}
      <DetailSections sections={details} title={`${page.h2}: in detail`} />

      {/* Meet the team */}
      <section className="ape-hero-simple ape-center ape-meet-intro" id="meet-the-team" aria-labelledby="ape-meet-heading">
        <div className="ape-wrap">
          <p className="ape-eyebrow">{ape.meet.eyebrow}</p>
          <h2 className="reveal" id="ape-meet-heading">
            {ape.meet.h2}
          </h2>
          <p className="ape-sub reveal">{ape.meet.sub}</p>
        </div>
      </section>

      <section className="ape-section ape-team-section" id="team" aria-label="Team">
        <div className="ape-wrap ape-team-list">
          <article className="ape-member" id="lorna-gladwin" aria-labelledby="lorna-gladwin-name">
            <div className="ape-member-photo reveal">
              <Frame shape="ape-arch ape-portrait" img={im.lorna} sizes="(max-width: 900px) 100vw, 30vw" />
            </div>
            <div className="ape-member-text">
              <h3 id="lorna-gladwin-name" className="ape-member-name reveal">
                {ape.lorna.name}
              </h3>
              <p className="ape-role reveal">{ape.lorna.role}</p>
              {ape.lorna.bio.map((p) => (
                <p className="ape-bio reveal" key={p.slice(0, 40)}>
                  {p}
                </p>
              ))}
              <div className="reveal">
                <blockquote>
                  {ape.lorna.quote} <span className="ape-accent">{ape.lorna.quoteAccent}</span>
                </blockquote>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Questions */}
      <section className="ape-section ape-bg-linen ape-faqs-section" id="faqs" aria-labelledby="ape-faqs-heading">
        <div className="ape-wrap">
          <div className="ape-section-head ape-faqs-head">
            <p className="ape-eyebrow">{ape.faqs.eyebrow}</p>
            <h2 id="ape-faqs-heading" className="reveal">
              {ape.faqs.h2}
            </h2>
          </div>
          <div className="ape-faq reveal">
            {ape.faqs.items.map((f, i) => (
              <details key={f.q} id={`faq-${i + 1}`}>
                <summary>{f.q}</summary>
                <div className="ape-faq-a">
                  {f.a.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>
          <div className="ape-reassure ape-faq-more reveal">
            <div>
              <h3>{ape.faqs.moreH3}</h3>
              <p>{ape.faqs.moreP}</p>
            </div>
            <Link href="/contact/" className="ape-btn ape-btn-ghost">
              {ape.faqs.moreBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* When you are ready */}
      <section className="ape-ready" aria-label="Closing" id="book">
        <div className="ape-wrap">
          <div className="ape-ready-card reveal">
            <p className="ape-eyebrow ape-on-dark">{ape.ready.eyebrow}</p>
            <h2>{ape.ready.h2}</h2>
            <p>{ape.ready.line}</p>
            <div className="ape-actions">
              <a className="ape-btn" href={bookUrl} target="_blank" rel="noopener">
                {ape.ready.book}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* The Cronulla booking strip (adapts to pre-opening / open mode like every other page) */}
      <CtaBand text={page.ctaBand} address />

      <RelatedServices current={page} />

      {/* APE disclaimer */}
      <section className="ape-disclaimer" aria-label="Disclaimer">
        <div className="ape-wrap">
          <p>{ape.disclaimer}</p>
        </div>
      </section>

      <p className="sr-only">
        <Link href="/services/">Back to all services</Link>
      </p>
    </div>
  );
}
