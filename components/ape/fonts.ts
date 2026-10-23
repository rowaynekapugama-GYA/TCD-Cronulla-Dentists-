import localFont from 'next/font/local';

/**
 * The Anxious Patient Experience (TM) typefaces, self-hosted like the site's own
 * Poppins and Inter: Playfair Display for headings and Figtree for text. Both
 * are SIL Open Font Licence files from the @fontsource packages (licences sit
 * beside the files). Exposed as --ape-serif / --ape-sans and only applied inside
 * the .ape-page wrapper, so nothing else on the site changes.
 */
export const apeSerif = localFont({
  variable: '--ape-serif',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  src: [
    { path: './fonts/playfair-display-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/playfair-display-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/playfair-display-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/playfair-display-latin-500-italic.woff2', weight: '500', style: 'italic' },
    { path: './fonts/playfair-display-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/playfair-display-latin-600-italic.woff2', weight: '600', style: 'italic' },
  ],
});

export const apeSans = localFont({
  variable: '--ape-sans',
  display: 'swap',
  fallback: ['-apple-system', 'Segoe UI', 'sans-serif'],
  src: [
    { path: './fonts/figtree-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/figtree-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/figtree-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
});

export const apeFontClass = `${apeSerif.variable} ${apeSans.variable}`;
