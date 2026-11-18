import type { Metadata } from 'next';
import { getPage } from '@/lib/content';
import { pageMetadata } from '@/lib/meta';
import type { HomePage } from '@/content/types';
import { HomeTemplate } from '@/components/templates/HomeTemplate';
import { SITE_CONFIG } from '@/site.config';
import { bannerBootScript } from '@/lib/apePromo';
import { ApePromoBanner } from '@/components/ape/ApePromoBanner';

const page = getPage<HomePage>('home');

export const metadata: Metadata = pageMetadata(page.meta);

export default function Home() {
  const promo = SITE_CONFIG.apePromo;
  return (
    <>
      {promo.bannerEnabled && (
        <>
          {/* Runs before the banner is parsed: decides whether it shows, so the page never jumps. */}
          <script dangerouslySetInnerHTML={{ __html: bannerBootScript(promo) }} />
          <ApePromoBanner promo={promo} />
        </>
      )}
      <HomeTemplate page={page} />
    </>
  );
}
