import type { CollectionConfig } from 'payload';
import { isLoggedIn, publishedOrLoggedIn } from '../access';
import { markChanged } from '../hooks/markChanged';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
  admin: { useAsTitle: 'title', group: 'Blog' },
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { description: 'Filled in from the title when empty.' },
      hooks: { beforeValidate: [({ value, data }) => value || (data?.title ? slugify(data.title) : value)] },
    },
  ],
};

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Article', plural: 'Blog articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status', 'updatedAt'],
    group: 'Blog',
    description: 'Articles appear at /blog/ once published and the website is republished. Keep to general dental information; no reviews or claims about results.',
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: publishedOrLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: { afterChange: [markChanged], afterDelete: [markChanged] },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Article',
          fields: [
            { name: 'excerpt', type: 'textarea', label: 'Summary', required: true, admin: { rows: 3, description: 'One or two sentences shown on the blog index and used as the meta description when the SEO one is empty.' } },
            { name: 'featuredImage', type: 'upload', relationTo: 'media', label: 'Featured image' },
            {
              name: 'body',
              type: 'textarea',
              label: 'Article (HTML from the dashboard editor)',
              required: true,
              admin: { rows: 20, description: 'Written with the editor on the /admin dashboard. Edit there rather than here.' },
            },
            { name: 'author', type: 'text', defaultValue: 'The Cronulla Dentists' },
            { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
            {
              name: 'publishedAt',
              type: 'date',
              label: 'Publish date',
              admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' }, description: 'Shown on the article. Defaults to today when published.' },
              hooks: { beforeChange: [({ value, siblingData }) => value || (siblingData?._status === 'published' ? new Date().toISOString() : value)] },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text', label: 'Meta title', admin: { description: 'Defaults to the article title plus the practice name.' } },
            { name: 'metaDescription', type: 'textarea', label: 'Meta description', admin: { rows: 3 } },
            { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Share image (optional)', admin: { description: 'Defaults to the featured image.' } },
            { name: 'noindex', type: 'checkbox', label: 'Hide from search engines', defaultValue: false },
          ],
        },
        {
          label: 'Settings',
          fields: [
            {
              name: 'slug',
              type: 'text',
              unique: true,
              index: true,
              admin: { description: 'Web address under /blog/. Filled in from the title when empty.' },
              hooks: { beforeValidate: [({ value, data }) => value || (data?.title ? slugify(data.title) : value)] },
            },
          ],
        },
      ],
    },
  ],
};
