import { preload } from 'react-dom';
import type { ServicePage } from '@/content/types';
import ape from '@/content/ape.json';
import { SITE_CONFIG } from '@/site.config';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, serviceSchema } from '@/lib/schema';
import { img } from '@/lib/img';
import { promoHref } from '@/lib/apePromo';
import { APE_AGE_LINE } from '@/lib/ape';
import { apeFontClass } from './fonts';
import { ApeBehaviour } from './ApeBehaviour';
import { ApePracticeCopy, ApePracticeClosing } from './ApePracticeCopy';

/**
 * /dental-anxiety/ : The Anxious Patient Experience (TM) at The Cronulla Dentists.
 *
 * Between the site header and the site footer this page is the APE website's home page,
 * section for section (v2.7.0, 24 Nov 2026, at Dr Lorna Gladwin's request). Nothing here is
 * written for this site:
 *
 * - Wording: content/ape.json, which is the APE source pack's `ape-page.json` unchanged
 *   (16 sections, APE website v1.14.0). To update the wording, replace that file with the
 *   one from a new pack. In the text, *word* is italic, **word** is bold and [[words]] are
 *   the second tone.
 * - Photos: public/images/ape/, the pack's own files and alt text, at the APE site's crops.
 * - Look: app/ape.css, the APE stylesheet ported with scripts/port-ape-css.py (classes
 *   renamed .X -> .ape-X, everything scoped to .ape-page).
 * - Markup: the same elements, classes and reveal steps as the APE home page
 *   (the pack's reference/ape-home.html), so the ported stylesheet lays it out the same way.
 * - Behaviour: components/ape/ApeBehaviour.tsx (scroll reveals, Read more, the FAQ viewer),
 *   ported from the APE site's script.
 *
 * The only differences from the APE website, all on purpose:
 * 1. This site's header and footer wrap the page. The APE header, menu and footer menu are
 *    not copied; the APE footer's contact details and disclaimer are section 16.
 * 2. The page keeps its own URL, canonical, title, description and H1 text. The H1 shows as
 *    one small line above the hero's small heading; the hero question has the APE h1 look
 *    but is an h2.
 * 3. Book Now opens the APE booking page in a new tab, tagged utm_content=ape-page.
 * 4. "Reach out to Alex" goes to #ape-contact and "Discover the Experience" to #intro.
 * 5. The "Opening special" ribbon, FAQ note and pop-up are not copied (the APE booking
 *    system switches them on and off).
 *
 * Switches:
 * - Site Settings > APE promotion > "Show Alex and Lauren on the APE page" (on).
 * - Site Settings > APE promotion > "Show the 15 and over line" (off; the APE home page has
 *   no age line, so turning it on makes this page differ from the APE site).
 * - site.config.ts `ape.practiceCopy` (false): the practice's own dental anxiety copy from
 *   the dashboard. Kept, not shown. See components/ape/ApePracticeCopy.tsx.
 *
 * Check after any change: npm run qa:ape (scripts/ape/tools/check-ape-match.mjs).
 */

type Photo = { file: string; files: string[]; alt: string; note?: string };
type Button = { label: string };
type Member = { name: string; role: string; bio: string[]; quote?: string; buttons?: Button[]; image: Photo };
/** The shape of a section in the pack's ape-page.json (each section uses the fields it needs). */
interface Section {
  id: string;
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  buttons: Button[];
  image: Photo;
  quote: string;
  list: string[];
  heading2: string;
  paragraphs2: string[];
  list2: string[];
  closing: string;
  cards: { heading: string; text: string }[];
  members: Member[];
  faqs: { question: string; answer: string[] }[];
  card: { heading: string; text: string; buttons: Button[] };
  contact: { place: string; address: string; addressLink: string; phone: string; phoneLink: string; labels: { label: string; email: string }[] };
  disclaimer: string;
}
function section(id: string): Section {
  const found = (ape.sections as unknown as Section[]).find((s) => s.id === id);
  if (!found) throw new Error(`content/ape.json has no section "${id}"`);
  return found;
}

const IMG_DIR = '/images/ape/';
const src = (file: string) => img(IMG_DIR + file);

/** The APE site's crops (object-position) for the four photos and the three portraits. */
const FOCUS: Record<string, string> = {
  'ape-armchair-corner': '34% 50%',
  'ape-candle-book': '52% 50%',
  'ape-textured-napkin': '50% 62%',
  'ape-toothbrushes-eucalyptus': '24% 50%',
  'team-lorna-gladwin-2026-10-26': '50% 22%',
  'team-alex-loupos-2026-11-03': '50% 16%',
  'team-lauren-bright-2026-11-09': '45% 22%',
};
const stem = (file: string) => file.replace(/\.(webp|jpe?g|png)$/i, '');

/** *italic*, **bold** and [[second tone]] in the pack's wording. */
function rich(text: string): React.ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[\[[\s\S]+?\]\])/)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('[[')) return <span className="ape-accent" key={i}>{part.slice(2, -2)}</span>;
      if (part.startsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
      return part;
    });
}
/** "First line. [[Second line.]]" as its two parts. */
function twoTone(text: string): [string, string] {
  const m = /^([\s\S]*?)\s*\[\[([\s\S]+)\]\]\s*$/.exec(text);
  return m ? [m[1], m[2]] : [text, ''];
}

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
const IconArrowLeft = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M13 8H3M7 4 3 8l4 4" />
  </svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 6l4 4 4-4" />
  </svg>
);

/** The six "What we do differently" icons, in the APE site's order. */
const CARD_ICONS: React.ReactNode[] = [
  <>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5.5 19.5c1.2-3.2 3.7-4.8 6.5-4.8s5.3 1.6 6.5 4.8" />
  </>,
  <>
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M8 3v4M16 3v4M4 10h16M9 14.5l2 2 4-4" />
  </>,
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M10 9v6M14 9v6" />
  </>,
  <path d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H11l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V8A1.5 1.5 0 0 1 5 6.5Z" />,
  <>
    <path d="M3 12c3-3 5-3 8 0s5 3 8 0" />
    <path d="M3 7c3-3 5-3 8 0s5 3 8 0" />
    <path d="M3 17c3-3 5-3 8 0s5 3 8 0" />
  </>,
  <>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="3.5" y="13.5" width="4" height="6" rx="1.6" />
    <rect x="16.5" y="13.5" width="4" height="6" rx="1.6" />
  </>,
];

/** One of the four APE photos: WebP at 800, 1400 and 2400 px with the JPG behind it, as on the APE site. */
function Photo({ photo, sizes, eager = false }: { photo: Photo; sizes: string; eager?: boolean }) {
  const name = stem(photo.file);
  const srcSet = [800, 1400, 2400].map((w) => `${src(`${name}-${w}.webp`)} ${w}w`).join(', ');
  if (eager) preload(src(`${name}-1400.webp`), { as: 'image', imageSrcSet: srcSet, imageSizes: sizes, fetchPriority: 'high', type: 'image/webp' });
  return (
    <picture>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img
        src={src(photo.file)}
        width={2400}
        height={1340}
        alt={photo.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : undefined}
        style={{ objectPosition: FOCUS[name] }}
      />
    </picture>
  );
}

/** A team portrait, with the same files and sizes the APE site serves for that person. */
function Portrait({ photo }: { photo: Photo }) {
  const name = stem(photo.file);
  const [w, h] = (/(\d+) x (\d+)/.exec(photo.note || '') || []).slice(1).map(Number);
  const common = { width: w || 1086, height: h || 1448, alt: photo.alt, loading: 'lazy' as const, decoding: 'async' as const, style: { objectPosition: FOCUS[name] } };
  const webp = photo.files.filter((f) => f.endsWith('.webp'));
  if (photo.file.endsWith('.webp')) return <img src={src(photo.file)} sizes="(max-width: 900px) 30vw, 30vw" {...common} />;
  const small = webp.find((f) => /-800\.webp$/.test(f));
  const full = webp.find((f) => !/-800\.webp$/.test(f)) as string;
  return (
    <picture>
      {small ? (
        <source type="image/webp" srcSet={`${src(small)} 800w, ${src(full)} ${common.width}w`} sizes="(max-width: 900px) 92vw, 30vw" />
      ) : (
        <source type="image/webp" srcSet={src(full)} />
      )}
      <img src={src(photo.file)} {...common} />
    </picture>
  );
}

const slug = (name: string) => name.toLowerCase().replace(/^dr\s+/, '').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

/** FAQPage structured data: the 11 APE questions and answers, word for word. */
function apeFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: section('faqs').faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer.join(' ') },
    })),
  };
}

const crumbHref: Record<string, string> = { Home: '/', Services: '/services/' };

export function ApeTemplate({ page }: { page: ServicePage }) {
  const crumbs = page.breadcrumb.map((c, i) => ({ name: c, href: i === page.breadcrumb.length - 1 ? page.meta.route : crumbHref[c] || '/' }));
  // Every Book Now on this page goes to the APE booking page, tagged so APE can see it came from here.
  const bookUrl = promoHref(SITE_CONFIG.ape.bookUrl, 'ape-page');
  const book = { href: bookUrl, target: '_blank', rel: 'noopener' };
  const showTeam = SITE_CONFIG.apePromo.teamEnabled !== false;
  const practiceCopy = SITE_CONFIG.ape.practiceCopy === true;
  // "15 and over" line: off, and not on the APE home page. See the note at the top of this file.
  const ageLine = SITE_CONFIG.apePromo.ageLineEnabled ? <p className="ape-age-line">{APE_AGE_LINE}</p> : null;

  const hero = section('hero');
  const intro = section('intro');
  const heart = section('heart');
  const understanding = section('understanding');
  const nervous = section('nervous-system');
  const approach = section('approach');
  const different = section('what-we-do-differently');
  const who = section('who-is-it-for');
  const meet = section('meet-the-team');
  const team = section('team');
  const faqs = section('faqs');
  const ready = section('book');
  const reach = section('ape-contact');
  const members = showTeam ? team.members : team.members.slice(0, 1);
  const [approachHead, approachAccent] = twoTone(approach.heading);
  const [closing, closingAccent] = twoTone(nervous.closing);

  return (
    <div className={`ape-page ape-home ${apeFontClass}`}>
      <JsonLd data={[breadcrumbSchema(crumbs), serviceSchema(page), apeFaqSchema()]} />

      {/* 1. Hero */}
      <section className="ape-hero">
        <div className="ape-wrap ape-grid">
          <div>
            <h1 className="ape-page-h1">{page.h1}</h1>
            <p className="ape-eyebrow reveal ape-fade">{hero.eyebrow}</p>
            <h2 className="ape-h1 reveal ape-fade ape-d1">{hero.heading}</h2>
            <p className="ape-sub reveal ape-fade ape-d2">{hero.paragraphs[0]}</p>
            <div className="ape-actions reveal ape-fade ape-d3">
              <a className="ape-btn" href="#intro">
                {hero.buttons[0].label}
                <IconArrowDown />
              </a>
              <a className="ape-link-arrow" {...book}>
                {hero.buttons[1].label}
                <IconArrowRight />
              </a>
            </div>
            {ageLine}
          </div>
          <div className="ape-hero-media reveal ape-fade ape-d1">
            <div className="ape-frame ape-arch ape-portrait">
              <Photo photo={hero.image} sizes="(max-width: 900px) 100vw, 50vw" eager />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Intro band */}
      <section className="ape-intro-band ape-bg-linen ape-center" aria-labelledby="ape-intro-heading" id="intro">
        <div className="ape-wrap">
          <p className="ape-eyebrow">{intro.eyebrow}</p>
          <h2 id="ape-intro-heading" className="reveal">
            {intro.heading}
          </h2>
          <p className="reveal ape-d1">{intro.paragraphs[0]}</p>
        </div>
      </section>

      {/* 3. The heart of the experience */}
      <section className="ape-section ape-bg-blush" id="heart" aria-labelledby="ape-heart-heading">
        <div className="ape-wrap ape-heart">
          <div className="ape-heart-intro">
            <p className="ape-eyebrow">{heart.eyebrow}</p>
            <h2 id="ape-heart-heading" className="reveal ape-d1">
              {heart.heading}
            </h2>
            <div className="ape-frame ape-heart-photo reveal ape-from-left ape-d1">
              <Photo photo={heart.image} sizes="(max-width: 1024px) 100vw, 40vw" />
            </div>
          </div>
          <div className="ape-heart-card reveal ape-from-right ape-d1">
            <div className="ape-quote-stack">
              {heart.paragraphs.map((p, i) => (
                <p className={`${i === heart.paragraphs.length - 1 ? 'ape-outcome ' : ''}reveal ape-seq`} key={i}>
                  {rich(p)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quote band */}
      <section className="ape-quote-band ape-two-tone" aria-label="Quote">
        <div className="ape-wrap">
          <TwoTone as="p" text={section('quote-1').quote} style={{ margin: 0 }} />
        </div>
      </section>

      {/* 5. What is The Anxious Patient Experience */}
      <section className="ape-section ape-bg-linen ape-what-is" id="understanding" aria-labelledby="ape-what-heading">
        <div className="ape-wrap ape-what-grid">
          <div className="ape-what-head">
            <p className="ape-eyebrow">{understanding.eyebrow}</p>
            <h2 id="ape-what-heading" className="reveal ape-d1">
              {understanding.heading}
            </h2>
          </div>
          <div className="ape-what-body">
            <p className="ape-what-lead reveal">{rich(understanding.paragraphs[0])}</p>
            {understanding.paragraphs.slice(1, -2).map((p, i) => (
              <p className="reveal" key={i}>
                {rich(p)}
              </p>
            ))}
            <div className="ape-what-aim reveal ape-pop">
              {understanding.paragraphs.slice(-2).map((p, i) => (
                <p className="reveal ape-seq" key={i}>
                  {rich(p)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Bridge quote */}
      <section className="ape-quote-band ape-two-tone ape-bridge-quote" aria-labelledby="ape-first-heading">
        <div className="ape-wrap">
          <TwoTone as="h2" id="ape-first-heading" text={section('quote-2').quote} />
        </div>
      </section>

      {/* 7. The nervous system */}
      <section className="ape-section ape-bg-blush" aria-labelledby="ape-body-heading" id="nervous-system">
        <div className="ape-wrap ape-two-col">
          <div>
            <p className="ape-eyebrow">{nervous.eyebrow}</p>
            <h2 id="ape-body-heading" className="reveal ape-d1" style={{ maxWidth: '16ch' }}>
              {nervous.heading}
            </h2>
            <p className="ape-lead reveal ape-d2" style={{ marginTop: 20 }}>
              {nervous.paragraphs[0]}
            </p>
            <ul className="ape-soft-list">
              {nervous.list.map((t) => (
                <li className="reveal ape-pop ape-seq" key={t}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="ape-feel-card reveal ape-from-right ape-d1">
            <h2>{nervous.heading2}</h2>
            <p className="ape-lead">{nervous.paragraphs2[0]}</p>
            <ul className="ape-dot-list">
              {nervous.list2.map((t) => (
                <li className="reveal ape-seq" key={t}>
                  {t}
                </li>
              ))}
            </ul>
            <p className="ape-closing-line">
              {closing} <span className="ape-accent">{closingAccent}</span>
            </p>
          </div>
        </div>
      </section>

      {/* 8. Our approach */}
      <section className="ape-section" aria-labelledby="ape-approach-heading" id="approach">
        <div className="ape-wrap ape-two-col" style={{ alignItems: 'center' }}>
          <div>
            <p className="ape-eyebrow">{approach.eyebrow}</p>
            <h2 id="ape-approach-heading" className="ape-approach-head reveal ape-d1">
              {approachHead} <span className="ape-accent">{approachAccent}</span>
            </h2>
            {approach.paragraphs.map((p, i) => (
              <p className="ape-lead reveal ape-d2" key={i}>
                {rich(p)}
              </p>
            ))}
          </div>
          <div className="reveal ape-from-right ape-d1">
            <div className="ape-frame ape-landscape">
              <Photo photo={approach.image} sizes="(max-width: 900px) 100vw, 50vw" />
            </div>
          </div>
        </div>
      </section>

      {/* 9. What we do differently */}
      <section className="ape-section ape-bg-linen" aria-labelledby="ape-differently-heading" id="what-we-do-differently">
        <div className="ape-wrap">
          <div className="ape-section-head">
            <p className="ape-eyebrow">{different.eyebrow}</p>
            <h2 id="ape-differently-heading" className="reveal ape-d1">
              {different.heading}
            </h2>
          </div>
          <div className="ape-card-grid ape-six">
            {different.cards.map((c, i) => (
              <div className="ape-card reveal ape-pop ape-seq" key={c.heading}>
                <div className="ape-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {CARD_ICONS[i]}
                  </svg>
                </div>
                <h3>{c.heading}</h3>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Who is it for */}
      <section className="ape-section ape-who" id="who-is-it-for" aria-labelledby="ape-who-heading">
        <div className="ape-wrap ape-who-grid">
          <div className="ape-who-photo reveal ape-from-left">
            <div className="ape-frame ape-arch ape-portrait">
              <Photo photo={who.image} sizes="(max-width: 900px) 100vw, 40vw" />
            </div>
          </div>
          <div className="ape-who-text">
            <h2 id="ape-who-heading" className="reveal">
              {who.heading}
            </h2>
            {who.paragraphs.slice(0, 2).map((p, i) => (
              <p className="reveal" key={i}>
                {rich(p)}
              </p>
            ))}
            <div className="ape-who-more reveal">
              {who.paragraphs.slice(2).map((p, i) => (
                <p key={i}>{rich(p)}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 11. Closing quote with Book Now */}
      <section className="ape-quote-band ape-two-tone ape-bg-blush" aria-label="Closing">
        <div className="ape-wrap">
          <TwoTone as="p" text={section('quote-3').quote} style={{ margin: 0 }} />
          <div className="ape-actions reveal ape-d2">
            <a className="ape-btn" {...book}>
              {section('quote-3').buttons[0].label}
            </a>
          </div>
        </div>
      </section>

      {/* The practice's own dental anxiety copy: kept in the dashboard, switched off for this page. */}
      {practiceCopy ? <ApePracticeCopy page={page} /> : null}

      {/* 12. Meet the team */}
      <section className="ape-hero-simple ape-center ape-meet-intro" id="meet-the-team" aria-labelledby="ape-meet-heading">
        <div className="ape-wrap">
          <p className="ape-eyebrow">{meet.eyebrow}</p>
          <h2 className="reveal ape-d1" id="ape-meet-heading">
            {meet.heading}
          </h2>
          <p className="ape-sub reveal ape-d2">{meet.paragraphs[0]}</p>
        </div>
      </section>

      {/* 13. Team */}
      <section className="ape-section ape-team-section" id="team" aria-label="Team">
        <div className={`ape-wrap ${members.length > 1 ? 'ape-team-grid' : 'ape-team-list'}`}>
          {members.map((m, i) => {
            const id = slug(m.name);
            const [quote, quoteAccent] = m.quote ? twoTone(m.quote) : ['', ''];
            return (
              <article className="ape-member" id={id} aria-labelledby={`${id}-name`} key={id}>
                <div className={`ape-member-photo reveal ape-pop${i ? ` ape-d${i}` : ''}`}>
                  <div className="ape-frame ape-arch ape-portrait">
                    <Portrait photo={m.image} />
                  </div>
                </div>
                <div className="ape-member-text">
                  <h3 id={`${id}-name`} className="ape-member-name reveal">
                    {m.name}
                  </h3>
                  <p className="ape-role reveal">{m.role}</p>
                  <p className="ape-bio reveal">{m.bio[0]}</p>
                  <div className="ape-bio-more" id={`${id}-more`}>
                    <div className="ape-bio-more-inner">
                      {m.bio.slice(1).map((p, k) => (
                        <p className="ape-bio" key={k}>
                          {p}
                        </p>
                      ))}
                      {quote ? (
                        <div className="reveal ape-d2">
                          <blockquote>
                            {quote} <span className="ape-accent">{quoteAccent}</span>
                          </blockquote>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {/* Without JavaScript the button stays hidden and the whole bio shows (as on the APE site). */}
                  <button type="button" className="ape-read-more" aria-expanded="true" aria-controls={`${id}-more`} hidden>
                    <span className="ape-read-more-label">Read less</span>
                    <IconChevron />
                  </button>
                  {m.buttons?.length ? (
                    <div className="ape-actions reveal">
                      <a href="#ape-contact" className="ape-btn ape-btn-ghost">
                        {m.buttons[0].label}
                      </a>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 14. FAQs */}
      <section className="ape-section ape-bg-linen ape-faqs-section" id="faqs" aria-labelledby="ape-faqs-heading">
        <div className="ape-wrap">
          <div className="ape-section-head ape-faqs-head">
            <p className="ape-eyebrow">{faqs.eyebrow}</p>
            <h2 id="ape-faqs-heading" className="reveal ape-d1">
              {faqs.heading}
            </h2>
          </div>
          <div className="ape-faq-deck reveal">
            <ol className="ape-faq-index" aria-label="Questions">
              {faqs.faqs.map((f, i) => (
                <li key={f.question}>
                  <button type="button" className="ape-faq-jump" data-go={i} aria-controls={`faq-${i + 1}`} aria-current={i === 0 ? 'true' : undefined}>
                    {f.question}
                  </button>
                </li>
              ))}
            </ol>
            <div className="ape-faq-stage">
              <div className="ape-faq-track" tabIndex={0} role="group" aria-label="Questions and answers">
                {faqs.faqs.map((f, i) => (
                  <article className="ape-faq-card" id={`faq-${i + 1}`} aria-labelledby={`faq-${i + 1}-q`} key={f.question}>
                    <h3 id={`faq-${i + 1}-q`}>{f.question}</h3>
                    {f.answer.map((p, k) => (
                      <p key={k}>{p}</p>
                    ))}
                  </article>
                ))}
              </div>
              <div className="ape-faq-nav">
                <button type="button" className="ape-faq-arrow ape-faq-prev" aria-label="Previous question" disabled>
                  <IconArrowLeft />
                </button>
                <span className="ape-faq-count" aria-live="polite">
                  <span className="ape-faq-now">1</span> / {faqs.faqs.length}
                </span>
                <button type="button" className="ape-faq-arrow ape-faq-next" aria-label="Next question">
                  <IconArrowRight />
                </button>
              </div>
            </div>
          </div>
          <div className="ape-reassure ape-faq-more reveal ape-pop">
            <div>
              <h3>{faqs.card.heading}</h3>
              <p>{faqs.card.text}</p>
            </div>
            <a href="#ape-contact" className="ape-btn ape-btn-ghost">
              {faqs.card.buttons[0].label}
            </a>
          </div>
        </div>
      </section>

      {/* 15. When you are ready */}
      <section className="ape-ready" aria-label="Closing" id="book">
        <div className="ape-wrap">
          <div className="ape-ready-card reveal ape-pop">
            <p className="ape-eyebrow ape-on-dark">{ready.eyebrow}</p>
            <h2>{ready.heading}</h2>
            <p>{ready.paragraphs[0]}</p>
            <div className="ape-actions">
              <a className="ape-btn" {...book}>
                {ready.buttons[0].label}
              </a>
            </div>
            {ageLine}
          </div>
        </div>
      </section>

      {practiceCopy ? <ApePracticeClosing page={page} /> : null}

      {/* 16. How to reach APE: the APE website's footer details. Both "Reach out to Alex" buttons land here. */}
      <section className="ape-reach" id="ape-contact" aria-label="How to reach The Anxious Patient Experience">
        <div className="ape-wrap">
          <ul className="ape-contact">
            <li className="ape-contact-name">{reach.contact.place}</li>
            <li>
              <a href={reach.contact.addressLink} target="_blank" rel="noopener">
                {reach.contact.address}
                <span className="sr-only"> (opens Google Maps)</span>
              </a>
            </li>
            <li>
              <a href={reach.contact.phoneLink}>{reach.contact.phone}</a>
            </li>
            {reach.contact.labels.map((l) => (
              <li className="ape-contact-email" key={l.email}>
                <span className="ape-contact-label">{l.label}</span>
                <a href={`mailto:${l.email}`}>{l.email}</a>
              </li>
            ))}
          </ul>
          <p className="ape-disclaimer">{reach.disclaimer}</p>
        </div>
      </section>

      <ApeBehaviour />
    </div>
  );
}

/** A two-tone quote: navy first line, a short taupe rule, taupe second line. */
function TwoTone({ as: Tag, text, id, style }: { as: 'p' | 'h2'; text: string; id?: string; style?: React.CSSProperties }) {
  const [l1, l2] = twoTone(text);
  return (
    <Tag className="ape-two-tone-lines" id={id} style={style}>
      <span className="ape-l1 reveal">{l1}</span>
      <span className="ape-rule reveal ape-pop ape-d1" aria-hidden="true" />
      <span className="ape-l2 reveal ape-d1">{l2}</span>
    </Tag>
  );
}
