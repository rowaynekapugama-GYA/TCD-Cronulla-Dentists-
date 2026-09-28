'use client';
import React, { useMemo, useState } from 'react';
import { api, mediaSrc, relId } from '../lib/api';
import { useToast } from '../ui/Toast';
import { Check, Select, TextArea, TextInput, HelpBox } from '../ui/fields';
import { MediaPicker, type MediaDoc } from '../ui/MediaPicker';
import { StringListEditor, withId, newId } from './listEditors';
import { SortableList, DragHandle } from '../ui/Sortable';
import { toPayload } from './PageEditor';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TABS = ['Practice', 'Opening hours', 'Booking and payment', 'Features', 'Brand', 'Tracking and links'] as const;

/** "08:00" -> "8:00am" for the label the site prints. */
const label12 = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t || '');
  if (!m) return '';
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]}${h < 12 ? 'am' : 'pm'}`;
};

export function SettingsForm({ initial, isAdmin }: { initial: any; isAdmin: boolean }) {
  const toast = useToast();
  const [doc, setDoc] = useState<any>(() => {
    const d = { ...initial };
    // Always seven rows, Monday to Sunday.
    const byDay = new Map((d.hours || []).map((h: any) => [h.day, h]));
    d.hours = DAYS.map((day) => byDay.get(day) || { day, closed: true });
    d.features = d.features || {};
    d.address = d.address || {};
    d.hooks = d.hooks || {};
    d.sameAs = d.sameAs || {};
    d.sister = d.sister || {};
    d.colours = d.colours || {};
    d.geo = d.geo || {};
    return d;
  });
  const [saved, setSaved] = useState(doc);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Practice');
  const [pick, setPick] = useState(false);
  const [busy, setBusy] = useState(false);
  const dirty = useMemo(() => JSON.stringify(doc) !== JSON.stringify(saved), [doc, saved]);
  const up = (patch: Record<string, unknown>) => setDoc({ ...doc, ...patch });
  const upIn = (group: string, patch: Record<string, unknown>) => setDoc({ ...doc, [group]: { ...(doc[group] || {}), ...patch } });
  const logo = doc.logo && typeof doc.logo === 'object' ? (doc.logo as MediaDoc) : null;
  const visibleTabs = TABS.filter((t) => t !== 'Tracking and links' || isAdmin);

  const save = async () => {
    setBusy(true);
    try {
      const { id, createdAt, updatedAt, globalType, ...rest } = doc;
      const body = toPayload({
        ...rest,
        hours: doc.hours.map((h: any) => (h.closed ? { day: h.day, closed: true } : { day: h.day, closed: false, open: h.open, close: h.close, label: h.label || `${label12(h.open)} to ${label12(h.close)}` })),
        payment: (doc.payment || []).map(withId),
        parkingNotes: (doc.parkingNotes || []).map(withId),
        bookingLocations: (doc.bookingLocations || []).map(withId),
      });
      const r = await api.post('/api/globals/site-settings?depth=1', body);
      const next = { ...doc, ...(r.result || {}), hours: doc.hours };
      setDoc(next);
      setSaved(next);
      toast('Settings saved. Publish website to update the live site.', 'success');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="d-save-bar">
        <span className={`state ${dirty ? 'dirty' : ''}`}>{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
        <div className="d-topbar-spacer" />
        <button className="d-btn primary" onClick={save} disabled={busy || !dirty}>
          {busy ? 'Saving…' : 'Save settings'}
        </button>
      </div>
      <div className="d-tabs">
        {visibleTabs.map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="d-card" style={{ maxWidth: 860 }}>
        {tab === 'Practice' && (
          <>
            <TextInput label="Practice name" value={doc.name || ''} onChange={(name) => up({ name })} />
            <div className="d-row">
              <TextInput label="Phone (as shown on the site)" value={doc.phone || ''} onChange={(phone) => up({ phone })} placeholder="(02) 8599 9815" />
              <TextInput label="Phone for tap-to-call" value={doc.phoneE164 || ''} onChange={(phoneE164) => up({ phoneE164 })} placeholder="+61285999815" help="International format, no spaces." />
            </div>
            <TextInput label="Public email address" value={doc.email || ''} onChange={(email) => up({ email })} type="email" />
            <TextInput label="Street address" value={doc.address.street || ''} onChange={(street) => upIn('address', { street })} />
            <div className="d-row-3">
              <TextInput label="Suburb" value={doc.address.suburb || ''} onChange={(suburb) => upIn('address', { suburb })} />
              <TextInput label="State" value={doc.address.state || ''} onChange={(state) => upIn('address', { state })} />
              <TextInput label="Postcode" value={doc.address.postcode || ''} onChange={(postcode) => upIn('address', { postcode })} />
            </div>
            <TextInput label="Google Business Profile link" value={doc.gbpShareUrl || ''} onChange={(gbpShareUrl) => up({ gbpShareUrl })} help="The share link from your Google Business Profile. Used for the map link in the footer." />
          </>
        )}

        {tab === 'Opening hours' && (
          <>
            <HelpBox>Tick Closed for days the practice is shut. Times are 24-hour (08:00, 17:00); the wording shown on the site is filled in for you but can be changed.</HelpBox>
            {doc.hours.map((h: any, i: number) => (
              <div key={h.day} style={{ display: 'grid', gridTemplateColumns: '120px 90px 1fr 1fr 1.4fr', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <strong>{h.day}</strong>
                <label className="d-check" style={{ marginBottom: 0 }}>
                  <input type="checkbox" checked={Boolean(h.closed)} onChange={(e) => up({ hours: doc.hours.map((x: any, j: number) => (j === i ? { ...x, closed: e.target.checked } : x)) })} />
                  <span>Closed</span>
                </label>
                <input className="d-input" placeholder="Opens 08:00" disabled={h.closed} value={h.closed ? '' : h.open || ''} onChange={(e) => up({ hours: doc.hours.map((x: any, j: number) => (j === i ? { ...x, open: e.target.value, label: `${label12(e.target.value)} to ${label12(x.close)}` } : x)) })} aria-label={`${h.day} opens`} />
                <input className="d-input" placeholder="Closes 17:00" disabled={h.closed} value={h.closed ? '' : h.close || ''} onChange={(e) => up({ hours: doc.hours.map((x: any, j: number) => (j === i ? { ...x, close: e.target.value, label: `${label12(x.open)} to ${label12(e.target.value)}` } : x)) })} aria-label={`${h.day} closes`} />
                <input className="d-input" placeholder="As shown, e.g. 8:00am to 5:00pm" disabled={h.closed} value={h.closed ? 'Closed' : h.label || ''} onChange={(e) => up({ hours: doc.hours.map((x: any, j: number) => (j === i ? { ...x, label: e.target.value } : x)) })} aria-label={`${h.day} wording`} />
              </div>
            ))}
            <div className="d-row" style={{ marginTop: 18 }}>
              <TextInput label="Late night call-out" value={doc.hooks.lateMonday || ''} onChange={(lateMonday) => upIn('hooks', { lateMonday })} placeholder="Open until 7pm Mondays" />
              <TextInput label="Early morning call-out" value={doc.hooks.earlyFriday || ''} onChange={(earlyFriday) => upIn('hooks', { earlyFriday })} placeholder="Early appointments from 7am Fridays" />
            </div>
          </>
        )}

        {tab === 'Booking and payment' && (
          <>
            <Select
              label="Practice status"
              value={doc.mode || 'pre-opening'}
              onChange={(mode) => up({ mode })}
              options={[
                { label: 'Before opening (opening date shown, Book online available)', value: 'pre-opening' },
                { label: 'Open (now taking patients)', value: 'open' },
              ]}
              help="Switch to Open on opening day. It changes the wording across the site."
            />
            {doc.mode !== 'open' && (
              <div className="d-row">
                <TextInput label="Opening wording" value={doc.openingDateLabel || ''} onChange={(openingDateLabel) => up({ openingDateLabel })} placeholder="late November 2026" help="For example: late November 2026, or 16 November 2026." />
                <TextInput label="Opening month or date" value={doc.openingDate || ''} onChange={(openingDate) => up({ openingDate })} placeholder="2026-11" help="YYYY-MM or YYYY-MM-DD. Used in Google's listing." />
              </div>
            )}
            <TextInput label="Online booking link (Cronulla)" value={doc.bookingUrl || ''} onChange={(bookingUrl) => up({ bookingUrl })} help="The Cronulla booking page. Every Book online button uses this." />
            <Check
              label="Ask which location when someone clicks Book online"
              checked={doc.bookingChooser !== false}
              onChange={(bookingChooser) => up({ bookingChooser })}
              help="Shows a pop-up with the practices below. Untick to send Book online straight to the Cronulla booking page."
            />
            {doc.bookingChooser !== false && (
              <div className="d-field">
                <span className="d-label">Booking locations (in the pop-up, in this order)</span>
                <LocationsEditor value={doc.bookingLocations || []} onChange={(bookingLocations) => up({ bookingLocations })} />
              </div>
            )}
            <div className="d-field">
              <span className="d-label">Health funds and payment lines</span>
              <StringListEditor value={(doc.payment || []).map(withId)} onChange={(payment) => up({ payment })} itemLabel="Line" rows={1} />
              <div className="d-help">Shown on the home page and the finances pages, for example: nib preferred provider.</div>
            </div>
          </>
        )}

        {tab === 'Features' && (
          <>
            <HelpBox>Each switch shows or hides everything about that feature across the site: pages, sections, menu links and individual lines. Please check with GYA before switching one on.</HelpBox>
            <Check label="Kids no-gap (CDBS) offer and page" checked={Boolean(doc.features.cdbs)} onChange={(cdbs) => upIn('features', { cdbs })} help="Bulk-billed check-up and clean for eligible children under the Child Dental Benefits Schedule." />
            <Check label="Emergency dentistry page and wording" checked={Boolean(doc.features.emergency)} onChange={(emergency) => upIn('features', { emergency })} help="Only once the practice offers emergency appointments." />
            <Check label="Zip and Afterpay sections" checked={Boolean(doc.features.zipAfterpay)} onChange={(zipAfterpay) => upIn('features', { zipAfterpay })} />
            <Check label="Show dentist names in search listings" checked={doc.teamNamesConfirmed !== false} onChange={(teamNamesConfirmed) => up({ teamNamesConfirmed })} />
            <div className="d-field">
              <span className="d-label">Parking notes (parking page)</span>
              <StringListEditor value={(doc.parkingNotes || []).map(withId)} onChange={(parkingNotes) => up({ parkingNotes })} itemLabel="Note" rows={1} />
            </div>
            <TextInput label="Privacy policy last updated" value={doc.privacyLastUpdated || ''} onChange={(privacyLastUpdated) => up({ privacyLastUpdated })} placeholder="1 November 2026" help="Leave empty to hide the line." />
          </>
        )}

        {tab === 'Brand' && (
          <>
            <div className="d-field">
              <span className="d-label">Logo</span>
              <div className="d-image">
                <div className="d-image-thumb" style={{ backgroundImage: logo ? `url("${mediaSrc(logo)}")` : 'url(/images/logo-primary.jpg)', backgroundSize: 'contain', backgroundColor: '#fff' }} />
                <div className="d-image-info">
                  <div className="src">{logo ? `Library file: ${logo.filename}` : 'Logo built into the site'}</div>
                  <div className="d-actions">
                    <button type="button" className="d-btn sm" onClick={() => setPick(true)}>
                      Choose from library / Upload
                    </button>
                    {relId(doc.logo) && (
                      <button type="button" className="d-btn sm ghost" onClick={() => up({ logo: null })}>
                        Use the built-in logo
                      </button>
                    )}
                  </div>
                  <div className="d-help">Wide format (about 3.5 to 1) on a white or transparent background.</div>
                </div>
              </div>
            </div>
            <div className="d-row">
              <TextInput label="Main colour (navy)" value={doc.colours.navy || ''} onChange={(navy) => upIn('colours', { navy })} placeholder="#0E3566" help="Leave empty to keep the designed colour." />
              <TextInput label="Accent colour (cyan)" value={doc.colours.cyan || ''} onChange={(cyan) => upIn('colours', { cyan })} placeholder="#26B8DB" help="Leave empty to keep the designed colour." />
            </div>
            <div className="d-row">
              <TextInput label="Facebook page URL" value={doc.sameAs.facebook || ''} onChange={(facebook) => upIn('sameAs', { facebook })} />
              <TextInput label="Instagram URL" value={doc.sameAs.instagram || ''} onChange={(instagram) => upIn('sameAs', { instagram })} />
            </div>
          </>
        )}

        {tab === 'Tracking and links' && isAdmin && (
          <>
            <HelpBox>GYA only. These IDs load the tracking scripts on every page.</HelpBox>
            <TextInput label="Google Analytics 4 measurement ID" value={doc.ga4Id || ''} onChange={(ga4Id) => up({ ga4Id })} placeholder="G-XXXXXXXXXX" />
            <TextInput label="Google Tag Manager container ID" value={doc.gtmId || ''} onChange={(gtmId) => up({ gtmId })} placeholder="GTM-XXXXXXX" help="Leave blank unless a container is set up." />
            <TextInput label="Meta Pixel ID" value={doc.metaPixelId || ''} onChange={(metaPixelId) => up({ metaPixelId })} help="Numbers only. Leave blank to not load the pixel." />
            <h2 style={{ marginTop: 20 }}>Sister practice</h2>
            <div className="d-row">
              <TextInput label="Name" value={doc.sister.name || ''} onChange={(name) => upIn('sister', { name })} />
              <TextInput label="Website" value={doc.sister.url || ''} onChange={(url) => upIn('sister', { url })} />
            </div>
            <TextInput label="Heritage line" value={doc.sister.heritage || ''} onChange={(heritage) => upIn('sister', { heritage })} placeholder="50 years in the Shire" />
            <div className="d-row">
              <TextInput label="Map latitude" value={doc.geo.lat ?? ''} onChange={(lat) => upIn('geo', { lat: lat === '' ? null : Number(lat) })} />
              <TextInput label="Map longitude" value={doc.geo.lng ?? ''} onChange={(lng) => upIn('geo', { lng: lng === '' ? null : Number(lng) })} />
            </div>
          </>
        )}
      </div>
      {pick && (
        <MediaPicker
          onClose={() => setPick(false)}
          onSelect={(m) => {
            up({ logo: m });
            setPick(false);
          }}
        />
      )}
    </>
  );
}

type Loc = { id?: string; name: string; address?: string; url?: string; note?: string };

/** The practices offered in the Book online pop-up. */
function LocationsEditor({ value, onChange }: { value: Loc[]; onChange: (v: Loc[]) => void }) {
  const items = value.map(withId);
  const set = (i: number, patch: Partial<Loc>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div>
      <SortableList items={items} getId={(r) => r.id} onReorder={onChange}>
        {(l, i) => (
          <div className="d-block">
            <div className="d-block-head">
              <DragHandle />
              <span className="preview" style={{ color: 'inherit', fontWeight: 600 }}>
                {l.name || 'New location'}
              </span>
              <button type="button" className="d-btn ghost sm" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
            <div className="d-block-body">
              <div className="d-row">
                <TextInput label="Practice name" value={l.name || ''} onChange={(name) => set(i, { name })} />
                <TextInput label="Address line" value={l.address || ''} onChange={(address) => set(i, { address })} placeholder="13 Cronulla Street, Cronulla" />
              </div>
              <TextInput
                label="Booking link"
                value={l.url || ''}
                onChange={(url) => set(i, { url })}
                help={i === 0 ? 'Leave empty to use the online booking link above.' : 'The online booking page for this practice.'}
              />
              <TextInput label="Short note (optional)" value={l.note || ''} onChange={(note) => set(i, { note })} help={i === 0 ? 'Leave empty to show the opening date while the practice is not open yet.' : 'For example: 50 years in the Shire'} />
            </div>
          </div>
        )}
      </SortableList>
      <button type="button" className="d-add" onClick={() => onChange([...items, { id: newId(), name: '', address: '', url: '', note: '' }])}>
        + Add a location
      </button>
    </div>
  );
}
