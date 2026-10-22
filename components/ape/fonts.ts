import localFont from 'next/font/local';

/**
 * The Anxious Patient Experience typefaces (Playfair Display and Figtree, SIL OFL),
 * the same files the APE website self-hosts. Loaded only on pages that show APE
 * sections, exposed as --ape-serif and --ape-sans.
 */
export const apeSerif = localFont({
  variable: '--ape-serif',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  src: [
    { path: './fonts/playfair-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/playfair-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/playfair-500.woff2', weight: '500', style: 'normal' },
  ],
});

export const apeSans = localFont({
  variable: '--ape-sans',
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
  src: [
    { path: './fonts/figtree-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/figtree-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/figtree-600.woff2', weight: '600', style: 'normal' },
  ],
});

export const apeFontVars = `${apeSerif.variable} ${apeSans.variable}`;
