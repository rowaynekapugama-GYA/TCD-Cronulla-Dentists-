'use client';
import React from 'react';
import { useRowLabel } from '@payloadcms/ui';

const trim = (s: unknown, n = 70) => {
  const t = String(s || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
};

/** Array row label for copy blocks: shows the type and the first words. */
export const NodeRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ type?: string; text?: string; items?: { value: string }[]; rowsText?: string }>();
  const n = (rowNumber ?? 0) + 1;
  const kind = { p: 'Paragraph', ul: 'Bullet list', h4: 'Sub-heading', table: 'Table' }[data?.type || 'p'] || 'Block';
  const preview = data?.type === 'ul' ? `${data.items?.length || 0} points` : data?.type === 'table' ? trim(data.rowsText?.split('\n')[0]) : trim(data?.text);
  return (
    <span>
      {n}. <strong>{kind}</strong>
      {preview ? ` – ${preview}` : ''}
    </span>
  );
};

export const SectionRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ heading?: string }>();
  return (
    <span>
      {(rowNumber ?? 0) + 1}. {data?.heading ? <strong>{trim(data.heading)}</strong> : <em>New section</em>}
    </span>
  );
};

export const TitleRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string; headline?: string }>();
  const t = data?.title || data?.headline;
  return (
    <span>
      {(rowNumber ?? 0) + 1}. {t ? <strong>{trim(t)}</strong> : <em>New item</em>}
    </span>
  );
};
