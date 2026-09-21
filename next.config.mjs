/**
 * Two build targets:
 *  - default            → standard Next.js build for Vercel (Git import or `vercel deploy`).
 *  - STATIC_EXPORT=1    → plain static HTML in `out/` (see scripts/build-static.mjs).
 */
const isStatic = process.env.STATIC_EXPORT === '1';

/**
 * Must match SITE_CONFIG.bookingUrl in site.config.ts (this file is plain JS and
 * cannot import the TypeScript config). Used only for the /register/ redirect
 * below. Set it to '' to turn the redirect off and bring the EOI page back.
 */
const BOOKING_URL = 'https://www.corepractice.is/practices/tcd/the-cronulla-dentists#/';

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  ...(isStatic
    ? { output: 'export', images: { unoptimized: true } }
    : {
        /**
         * The expression-of-interest page has retired: anyone following an old
         * /register/ link (ads, QR codes, the previous live site) goes straight to
         * online booking. Done here as a server redirect rather than only with
         * redirect() inside the page, because Next caches a pre-rendered page's
         * redirect as a 307 with NO Location header — browsers limp through on a
         * script in the page body, search engines just see a broken redirect.
         * Not available in the static-export build, hence inside this branch.
         */
        async redirects() {
          if (!BOOKING_URL) return [];
          return [
            { source: '/register', destination: BOOKING_URL, permanent: false },
            { source: '/register/', destination: BOOKING_URL, permanent: false },
          ];
        },
        images: {
          // WebP only. AVIF encoding is very slow without the optional `sharp`
          // binary (it falls back to WASM), and WebP already covers every browser
          // this audience uses. Add sharp and re-enable 'image/avif' first in this
          // array if you want AVIF later.
          formats: ['image/webp'],
          // No source image on this site is wider than 2400px, and the widest
          // next/image container is the 1160px content wrap. Dropping the default
          // 2048/3840 candidates stops Next upscaling (slow, heavy, and blurry).
          deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        },
      }),
};
export default nextConfig;
