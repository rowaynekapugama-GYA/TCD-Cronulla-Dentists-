import type { EditorLayout, FieldDef, SectionDef } from '../pageSchema';

/**
 * Every editable piece of wording and every photo slot on a page, flattened
 * with a dotted path (array rows by index) so the preview and the side panel
 * can point at the same thing.
 */
export type FieldRef = {
  path: string;
  label: string;
  section: string; // SectionDef.key, or `arr-<row id>` for a row of the page's sections
  sectionLabel: string;
  kind: 'text' | 'image';
  multiline: boolean;
  value: string; // text: the wording as saved; image: the effective file
  builtInAlt?: string;
};

export const getIn = (o: any, path: string): any => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);

export function setIn(o: any, path: string, v: unknown): any {
  const [k, ...rest] = path.split('.');
  const key: string | number = Array.isArray(o) ? Number(k) : k;
  const cur = o == null ? (/^\d+$/.test(k) ? [] : {}) : o;
  const next = rest.length ? setIn(cur[key as any], rest.join('.'), v) : v;
  if (Array.isArray(cur)) {
    const copy = cur.slice();
    copy[key as number] = next;
    return copy;
  }
  return { ...cur, [key]: next };
}

const mediaUrl = (m: any): string => {
  if (!m || typeof m !== 'object' || !m.url) return '';
  const raw = String(m.url);
  if (/^https?:\/\//i.test(raw) && !raw.includes('/api/media/')) return raw;
  try {
    return new URL(raw, 'http://x.invalid').pathname.replace(/\/+$/, '');
  } catch {
    return raw;
  }
};

/** The file a photo slot currently shows (library upload first, then the built-in photo). */
export const slotSrc = (v: any): string => (v ? mediaUrl(v.upload) || v.path || '' : '');

const NODE_LABEL: Record<string, string> = { p: 'Paragraph', h4: 'Sub-heading', ul: 'Bullet point' };

export function collectFields(doc: any, layout: EditorLayout): FieldRef[] {
  const out: FieldRef[] = [];
  const text = (path: string, label: string, sec: { key: string; label: string }, multiline = true) => {
    const v = getIn(doc, path);
    if (typeof v === 'string') out.push({ path, label, section: sec.key, sectionLabel: sec.label, kind: 'text', multiline, value: v });
  };
  const nodes = (path: string, sec: { key: string; label: string }, prefix = '') => {
    const list: any[] = getIn(doc, path) || [];
    const count: Record<string, number> = {};
    list.forEach((n, i) => {
      const kind = n?.type;
      if (kind === 'p' || kind === 'h4') {
        count[kind] = (count[kind] || 0) + 1;
        text(`${path}.${i}.text`, `${prefix}${NODE_LABEL[kind]} ${count[kind]}`, sec, kind === 'p');
      } else if (kind === 'ul') {
        (n.items || []).forEach((_: unknown, j: number) => text(`${path}.${i}.items.${j}.value`, `${prefix}Bullet point ${j + 1}`, sec));
      }
    });
  };
  const walk = (fields: FieldDef[], base: string, sec: SectionDef) => {
    for (const f of fields) {
      if (f.type === 'group') {
        walk(f.fields, base ? `${base}.${f.name}` : f.name, sec);
        continue;
      }
      const path = base ? `${base}.${f.name}` : f.name;
      switch (f.type) {
        case 'text':
          text(path, f.label, sec, false);
          break;
        case 'textarea':
          text(path, f.label, sec, true);
          break;
        case 'image':
          out.push({ path, label: f.label, section: sec.key, sectionLabel: sec.label, kind: 'image', multiline: false, value: slotSrc(getIn(doc, path)), builtInAlt: f.builtInAlt });
          break;
        case 'nodes':
          nodes(path, sec);
          break;
        case 'stringList':
          (getIn(doc, path) || []).forEach((_: unknown, i: number) => text(`${path}.${i}.value`, `${f.itemLabel} ${i + 1}`, sec));
          break;
        case 'cards':
          (getIn(doc, path) || []).forEach((c: any, i: number) => {
            const name = c?.title ? `“${String(c.title).slice(0, 40)}”` : `${f.itemLabel || 'Card'} ${i + 1}`;
            text(`${path}.${i}.title`, `${name}: title`, sec, false);
            text(`${path}.${i}.text`, `${name}: text`, sec);
            if (c?.fallback) {
              text(`${path}.${i}.fallback.title`, `${name}: title while the feature is off`, sec, false);
              text(`${path}.${i}.fallback.text`, `${name}: text while the feature is off`, sec);
            }
            if (f.withImage) out.push({ path: `${path}.${i}.image`, label: `${name}: photo`, section: sec.key, sectionLabel: sec.label, kind: 'image', multiline: false, value: slotSrc(c?.image) });
          });
          break;
        case 'slides':
          (getIn(doc, path) || []).forEach((_: unknown, i: number) => {
            text(`${path}.${i}.headline`, `Slide ${i + 1}: headline`, sec, false);
            text(`${path}.${i}.sub`, `Slide ${i + 1}: line under the headline`, sec);
            text(`${path}.${i}.linkText`, `Slide ${i + 1}: link text`, sec, false);
          });
          break;
      }
    }
  };
  for (const s of layout.before) walk(s.fields, '', s);
  if (layout.array) {
    const rows: any[] = getIn(doc, layout.array.name) || [];
    rows.forEach((r, i) => {
      const sec = { key: `arr-${r?.id ?? i}`, label: r?.heading || `Section ${i + 1}` };
      text(`${layout.array!.name}.${i}.heading`, 'Section heading', sec, false);
      nodes(`${layout.array!.name}.${i}.nodes`, sec);
    });
  }
  for (const s of layout.after) walk(s.fields, '', s);
  return out;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The wording as a visitor reads it (what the preview is searched for). */
export function plainText(src: string, cfg: { phone: string; email: string }): string {
  return String(src || '')
    .replace(/\*\*/g, '')
    .replace(/\{\{phone\}\}/g, cfg.phone)
    .replace(/\{\{email\}\}/g, cfg.email)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

/** The same markup components/Inline.tsx produces, for instant updates in the preview. */
export function inlineHtml(src: string, cfg: { phone: string; email: string; tel: string }): string {
  const re = /(\*\*[^*]+\*\*|\{\{phone\}\}|\{\{email\}\}|\[[^\]]+\]\([^)]+\))/g;
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  const s = String(src || '');
  while ((m = re.exec(s))) {
    out += esc(s.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) out += `<strong>${inlineHtml(tok.slice(2, -2), cfg)}</strong>`;
    else if (tok === '{{phone}}') out += `<a href="${esc(cfg.tel)}">${esc(cfg.phone)}</a>`;
    else if (tok === '{{email}}') out += `<a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a>`;
    else {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!;
      out += `<a href="${esc(lm[2])}">${esc(lm[1])}</a>`;
    }
    last = m.index + tok.length;
  }
  return out + esc(s.slice(last));
}
