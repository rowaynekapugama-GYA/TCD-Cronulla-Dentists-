'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { BookingLocation } from '@/lib/cta';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * "Book online" location chooser.
 *
 * Every Book online button on the site (nav, mobile bar, CTA bands, links in the
 * copy) points at the Cronulla booking page. This listens for clicks on any link
 * to that address and shows a pop-up asking which practice to book at instead.
 * Nothing about the buttons themselves changes, so without JavaScript (or with
 * the chooser switched off in Site Settings) they still go straight to Cronulla.
 *
 * The pop-up is only rendered after a click, so the Caringbah details never
 * appear in the page's HTML (keeps each practice's local search listing clean).
 */
/** "The Caringbah Dentists" -> "Caringbah" for the button label. */
const shortName = (name: string) => name.replace(/^the\s+/i, '').replace(/\s+dent(al|ists?)\b.*$/i, '').trim() || name;

export function BookingChooser({ bookingUrl, locations }: { bookingUrl: string; locations: BookingLocation[] }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    opener.current?.focus?.();
  }, []);

  // Intercept clicks on any Book online link, anywhere on the page.
  useEffect(() => {
    if (!bookingUrl || locations.length < 2) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.getAttribute('href') !== bookingUrl || a.hasAttribute('data-booking-location')) return;
      e.preventDefault();
      e.stopPropagation();
      opener.current = a;
      setOpen(true);
      window.gtag?.('event', 'book_online_click', { link_text: (a.textContent || '').trim().slice(0, 40) });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [bookingUrl, locations.length]);

  // Escape to close, focus into the dialog, keep Tab inside it, lock page scroll.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = dialog.current?.querySelector<HTMLElement>('a[data-booking-location]');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab' || !dialog.current) return;
      const f = Array.from(dialog.current.querySelectorAll<HTMLElement>('a[href], button'));
      if (!f.length) return;
      const [a, z] = [f[0], f[f.length - 1]];
      if (e.shiftKey && document.activeElement === a) (e.preventDefault(), z.focus());
      else if (!e.shiftKey && document.activeElement === z) (e.preventDefault(), a.focus());
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  if (!open) return null;
  return (
    <div className="loc-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="loc-dialog" role="dialog" aria-modal="true" aria-labelledby="loc-title" ref={dialog}>
        <button type="button" className="loc-close" onClick={close} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <span className="kicker">Book an appointment</span>
        <h2 id="loc-title">
          Select your <span>location</span>
        </h2>
        <p className="loc-sub">Choose the practice you would like to visit.</p>
        <div className="loc-options">
          {locations.map((l) => (
            <a
              key={l.name}
              className="loc-option"
              href={l.url}
              target="_blank"
              rel="noopener"
              data-booking-location={l.name}
              onClick={() => {
                window.gtag?.('event', 'book_online_location', { location: l.name });
                setTimeout(() => setOpen(false), 0);
              }}
            >
              <span className="loc-pin" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
              </span>
              <span className="loc-text">
                <span className="loc-name">{l.name}</span>
                {l.address && <span className="loc-address">{l.address}</span>}
                {l.note && <span className="loc-note">{l.note}</span>}
              </span>
              <span className="loc-go">
                Book at {shortName(l.name)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
