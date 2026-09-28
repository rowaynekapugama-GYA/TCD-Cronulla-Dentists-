'use client';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { api, stripDoc } from '../../lib/api';
import { useToast } from '../../ui/Toast';
import { Icons } from '../../ui/Icons';
import { TextArea, TextInput } from '../../ui/fields';
import { ImageField } from '../../ui/ImageField';
import { SortableList, DragHandle } from '../../ui/Sortable';
import { newId, withId } from '../listEditors';
import { SeoPanel } from '../SeoPanel';
import { ContentSections, PageSettingsForm, sectionPreview, toPayload } from '../PageEditor';
import { layoutFor, KIND_LABEL, type EditorLayout, type FieldDef } from '../pageSchema';
import { collectFields, getIn, inlineHtml, plainText, setIn, type FieldRef } from './fieldIndex';
import { DRAFT_KEY, PREVIEW_ROUTE } from '@/lib/preview';

type Cfg = { phone: string; email: string; tel: string };
type Mapping = { inline: Set<string>; select: Set<string>; images: Set<string> };
type Device = 'desktop' | 'mobile';
type Tab = 'content' | 'seo' | 'sections';

const EMPTY_MAP: Mapping = { inline: new Set(), select: new Set(), images: new Set() };
const DESKTOP_W = 1280;
const MOBILE_W = 390;
/** Fields that only affect search results, not what the page shows. */
const SEO_KEYS = ['metaTitle', 'metaDescription', 'metaTitleGated', 'metaDescriptionGated', 'ogImage', 'canonical', 'noindex', 'primaryKeyword'];
const contentKey = (d: any) => {
  const c = { ...d };
  for (const k of [...SEO_KEYS, 'updatedAt', 'createdAt']) delete c[k];
  return JSON.stringify(c);
};

/** Top-level field names a schema section covers (used to find it in the preview). */
const sectionPrefixes = (fields: FieldDef[]): string[] => fields.map((f) => f.name);

export function VisualPageEditor({ initial, siteUrl, siteName, isAdmin, cfg }: { initial: any; siteUrl: string; siteName: string; isAdmin: boolean; cfg: Cfg }) {
  const toast = useToast();
  const [doc, setDoc] = useState<any>(initial);
  const [saved, setSaved] = useState<any>(initial);
  const [device, setDevice] = useState<Device>('desktop');
  const [tab, setTab] = useState<Tab>(typeof window !== 'undefined' && window.location.hash === '#seo' ? 'seo' : 'content');
  const [open, setOpen] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | 'save' | 'publish'>(null);
  const [mapping, setMapping] = useState<Mapping>(EMPTY_MAP);
  const [urls, setUrls] = useState<[string, string | null]>([PREVIEW_ROUTE(initial.id), null]);
  const [active, setActive] = useState<0 | 1>(0);
  const [updating, setUpdating] = useState(false);
  const [size, setSize] = useState({ w: 900, h: 700 });

  const dirty = useMemo(() => JSON.stringify(doc) !== JSON.stringify(saved), [doc, saved]);
  const layout: EditorLayout = useMemo(() => layoutFor(doc), [doc.kind, doc.slug]); // eslint-disable-line react-hooks/exhaustive-deps
  const fields = useMemo(() => collectFields(doc, layout), [doc, layout]);
  const byPath = useMemo(() => new Map(fields.map((f) => [f.path, f])), [fields]);
  const pageUrl = `${siteUrl}${doc.route}`;

  // refs the message handler reads (it is registered once)
  const docRef = useRef(doc);
  docRef.current = doc;
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  const activeRef = useRef<0 | 1>(0);
  activeRef.current = active;
  const mappingRef = useRef(mapping);
  mappingRef.current = mapping;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const frames = [useRef<HTMLIFrameElement>(null), useRef<HTMLIFrameElement>(null)] as const;
  const pendingRef = useRef<0 | 1 | null>(null);
  const queuedRef = useRef(false);
  const scrollRef = useRef(0);
  const originRef = useRef<null | 'preview' | 'save'>(null);
  const prevDocRef = useRef(doc);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const canvasRef = useRef<HTMLDivElement>(null);

  const postTo = (i: 0 | 1, m: Record<string, unknown>) => frames[i].current?.contentWindow?.postMessage({ __cms: true, ...m }, window.location.origin);
  const postActive = (m: Record<string, unknown>) => postTo(activeRef.current, m);

  const bridgeFields = () => {
    const list = fieldsRef.current;
    return {
      fields: list.filter((f) => f.kind === 'text').map((f) => ({ path: f.path, src: f.value, plain: plainText(f.value, cfg) })),
      images: list.filter((f) => f.kind === 'image').map((f) => ({ path: f.path, src: f.value })),
    };
  };

  /** Render the unsaved page into the hidden frame, then swap it in (no flash, same scroll). */
  const refresh = useCallback(async () => {
    if (pendingRef.current !== null) {
      queuedRef.current = true;
      return;
    }
    setUpdating(true);
    try {
      await api.post(`/api/payload-preferences/${DRAFT_KEY(docRef.current.id)}`, { value: toPayloadDraft(docRef.current) });
    } catch {
      setUpdating(false);
      return;
    }
    const next: 0 | 1 = activeRef.current === 0 ? 1 : 0;
    pendingRef.current = next;
    const url = `${PREVIEW_ROUTE(docRef.current.id)}?draft=1&v=${Date.now()}`;
    setUrls((u) => (next === 0 ? [url, u[1]] : [u[0], url]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleRefresh = useCallback(() => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => void refresh(), 900);
  }, [refresh]);

  // messages from the preview
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !e.data || !e.data.__cms) return;
      const i = frames[0].current?.contentWindow === e.source ? 0 : frames[1].current?.contentWindow === e.source ? 1 : null;
      if (i === null) return;
      const m = e.data;
      if (m.type === 'ready') {
        postTo(i, { type: 'init', ...bridgeFields(), scrollY: i === activeRef.current && pendingRef.current === null ? undefined : scrollRef.current });
      } else if (m.type === 'mapped') {
        const map: Mapping = { inline: new Set(m.inline), select: new Set(m.select), images: new Set(m.images) };
        if (pendingRef.current === i) {
          pendingRef.current = null;
          setActive(i);
          if (selectedRef.current) postTo(i, { type: 'mark', path: selectedRef.current });
          setUpdating(false);
          if (queuedRef.current) {
            queuedRef.current = false;
            setTimeout(() => void refresh(), 50);
          }
        }
        if (i === activeRef.current || pendingRef.current === null) setMapping(map);
      } else if (i !== activeRef.current) {
        return;
      } else if (m.type === 'scroll') {
        scrollRef.current = m.y || 0;
      } else if (m.type === 'select') {
        setSelected(m.path);
        setTab('content');
        const f = fieldsRef.current.find((x) => x.path === m.path);
        if (f) setOpen(f.section);
      } else if (m.type === 'edit') {
        originRef.current = 'preview';
        setDoc((d: any) => setIn(d, m.path, m.value));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // keep the preview in step with edits made in the side panel
  useEffect(() => {
    const prev = prevDocRef.current;
    prevDocRef.current = doc;
    if (prev === doc) return;
    const origin = originRef.current;
    originRef.current = null;
    if (origin) return; // typed on the page itself, or the saved copy coming back
    if (contentKey(prev) === contentKey(doc)) return; // SEO only
    const before = new Map(collectFields(prev, layoutFor(prev)).map((f) => [f.path, f]));
    let patched = prev;
    const changed: FieldRef[] = [];
    for (const f of fields) {
      const p = before.get(f.path);
      if (p && p.value !== f.value && f.kind === 'text') changed.push(f);
    }
    if (changed.length && changed.length <= 2 && changed.every((f) => mappingRef.current.inline.has(f.path))) {
      for (const f of changed) {
        postActive({ type: 'text', path: f.path, html: inlineHtml(f.value, cfg), src: f.value });
        patched = setIn(patched, f.path, f.value);
      }
      if (contentKey(patched) === contentKey(doc)) return;
    }
    scheduleRefresh();
  }, [doc]); // eslint-disable-line react-hooks/exhaustive-deps

  // tell the preview which element is selected
  useEffect(() => {
    if (selected) postActive({ type: 'focus', path: selected });
    else postActive({ type: 'deselect' });
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const change = useCallback((path: string, v: unknown) => setDoc((d: any) => setIn(d, path, v)), []);

  const save = async () => {
    setBusy('save');
    try {
      const body = toPayload({ ...stripDoc(doc), _status: 'published' });
      const r = await api.patch(`/api/pages/${doc.id}?depth=1`, body);
      originRef.current = 'save';
      setDoc(r.doc);
      setSaved(r.doc);
      toast('Saved. Click Publish website when you are ready for it to go live.', 'success');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  };
  const publish = async () => {
    if (dirty && !window.confirm('You have unsaved changes on this page. Publish without them? (Click Cancel, then Save changes first, to include them.)')) return;
    setBusy('publish');
    try {
      const r = await api.post('/api/publish-site');
      toast(r.ok ? 'Publishing started. The website updates in about 2 to 3 minutes.' : r.detail || 'Publish failed', r.ok ? 'success' : 'error');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  };

  // preview sizing: desktop renders at 1280px wide and scales down to fit
  const pad = 24;
  const cw = Math.max(200, size.w - pad * 2);
  const ch = Math.max(200, size.h - pad * 2);
  const logical = device === 'desktop' ? Math.max(DESKTOP_W, cw) : MOBILE_W;
  const scale = device === 'desktop' ? cw / logical : Math.min(1, cw / MOBILE_W);
  const frameStyle = (i: 0 | 1): React.CSSProperties => ({
    width: logical,
    height: ch / scale,
    transform: `scale(${scale})`,
    transformOrigin: '0 0',
    visibility: i === active ? 'visible' : 'hidden',
    zIndex: i === active ? 2 : 1,
  });

  const sel = selected ? byPath.get(selected) : undefined;
  const Back = Icons.arrowLeft;
  const Ext = Icons.external;
  const Desk = Icons.desktop;
  const Mob = Icons.mobile;
  const X = Icons.x;
  const Rocket = Icons.rocket;

  const reveal = (paths: string[]) => postActive({ type: 'reveal', paths });

  return (
    <div className="v-editor">
      <div className="v-bar">
        <Link href="/admin/pages" className="d-btn ghost sm v-pill">
          <Back /> Pages
        </Link>
        <strong className="v-title" title={doc.title}>
          {doc.title}
        </strong>
        <span className="d-badge">{KIND_LABEL[doc.kind] || doc.kind}</span>
        <div className="d-topbar-spacer" />
        <div className="v-device" role="group" aria-label="Preview size">
          <button type="button" className={device === 'desktop' ? 'on' : ''} onClick={() => setDevice('desktop')} aria-pressed={device === 'desktop'}>
            <Desk width={17} height={17} /> Desktop
          </button>
          <button type="button" className={device === 'mobile' ? 'on' : ''} onClick={() => setDevice('mobile')} aria-pressed={device === 'mobile'}>
            <Mob width={17} height={17} /> Mobile
          </button>
        </div>
        <span className={`v-state ${dirty ? 'dirty' : ''}`}>
          <span className="dot" /> {dirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
        <a className="d-btn sm" href={pageUrl} target="_blank" rel="noopener" title="Opens the live page. Saved changes appear there after Publish website.">
          <Ext /> View
        </a>
        <button className="d-btn sm" onClick={publish} disabled={busy !== null} title="Rebuild the live website with everything saved so far">
          <Rocket /> {busy === 'publish' ? 'Publishing…' : 'Publish website'}
        </button>
        <button className="d-btn primary" onClick={save} disabled={busy !== null || !dirty}>
          {busy === 'save' ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="v-body">
        <div className="v-canvas" ref={canvasRef}>
          <div className={`v-stage ${device}`} style={{ width: logical * scale, height: ch }}>
            {([0, 1] as const).map((i) =>
              urls[i] ? <iframe key={i} ref={frames[i]} src={urls[i] as string} title={i === active ? `Preview of ${doc.title}` : 'Updating preview'} style={frameStyle(i)} tabIndex={i === active ? 0 : -1} aria-hidden={i !== active} /> : <iframe key={i} ref={frames[i]} title="" style={{ ...frameStyle(i), display: 'none' }} aria-hidden />,
            )}
          </div>
          {updating && <div className="v-updating">Updating preview…</div>}
        </div>

        <aside className="v-panel">
          <div className="v-tabs" role="tablist">
            {(['content', 'seo', 'sections'] as Tab[]).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
                {t === 'content' ? 'Content' : t === 'seo' ? 'SEO' : 'Sections'}
              </button>
            ))}
          </div>
          <div className="v-panel-body">
            {tab === 'content' && (
              <>
                {sel ? (
                  <div className="v-selected">
                    <div className="v-selected-head">
                      <div>
                        <span className="v-kicker">{sel.sectionLabel}</span>
                        <strong>{sel.label}</strong>
                      </div>
                      <button type="button" className="d-btn ghost icon" aria-label="Close" onClick={() => setSelected(null)}>
                        <X />
                      </button>
                    </div>
                    {sel.kind === 'image' ? (
                      <ImageField label="Photo" value={getIn(doc, sel.path)} onChange={(v) => change(sel.path, v)} builtInAlt={sel.builtInAlt} />
                    ) : sel.multiline ? (
                      <TextArea label="Wording" value={getIn(doc, sel.path) || ''} onChange={(v) => change(sel.path, v)} rows={Math.min(8, Math.max(3, Math.ceil((getIn(doc, sel.path) || '').length / 48)))} />
                    ) : (
                      <TextInput label="Wording" value={getIn(doc, sel.path) || ''} onChange={(v) => change(sel.path, v)} />
                    )}
                    <div className="d-help">
                      {sel.kind === 'image'
                        ? 'Pick a photo from the library or upload one. Keep a similar shape so the layout stays the same.'
                        : mapping.inline.has(sel.path)
                          ? 'You can also click the text on the page and type straight over it. Shortcuts: **bold**, {{phone}}, {{email}}, [link text](/page/).'
                          : 'The design styles this wording (for example capitals or a coloured word), so edit it here and the preview updates.'}
                    </div>
                  </div>
                ) : (
                  <div className="v-hint">
                    <Icons.pointer width={18} height={18} />
                    <div>
                      <strong>Click any text on the page to edit it</strong>
                      <span>Type straight onto the page, or click a photo to change it. Everything is also listed below, section by section.</span>
                    </div>
                  </div>
                )}
                <ContentSections
                  doc={doc}
                  layout={layout}
                  change={change}
                  open={open}
                  setOpen={(k) => {
                    setOpen(k);
                    if (k) {
                      const s = [...layout.before, ...layout.after].find((x) => x.key === k);
                      if (s) reveal(sectionPrefixes(s.fields));
                      else if (k.startsWith('arr-') && layout.array) {
                        const idx = (getIn(doc, layout.array.name) || []).map(withId).findIndex((r: any) => `arr-${r.id}` === k);
                        if (idx >= 0) reveal([`${layout.array.name}.${idx}`]);
                      }
                    }
                  }}
                  compact
                />
              </>
            )}

            {tab === 'seo' && <SeoPanel value={doc} onChange={(v) => setDoc({ ...doc, ...v })} url={pageUrl} siteName={siteName} fallbackTitle={doc.title} />}

            {tab === 'sections' && <SectionsTab doc={doc} layout={layout} change={change} isAdmin={isAdmin} pageUrl={pageUrl} onGo={(key, paths) => (reveal(paths), setTab('content'), setOpen(key), setSelected(null))} />}
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Draft sent to the preview: the document as the editor holds it (media stay populated). */
function toPayloadDraft(doc: any) {
  const { createdAt, updatedAt, ...rest } = doc;
  return rest;
}

/* ------------------------------------------------------------------ */
/* Sections tab: the page's sections in order                          */
/* ------------------------------------------------------------------ */
function SectionsTab({ doc, layout, change, isAdmin, pageUrl, onGo }: { doc: any; layout: EditorLayout; change: (p: string, v: unknown) => void; isAdmin: boolean; pageUrl: string; onGo: (key: string, paths: string[]) => void }) {
  const Lock = Icons.lock;
  const Trash = Icons.trash;
  const arr: any[] = layout.array ? (getIn(doc, layout.array.name) || []).map(withId) : [];
  const setArr = (rows: any[]) => layout.array && change(layout.array.name, rows);
  const fixed = (num: number, k: string, label: string, preview: string, paths: string[]) => {
    return (
      <button key={k} type="button" className="v-sec" onClick={() => onGo(k, paths)} title="Show this section">
        <span className="v-sec-lock" title="Fixed by the design">
          <Lock width={14} height={14} />
        </span>
        <span className="num">{num}</span>
        <span className="label">
          {label}
          {preview && <small>{preview}</small>}
        </span>
      </button>
    );
  };
  return (
    <div>
      <p className="d-help" style={{ marginTop: 0 }}>
        The page from top to bottom. Click a section to jump to it.
        {layout.array ? ` Drag the ${layout.array.label.toLowerCase()} sections to change their order; the others keep the position the design gives them.` : ' Their order is set by the design.'}
      </p>
      {layout.before.map((s, i) => fixed(i + 1, s.key, s.label, sectionPreview(s, doc), sectionPrefixes(s.fields)))}
      {layout.array && (
        <>
          <div className="v-sec-group">{layout.array.label}</div>
          <SortableList items={arr} getId={(r) => r.id} onReorder={setArr}>
            {(row, i) => (
              <div className="v-sec draggable">
                <DragHandle />
                <span className="num">{layout.before.length + i + 1}</span>
                <button type="button" className="label linklike" onClick={() => onGo(`arr-${row.id}`, [`${layout.array!.name}.${i}`])}>
                  {row.heading || 'New section'}
                  {row.gate && <small>Only while a feature switch is on</small>}
                </button>
                <button type="button" className="d-btn ghost icon" aria-label={`Remove ${row.heading}`} title="Remove section" onClick={() => window.confirm(`Remove the section "${row.heading}"?`) && setArr(arr.filter((_, j) => j !== i))}>
                  <Trash />
                </button>
              </div>
            )}
          </SortableList>
          <button type="button" className="d-add" onClick={() => setArr([...arr, { id: newId(), heading: 'New section', nodes: [{ id: newId(), type: 'p', text: 'New paragraph.' }] }])}>
            + Add a section
          </button>
        </>
      )}
      {layout.after.map((s, i) => fixed(layout.before.length + arr.length + i + 1, s.key, s.label, sectionPreview(s, doc), sectionPrefixes(s.fields)))}
      <details className="d-more" style={{ marginTop: 18 }}>
        <summary>Page settings</summary>
        <div>
          <PageSettingsForm doc={doc} change={change} isAdmin={isAdmin} pageUrl={pageUrl} />
        </div>
      </details>
    </div>
  );
}
