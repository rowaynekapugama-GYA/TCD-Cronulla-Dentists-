'use client';
import React, { useCallback, useEffect, useRef } from 'react';
import { DISMISS_DAYS, DISMISS_KEY, bannerShouldShow, promoHref, trackPromoClick, type ApePromo } from '@/lib/apePromo';
import { apePromoSans } from './promoFont';

/**
 * Temporary APE launch banner, homepage only (rendered by app/(frontend)/page.tsx).
 *
 * Shown and hidden by <html data-ape-promo="on">. On a full page load the inline
 * boot script (lib/apePromo.ts) sets it before the banner is parsed, so the space
 * is reserved from the first paint and nothing jumps. On a client-side visit to
 * the homepage the effect below does the same check. While the banner is on
 * screen the fixed menu sits just under it, and slides back to its usual place
 * as the banner scrolls away.
 */
export function ApePromoBanner({ promo }: { promo: ApePromo }) {
  const bar = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (bannerShouldShow(promo)) root.setAttribute('data-ape-promo', 'on');
    else root.removeAttribute('data-ape-promo');
    let raf = 0;
    const place = () => {
      raf = 0;
      if (root.getAttribute('data-ape-promo') !== 'on' || !bar.current) return root.style.removeProperty('--ape-promo-offset');
      const h = bar.current.offsetHeight;
      root.style.setProperty('--ape-promo-offset', `${Math.max(0, h - window.scrollY)}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };
    place();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      // Leaving the homepage: the banner is not on other pages.
      root.removeAttribute('data-ape-promo');
      root.style.removeProperty('--ape-promo-offset');
    };
  }, [promo]);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000));
    } catch {
      /* storage blocked: hidden for this visit only */
    }
    const root = document.documentElement;
    const done = () => {
      root.removeAttribute('data-ape-promo');
      root.removeAttribute('data-ape-promo-leaving');
      root.style.removeProperty('--ape-promo-offset');
    };
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (calm) return done();
    root.setAttribute('data-ape-promo-leaving', '');
    window.setTimeout(done, 220);
  }, []);

  const href = promoHref(promo.link, 'banner');
  return (
    <div className={`ape-promo ${apePromoSans.variable}`} ref={bar} role="region" aria-label="The Anxious Patient Experience">
      <div className="ape-promo-inner">
        <p className="ape-promo-text">
          <span className="ape-promo-long">{promo.bannerText}</span>
          <span className="ape-promo-short">{promo.bannerTextShort || promo.bannerText}</span>
        </p>
        <a className="ape-promo-btn" href={href} target="_blank" rel="noopener" onClick={() => trackPromoClick('banner')}>
          <span className="ape-promo-long">{promo.bannerButton}</span>
          <span className="ape-promo-short">{promo.bannerButtonShort || promo.bannerButton}</span>
        </a>
        <button type="button" className="ape-promo-close" onClick={dismiss} aria-label="Hide this message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
