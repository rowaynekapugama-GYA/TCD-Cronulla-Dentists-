'use client';
import React, { useState } from 'react';
import { MediaPicker, type MediaDoc } from './MediaPicker';
import { mediaSrc, relId } from '../lib/api';
import { TextInput } from './fields';

export type ImageValue = { upload?: MediaDoc | number | string | null; path?: string | null; alt?: string | null } | null | undefined;

/**
 * One photo slot on a page: the built-in photo the site shipped with, or a
 * photo from the media library chosen here. Alt text always editable.
 */
export function ImageField({ label, value, onChange, help, builtInAlt }: { label: string; value: ImageValue; onChange: (v: ImageValue) => void; help?: React.ReactNode; builtInAlt?: string }) {
  const [open, setOpen] = useState(false);
  const v = value || {};
  const up = v.upload && typeof v.upload === 'object' ? (v.upload as MediaDoc) : null;
  const src = up ? mediaSrc(up) : v.path || '';
  const usingLibrary = Boolean(relId(v.upload));
  return (
    <div className="d-field">
      <span className="d-label">{label}</span>
      <div className="d-image">
        <div className="d-image-thumb" style={{ backgroundImage: src ? `url("${src}")` : undefined }} aria-hidden="true" />
        <div className="d-image-info">
          <div className="src">{usingLibrary ? `Library photo: ${up?.alt || up?.filename || ''}` : v.path ? 'Built-in photo (as designed)' : 'No photo chosen'}</div>
          <div className="d-actions" style={{ marginBottom: 10 }}>
            <button type="button" className="d-btn sm" onClick={() => setOpen(true)}>
              Choose from library / Upload
            </button>
            {usingLibrary && v.path && (
              <button type="button" className="d-btn sm ghost" onClick={() => onChange({ ...v, upload: null })}>
                Use the built-in photo
              </button>
            )}
          </div>
          <TextInput label="Alt text" value={v.alt || up?.alt || builtInAlt || ''} onChange={(alt) => onChange({ ...v, alt })} help="What is in the photo, in a few words." />
        </div>
      </div>
      {help && <div className="d-help">{help}</div>}
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onSelect={(m) => {
            onChange({ ...v, upload: m, alt: m.alt || v.alt });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
