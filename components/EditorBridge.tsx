'use client';

import { useEffect } from 'react';

/**
 * Click-to-edit layer for the dashboard's visual page editor. Loaded only by
 * /edit-preview/ (never by the public pages).
 *
 * It does not change how the page renders. The editor sends the list of text
 * fields on the page (their saved wording) and photo slots (their file); this
 * finds the element that shows each one by its visible text or image source and
 * marks it. Wording that shows exactly as written can be edited in place; text
 * the design reshapes (split headings, title case, cards built from a bold
 * lead-in) is selected on click and edited in the side panel instead.
 *
 * Messages (window.postMessage, same origin only, all tagged __cms):
 *   editor -> page: init {fields, images, scrollY}, text {path, html}, focus {path}, mark {path}, reveal {paths}, deselect
 *   page -> editor: ready, mapped {inline, select, images}, select {path, kind}, edit {path, value},
 *                   scroll {y}, blocked
 */

type TextField = { path: string; src: string; plain: string };
type ImageFieldRef = { path: string; src: string };
type Mode = 'inline' | 'select';

const INLINE_OK = new Set(['STRONG', 'B', 'EM', 'I', 'A', 'SPAN', 'BR', 'SMALL']);

const CSS = `
.reveal{opacity:1!important;transform:none!important;transition:none!important}
[data-cms-edit]{outline:2px dashed transparent;outline-offset:3px;border-radius:3px;transition:outline-color .12s;cursor:text}
[data-cms-edit][data-cms-mode="select"]{cursor:pointer}
[data-cms-edit]:hover{outline-color:rgba(38,184,219,.95)}
[data-cms-sel]{outline:2px solid #26b8db!important;outline-offset:3px}
[data-cms-edit][contenteditable]{outline:2px solid #26b8db!important;background:rgba(38,184,219,.07);cursor:text}
[data-cms-imgbox]{cursor:pointer}
[data-cms-imgbox]:hover{outline:3px solid #26b8db;outline-offset:-3px}
[data-cms-imgbox]:hover::after{content:"Click to change photo";position:absolute;top:12px;left:12px;z-index:30;background:#0e3566;color:#fff;font:600 12px/1 system-ui,sans-serif;padding:8px 10px;border-radius:6px;pointer-events:none}
[data-cms-imgbox][data-cms-sel]{outline:3px solid #26b8db;outline-offset:-3px}
.cms-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483647;background:#0e3566;color:#fff;font:500 13px/1.3 system-ui,sans-serif;padding:10px 14px;border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.25);pointer-events:none;opacity:0;transition:opacity .2s}
.cms-toast.on{opacity:1}
`;

const norm = (s: string) => s.replace(/[ \s]+/g, ' ').trim();
const loose = (s: string) => s.replace(/[\s ]+/g, '').toLowerCase();

/** The file behind an <img>, whatever next/image did to the URL. */
function imgKey(raw: string | null): string {
  if (!raw) return '';
  let s = raw;
  try {
    const u = new URL(raw, location.href);
    if (u.pathname.replace(/\/$/, '') === '/_next/image') s = u.searchParams.get('url') || '';
    else s = u.origin === location.origin ? u.pathname + u.search : u.href;
  } catch {
    /* keep raw */
  }
  try {
    const u = new URL(s, location.href);
    return u.origin === location.origin ? decodeURIComponent(u.pathname) : `${u.origin}${u.pathname}`;
  } catch {
    return s.split('?')[0];
  }
}

/** Element wording back to the copy shortcuts (**bold**, [link](/x/), {{phone}}, {{email}}). */
function toSource(el: HTMLElement, orig: string): string {
  const links = Array.from(orig.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)).map((m) => m[2]);
  let li = 0;
  const hasPhone = orig.includes('{{phone}}');
  const hasEmail = orig.includes('{{email}}');
  const walk = (n: Node): string => {
    let out = '';
    n.childNodes.forEach((c) => {
      if (c.nodeType === 3) out += c.nodeValue || '';
      else if (c.nodeType === 1) {
        const e = c as HTMLElement;
        const tag = e.tagName;
        if (tag === 'BR') out += ' ';
        else if (tag === 'STRONG' || tag === 'B') {
          const inner = walk(e);
          out += inner.trim() ? `**${inner}**` : inner;
        } else if (tag === 'A') {
          const href = e.getAttribute('href') || '';
          const inner = walk(e);
          if (href.startsWith('tel:') && hasPhone) out += '{{phone}}';
          else if (href.startsWith('mailto:') && hasEmail) out += '{{email}}';
          else out += inner.trim() ? `[${inner}](${links[li++] ?? href})` : inner;
        } else out += walk(e);
      }
    });
    return out;
  };
  return walk(el).replace(/ /g, ' ').replace(/\s+/g, ' ').replace(/\*\*\s*\*\*/g, '').trim();
}

export default function EditorBridge() {
  useEffect(() => {
    if (window.parent === window) return; // opened on its own: just a preview
    const origin = location.origin;
    const post = (m: Record<string, unknown>) => window.parent.postMessage({ __cms: true, ...m }, origin);

    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    const toast = document.createElement('div');
    toast.className = 'cms-toast';
    document.body.appendChild(toast);
    let toastTimer: ReturnType<typeof setTimeout> | undefined;
    const say = (msg: string) => {
      toast.textContent = msg;
      toast.classList.add('on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('on'), 2200);
    };

    const byPath = new Map<string, { el: HTMLElement; mode: Mode; src: string }>();
    const imgByPath = new Map<string, HTMLElement>();
    let editing: HTMLElement | null = null;
    const plaintextOnly = (() => {
      const d = document.createElement('div');
      try {
        d.contentEditable = 'plaintext-only';
        return d.contentEditable === 'plaintext-only';
      } catch {
        return false;
      }
    })();

    const clearSel = () => document.querySelectorAll('[data-cms-sel]').forEach((e) => e.removeAttribute('data-cms-sel'));
    const markSel = (el: Element | null | undefined) => {
      clearSel();
      el?.setAttribute('data-cms-sel', '');
    };

    function map(fields: TextField[], images: ImageFieldRef[]) {
      document.querySelectorAll('[data-cms-edit]').forEach((e) => {
        e.removeAttribute('data-cms-edit');
        e.removeAttribute('data-cms-mode');
      });
      document.querySelectorAll('[data-cms-imgbox]').forEach((e) => e.removeAttribute('data-cms-imgbox'));
      byPath.clear();
      imgByPath.clear();
      const root = (document.querySelector('main') as HTMLElement) || document.body;
      const els = Array.from(root.querySelectorAll<HTMLElement>('*')).filter((e) => !e.closest('svg, script, style, form, noscript, .cms-toast, [aria-hidden="true"]:not(.slide)'));
      const exact = new Map<string, HTMLElement[]>();
      const lower = new Map<string, HTMLElement[]>();
      const ns = new Map<string, HTMLElement[]>();
      const add = (m: Map<string, HTMLElement[]>, k: string, e: HTMLElement) => {
        if (!k) return;
        const l = m.get(k);
        if (l) l.push(e);
        else m.set(k, [e]);
      };
      for (const e of els) {
        const t = norm(e.textContent || '');
        if (!t || t.length > 4000) continue;
        add(exact, t, e);
        add(lower, t.toLowerCase(), e);
        add(ns, loose(t), e);
      }
      const used = new Set<HTMLElement>();
      const deepest = (list: HTMLElement[]) => list.filter((a) => !list.some((b) => b !== a && a.contains(b)));
      const inlineOk = (e: HTMLElement) => Array.from(e.querySelectorAll('*')).every((c) => INLINE_OK.has(c.tagName));
      const inline: string[] = [];
      const select: string[] = [];
      for (const f of fields) {
        const target = norm(f.plain);
        if (!target) continue;
        let el: HTMLElement | undefined;
        let mode: Mode = 'select';
        const ex = exact.get(target);
        if (ex) {
          el = deepest(ex).find((e) => !used.has(e));
          if (el && inlineOk(el)) mode = 'inline';
        }
        if (!el) el = deepest(lower.get(target.toLowerCase()) || []).find((e) => !used.has(e));
        if (!el) el = deepest(ns.get(loose(target)) || []).find((e) => !used.has(e));
        if (!el) continue;
        used.add(el);
        el.setAttribute('data-cms-edit', f.path);
        el.setAttribute('data-cms-mode', mode);
        byPath.set(f.path, { el, mode, src: f.src });
        (mode === 'inline' ? inline : select).push(f.path);
      }
      const imgs = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
      const usedImg = new Set<HTMLImageElement>();
      const mappedImages: string[] = [];
      for (const f of images) {
        const want = imgKey(f.src);
        if (!want) continue;
        const img = imgs.find((i) => !usedImg.has(i) && imgKey(i.getAttribute('src')) === want);
        if (!img) continue;
        usedImg.add(img);
        const pos = getComputedStyle(img).position;
        const box = (pos === 'absolute' && img.parentElement ? img.parentElement : img) as HTMLElement;
        box.setAttribute('data-cms-imgbox', f.path);
        imgByPath.set(f.path, box);
        mappedImages.push(f.path);
      }
      post({ type: 'mapped', inline, select, images: mappedImages });
    }

    let editTimer: ReturnType<typeof setTimeout> | undefined;
    const sendEdit = (el: HTMLElement) => {
      const path = el.getAttribute('data-cms-edit');
      const rec = path ? byPath.get(path) : undefined;
      if (!path || !rec) return;
      const value = toSource(el, rec.src);
      if (norm(value) === norm(rec.src)) return;
      rec.src = value;
      post({ type: 'edit', path, value });
    };
    const stopEditing = () => {
      if (!editing) return;
      clearTimeout(editTimer);
      sendEdit(editing);
      editing.removeAttribute('contenteditable');
      editing.querySelectorAll('a').forEach((a) => a.removeAttribute('draggable'));
      editing = null;
    };
    const startEditing = (el: HTMLElement) => {
      if (editing === el) return;
      stopEditing();
      editing = el;
      el.contentEditable = plaintextOnly ? 'plaintext-only' : 'true';
      el.spellcheck = true;
      el.querySelectorAll('a').forEach((a) => a.setAttribute('draggable', 'false'));
    };

    // Editable text starts editing on pointerdown so the click itself places the caret.
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const el = t.closest<HTMLElement>('[data-cms-edit]');
      if (el && el.getAttribute('data-cms-mode') === 'inline') startEditing(el);
      else if (editing && !editing.contains(t)) stopEditing();
    };

    // Links, the booking pop-up and form buttons do nothing while editing.
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const edit = t.closest<HTMLElement>('[data-cms-edit]');
      const imgbox = t.closest<HTMLElement>('[data-cms-imgbox]');
      const link = t.closest('a');
      const submit = t.closest('button[type="submit"], input[type="submit"]');
      if (link || submit || edit || imgbox) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
      if (edit) {
        const path = edit.getAttribute('data-cms-edit')!;
        markSel(edit);
        post({ type: 'select', path, kind: 'text', mode: edit.getAttribute('data-cms-mode') });
        return;
      }
      if (imgbox) {
        markSel(imgbox);
        post({ type: 'select', path: imgbox.getAttribute('data-cms-imgbox'), kind: 'image' });
        return;
      }
      if (link || submit) {
        say(link ? 'Links are switched off while you edit. Use View to open the page.' : 'Forms are switched off in the editor.');
        post({ type: 'blocked' });
      }
    };

    const onInput = (e: Event) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-cms-edit]');
      if (!el) return;
      clearTimeout(editTimer);
      editTimer = setTimeout(() => sendEdit(el), 250);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!editing) return;
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        const el = editing;
        stopEditing();
        el.blur();
      }
    };
    const onPaste = (e: ClipboardEvent) => {
      if (!editing) return;
      e.preventDefault();
      const text = (e.clipboardData?.getData('text/plain') || '').replace(/\s+/g, ' ');
      document.execCommand('insertText', false, text);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (editing && e.target === editing) stopEditing();
    };
    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => post({ type: 'scroll', y: window.scrollY }), 120);
    };

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== origin || e.source !== window.parent || !e.data || !e.data.__cms) return;
      const m = e.data;
      if (m.type === 'init') {
        if (typeof m.scrollY === 'number') window.scrollTo({ top: m.scrollY, behavior: 'instant' as ScrollBehavior });
        map(m.fields || [], m.images || []);
      } else if (m.type === 'text') {
        const rec = byPath.get(m.path);
        if (rec && rec.mode === 'inline' && rec.el !== editing) {
          rec.el.innerHTML = m.html;
          rec.src = m.src ?? rec.src;
        }
      } else if (m.type === 'focus') {
        const el = byPath.get(m.path)?.el || imgByPath.get(m.path);
        if (el) {
          markSel(el);
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      } else if (m.type === 'reveal') {
        const prefixes: string[] = m.paths || [];
        const hit = [...byPath.entries(), ...imgByPath.entries()].find(([p]) => prefixes.some((x) => p === x || p.startsWith(`${x}.`)));
        const el = hit ? ('el' in (hit[1] as object) ? (hit[1] as { el: HTMLElement }).el : (hit[1] as HTMLElement)) : null;
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
          markSel(el);
        }
      } else if (m.type === 'mark') {
        markSel(byPath.get(m.path)?.el || imgByPath.get(m.path));
      } else if (m.type === 'deselect') {
        clearSel();
      }
    };

    window.addEventListener('message', onMessage);
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('click', onClick, true);
    window.addEventListener('submit', (e) => e.preventDefault(), true);
    document.addEventListener('input', onInput, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('paste', onPaste, true);
    document.addEventListener('focusout', onFocusOut, true);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Wait for React to finish hydrating before anything is marked.
    let cancelled = false;
    const ready = () => !cancelled && post({ type: 'ready', height: document.documentElement.scrollHeight });
    if (document.readyState === 'complete') setTimeout(ready, 60);
    else window.addEventListener('load', () => setTimeout(ready, 60), { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('message', onMessage);
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('click', onClick, true);
      document.removeEventListener('input', onInput, true);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('paste', onPaste, true);
      document.removeEventListener('focusout', onFocusOut, true);
      window.removeEventListener('scroll', onScroll);
      style.remove();
      toast.remove();
    };
  }, []);
  return null;
}
