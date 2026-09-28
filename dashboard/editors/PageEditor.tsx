'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, stripDoc } from '../lib/api';
import { useToast } from '../ui/Toast';
import { Icons } from '../ui/Icons';
import { Select, TextArea, TextInput, HelpBox, INLINE_HELP } from '../ui/fields';
import { ImageField } from '../ui/ImageField';
import { SortableList, DragHandle } from '../ui/Sortable';
import { CardsEditor, NodesEditor, SlidesEditor, StringListEditor, newId, withId } from './listEditors';
import { SeoPanel } from './SeoPanel';
import { layoutFor, KIND_LABEL, type EditorLayout, type FieldDef, type SectionDef } from './pageSchema';

/* ------------------------------------------------------------------ */
/* document helpers                                                    */
/* ------------------------------------------------------------------ */
const get = (o: any, path: string) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
const set = (o: any, path: string, v: unknown) => {
  const keys = path.split('.');
  const out = { ...o };
  let cur = out;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...(cur[keys[i]] || {}) };
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = v;
  return out;
};

/** Relationship fields go back to Payload as ids. */
const REL_KEYS = new Set(['upload', 'ogImage', 'photo', 'featuredImage', 'logo']);
export function toPayload(v: any, key?: string): any {
  if (Array.isArray(v)) return v.map((x) => toPayload(x));
  if (v && typeof v === 'object') {
    if (key && REL_KEYS.has(key) && 'id' in v) return v.id;
    const out: any = {};
    for (const [k, val] of Object.entries(v)) out[k] = toPayload(val, k);
    return out;
  }
  return v;
}

const trim = (s: unknown, n = 90) => {
  const v = String(s || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  return v.length > n ? `${v.slice(0, n)}…` : v;
};

/* ------------------------------------------------------------------ */
/* collapsible section row                                             */
/* ------------------------------------------------------------------ */
export function SectionRow({ num, label, preview, open, onToggle, draggable, children, onRemove }: { num: number; label: string; preview?: string; open: boolean; onToggle: () => void; draggable?: boolean; children: React.ReactNode; onRemove?: () => void }) {
  const Chev = Icons.chevron;
  const Trash = Icons.trash;
  return (
    <div className={`d-section ${open ? 'open' : ''}`}>
      <div className="d-section-head" onClick={onToggle} role="button" aria-expanded={open}>
        {draggable ? <DragHandle /> : <span className="d-handle disabled" />}
        <span className="num">{num}</span>
        <span className="label">
          {label}
          {preview && <small>{preview}</small>}
        </span>
        {onRemove && (
          <button type="button" className="d-btn ghost icon" aria-label="Remove section" title="Remove section" onClick={(e) => (e.stopPropagation(), onRemove())}>
            <Trash />
          </button>
        )}
        <Chev className="chev" width={18} height={18} />
      </div>
      {open && <div className="d-section-body">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* field renderer                                                      */
/* ------------------------------------------------------------------ */
export function Fields({ fields, doc, base = '', onChange }: { fields: FieldDef[]; doc: any; base?: string; onChange: (path: string, v: unknown) => void }) {
  return (
    <>
      {fields.map((f) => {
        const path = base ? `${base}.${f.name}` : f.name;
        const v = get(doc, path);
        switch (f.type) {
          case 'text':
            return <TextInput key={path} label={f.label} value={v || ''} onChange={(x) => onChange(path, x)} help={f.help} />;
          case 'textarea':
            return <TextArea key={path} label={f.label} value={v || ''} onChange={(x) => onChange(path, x)} help={f.help || INLINE_HELP} rows={f.rows} />;
          case 'image':
            return <ImageField key={path} label={f.label} value={v} onChange={(x) => onChange(path, x)} help={f.help} builtInAlt={f.builtInAlt} />;
          case 'nodes':
            return (
              <div className="d-field" key={path}>
                <span className="d-label">{f.label}</span>
                <NodesEditor value={v || []} onChange={(x) => onChange(path, x)} label={f.label} />
                {f.help && <div className="d-help">{f.help}</div>}
              </div>
            );
          case 'stringList':
            return (
              <div className="d-field" key={path}>
                <span className="d-label">{f.label}</span>
                <StringListEditor value={v || []} onChange={(x) => onChange(path, x)} itemLabel={f.itemLabel} rows={f.rows} />
                {f.help && <div className="d-help">{f.help}</div>}
              </div>
            );
          case 'cards':
            return (
              <div className="d-field" key={path}>
                <span className="d-label">{f.label}</span>
                <CardsEditor value={v || []} onChange={(x) => onChange(path, x)} withImage={f.withImage} withIcon={f.withIcon} withFallback={f.withFallback} itemLabel={f.itemLabel} />
                {f.help && <div className="d-help">{f.help}</div>}
              </div>
            );
          case 'slides':
            return (
              <div className="d-field" key={path}>
                <span className="d-label">{f.label}</span>
                <SlidesEditor value={v || []} onChange={(x) => onChange(path, x)} />
              </div>
            );
          case 'group':
            return <Fields key={path} fields={f.fields} doc={doc} base={path} onChange={onChange} />;
        }
      })}
    </>
  );
}

export const sectionPreview = (s: SectionDef, doc: any) => {
  for (const f of s.fields) {
    if (f.type === 'text' || f.type === 'textarea') {
      const v = get(doc, f.name);
      if (v) return trim(v);
    }
    if (f.type === 'group') {
      const g = get(doc, f.name) || {};
      const first = f.fields.find((x) => (x.type === 'text' || x.type === 'textarea') && g[x.name]);
      if (first) return trim(g[first.name]);
    }
    if (f.type === 'cards' || f.type === 'slides') {
      const arr = get(doc, f.name) || [];
      if (arr.length) return `${arr.length} item${arr.length === 1 ? '' : 's'}: ${arr.map((c: any) => c.title || c.headline).filter(Boolean).slice(0, 3).join(', ')}`;
    }
    if (f.type === 'nodes') {
      const arr = get(doc, f.name) || [];
      if (arr.length) return trim(arr.find((n: any) => n.text)?.text);
    }
  }
  return '';
};

/* ------------------------------------------------------------------ */
/* the editor                                                          */
/* ------------------------------------------------------------------ */
export function PageEditor({ initial, siteUrl, siteName, isAdmin }: { initial: any; siteUrl: string; siteName: string; isAdmin: boolean }) {
  const toast = useToast();
  const [doc, setDoc] = useState<any>(initial);
  const [saved, setSaved] = useState<any>(initial);
  const [tab, setTab] = useState<'content' | 'seo' | 'settings'>(typeof window !== 'undefined' && window.location.hash === '#seo' ? 'seo' : 'content');
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const dirty = useMemo(() => JSON.stringify(doc) !== JSON.stringify(saved), [doc, saved]);
  const layout = useMemo(() => layoutFor(doc), [doc.kind, doc.slug]); // eslint-disable-line react-hooks/exhaustive-deps
  const change = useCallback((path: string, v: unknown) => setDoc((d: any) => set(d, path, v)), []);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = async () => {
    setBusy(true);
    try {
      const body = toPayload({ ...stripDoc(doc), _status: 'published' });
      const r = await api.patch(`/api/pages/${doc.id}?depth=1`, body);
      setDoc(r.doc);
      setSaved(r.doc);
      toast('Saved. Click Publish website on the dashboard when you want it live.', 'success');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const Ext = Icons.external;
  const Back = Icons.arrowLeft;
  const pageUrl = `${siteUrl}${doc.route}`;

  return (
    <>
      <div className="d-save-bar">
        <Link href="/admin/pages" className="d-btn ghost sm">
          <Back /> Pages
        </Link>
        <strong style={{ fontSize: 17 }}>{doc.title}</strong>
        <span className="d-badge">{KIND_LABEL[doc.kind] || doc.kind}</span>
        <span className={`state ${dirty ? 'dirty' : ''}`}>{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
        <div className="d-topbar-spacer" />
        <a className="d-btn sm" href={pageUrl} target="_blank" rel="noopener" title="Opens the live page. Saved changes appear after Publish website.">
          <Ext /> View page
        </a>
        <button className="d-btn primary" onClick={save} disabled={busy || !dirty}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="d-tabs">
        <button className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>
          Content
        </button>
        <button className={tab === 'seo' ? 'active' : ''} onClick={() => setTab('seo')}>
          SEO
        </button>
        <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
          Page settings
        </button>
      </div>

      {tab === 'content' && <ContentSections doc={doc} layout={layout} change={change} open={open} setOpen={setOpen} />}

      {tab === 'seo' && (
        <div className="d-card" style={{ maxWidth: 820 }}>
          <SeoPanel value={doc} onChange={(v) => setDoc({ ...doc, ...v })} url={pageUrl} siteName={siteName} fallbackTitle={doc.title} />
        </div>
      )}

      {tab === 'settings' && <PageSettingsForm doc={doc} change={change} isAdmin={isAdmin} pageUrl={pageUrl} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* the section list (shared by the visual editor's Content tab)        */
/* ------------------------------------------------------------------ */
export function ContentSections({ doc, layout, change, open, setOpen, compact = false }: { doc: any; layout: EditorLayout; change: (path: string, v: unknown) => void; open: string | null; setOpen: (k: string | null) => void; compact?: boolean }) {
  const arr: any[] = layout.array ? (get(doc, layout.array.name) || []).map(withId) : [];
  const setArr = (rows: any[]) => layout.array && change(layout.array.name, rows);
  let num = 0;
  return (
        <div className={compact ? "d-content-panel" : "d-content narrow"} style={{ padding: 0 }}>
          {!compact && (
            <HelpBox>
              The sections below are in the order they appear on the page. Click a section to open it. Inside a section, drag the six-dot handle to reorder paragraphs, tiles or slides. Save when you are done, then Publish website from the dashboard.
            </HelpBox>
          )}
          {layout.before.map((s) => {
            num++;
            return (
              <SectionRow key={s.key} num={num} label={s.label} preview={sectionPreview(s, doc)} open={open === s.key} onToggle={() => setOpen(open === s.key ? null : s.key)}>
                {s.help && <div className="d-help" style={{ margin: '10px 0 14px' }}>{s.help}</div>}
                <Fields fields={s.fields} doc={doc} onChange={change} />
              </SectionRow>
            );
          })}
          {layout.array && (
            <>
              <div style={{ margin: '18px 0 8px' }}>
                <span className="d-label">{layout.array.label}</span>
                <div className="d-help" style={{ marginTop: 0 }}>
                  {layout.array.help}
                </div>
              </div>
              <SortableList items={arr} getId={(r) => r.id} onReorder={setArr}>
                {(row, i) => {
                  const key = `arr-${row.id}`;
                  const n = layout.before.length + i + 1;
                  return (
                    <SectionRow
                      num={n}
                      label={row.heading || 'New section'}
                      preview={trim((row.nodes || []).find((x: any) => x.text)?.text)}
                      open={open === key}
                      onToggle={() => setOpen(open === key ? null : key)}
                      draggable
                      onRemove={() => window.confirm(`Remove the section "${row.heading}"?`) && setArr(arr.filter((_, j) => j !== i))}
                    >
                      <TextInput label="Section heading" value={row.heading || ''} onChange={(heading) => setArr(arr.map((x, j) => (j === i ? { ...x, heading } : x)))} />
                      {doc.slug === 'about' && row.heading === 'Meet the team' ? (
                        <div className="d-notice info">
                          <div className="grow">
                            <strong>The dentists' names, photos and bios are edited under Team.</strong>
                            <small>
                              <Link href="/admin/team">Open Team</Link> to change them, reorder them or hide someone. This section only sets the heading.
                            </small>
                          </div>
                        </div>
                      ) : (
                        <div className="d-field">
                          <span className="d-label">Section copy</span>
                          <NodesEditor value={row.nodes || []} onChange={(nodes) => setArr(arr.map((x, j) => (j === i ? { ...x, nodes } : x)))} label="Section copy" />
                        </div>
                      )}
                      <details className="d-more">
                        <summary>When to show this section (advanced)</summary>
                        <div>
                          <Select
                            label="Only show when this feature is switched on"
                            value={row.gate || ''}
                            onChange={(gate) => setArr(arr.map((x, j) => (j === i ? { ...x, gate: gate || null } : x)))}
                            options={[
                              { label: 'Emergency dentistry', value: 'emergency' },
                              { label: 'Kids no-gap (CDBS) offer', value: 'cdbs' },
                              { label: 'Zip and Afterpay', value: 'zipAfterpay' },
                            ]}
                            allowEmpty="Always"
                          />
                        </div>
                      </details>
                    </SectionRow>
                  );
                }}
              </SortableList>
              <button type="button" className="d-add" style={{ marginBottom: 10 }} onClick={() => setArr([...arr, { id: newId(), heading: 'New section', nodes: [{ id: newId(), type: 'p', text: '' }] }])}>
                + Add a section
              </button>
            </>
          )}
          {layout.after.map((s) => {
            const n = layout.before.length + arr.length + layout.after.indexOf(s) + 1;
            return (
              <SectionRow key={s.key} num={n} label={s.label} preview={sectionPreview(s, doc)} open={open === s.key} onToggle={() => setOpen(open === s.key ? null : s.key)}>
                {s.help && <div className="d-help" style={{ margin: '10px 0 14px' }}>{s.help}</div>}
                <Fields fields={s.fields} doc={doc} onChange={change} />
              </SectionRow>
            );
          })}
        </div>
  );
}

export function PageSettingsForm({ doc, change, isAdmin, pageUrl }: { doc: any; change: (path: string, v: unknown) => void; isAdmin: boolean; pageUrl: string }) {
  return (
        <div className="d-card" style={{ maxWidth: 820 }}>
          <TextInput label="Page name (menus and breadcrumbs)" value={doc.title || ''} onChange={(x) => change('title', x)} />
          <TextInput label="Web address" value={pageUrl} onChange={() => undefined} readOnly help="Changing a page's address is done by GYA, together with a redirect from the old one." />
          {isAdmin && (
            <>
              <div className="d-row">
                <TextInput label="Slug" value={doc.slug || ''} onChange={(x) => change('slug', x)} help="Admin only. Changing this changes the URL." />
                <TextInput label="Route" value={doc.route || ''} onChange={(x) => change('route', x)} help="Admin only. Must match the slug, e.g. /example/" />
              </div>
              <Select label="Template" value={doc.kind} onChange={(x) => change('kind', x)} options={Object.entries(KIND_LABEL).map(([value, label]) => ({ value, label }))} help="Admin only." />
              {doc.kind === 'service' && (
                <Select
                  label="Menu group"
                  value={doc.category || ''}
                  onChange={(x) => change('category', x || null)}
                  options={[
                    { label: 'General', value: 'general' },
                    { label: 'Children', value: 'children' },
                    { label: 'Cosmetic', value: 'cosmetic' },
                    { label: 'Restorative', value: 'restorative' },
                    { label: 'Gum health', value: 'gum' },
                    { label: 'Sleep and comfort', value: 'other' },
                  ]}
                  allowEmpty="None"
                />
              )}
            </>
          )}
          <Select
            label="Whole page only shows when this feature is switched on"
            value={doc.gate || ''}
            onChange={(x) => change('gate', x || null)}
            options={[
              { label: 'Emergency dentistry', value: 'emergency' },
              { label: 'Kids no-gap (CDBS) offer', value: 'cdbs' },
              { label: 'Zip and Afterpay', value: 'zipAfterpay' },
            ]}
            allowEmpty="Always shown"
            help="Feature switches are in Site Settings."
          />
        </div>
  );
}
