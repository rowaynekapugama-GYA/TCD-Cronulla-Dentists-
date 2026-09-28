import { NextResponse } from 'next/server';
import { relay, isEmail, e164 } from '@/lib/relay';
import { logEnquiry } from '@/lib/enquiries';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (body.website) return NextResponse.json({ ok: true });

  const first_name = (body.first_name || '').trim();
  const last_name = (body.last_name || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim();
  const interest = (body.interest || '').trim();
  if (!first_name || !last_name || !isEmail(email) || !phone || !interest || body.consent !== 'yes') {
    return NextResponse.json({ error: 'Please complete all fields.' }, { status: 400 });
  }

  // Field names follow the SmileOx intake schema (camelCase, phoneNumber in E.164).
  const lead = { firstName: first_name, lastName: last_name, email, phoneNumber: e164(phone), interest, consent: 'yes', source: 'thecronulladentists.com.au /register' };
  const result = await relay(`New EOI: ${first_name} ${last_name}`, lead, 'Founding patient expression of interest — The Cronulla Dentists website');
  await logEnquiry({
    form: 'eoi',
    name: `${first_name} ${last_name}`,
    email,
    phone,
    message: interest,
    source: lead.source,
    raw: lead,
    emailStatus: result.ok ? (process.env.SMTP2GO_API_KEY ? 'sent' : 'skipped') : 'failed',
    emailError: result.error,
  });
  if (!result.ok) return NextResponse.json({ error: 'We could not send your registration. Please try again or email us.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
