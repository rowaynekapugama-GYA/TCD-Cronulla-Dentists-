import localFont from 'next/font/local';

/**
 * The Anxious Patient Experience (TM) typefaces, self-hosted like the site's own
 * Poppins and Inter: Playfair Display for headings and Figtree for text. Both
 * are SIL Open Font Licence files from the @fontsource packages (licences sit
 * beside the files). Exposed as --ape-serif / --ape-sans and only applied inside
 * the .ape-page wrapper, so nothing else on the site changes. Not preloaded (v2.6.0),
 * the same way components/ape/promoFont.ts loads Figtree for the launch banner.
 *
 * v2.7.0: the six files are the ones the APE website itself serves (APE source pack,
 * styles/fonts): Playfair Display 400, 400 italic and 500; Figtree 400, 500 and 600. No other
 * weights, so bold and italic fall back exactly as they do on the APE site.
 */
export const apeSerif = localFont({
  variable: '--ape-serif',
  display: 'swap',
  preload: false,
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  src: [
    { path: './fonts/playfair-display-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/playfair-display-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/playfair-display-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
});

export const apeSans = localFont({
  variable: '--ape-sans',
  display: 'swap',
  preload: false,
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
  src: [
    { path: './fonts/figtree-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/figtree-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/figtree-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
});

export const apeFontClass = `${apeSerif.variable} ${apeSans.variable}`;
