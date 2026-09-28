import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '../globals.css';
import { SITE_CONFIG, fullAddress, telHref, isOpen } from '@/site.config';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { JsonLd } from '@/components/JsonLd';
import Script from 'next/script';
import { GtmBody, GtmHead } from '@/components/Gtm';
import { dentistSchema } from '@/lib/schema';
import { primaryNav, aboutFeatured, serviceGroups, featuredServices, serviceCount } from '@/lib/nav';
import { primaryCta, secondaryCta, bookingLocations } from '@/lib/cta';
import { BookingChooser } from '@/components/BookingChooser';
import MobileBar from '@/components/MobileBar';
import { OG_IMAGE } from '@/lib/meta';

// Self-hosted Poppins + Inter (Google Fonts files) via next/font → display:swap, zero third-party requests, no CLS.
const poppins = localFont({
  variable: '--display',
  display: 'swap',
  fallback: ['-apple-system', 'Segoe UI', 'sans-serif'],
  src: [
    { path: './fonts/poppins-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/poppins-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/poppins-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/poppins-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
});
const inter = localFont({
  variable: '--body',
  display: 'swap',
  fallback: ['-apple-system', 'Segoe UI', 'sans-serif'],
  src: [
    { path: './fonts/inter-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.domain),
  title: { default: SITE_CONFIG.name, template: '%s' },
  openGraph: { siteName: SITE_CONFIG.name, locale: 'en_AU', type: 'website', images: [OG_IMAGE] },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        {(SITE_CONFIG.colours.navy || SITE_CONFIG.colours.cyan) && (
          // Brand colour overrides from the dashboard. Absent until someone sets them.
          <style>{`:root{${SITE_CONFIG.colours.navy ? `--navy:${SITE_CONFIG.colours.navy};` : ''}${SITE_CONFIG.colours.cyan ? `--cyan:${SITE_CONFIG.colours.cyan};` : ''}}`}</style>
        )}
        <GtmHead />
        {/*
          GA4 inlined deliberately rather than imported from components/Gtm.tsx.
          The three-file chain (layout -> Gtm -> site.config) meant a partial
          upload could leave layout.tsx importing an export that did not exist
          yet, which fails the build — and a failed build keeps serving the
          previous deployment, so the site looked unchanged rather than broken.
          This version needs nothing but SITE_CONFIG.ga4Id. Renders only when
          that is set, and exactly once: a second copy of gtag.js on the page
          would fire a duplicate page_view and inflate every session.
        */}
        {SITE_CONFIG.ga4Id && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.ga4Id}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${SITE_CONFIG.ga4Id}');`}
            </Script>
          </>
        )}
        {SITE_CONFIG.metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${SITE_CONFIG.metaPixelId}');
fbq('track', 'PageView');`}
          </Script>
        )}
      </head>
      <body>
        <GtmBody />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav
          primary={primaryNav()}
          groups={serviceGroups()}
          featured={featuredServices()}
          aboutCards={aboutFeatured()}
          serviceCount={serviceCount()}
          cta={primaryCta()}
          call={secondaryCta()}
          phone={SITE_CONFIG.phone}
          telHref={telHref()}
          email={SITE_CONFIG.email}
          address={fullAddress()}
        />
        {/* Scroll-reveal must never be able to hide content permanently. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <main id="main">{children}</main>
        <Footer />
        <MobileBar />
        <BookingChooser bookingUrl={SITE_CONFIG.bookingUrl} locations={bookingLocations()} />
        <Reveal />
        <JsonLd data={dentistSchema()} />
        {isOpen() ? null : <span className="sr-only">Opening {SITE_CONFIG.openingDateLabel}</span>}
      </body>
    </html>
  );
}
