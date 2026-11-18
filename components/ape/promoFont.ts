import localFont from 'next/font/local';

/**
 * Figtree for the APE launch banner and the Book online panel. A separate,
 * non-preloaded copy of the APE text face: the promotion appears on the
 * homepage and inside a pop-up, so the other pages should not start
 * downloading it. Same files as components/ape/fonts.ts.
 */
export const apePromoSans = localFont({
  variable: '--ape-promo-sans',
  display: 'swap',
  preload: false,
  fallback: ['-apple-system', 'Segoe UI', 'sans-serif'],
  src: [
    { path: './fonts/figtree-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/figtree-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
});
