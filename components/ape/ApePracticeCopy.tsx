import type { ServicePage } from '@/content/types';
import { Inline, Nodes, sectionVisible } from '@/components/Inline';
import { CtaButtons, CtaBand } from '@/components/Cta';
import { DetailSections } from '@/components/DetailSections';
import { RelatedServices } from '@/components/RelatedServices';

/**
 * The practice's own dental anxiety copy from the dashboard ("Dental Anxiety" page: eyebrow,
 * heading, hook, body, the numbered "in detail" sections, the booking strip wording) and
 * Related treatments.
 *
 * Not shown since v2.6.2 / v2.7.0: /dental-anxiety/ holds only the APE website's sections
 * (Dr Lorna Gladwin, 23 Nov 2026). The wording stays in the dashboard and the repo so the
 * content team can reuse it on another page. `ape.practiceCopy: true` in site.config.ts puts
 * it back on this page, after the APE "Book Now" quote and after "When you are ready".
 */
export function ApePracticeCopy({ page }: { page: ServicePage }) {
  const details = page.details.filter(sectionVisible);
  return (
    <>
      <section className="ape-section ape-bg-linen ape-local" aria-labelledby="ape-local-heading" id="cronulla">
        <div className="ape-wrap ape-local-wrap">
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
        </div>
      </section>
      <DetailSections sections={details} title={`${page.h2}: in detail`} />
    </>
  );
}

export function ApePracticeClosing({ page }: { page: ServicePage }) {
  return (
    <>
      <CtaBand text={page.ctaBand} address />
      <RelatedServices current={page} />
    </>
  );
}
