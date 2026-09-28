import fs from 'node:fs';
import { withPayload } from '@payloadcms/next/withPayload';

/**
 * Must match SITE_CONFIG.bookingUrl in site.config.ts (this file is plain JS and
 * cannot import the TypeScript config). Used only for the /register/ redirect
 * below. Set it to '' to turn the redirect off and bring the EOI page back.
 */
const BOOKING_URL = 'https://www.corepractice.is/practices/tcd/the-cronulla-dentists#/';

/**
 * Redirects managed in the dashboard (Redirects collection). scripts/pull-content.ts
 * writes them to content/redirects.json before every build, so the practice can
 * fix an old link from /admin and it takes effect on the next publish.
 */
function dashboardRedirects() {
  try {
    const list = JSON.parse(fs.readFileSync(new URL('./content/redirects.json', import.meta.url), 'utf8'));
    return list
      .filter((r) => r.from && r.to)
      .map((r) => ({ source: r.from.replace(/\/+$/, '') || '/', destination: r.to, permanent: r.type !== '302' }));
  } catch {
    return [];
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  /**
   * The public site keeps its trailing-slash URLs (middleware.ts adds the slash),
   * but the dashboard and its API must be reachable without one, so Next's
   * global redirect is switched off and handled per-path in middleware.ts.
   */
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  async redirects() {
    const list = dashboardRedirects();
    if (BOOKING_URL) {
      list.push(
        { source: '/register', destination: BOOKING_URL, permanent: false },
        { source: '/register/', destination: BOOKING_URL, permanent: false },
      );
    }
    return list;
  },
  images: {
    // WebP only. AVIF encoding is very slow without the optional `sharp`
    // binary (it falls back to WASM), and WebP already covers every browser
    // this audience uses.
    formats: ['image/webp'],
    // No source image on this site is wider than 2400px, and the widest
    // next/image container is the 1160px content wrap. Dropping the default
    // 2048/3840 candidates stops Next upscaling (slow, heavy, and blurry).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};

export default withPayload(nextConfig);
