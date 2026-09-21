import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * RETIRED 21 Sep 2026. This was a temporary diagnostic that sent a real email
 * through SMTP2GO on every load. It found the unverified sender domain and the
 * whitespace on the API key, and both are fixed.
 *
 * It now always returns 404, so it is harmless if left in place. It is kept as a
 * stub only because files are being uploaded through GitHub's web uploader,
 * which cannot delete. Safe to delete this file whenever convenient.
 */
export function GET() {
  return new NextResponse('Not found', { status: 404 });
}
