import type { GlobalConfig } from 'payload';
import { anyone, isAdminField, isLoggedIn } from '../access';
import { markChanged } from '../hooks/markChanged';

/**
 * Practice details, hours, booking link, tracking IDs and feature switches.
 * Mirrors site.config.ts: scripts/pull-content.ts writes this global to
 * content/site-settings.json at build time and site.config.ts merges it over
 * its defaults, so every component keeps reading SITE_CONFIG exactly as before.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Settings', description: 'Practice details used across the whole website. Save, then Publish website.' },
  access: { read: anyone, update: isLoggedIn },
  hooks: { afterChange: [markChanged] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Practice',
          fields: [
            { name: 'name', type: 'text', label: 'Practice name', required: true },
            {
              type: 'row',
              fields: [
                { name: 'phone', type: 'text', label: 'Phone (as shown)', required: true, admin: { description: 'For example (02) 8599 9815' } },
                { name: 'phoneE164', type: 'text', label: 'Phone for tap-to-call', required: true, admin: { description: 'International format, no spaces: +61285999815' } },
              ],
            },
            { name: 'email', type: 'email', label: 'Public email', required: true },
            {
              name: 'address',
              type: 'group',
              fields: [
                { name: 'street', type: 'text', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'suburb', type: 'text', required: true },
                    { name: 'state', type: 'text', required: true, defaultValue: 'NSW' },
                    { name: 'postcode', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'geo',
              type: 'group',
              label: 'Map pin',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'lat', type: 'number', label: 'Latitude' },
                    { name: 'lng', type: 'number', label: 'Longitude' },
                  ],
                },
              ],
            },
            { name: 'gbpShareUrl', type: 'text', label: 'Google Business Profile link' },
            { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo (optional)', admin: { description: 'Leave empty to keep the logo built into the site.' } },
            {
              name: 'colours',
              type: 'group',
              label: 'Brand colours',
              admin: { description: 'Leave empty to keep the colours the site was designed with.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'navy', type: 'text', label: 'Main (navy)', admin: { placeholder: '#0E3566' } },
                    { name: 'cyan', type: 'text', label: 'Accent (cyan)', admin: { placeholder: '#26B8DB' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Hours',
          fields: [
            {
              name: 'hours',
              type: 'array',
              label: 'Opening hours',
              minRows: 7,
              maxRows: 7,
              admin: { description: 'One row per day, Monday to Sunday. Tick Closed for days the practice is shut.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'day', type: 'select', required: true, options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
                    { name: 'closed', type: 'checkbox', label: 'Closed', defaultValue: false },
                  ],
                },
                {
                  type: 'row',
                  admin: { condition: (_, sibling) => !sibling?.closed },
                  fields: [
                    { name: 'open', type: 'text', label: 'Opens (24h, e.g. 08:00)', admin: { placeholder: '08:00' } },
                    { name: 'close', type: 'text', label: 'Closes (24h, e.g. 17:00)', admin: { placeholder: '17:00' } },
                    { name: 'label', type: 'text', label: 'As shown on the site', admin: { placeholder: '8:00am to 5:00pm' } },
                  ],
                },
              ],
            },
            {
              name: 'hooks',
              type: 'group',
              label: 'Hours call-outs',
              fields: [
                { name: 'lateMonday', type: 'text', label: 'Late night line', admin: { description: 'For example: Open until 7pm Mondays' } },
                { name: 'earlyFriday', type: 'text', label: 'Early morning line', admin: { description: 'For example: Early appointments from 7am Fridays' } },
              ],
            },
          ],
        },
        {
          label: 'Opening and booking',
          fields: [
            {
              name: 'mode',
              type: 'select',
              required: true,
              defaultValue: 'pre-opening',
              options: [
                { label: 'Before opening (opening date shown)', value: 'pre-opening' },
                { label: 'Open (now taking patients)', value: 'open' },
              ],
            },
            { name: 'openingDateLabel', type: 'text', label: 'Opening wording', admin: { description: 'For example: late November 2026, or 16 November 2026', condition: (data) => data?.mode === 'pre-opening' } },
            { name: 'openingDate', type: 'text', label: 'Opening month or date (YYYY-MM or YYYY-MM-DD)', admin: { condition: (data) => data?.mode === 'pre-opening' } },
            { name: 'openingDateTime', type: 'text', label: 'Countdown target (developer)', admin: { description: 'ISO date-time. Leave empty to hide the countdown.', condition: (data) => data?.mode === 'pre-opening' } },
            { name: 'bookingUrl', type: 'text', label: 'Online booking link', admin: { description: 'Core Practice booking page. Every Book online button uses this.' } },
            { name: 'bookingChooser', type: 'checkbox', label: 'Ask which location when someone clicks Book online', defaultValue: true },
            {
              name: 'bookingLocations',
              type: 'array',
              label: 'Booking locations',
              admin: { description: 'Shown in the Book online pop-up, in this order. Leave the link blank on Cronulla to use the online booking link above.' },
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'address', type: 'text' },
                { name: 'url', type: 'text', label: 'Booking link' },
                { name: 'note', type: 'text', label: 'Short note (optional)' },
              ],
            },
            {
              name: 'payment',
              type: 'array',
              label: 'Health funds and payment lines',
              fields: [{ name: 'value', type: 'text', required: true }],
              admin: { description: 'Shown on the home page and finances pages, for example: nib preferred provider' },
            },
          ],
        },
        {
          label: 'Features',
          fields: [
            {
              name: 'features',
              type: 'group',
              label: 'Feature switches',
              admin: { description: 'Turning one off hides every page, section and line that depends on it.' },
              fields: [
                { name: 'emergency', type: 'checkbox', label: 'Emergency dentistry page and wording', defaultValue: false },
                { name: 'cdbs', type: 'checkbox', label: 'Kids no-gap (CDBS) offer and page', defaultValue: true },
                { name: 'zipAfterpay', type: 'checkbox', label: 'Zip and Afterpay sections', defaultValue: false },
              ],
            },
            { name: 'teamNamesConfirmed', type: 'checkbox', label: 'Show dentist names in meta and schema', defaultValue: true },
            { name: 'parkingNotes', type: 'array', label: 'Parking notes (parking page)', fields: [{ name: 'value', type: 'text', required: true }] },
            { name: 'privacyLastUpdated', type: 'text', label: 'Privacy policy last updated', admin: { description: 'For example: 1 November 2026. Empty hides the line.' } },
          ],
        },
        {
          label: 'Tracking and links',
          fields: [
            { name: 'ga4Id', type: 'text', access: { read: isAdminField, update: isAdminField }, label: 'Google Analytics 4 measurement ID', admin: { placeholder: 'G-XXXXXXXXXX' } },
            { name: 'gtmId', type: 'text', access: { read: isAdminField, update: isAdminField }, label: 'Google Tag Manager container ID', admin: { placeholder: 'GTM-XXXXXXX', description: 'Leave blank unless a container is set up.' } },
            { name: 'metaPixelId', type: 'text', access: { read: isAdminField, update: isAdminField }, label: 'Meta Pixel ID', admin: { description: 'Numbers only. Leave blank to not load the pixel.' } },
            {
              name: 'sameAs',
              type: 'group',
              label: 'Social profiles',
              fields: [
                { name: 'facebook', type: 'text', label: 'Facebook page URL' },
                { name: 'instagram', type: 'text', label: 'Instagram URL' },
              ],
            },
            {
              name: 'sister',
              type: 'group',
              label: 'Sister practice',
              fields: [
                { name: 'name', type: 'text' },
                { name: 'url', type: 'text' },
                { name: 'heritage', type: 'text', admin: { description: 'For example: 50 years in the Shire' } },
              ],
            },
          ],
        },
      ],
    },
  ],
};
