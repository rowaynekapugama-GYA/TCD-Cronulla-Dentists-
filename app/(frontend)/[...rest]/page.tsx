import { notFound } from 'next/navigation';

/**
 * Catch-all for paths deeper than one segment (/a/b/). Nothing lives there;
 * calling notFound() here renders the site's own 404 page inside the public
 * layout instead of Next's bare default, which is what a URL outside every
 * route group would otherwise get now that /admin has its own root layout.
 */
export default function CatchAll() {
  notFound();
}
