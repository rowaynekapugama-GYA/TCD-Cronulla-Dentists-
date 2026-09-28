import { NextResponse, type NextRequest } from 'next/server';

/**
 * Trailing-slash policy. Public pages live at /about/, /contact/ and so on
 * (the URLs Google already has). The dashboard (/admin) and the Payload API
 * (/api/...) must NOT be redirected, so `skipTrailingSlashRedirect` is on in
 * next.config.mjs and the redirect is applied here for public pages only.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  // Payload's "create first user" screen is closed unless GYA is setting up a new site (see cms/collections/Users.ts).
  if (pathname.startsWith('/cms/create-first-user') && process.env.ALLOW_FIRST_USER !== 'true') {
    return new NextResponse('Not found', { status: 404 });
  }
  if (
    pathname === '/' ||
    pathname.endsWith('/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    /\.[a-z0-9]+$/i.test(pathname) // files: sitemap.xml, robots.txt, images
  ) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL(`${pathname}/${search}`, req.url), 308);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
