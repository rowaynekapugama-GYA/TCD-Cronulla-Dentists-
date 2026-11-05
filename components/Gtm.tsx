import Script from 'next/script';
import { SITE_CONFIG } from '@/site.config';

/**
 * Google Tag Manager, using the container snippet exactly as Google supplied it
 * for GTM-TNWQ82NH (Brian, Google Ads, 4 Nov 2026: new containers use this
 * shorter tag). Rendered as the first thing inside <head>, as Google asks, and
 * only when SITE_CONFIG.gtmId is set (dashboard: Site Settings > Tracking).
 * Plain <script> tags rather than next/script so it sits in the server HTML
 * straight after <head> instead of being injected after hydration.
 */
export function GtmHead() {
  if (!SITE_CONFIG.gtmId) return null;
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtm.js?id=${SITE_CONFIG.gtmId}`} />
      <script
        id="gtm-init"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`,
        }}
      />
    </>
  );
}
/**
 * GA4 (gtag.js): loads only when SITE_CONFIG.ga4Id is set.
 *
 * Deliberately separate from the GTM block above: a G-XXXXXXXXXX measurement ID
 * and a GTM-XXXXXXX container are different products, and dropping the GA4 ID
 * into the Tag Manager loader would not report anything. If a GTM container is
 * ever added, set gtmId as well, but then move GA4 INSIDE the container and
 * clear ga4Id here, or every pageview is counted twice.
 *
 * One tag only. The snippet supplied was pasted twice; a second copy of gtag.js
 * on the same page fires a duplicate page_view and inflates every session.
 */
export function Ga4() {
  if (!SITE_CONFIG.ga4Id) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.ga4Id}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${SITE_CONFIG.ga4Id}');`}
      </Script>
    </>
  );
}

export function GtmBody() {
  if (!SITE_CONFIG.gtmId) return null;
  return (
    <noscript>
      <iframe src={`https://www.googletagmanager.com/ns.html?id=${SITE_CONFIG.gtmId}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="gtm" />
    </noscript>
  );
}
