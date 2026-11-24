'use client';
import { useEffect } from 'react';

/**
 * The APE home page's behaviour, ported from the APE website's script (the source pack's
 * reference/site.js) and limited to the .ape-page wrapper:
 *
 * - Gentle reveals: each .reveal fades, slides or settles in once as it scrolls into view;
 *   pieces marked .ape-seq that arrive together follow one another. Anything that takes
 *   keyboard focus is shown at once. (components/Reveal.tsx leaves this page to this file.)
 * - "Read more" on the team bios: starts closed, the button opens and closes the rest.
 *   Without JavaScript the button stays hidden and the whole bio shows.
 * - FAQs: the question list, the arrows and the counter move a native scroll-snap track
 *   and follow where it is. Without JavaScript all 11 answers show as a plain list.
 *
 * Class names are the APE ones with the `ape-` prefix (app/ape.css).
 */
export function ApeBehaviour() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.ape-page');
    if (!root) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SCROLL: ScrollBehavior = reduce ? 'auto' : 'smooth';
    const STAGGER = 0.14; // seconds between items that appear one by one
    const off: (() => void)[] = [];
    const on = <T extends EventTarget>(el: T, type: string, fn: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) => {
      el.addEventListener(type, fn, opts);
      off.push(() => el.removeEventListener(type, fn, opts));
    };

    // ---------- Gentle reveals ----------
    const reveals = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));
    const showNow = (el: HTMLElement) => {
      el.style.setProperty('--d', '0s');
      el.classList.add('in');
    };
    if (!('IntersectionObserver' in window) || reduce) {
      reveals.forEach((el) => el.classList.add('in'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          const arriving = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
          arriving.sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));
          const counts: { p: Node | null; n: number }[] = [];
          arriving.forEach((el) => {
            // Stagger only what arrives from below; anything already above the fold shows at once.
            if (el.classList.contains('ape-seq') && el.getBoundingClientRect().bottom > 0) {
              const parent = el.parentNode;
              let n = 0;
              const seen = counts.find((c) => c.p === parent);
              if (seen) n = ++seen.n;
              else counts.push({ p: parent, n: 0 });
              el.style.setProperty('--d', Math.min(0.15 + n * STAGGER, 1.2).toFixed(2) + 's');
            }
            el.classList.add('in');
            io.unobserve(el);
          });
        },
        // As on the APE site (-8% at the bottom). The tall top margin also counts everything above
        // the viewport as arrived, so a reload or an anchor link part-way down never leaves a gap.
        { rootMargin: '100000px 0px -8% 0px', threshold: 0 },
      );
      reveals.forEach((el) => io.observe(el));
      off.push(() => io.disconnect());
      on(root, 'focusin', (ev) => {
        const target = ev.target as HTMLElement;
        let el = target.closest<HTMLElement>('.reveal');
        while (el) {
          if (!el.classList.contains('in')) {
            showNow(el);
            io.unobserve(el);
          }
          el = el.parentElement ? el.parentElement.closest<HTMLElement>('.reveal') : null;
        }
        target.querySelectorAll<HTMLElement>('.reveal:not(.in)').forEach(showNow);
      });
    }

    // ---------- "Read more" on long bios ----------
    root.querySelectorAll<HTMLButtonElement>('.ape-read-more[aria-controls]').forEach((btn) => {
      const more = document.getElementById(btn.getAttribute('aria-controls') || '');
      if (!more) return;
      const label = btn.querySelector('.ape-read-more-label');
      const setOpen = (open: boolean) => {
        more.classList.toggle('ape-is-collapsed', !open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (label) label.textContent = open ? 'Read less' : 'Read more';
        if (open) more.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
      };
      setOpen(window.location.hash === '#' + more.id);
      btn.hidden = false;
      on(btn, 'click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        setOpen(open);
        if (!open) {
          // after closing, make sure the button is still on screen (below this site's fixed menu)
          const nav = document.querySelector('.nav');
          const top = nav ? nav.getBoundingClientRect().bottom : 0;
          if (btn.getBoundingClientRect().top < top + 8) btn.scrollIntoView({ behavior: SCROLL, block: 'center' });
        }
      });
    });

    root.classList.add('ape-js-ready');

    // ---------- FAQs: question index and swipeable answer cards ----------
    root.querySelectorAll<HTMLElement>('.ape-faq-deck').forEach((deck) => {
      const track = deck.querySelector<HTMLElement>('.ape-faq-track');
      const cards = Array.from(deck.querySelectorAll<HTMLElement>('.ape-faq-card'));
      const jumps = Array.from(deck.querySelectorAll<HTMLButtonElement>('.ape-faq-jump'));
      const prev = deck.querySelector<HTMLButtonElement>('.ape-faq-prev');
      const next = deck.querySelector<HTMLButtonElement>('.ape-faq-next');
      const now = deck.querySelector('.ape-faq-now');
      if (!track || !cards.length) return;
      let current = 0;
      const show = (i: number) => {
        current = i;
        jumps.forEach((b, k) => (k === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
        if (now) now.textContent = String(i + 1);
        if (prev) prev.disabled = i === 0;
        if (next) next.disabled = i === cards.length - 1;
      };
      const go = (i: number) => {
        const k = Math.max(0, Math.min(cards.length - 1, i));
        track.scrollTo({ left: cards[k].offsetLeft - cards[0].offsetLeft, behavior: SCROLL });
        show(k);
      };
      jumps.forEach((b, k) => on(b, 'click', () => go(k)));
      if (prev) on(prev, 'click', () => go(current - 1));
      if (next) on(next, 'click', () => go(current + 1));
      let t: number | undefined;
      on(
        track,
        'scroll',
        () => {
          window.clearTimeout(t);
          t = window.setTimeout(() => {
            let best = 0;
            let dist = Infinity;
            const left = track.scrollLeft;
            cards.forEach((c, k) => {
              const d = Math.abs(c.offsetLeft - cards[0].offsetLeft - left);
              if (d < dist) {
                dist = d;
                best = k;
              }
            });
            if (best !== current) show(best);
          }, 90);
        },
        { passive: true },
      );
      off.push(() => window.clearTimeout(t));
      show(0);
    });

    return () => {
      off.forEach((fn) => fn());
      root.classList.remove('ape-js-ready');
    };
  }, []);
  return null;
}
