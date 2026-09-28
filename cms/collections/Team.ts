import type { CollectionConfig } from 'payload';
import { anyone, isLoggedIn } from '../access';
import { markChanged } from '../hooks/markChanged';

/**
 * The practitioners. Drives the team photos on /about/, the Person schema and
 * the Dentist schema's employee list. Names, titles and registration details
 * come from the practice and the AHPRA register, never guessed.
 */
export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team member', plural: 'Team' },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'title', 'order'],
    group: 'Content',
    description: 'The dentists shown on the About page. The bios themselves are edited on the About page (Meet the team section).',
  },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: { afterChange: [markChanged], afterDelete: [markChanged] },
  defaultSort: 'order',
  fields: [
    { name: 'fullName', type: 'text', label: 'Full name with title', required: true, admin: { description: 'For example Dr Ram Nathwani' } },
    { name: 'shortName', type: 'text', label: 'Short name', required: true, admin: { description: 'How the copy refers to them, for example Dr Ram. Used to match the bio on the About page.' } },
    {
      type: 'row',
      fields: [
        { name: 'givenName', type: 'text', label: 'Given name', required: true },
        { name: 'familyName', type: 'text', label: 'Family name', required: true },
      ],
    },
    { name: 'title', type: 'text', label: 'Role', required: true, defaultValue: 'Dentist', admin: { description: 'For example Principal Dentist' } },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Photo' },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Bio',
      admin: { rows: 8, description: 'Shown on the About page. Leave a blank line between paragraphs. Supports **bold**.' },
    },
    { name: 'hidden', type: 'checkbox', label: 'Hide from the website', defaultValue: false, admin: { description: 'Keeps the record but removes them from the About page and search listings.' } },
    { name: 'photoPath', type: 'text', label: 'Built-in photo (developer)', admin: { readOnly: true } },
    { name: 'order', type: 'number', label: 'Order', defaultValue: 1 },
    { name: 'key', type: 'text', label: 'Key (developer)', admin: { readOnly: true, description: 'Internal key, for example ram.' } },
    {
      type: 'collapsible',
      label: 'Credentials and schema details',
      fields: [
        { name: 'alumniOf', type: 'text', label: 'University' },
        { name: 'credentials', type: 'array', label: 'Qualifications', fields: [{ name: 'value', type: 'text', required: true }] },
        { name: 'knowsAbout', type: 'array', label: 'Areas of practice', fields: [{ name: 'value', type: 'text', required: true }] },
        { name: 'sameAs', type: 'text', label: 'Public profile link (LinkedIn)', admin: { description: 'Optional. Added to the Person schema when set.' } },
        { name: 'ahpra', type: 'text', label: 'AHPRA registration number', admin: { description: 'From the AHPRA public register. Optional; shown in schema only when set.' } },
      ],
    },
  ],
};
