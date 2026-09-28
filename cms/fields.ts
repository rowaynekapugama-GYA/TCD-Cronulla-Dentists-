import type { ArrayField, Field, GroupField, SelectField, TextareaField } from 'payload';

/**
 * Reusable field builders that mirror content/types.ts one for one, so the
 * dashboard edits exactly the shapes the page templates already render.
 * scripts/pull-content.ts turns the saved documents back into the JSON files
 * the site is built from (see cms/pull.ts for the mapping).
 */

export const INLINE_HELP =
  'Plain text with a few shortcuts: **bold**, {{phone}} for the practice phone, {{email}} for the email, and [link text](/route/) for a link.';

/** Feature-flag gate. A gated item renders only while that flag is ON in Site Settings. */
export const gateField = (overrides: { label?: string; admin?: Record<string, unknown> } = {}): SelectField => ({
  name: 'gate',
  type: 'select',
  label: overrides.label || 'Only show when this feature is on',
  options: [
    { label: 'Emergency dentistry', value: 'emergency' },
    { label: 'Kids CDBS (no-gap) offer', value: 'cdbs' },
    { label: 'Zip and Afterpay', value: 'zipAfterpay' },
  ],
  admin: { description: 'Leave blank to always show. Feature switches live in Site Settings.', ...(overrides.admin || {}) },
});

export const inlineText = (name: string, label: string, overrides: Partial<TextareaField> = {}): TextareaField => ({
  name,
  type: 'textarea',
  label,
  admin: { description: INLINE_HELP, rows: 3, ...overrides.admin },
  ...overrides,
});

/** A list of plain strings (breadcrumb labels, paragraphs, bullet lines). */
export const stringList = (name: string, label: string, valueLabel = 'Text', overrides: Partial<ArrayField> = {}): ArrayField => ({
  name,
  type: 'array',
  label,
  labels: { singular: valueLabel, plural: `${valueLabel}s` },
  fields: [{ name: 'value', type: 'textarea', label: valueLabel, required: true, admin: { rows: 2, description: INLINE_HELP } }],
  ...overrides,
});

/** The copy "node": paragraph, bullet list, sub-heading or table. Drag rows to reorder. */
export const nodesField = (name = 'nodes', label = 'Content'): ArrayField => ({
  name,
  type: 'array',
  label,
  labels: { singular: 'Block', plural: 'Blocks' },
  admin: {
    description: 'Paragraphs, bullet lists, sub-headings and tables. Click a row to open it; drag the handle on the left to reorder.',
    initCollapsed: true,
    components: { RowLabel: '/cms/components/RowLabels#NodeRowLabel' },
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'p',
      options: [
        { label: 'Paragraph', value: 'p' },
        { label: 'Bullet list', value: 'ul' },
        { label: 'Sub-heading', value: 'h4' },
        { label: 'Table', value: 'table' },
      ],
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Text',
      admin: { rows: 4, description: INLINE_HELP, condition: (_, sibling) => sibling?.type === 'p' || sibling?.type === 'h4' },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Bullet points',
      labels: { singular: 'Point', plural: 'Points' },
      admin: { condition: (_, sibling) => sibling?.type === 'ul' },
      fields: [{ name: 'value', type: 'textarea', label: 'Point', required: true, admin: { rows: 2, description: INLINE_HELP } }],
    },
    {
      name: 'rowsText',
      type: 'textarea',
      label: 'Table rows',
      admin: {
        rows: 5,
        description: 'One table row per line. Separate the cells in a row with a vertical bar |. The first line is the header row.',
        condition: (_, sibling) => sibling?.type === 'table',
      },
    },
    {
      type: 'collapsible',
      label: 'Visibility (advanced)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'mode',
          type: 'select',
          label: 'Only show in this site mode',
          options: [
            { label: 'Before opening', value: 'pre-opening' },
            { label: 'Once open', value: 'open' },
            { label: 'Once online booking is live', value: 'booking' },
          ],
          admin: { condition: (_, sibling) => sibling?.type === 'p', description: 'Leave blank to always show.' },
        },
        gateField(),
      ],
    },
  ],
});

/** A headed section of nodes. */
export const sectionsField = (name = 'sections', label = 'Sections'): ArrayField => ({
  name,
  type: 'array',
  label,
  labels: { singular: 'Section', plural: 'Sections' },
  admin: {
    description: 'Each section is a heading with its own content. Click a section to open it; drag the handle to reorder.',
    initCollapsed: true,
    components: { RowLabel: '/cms/components/RowLabels#SectionRowLabel' },
  },
  fields: [
    { name: 'heading', type: 'text', label: 'Heading', required: true },
    gateField(),
    nodesField('nodes', 'Section content'),
  ],
});

/** Optional image: an upload from the Media library, or the file path already in the repo. */
export const imageField = (name = 'image', label = 'Image', required = false): GroupField => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      name: 'upload',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo from the media library',
      admin: { description: 'Choose or upload a photo. Leave empty to keep the photo currently built into the site.' },
    },
    {
      name: 'path',
      type: 'text',
      label: 'Built-in photo (file path)',
      admin: { description: 'The photo shipped with the site, used when no library photo is chosen. Changed by the developer only.', readOnly: true },
    },
    {
      name: 'alt',
      type: 'text',
      label: 'Alt text',
      required,
      admin: { description: 'Describes the photo for search engines and screen readers.' },
    },
  ],
});

/** Card with optional link, icon and gated fallback. */
export const cardsField = (name: string, label: string, opts: { withImage?: boolean; withIcon?: boolean; withFallback?: boolean } = {}): ArrayField => {
  const base = (required = true): Field[] => [
    { name: 'title', type: 'text', label: 'Title', required },
    inlineText('text', 'Text'),
    { name: 'href', type: 'text', label: 'Link (optional)', admin: { description: 'A page on this site such as /general-dentistry-cronulla/ or a full https:// address.' } },
    ...(opts.withIcon ? [{ name: 'icon', type: 'text', label: 'Icon name (optional)', admin: { description: 'Developer setting: an icon name from components/Icons.tsx.' } } as Field] : []),
  ];
  return {
    name,
    type: 'array',
    label,
    labels: { singular: 'Card', plural: 'Cards' },
    admin: { initCollapsed: true, components: { RowLabel: '/cms/components/RowLabels#TitleRowLabel' } },
    fields: [
      ...base(),
      ...(opts.withImage ? [imageField('image', 'Photo (optional)')] : []),
      gateField(),
      ...(opts.withFallback
        ? [
            {
              name: 'fallback',
              type: 'group',
              label: 'Shown instead while the feature above is off',
              admin: { condition: (_: unknown, sibling: { gate?: string }) => Boolean(sibling?.gate) },
              fields: base(false),
            } as GroupField,
          ]
        : []),
    ],
  };
};
