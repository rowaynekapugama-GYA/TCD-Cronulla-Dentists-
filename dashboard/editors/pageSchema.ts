/**
 * What each kind of page shows in the editor, in the order the sections appear
 * on the live page. Field names are the Payload field names (which mirror the
 * site's JSON content model), so the editor reads and writes documents as-is.
 */
export type FieldDef =
  | { type: 'text' | 'textarea'; name: string; label: string; help?: string; rows?: number }
  | { type: 'image'; name: string; label: string; help?: string; builtInAlt?: string }
  | { type: 'nodes'; name: string; label: string; help?: string }
  | { type: 'stringList'; name: string; label: string; itemLabel: string; help?: string; rows?: number }
  | { type: 'cards'; name: string; label: string; withImage?: boolean; withIcon?: boolean; withFallback?: boolean; itemLabel?: string; help?: string }
  | { type: 'slides'; name: string; label: string; help?: string }
  | { type: 'group'; name: string; fields: FieldDef[] };

export type SectionDef = { key: string; label: string; help?: string; fields: FieldDef[] };

/** Rows that come from an array of sections on the document (rendered as reorderable top-level rows). */
export type ArraySectionsDef = { name: 'details' | 'sections'; label: string; help: string };

export interface EditorLayout {
  before: SectionDef[];
  array?: ArraySectionsDef;
  after: SectionDef[];
}

const t = (name: string, label: string, help?: string): FieldDef => ({ type: 'text', name, label, help });
const ta = (name: string, label: string, help?: string, rows = 3): FieldDef => ({ type: 'textarea', name, label, help, rows });

export function layoutFor(doc: { kind: string; slug: string }): EditorLayout {
  switch (doc.kind) {
    case 'service':
      return {
        before: [
          {
            key: 'intro',
            label: 'Heading and introduction',
            help: 'The top of the page: heading, the short line above it, the sub-heading and the bold opening line beside the photo.',
            fields: [t('h1', 'Page heading'), t('eyebrow', 'Short line above the heading'), t('h2', 'Sub-heading'), ta('hook', 'Bold opening line'), { type: 'image', name: 'image', label: 'Page photo' }],
          },
          { key: 'body', label: 'Opening copy', help: 'The paragraphs under the sub-heading.', fields: [{ type: 'nodes', name: 'body', label: 'Paragraphs' }] },
          { key: 'cta', label: 'Call-to-action band', fields: [ta('ctaBand', 'Band wording', 'The bold line in the coloured band, for example: Give Us A Call At {{phone}} Today To Make An Appointment', 2)] },
          ...(doc.slug === 'payment-plans'
            ? [
                {
                  key: 'gatedText',
                  label: 'Wording while Zip and Afterpay are switched off',
                  fields: [{ type: 'group', name: 'gatedText', fields: [ta('hook', 'Bold opening line'), ta('bodyIntro', 'Opening paragraph')] } as FieldDef],
                },
              ]
            : []),
        ],
        array: { name: 'details', label: 'In detail', help: 'The headed sections further down the page. Drag the handle to change their order; click one to edit it.' },
        after: [{ key: 'closing', label: 'Closing call to action', fields: [ta('closingCta', 'Closing line', 'The bold line above the final Book online button.', 2)] }],
      };
    case 'prose':
      return {
        before: [
          {
            key: 'intro',
            label: 'Heading and introduction',
            fields: [
              t('h1', 'Page heading'),
              { type: 'stringList', name: 'intro', label: 'Intro paragraphs', itemLabel: 'Paragraph' },
              ...(doc.slug === 'about' ? [{ type: 'image', name: 'dentistsImage', label: 'Photo of the dentists', builtInAlt: 'Dr Ram Nathwani and Dr Lorna Gladwin' } as FieldDef] : []),
            ],
          },
        ],
        array: { name: 'sections', label: 'Sections', help: 'Each section is a heading with its own copy. Drag the handle to reorder; click one to edit it.' },
        after: [],
      };
    case 'contact':
      return {
        before: [{ key: 'intro', label: 'Heading', fields: [t('h1', 'Page heading')] }],
        array: { name: 'sections', label: 'Sections', help: 'Each section is a heading with its own copy. Drag the handle to reorder; click one to edit it.' },
        after: [],
      };
    case 'hub':
      return {
        before: [
          {
            key: 'intro',
            label: 'Heading and introduction',
            fields: [t('h1', 'Page heading'), ta('introLine', 'Intro line'), { type: 'stringList', name: 'serviceList', label: 'The list of treatments', itemLabel: 'Treatment', rows: 1 }, ta('closingLine', 'Closing line', undefined, 2)],
          },
          { key: 'featured', label: 'Featured tiles', help: 'The three photo tiles.', fields: [{ type: 'cards', name: 'featured', label: 'Tiles', withImage: true, withFallback: true }] },
          { key: 'blurbs', label: 'Short blurbs', fields: [{ type: 'cards', name: 'blurbs', label: 'Blurbs', withIcon: true, withFallback: true }] },
          { key: 'categoryCards', label: 'Category cards', fields: [{ type: 'cards', name: 'categoryCards', label: 'Cards', withIcon: true, withFallback: true }] },
          { key: 'closing', label: 'Closing section', fields: [{ type: 'group', name: 'closing', fields: [t('h2', 'Heading'), { type: 'stringList', name: 'paragraphs', label: 'Paragraphs', itemLabel: 'Paragraph' }, ta('closingLine', 'Closing line', undefined, 2)] }] },
        ],
        after: [],
      };
    case 'home':
      return {
        before: [
          { key: 'hero', label: 'Hero banner', help: 'The rotating slides at the very top and the photo behind them.', fields: [{ type: 'slides', name: 'slides', label: 'Slides' }, { type: 'image', name: 'heroImage', label: 'Background photo', builtInAlt: '13 Cronulla Street, Cronulla NSW' }] },
          { key: 'headings', label: 'Main headings', fields: [t('h1', 'Page heading'), t('h2', 'Sub-heading'), t('h3', 'Intro line')] },
          { key: 'pillars', label: 'Three pillars', fields: [{ type: 'cards', name: 'pillars', label: 'Pillars', withIcon: true, withFallback: true }] },
          { key: 'cta', label: 'Call-to-action band', fields: [ta('ctaBand', 'Band wording', undefined, 2)] },
          {
            key: 'welcome',
            label: 'Welcome section',
            fields: [{ type: 'group', name: 'welcome', fields: [t('h2', 'Heading'), t('h3', 'Sub-heading'), { type: 'stringList', name: 'paragraphs', label: 'Paragraphs', itemLabel: 'Paragraph' }] }, { type: 'image', name: 'welcomeImage', label: 'Photo', builtInAlt: 'Aerial view of Cronulla Beach and the Cronulla peninsula, a short walk from the practice on Cronulla Street' }],
          },
          { key: 'categoryCards', label: 'Category cards', fields: [{ type: 'cards', name: 'categoryCards', label: 'Cards', withIcon: true, withFallback: true }] },
          { key: 'treatments', label: 'Treatment tiles', fields: [{ type: 'group', name: 'treatments', fields: [t('h2', 'Heading'), t('h3', 'Sub-heading'), { type: 'cards', name: 'tiles', label: 'Tiles', withImage: true }] }] },
          { key: 'iconBlocks', label: 'Icon blocks', fields: [{ type: 'cards', name: 'iconBlocks', label: 'Blocks', withIcon: true, withFallback: true }] },
          { key: 'paymentBand', label: 'Payment band', fields: [{ type: 'group', name: 'paymentBand', fields: [t('h2', 'Heading'), { type: 'stringList', name: 'lines', label: 'Lines', itemLabel: 'Line', rows: 1 }] }] },
          {
            key: 'note',
            label: 'A note from the dentists',
            fields: [{ type: 'group', name: 'note', fields: [t('h2', 'Heading'), t('h3', 'Sub-heading'), { type: 'stringList', name: 'paragraphs', label: 'Paragraphs', itemLabel: 'Paragraph' }, t('signoff', 'Sign-off')] }, { type: 'image', name: 'dentistsImage', label: 'Photo of the dentists', builtInAlt: 'Dr Ram Nathwani and Dr Lorna Gladwin' }],
          },
        ],
        after: [],
      };
    default:
      return { before: [], after: [] };
  }
}

export const KIND_LABEL: Record<string, string> = {
  service: 'Service page',
  prose: 'Information page',
  home: 'Home page',
  hub: 'Services overview',
  contact: 'Contact page',
};
