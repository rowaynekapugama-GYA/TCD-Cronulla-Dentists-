'use client';
import React, { useState } from 'react';
import { SortableList, DragHandle } from '../ui/Sortable';
import { Icons } from '../ui/Icons';
import { HelpBox, INLINE_HELP, Select, TextArea, TextInput } from '../ui/fields';
import { ImageField, type ImageValue } from '../ui/ImageField';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
export const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 12)).replace(/-/g, '').slice(0, 24);
export const withId = <T extends { id?: string | null }>(row: T): T & { id: string } => ({ ...row, id: row.id || newId() });
const trim = (s: unknown, n = 80) => {
  const v = String(s || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  return v.length > n ? `${v.slice(0, n)}…` : v;
};
const Trash = Icons.trash;
const Plus = Icons.plus;
const Chev = Icons.chevron;

const GATE_OPTIONS = [
  { label: 'Emergency dentistry', value: 'emergency' },
  { label: 'Kids no-gap (CDBS) offer', value: 'cdbs' },
  { label: 'Zip and Afterpay', value: 'zipAfterpay' },
];
const MODE_OPTIONS = [
  { label: 'Before the practice opens', value: 'pre-opening' },
  { label: 'Once the practice is open', value: 'open' },
  { label: 'Once online booking is live', value: 'booking' },
];

function RemoveButton({ onClick, label = 'Remove' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="d-btn ghost icon" aria-label={label} title={label} onClick={onClick}>
      <Trash />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Plain list of lines / paragraphs                                    */
/* ------------------------------------------------------------------ */
export type Row = { id: string; value: string };
export function StringListEditor({ value, onChange, itemLabel, rows = 2 }: { value: Row[]; onChange: (v: Row[]) => void; itemLabel: string; rows?: number }) {
  const items = (value || []).map(withId);
  return (
    <div>
      <SortableList items={items} getId={(r) => r.id} onReorder={onChange}>
        {(r, i) => (
          <div className="d-list-item">
            <DragHandle />
            {rows <= 1 ? (
              <input className="d-input" value={r.value} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} aria-label={`${itemLabel} ${i + 1}`} />
            ) : (
              <textarea className="d-textarea" rows={rows} value={r.value} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} aria-label={`${itemLabel} ${i + 1}`} />
            )}
            <RemoveButton onClick={() => onChange(items.filter((_, j) => j !== i))} label={`Remove ${itemLabel.toLowerCase()}`} />
          </div>
        )}
      </SortableList>
      <button type="button" className="d-add" onClick={() => onChange([...items, { id: newId(), value: '' }])}>
        <Plus width={14} height={14} /> Add {itemLabel.toLowerCase()}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Copy blocks: paragraph / bullet list / sub-heading / table          */
/* ------------------------------------------------------------------ */
export type NodeRow = { id: string; type: 'p' | 'ul' | 'h4' | 'table'; text?: string | null; items?: Row[] | null; rowsText?: string | null; mode?: string | null; gate?: string | null };
const NODE_LABEL: Record<string, string> = { p: 'Paragraph', ul: 'Bullet list', h4: 'Sub-heading', table: 'Table' };

export function NodesEditor({ value, onChange, label = 'Copy' }: { value: NodeRow[]; onChange: (v: NodeRow[]) => void; label?: string }) {
  const items = (value || []).map(withId);
  const [openId, setOpenId] = useState<string | null>(null);
  const update = (i: number, patch: Partial<NodeRow>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div>
      <HelpBox>
        {label}: click a block to edit it, drag the handle to reorder. {INLINE_HELP}
      </HelpBox>
      <SortableList items={items} getId={(r) => r.id} onReorder={onChange}>
        {(n, i) => {
          const open = openId === n.id;
          const preview = n.type === 'ul' ? `${n.items?.length || 0} points` : n.type === 'table' ? trim((n.rowsText || '').split('\n')[0]) : trim(n.text);
          return (
            <div className="d-block">
              <div className="d-block-head" onClick={() => setOpenId(open ? null : n.id)}>
                <DragHandle />
                <select value={n.type} onClick={(e) => e.stopPropagation()} onChange={(e) => update(i, { type: e.target.value as NodeRow['type'] })} aria-label="Block type">
                  {Object.entries(NODE_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <span className="preview">{preview || <em>Empty</em>}</span>
                <RemoveButton onClick={() => onChange(items.filter((_, j) => j !== i))} label="Remove block" />
                <Chev width={16} height={16} style={{ transform: open ? 'rotate(180deg)' : undefined, color: '#98a2b3' }} />
              </div>
              {open && (
                <div className="d-block-body">
                  {(n.type === 'p' || n.type === 'h4') && <TextArea label={n.type === 'p' ? 'Paragraph' : 'Sub-heading'} value={n.text || ''} onChange={(text) => update(i, { text })} rows={n.type === 'p' ? 4 : 1} />}
                  {n.type === 'ul' && (
                    <div className="d-field">
                      <span className="d-label">Bullet points</span>
                      <StringListEditor value={n.items || []} onChange={(items) => update(i, { items })} itemLabel="Point" />
                    </div>
                  )}
                  {n.type === 'table' && <TextArea label="Table rows" value={n.rowsText || ''} onChange={(rowsText) => update(i, { rowsText })} rows={5} help="One row per line. Separate the cells with a vertical bar |. The first line is the header row." />}
                  <details className="d-more">
                    <summary>When to show this block (advanced)</summary>
                    <div>
                      {n.type === 'p' && <Select label="Only show in this site mode" value={n.mode || ''} onChange={(mode) => update(i, { mode: mode || null })} options={MODE_OPTIONS} allowEmpty="Always" />}
                      <Select label="Only show when this feature is switched on" value={n.gate || ''} onChange={(gate) => update(i, { gate: gate || null })} options={GATE_OPTIONS} allowEmpty="Always" help="Feature switches are in Site Settings." />
                    </div>
                  </details>
                </div>
              )}
            </div>
          );
        }}
      </SortableList>
      <div className="d-actions">
        <button type="button" className="d-add" onClick={() => onChange([...items, { id: newId(), type: 'p', text: '' }])}>
          <Plus width={14} height={14} /> Add paragraph
        </button>
        <button type="button" className="d-add" onClick={() => onChange([...items, { id: newId(), type: 'ul', items: [{ id: newId(), value: '' }] }])}>
          <Plus width={14} height={14} /> Add bullet list
        </button>
        <button type="button" className="d-add" onClick={() => onChange([...items, { id: newId(), type: 'h4', text: '' }])}>
          <Plus width={14} height={14} /> Add sub-heading
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cards (tiles, pillars, blurbs)                                       */
/* ------------------------------------------------------------------ */
export type CardRow = { id: string; title: string; text?: string | null; href?: string | null; icon?: string | null; gate?: string | null; image?: ImageValue; fallback?: { title?: string | null; text?: string | null; href?: string | null; icon?: string | null } | null };

export function CardsEditor({ value, onChange, withImage, withIcon, withFallback, itemLabel = 'Card' }: { value: CardRow[]; onChange: (v: CardRow[]) => void; withImage?: boolean; withIcon?: boolean; withFallback?: boolean; itemLabel?: string }) {
  const items = (value || []).map(withId);
  const [openId, setOpenId] = useState<string | null>(null);
  const update = (i: number, patch: Partial<CardRow>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div>
      <SortableList items={items} getId={(r) => r.id} onReorder={onChange}>
        {(c, i) => {
          const open = openId === c.id;
          return (
            <div className="d-block">
              <div className="d-block-head" onClick={() => setOpenId(open ? null : c.id)}>
                <DragHandle />
                <span className="preview" style={{ color: 'inherit', fontWeight: 600 }}>
                  {i + 1}. {c.title || <em>New {itemLabel.toLowerCase()}</em>}
                </span>
                <RemoveButton onClick={() => onChange(items.filter((_, j) => j !== i))} label={`Remove ${itemLabel.toLowerCase()}`} />
                <Chev width={16} height={16} style={{ transform: open ? 'rotate(180deg)' : undefined, color: '#98a2b3' }} />
              </div>
              {open && (
                <div className="d-block-body">
                  <TextInput label="Title" value={c.title || ''} onChange={(title) => update(i, { title })} />
                  <TextArea label="Text" value={c.text || ''} onChange={(text) => update(i, { text })} help={INLINE_HELP} />
                  <TextInput label="Link (optional)" value={c.href || ''} onChange={(href) => update(i, { href })} help="A page on this site such as /general-dentistry-cronulla/ or a full https:// address." />
                  {withImage && <ImageField label="Photo" value={c.image} onChange={(image) => update(i, { image })} help="Leave on the built-in photo unless you want to swap it." />}
                  <details className="d-more">
                    <summary>More options</summary>
                    <div>
                      {withIcon && <TextInput label="Icon name" value={c.icon || ''} onChange={(icon) => update(i, { icon })} help="Set by GYA. Leave as is." />}
                      <Select label="Only show when this feature is switched on" value={c.gate || ''} onChange={(gate) => update(i, { gate: gate || null })} options={GATE_OPTIONS} allowEmpty="Always" />
                      {withFallback && c.gate && (
                        <>
                          <span className="d-label">Shown instead while that feature is off</span>
                          <TextInput label="Title" value={c.fallback?.title || ''} onChange={(title) => update(i, { fallback: { ...(c.fallback || {}), title } })} />
                          <TextArea label="Text" value={c.fallback?.text || ''} onChange={(text) => update(i, { fallback: { ...(c.fallback || {}), text } })} />
                          <TextInput label="Link" value={c.fallback?.href || ''} onChange={(href) => update(i, { fallback: { ...(c.fallback || {}), href } })} />
                        </>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>
          );
        }}
      </SortableList>
      <button type="button" className="d-add" onClick={() => onChange([...items, { id: newId(), title: '', text: '' }])}>
        <Plus width={14} height={14} /> Add {itemLabel.toLowerCase()}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero slides                                                          */
/* ------------------------------------------------------------------ */
export type SlideRow = { id: string; headline: string; sub?: string | null; linkText?: string | null; linkHref?: string | null; gate?: string | null };
export function SlidesEditor({ value, onChange }: { value: SlideRow[]; onChange: (v: SlideRow[]) => void }) {
  const items = (value || []).map(withId);
  const [openId, setOpenId] = useState<string | null>(null);
  const update = (i: number, patch: Partial<SlideRow>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div>
      <SortableList items={items} getId={(r) => r.id} onReorder={onChange}>
        {(s, i) => {
          const open = openId === s.id;
          return (
            <div className="d-block">
              <div className="d-block-head" onClick={() => setOpenId(open ? null : s.id)}>
                <DragHandle />
                <span className="preview" style={{ color: 'inherit', fontWeight: 600 }}>
                  Slide {i + 1}: {s.headline || <em>New slide</em>}
                </span>
                <RemoveButton onClick={() => onChange(items.filter((_, j) => j !== i))} label="Remove slide" />
                <Chev width={16} height={16} style={{ transform: open ? 'rotate(180deg)' : undefined, color: '#98a2b3' }} />
              </div>
              {open && (
                <div className="d-block-body">
                  <TextInput label="Headline" value={s.headline || ''} onChange={(headline) => update(i, { headline })} />
                  <TextArea label="Line under the headline" value={s.sub || ''} onChange={(sub) => update(i, { sub })} help={INLINE_HELP} />
                  <div className="d-row">
                    <TextInput label="Button text (optional)" value={s.linkText || ''} onChange={(linkText) => update(i, { linkText })} />
                    <TextInput label="Button link" value={s.linkHref || ''} onChange={(linkHref) => update(i, { linkHref })} help="A page such as /kids-gap-free-dentistry-cronulla/ or {{cta}} for the booking button." />
                  </div>
                  <details className="d-more">
                    <summary>When to show this slide (advanced)</summary>
                    <div>
                      <Select label="Only show when this feature is switched on" value={s.gate || ''} onChange={(gate) => update(i, { gate: gate || null })} options={GATE_OPTIONS} allowEmpty="Always" />
                    </div>
                  </details>
                </div>
              )}
            </div>
          );
        }}
      </SortableList>
      <button type="button" className="d-add" onClick={() => onChange([...items, { id: newId(), headline: '', sub: '' }])}>
        <Plus width={14} height={14} /> Add slide
      </button>
    </div>
  );
}
