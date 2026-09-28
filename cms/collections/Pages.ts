import type { CollectionConfig, Field } from 'payload';
import { isLoggedIn, publishedOrLoggedIn } from '../access';
import { cardsField, gateField, imageField, inlineText, nodesField, sectionsField, stringList } from '../fields';
import { markChanged } from '../hooks/markChanged';

type Kind = 'service' | 'prose' | 'home' | 'hub' | 'contact';
/** Payload's condition signature is (data, siblingData, ctx). We only need data.kind. */
const onlyFor = (...kinds: Kind[]) => (data: any) => kinds.includes(data?.kind);

const seoFields: Field[] = [
  { name: 'metaTitle', type: 'text', label: 'Meta title', required: true, admin: { description: 'Shown in the browser tab and in Google. Keep under about 60 characters.' } },
  { name: 'metaDescription', type: 'textarea', label: 'Meta description', required: true, admin: { rows: 3, description: 'The summary Google shows under the title. Aim for 120 to 155 characters.' } },
  {
    name: 'ogImage',
    type: 'upload',
    relationTo: 'media',
    label: 'Share image (optional)',
    admin: { description: 'Shown when this page is shared on Facebook or in messages. 1200 x 630 works best. Leave empty to use the default share image.' },
  },
  { name: 'noindex', type: 'checkbox', label: 'Hide this page from search engines', defaultValue: false },
  { name: 'canonical', type: 'text', label: 'Canonical URL (optional)', admin: { description: 'Only if this page should point search engines at a different address. Leave empty to use its own.' } },
  { name: 'primaryKeyword', type: 'text', label: 'Primary keyword (reference only)', admin: { description: 'For the SEO team. Not shown on the page.' } },
  {
    type: 'collapsible',
    label: 'Alternative meta while a feature is switched off (developer)',
    admin: { initCollapsed: true },
    fields: [
      { name: 'metaTitleGated', type: 'text', label: 'Meta title while gated' },
      { name: 'metaDescriptionGated', type: 'textarea', label: 'Meta description while gated', admin: { rows: 2 } },
    ],
  },
];

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'route', 'kind', '_status', 'updatedAt'],
    group: 'Content',
    description:
      'Every page on the website. Edit the wording, photos and SEO, then Save. Changes appear on the live site after you click Publish website on the dashboard.',
    listSearchableFields: ['title', 'slug', 'route', 'h1'],
    pagination: { defaultLimit: 50 },
  },
  defaultSort: 'title',
  versions: { drafts: true, maxPerDoc: 30 },
  access: { read: publishedOrLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: { afterChange: [markChanged], afterDelete: [markChanged] },
  fields: [
    { name: 'title', type: 'text', label: 'Page name (menus and breadcrumbs)', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            // ---- Service pages ----
            { name: 'h1', type: 'text', label: 'Page heading (H1)', admin: { condition: onlyFor('service', 'prose', 'hub', 'contact', 'home') } },
            { name: 'eyebrow', type: 'text', label: 'Eyebrow line above the heading', admin: { condition: onlyFor('service') } },
            { name: 'h2', type: 'text', label: 'Sub-heading (H2)', admin: { condition: onlyFor('service', 'home') } },
            { name: 'h3', type: 'text', label: 'Intro line (H3)', admin: { condition: onlyFor('home') } },
            inlineText('hook', 'Opening hook (bold line)', { admin: { condition: onlyFor('service'), rows: 3, description: 'Shown bold beside the photo.' } }),
            imageField('image', 'Page photo'),
            nodesField('body', 'Opening copy'),
            inlineText('ctaBand', 'Call-to-action band', { admin: { condition: onlyFor('service', 'home'), rows: 2 } }),
            sectionsField('details', 'In detail sections'),
            inlineText('closingCta', 'Closing call to action', { admin: { condition: onlyFor('service'), rows: 2 } }),
            {
              name: 'gatedText',
              type: 'group',
              label: 'Wording while Zip and Afterpay are off (payment plans page)',
              admin: { condition: (data: any) => data?.kind === 'service' && data?.slug === 'payment-plans' },
              fields: [inlineText('hook', 'Hook'), inlineText('bodyIntro', 'Body intro')],
            },

            // ---- Prose (about, parking, privacy) and contact ----
            stringList('intro', 'Intro paragraphs', 'Paragraph', { admin: { condition: onlyFor('prose') } }),
            sectionsField('sections', 'Sections'),

            // ---- Home page ----
            {
              name: 'slides',
              type: 'array',
              label: 'Hero slides',
              labels: { singular: 'Slide', plural: 'Slides' },
              admin: { condition: onlyFor('home'), description: 'The rotating banner at the top of the home page. First slide shows first.', components: { RowLabel: '/cms/components/RowLabels#TitleRowLabel' } },
              fields: [
                { name: 'headline', type: 'text', required: true },
                inlineText('sub', 'Sub line'),
                { name: 'linkText', type: 'text', label: 'Button text (optional)' },
                { name: 'linkHref', type: 'text', label: 'Button link (optional)', admin: { description: 'A page such as /kids-gap-free-dentistry-cronulla/ or {{cta}} for the booking button.' } },
                gateField(),
              ],
            },
            imageField('heroImage', 'Hero background photo'),
            stringList('providers', 'Health fund logos to show (developer)', 'Provider', { admin: { condition: onlyFor('home') } }),
            cardsField('pillars', 'Three pillars', { withIcon: true, withFallback: true }),
            {
              name: 'welcome',
              type: 'group',
              label: 'Welcome section',
              admin: { condition: onlyFor('home') },
              fields: [
                { name: 'h2', type: 'text', label: 'Heading' },
                { name: 'h3', type: 'text', label: 'Sub-heading' },
                stringList('paragraphs', 'Paragraphs', 'Paragraph'),
              ],
            },
            imageField('welcomeImage', 'Welcome section photo'),
            cardsField('categoryCards', 'Category cards', { withIcon: true, withFallback: true }),
            {
              name: 'treatments',
              type: 'group',
              label: 'Treatments tiles',
              admin: { condition: onlyFor('home') },
              fields: [
                { name: 'h2', type: 'text', label: 'Heading' },
                { name: 'h3', type: 'text', label: 'Sub-heading' },
                cardsField('tiles', 'Tiles', { withImage: true }),
              ],
            },
            cardsField('iconBlocks', 'Icon blocks', { withIcon: true, withFallback: true }),
            {
              name: 'paymentBand',
              type: 'group',
              label: 'Payment band',
              admin: { condition: onlyFor('home') },
              fields: [{ name: 'h2', type: 'text', label: 'Heading' }, stringList('lines', 'Lines', 'Line'), { name: 'logo', type: 'text', label: 'Logo file (developer)' }],
            },
            {
              name: 'note',
              type: 'group',
              label: 'Note from the dentists',
              admin: { condition: onlyFor('home') },
              fields: [
                { name: 'h2', type: 'text', label: 'Heading' },
                { name: 'h3', type: 'text', label: 'Sub-heading' },
                stringList('paragraphs', 'Paragraphs', 'Paragraph'),
                { name: 'signoff', type: 'text', label: 'Sign-off' },
              ],
            },
            imageField('dentistsImage', 'Photo of the dentists'),

            // ---- Services hub ----
            inlineText('introLine', 'Intro line', { admin: { condition: onlyFor('hub'), rows: 3 } }),
            stringList('serviceList', 'Service list (the 15 treatments)', 'Service', { admin: { condition: onlyFor('hub') } }),
            inlineText('closingLine', 'Closing line', { admin: { condition: onlyFor('hub'), rows: 2 } }),
            cardsField('featured', 'Featured tiles', { withImage: true, withFallback: true }),
            cardsField('blurbs', 'Blurbs', { withIcon: true, withFallback: true }),
            {
              name: 'closing',
              type: 'group',
              label: 'Closing section',
              admin: { condition: onlyFor('hub') },
              fields: [{ name: 'h2', type: 'text', label: 'Heading' }, stringList('paragraphs', 'Paragraphs', 'Paragraph'), inlineText('closingLine', 'Closing line')],
            },
          ],
        },
        { label: 'SEO', fields: seoFields },
        {
          label: 'Settings',
          fields: [
            {
              name: 'kind',
              type: 'select',
              required: true,
              defaultValue: 'service',
              options: [
                { label: 'Service page', value: 'service' },
                { label: 'Text page (about, parking, privacy)', value: 'prose' },
                { label: 'Home page', value: 'home' },
                { label: 'Services hub', value: 'hub' },
                { label: 'Contact page', value: 'contact' },
              ],
              admin: { description: 'Which template renders this page. Developer setting.' },
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              admin: { description: 'Web address of the page, for example general-dentistry-cronulla. Changing it changes the URL, so add a redirect from the old one.' },
            },
            { name: 'route', type: 'text', required: true, admin: { description: 'The full path, for example /general-dentistry-cronulla/. Filled in from the slug when empty.' } },
            stringList('breadcrumb', 'Breadcrumb trail', 'Crumb', { admin: { condition: onlyFor('service', 'prose') } }),
            {
              name: 'category',
              type: 'select',
              label: 'Service category (menu grouping)',
              options: [
                { label: 'General', value: 'general' },
                { label: 'Children', value: 'children' },
                { label: 'Cosmetic', value: 'cosmetic' },
                { label: 'Restorative', value: 'restorative' },
                { label: 'Gum health', value: 'gum' },
                { label: 'Sleep and comfort', value: 'other' },
              ],
              admin: { condition: onlyFor('service') },
            },
            gateField({ label: 'Whole page only shows when this feature is on' }),
          ],
        },
      ],
    },
  ],
};

// Give the per-kind arrays their conditions. Done here so the field builders stay generic.
function setCondition(fields: Field[], name: string, kinds: Kind[]) {
  for (const f of fields) {
    if ('name' in f && f.name === name) {
      f.admin = { ...(f.admin || {}), condition: onlyFor(...kinds) };
      return true;
    }
    if (f.type === 'tabs') for (const t of f.tabs) if (setCondition(t.fields, name, kinds)) return true;
  }
  return false;
}
const conds: [string, Kind[]][] = [
  ['image', ['service']],
  ['body', ['service']],
  ['details', ['service']],
  ['sections', ['prose', 'contact']],
  ['heroImage', ['home']],
  ['pillars', ['home']],
  ['welcomeImage', ['home']],
  ['categoryCards', ['home', 'hub']],
  ['iconBlocks', ['home']],
  ['dentistsImage', ['home', 'prose']],
  ['featured', ['hub']],
  ['blurbs', ['hub']],
];
for (const [name, kinds] of conds) setCondition(Pages.fields, name, kinds);
