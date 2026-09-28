'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, mediaSrc, stripDoc } from '../lib/api';
import { useToast } from '../ui/Toast';
import { Check, Modal, TextArea, TextInput } from '../ui/fields';
import { SortableList, DragHandle } from '../ui/Sortable';
import { MediaPicker, type MediaDoc } from '../ui/MediaPicker';
import { StringListEditor, withId, newId } from './listEditors';
import { toPayload } from './PageEditor';

const EMPTY = { fullName: '', shortName: '', givenName: '', familyName: '', title: 'Dentist', bio: '', hidden: false, credentials: [], knowsAbout: [], alumniOf: '', sameAs: '', ahpra: '', order: 99 };

export function TeamManager({ initial }: { initial: any[] }) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState<any[]>(initial);
  const [edit, setEdit] = useState<any | null>(null);
  const [pick, setPick] = useState(false);
  const [busy, setBusy] = useState(false);

  const reorder = async (next: any[]) => {
    setRows(next);
    try {
      await Promise.all(next.map((t, i) => (t.order === i + 1 ? null : api.patch(`/api/team/${t.id}`, { order: i + 1 }))));
      setRows(next.map((t, i) => ({ ...t, order: i + 1 })));
      toast('Order saved.', 'success');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };
  const toggleHidden = async (t: any) => {
    try {
      const r = await api.patch(`/api/team/${t.id}?depth=1`, { hidden: !t.hidden });
      setRows(rows.map((x) => (x.id === t.id ? r.doc : x)));
      toast(r.doc.hidden ? `${t.fullName} hidden from the website.` : `${t.fullName} shown on the website.`, 'success');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };
  const save = async () => {
    if (!edit.fullName.trim() || !edit.shortName.trim()) return toast('Full name and short name are required.', 'error');
    setBusy(true);
    try {
      const names = edit.fullName.replace(/^Dr\.?\s+/i, '').trim().split(/\s+/);
      const body = toPayload({
        ...stripDoc(edit),
        givenName: edit.givenName || names[0] || edit.fullName,
        familyName: edit.familyName || names.slice(1).join(' ') || edit.fullName,
        credentials: (edit.credentials || []).map(withId),
        knowsAbout: (edit.knowsAbout || []).map(withId),
        key: edit.key || (edit.givenName || names[0] || newId()).toLowerCase(),
      });
      const r = edit.id ? await api.patch(`/api/team/${edit.id}?depth=1`, body) : await api.post(`/api/team?depth=1`, { ...body, order: rows.length + 1 });
      setRows(edit.id ? rows.map((x) => (x.id === edit.id ? r.doc : x)) : [...rows, r.doc]);
      setEdit(null);
      toast('Saved.', 'success');
      router.refresh();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!edit?.id || !window.confirm(`Remove ${edit.fullName} from the team? Use Hide instead if they may return.`)) return;
    setBusy(true);
    try {
      await api.delete(`/api/team/${edit.id}`);
      setRows(rows.filter((x) => x.id !== edit.id));
      setEdit(null);
      toast('Removed.', 'success');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };
  const photo = edit?.photo && typeof edit.photo === 'object' ? (edit.photo as MediaDoc) : null;

  return (
    <>
      <div className="d-card tight">
        <SortableList items={rows} getId={(r) => String(r.id)} onReorder={reorder}>
          {(t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: '1px solid var(--d-line)', opacity: t.hidden ? 0.55 : 1 }}>
              <DragHandle />
              <div style={{ width: 56, height: 56, borderRadius: 12, flex: 'none', background: `#e7edf3 center/cover url("${t.photo && typeof t.photo === 'object' ? mediaSrc(t.photo) : t.photoPath || ''}")` }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{t.fullName}</strong>
                <div className="muted" style={{ fontSize: 13, color: 'var(--d-muted)' }}>
                  {t.title}
                  {t.hidden ? ' · hidden from the website' : ''}
                </div>
              </div>
              <button className="d-btn sm" onClick={() => setEdit({ ...t })}>
                Edit
              </button>
              <button className="d-btn sm ghost" onClick={() => toggleHidden(t)}>
                {t.hidden ? 'Show' : 'Hide'}
              </button>
            </div>
          )}
        </SortableList>
        <div style={{ padding: 14 }}>
          <button className="d-add" onClick={() => setEdit({ ...EMPTY })}>
            + Add a team member
          </button>
        </div>
      </div>

      {edit && (
        <Modal
          title={edit.id ? `Edit ${edit.fullName}` : 'Add a team member'}
          onClose={() => setEdit(null)}
          footer={
            <>
              {edit.id && (
                <button className="d-btn danger" onClick={remove} disabled={busy}>
                  Remove
                </button>
              )}
              <span style={{ flex: 1 }} />
              <button className="d-btn" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button className="d-btn primary" onClick={save} disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        >
          <div className="d-row">
            <TextInput label="Full name with title" value={edit.fullName} onChange={(fullName) => setEdit({ ...edit, fullName })} placeholder="Dr Jane Smith" />
            <TextInput label="Short name" value={edit.shortName} onChange={(shortName) => setEdit({ ...edit, shortName })} placeholder="Dr Jane" help="How the website refers to them in passing." />
          </div>
          <TextInput label="Role" value={edit.title} onChange={(title) => setEdit({ ...edit, title })} placeholder="Principal Dentist" />
          <div className="d-field">
            <span className="d-label">Photo</span>
            <div className="d-image">
              <div className="d-image-thumb" style={{ backgroundImage: `url("${photo ? mediaSrc(photo) : edit.photoPath || ''}")` }} />
              <div className="d-image-info">
                <div className="src">{photo ? photo.alt || photo.filename : edit.photoPath ? 'Built-in photo' : 'No photo yet'}</div>
                <div className="d-actions">
                  <button type="button" className="d-btn sm" onClick={() => setPick(true)}>
                    Choose from library / Upload
                  </button>
                  {photo && edit.photoPath && (
                    <button type="button" className="d-btn sm ghost" onClick={() => setEdit({ ...edit, photo: null })}>
                      Use the built-in photo
                    </button>
                  )}
                </div>
                <div className="d-help">Square photos look best. They are cropped to a square on the About page.</div>
              </div>
            </div>
          </div>
          <TextArea label="Bio" value={edit.bio || ''} onChange={(bio) => setEdit({ ...edit, bio })} rows={7} help="Shown on the About page. Leave a blank line between paragraphs. No claims such as 'expert' or 'best'; qualifications and areas of interest are fine." />
          <div className="d-field">
            <span className="d-label">Qualifications</span>
            <StringListEditor value={(edit.credentials || []).map(withId)} onChange={(credentials) => setEdit({ ...edit, credentials })} itemLabel="Qualification" rows={1} />
            <div className="d-help">Exactly as registered, for example: Bachelor of Dental Surgery, University of Sydney (2009).</div>
          </div>
          <details className="d-more">
            <summary>More details (used in Google's listing)</summary>
            <div>
              <TextInput label="University" value={edit.alumniOf || ''} onChange={(alumniOf) => setEdit({ ...edit, alumniOf })} />
              <div className="d-field">
                <span className="d-label">Areas of practice</span>
                <StringListEditor value={(edit.knowsAbout || []).map(withId)} onChange={(knowsAbout) => setEdit({ ...edit, knowsAbout })} itemLabel="Area" rows={1} />
              </div>
              <TextInput label="LinkedIn or public profile link" value={edit.sameAs || ''} onChange={(sameAs) => setEdit({ ...edit, sameAs })} />
              <TextInput label="AHPRA registration number" value={edit.ahpra || ''} onChange={(ahpra) => setEdit({ ...edit, ahpra })} help="From the AHPRA public register. Optional." />
              <div className="d-row">
                <TextInput label="Given name" value={edit.givenName || ''} onChange={(givenName) => setEdit({ ...edit, givenName })} />
                <TextInput label="Family name" value={edit.familyName || ''} onChange={(familyName) => setEdit({ ...edit, familyName })} />
              </div>
            </div>
          </details>
          <Check label="Hide from the website" checked={Boolean(edit.hidden)} onChange={(hidden) => setEdit({ ...edit, hidden })} help="Keeps the record but removes them from the About page and search listings." />
          {pick && (
            <MediaPicker
              onClose={() => setPick(false)}
              onSelect={(m) => {
                setEdit({ ...edit, photo: m });
                setPick(false);
              }}
            />
          )}
        </Modal>
      )}
    </>
  );
}
