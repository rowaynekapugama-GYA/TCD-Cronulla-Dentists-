/**
 * Form relay: SMTP2GO API → SmileOx intake address.
 *
 * The SmileOx intake parses leads ONLY from a plain-text email body that is a
 * raw JSON object with camelCase keys (firstName, lastName, email, phoneNumber
 * + any extra fields). So the intake email carries exactly
 * JSON.stringify(payload) and nothing else — no HTML part, no prose. The
 * optional NOTIFY_EMAIL copy is sent as a SEPARATE human-readable email so
 * reception never sees raw JSON.
 *
 * Env vars (see .env.example): SMTP2GO_API_KEY, SMTP2GO_SENDER,
 * SMILEOX_INTAKE_EMAIL, NOTIFY_EMAIL (optional).
 */
export interface RelayResult {
  ok: boolean;
  error?: string;
}

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** "0412 345 678" → "+61412345678" (SmileOx dedupes on email + phone, and its examples use E.164). International input is left alone. */
export function e164(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('61')) return '+' + digits;
  if (digits.startsWith('0')) return '+61' + digits.slice(1);
  return digits;
}

export async function relay(subject: string, lead: Record<string, string>, source: string): Promise<RelayResult> {
  // Trim every value. A key pasted into a hosting dashboard very often picks up
  // a trailing newline, which is invisible on screen and rejected by the API —
  // diagnosed exactly that on 17 Sep 2026, where the key measured 38 characters
  // instead of 36. Trimming here means the same paste cannot break it again.
  const apiKey = process.env.SMTP2GO_API_KEY?.trim();
  const sender = process.env.SMTP2GO_SENDER?.trim() || 'website@thecronulladentists.com.au';
  const intake = process.env.SMILEOX_INTAKE_EMAIL?.trim();

  /**
   * NOTIFY_EMAIL takes one address or several, separated by commas or
   * semicolons, so reception and the agency can both be copied without needing
   * another environment variable each time someone is added:
   *
   *   reception@thecronulladentists.com.au, rowayne@gyaclients.com
   *
   * Whitespace around each address is trimmed, because a list pasted into
   * Vercel almost always arrives with spaces after the commas.
   */
  const notifyList = (process.env.NOTIFY_EMAIL || '')
    .split(/[,;]/)
    .map((a) => a.trim())
    .filter(Boolean);
  const notify = notifyList.length > 0;

  if (!apiKey || !(intake || notify)) {
    // Not configured yet (local dev / preview): log and succeed so the UI can be tested.
    console.warn('[relay] SMTP2GO not configured — submission logged only:', source, lead);
    return { ok: true };
  }

  async function send(body: Record<string, unknown>) {
    let res: Response;
    try {
      res = await fetch('https://api.smtp2go.com/v3/email/send', {
        method: 'POST',
        // A lead must never be answered from a cache.
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      // Network/DNS failure reaching SMTP2GO at all.
      console.error('[relay] could not reach SMTP2GO:', (e as Error).message);
      return { ok: false, error: 'Network error reaching SMTP2GO' };
    }

    const raw = await res.text();
    let json: { data?: { succeeded?: number; failed?: number; failures?: unknown[]; error?: string; error_code?: string } } = {};
    try {
      json = JSON.parse(raw);
    } catch {
      /* non-JSON body: `raw` is logged below as-is */
    }

    // Log the provider's own words. Without this the visitor sees "we could not
    // send" and the function log says nothing, which leaves no way to tell a bad
    // API key from an unverified sender from an account out of credits. The
    // visitor still only ever sees the generic message — the detail is for the
    // log, and the key is never printed.
    if (!res.ok || json.data?.error || json.data?.failures?.length) {
      console.error(
        `[relay] SMTP2GO rejected the send. HTTP ${res.status}.`,
        'error:', json.data?.error ?? '(none)',
        '| error_code:', json.data?.error_code ?? '(none)',
        '| failures:', JSON.stringify(json.data?.failures ?? []),
        '| sender:', sender,
        '| raw:', raw.slice(0, 500),
      );
    }

    if (!res.ok) return { ok: false, error: `SMTP2GO responded ${res.status}` };
    if (json.data?.error) return { ok: false, error: json.data.error };
    if (json.data?.failures?.length) return { ok: false, error: 'Delivery failed' };
    if (json.data?.succeeded === 0) return { ok: false, error: 'SMTP2GO accepted 0 recipients' };
    return { ok: true };
  }

  // 1. The lead → SmileOx. Body is the JSON payload verbatim, per the intake spec.
  let result: RelayResult = { ok: true };
  if (intake) {
    result = await send({
      api_key: apiKey,
      sender,
      to: [intake],
      subject: 'Website form submission',
      text_body: JSON.stringify(lead),
    });
  }

  // 2. Readable copy → everyone on NOTIFY_EMAIL (best effort; a failure here
  //    never fails the submission, because the lead itself has already gone to
  //    SmileOx above and that is the part that matters).
  if (notify) {
    const rows = Object.entries(lead)
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0"><strong>${esc(k)}</strong></td><td style="padding:4px 0">${esc(v)}</td></tr>`)
      .join('');
    const text = Object.entries(lead)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    await send({
      api_key: apiKey,
      sender,
      to: notifyList,
      subject,
      text_body: `${source}\n\n${text}`,
      html_body: `<p>${esc(source)}</p><table>${rows}</table>`,
    }).catch(() => ({ ok: false }));
  }

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
