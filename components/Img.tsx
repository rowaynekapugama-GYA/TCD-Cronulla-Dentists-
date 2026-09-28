import NextImage, { type ImageProps } from 'next/image';
import { img } from '@/lib/img';

/**
 * Drop-in replacement for next/image that content-hashes the source path.
 * See lib/img.ts for why. Import this instead of 'next/image' everywhere, so a
 * swapped photo can never be served from a stale CDN entry.
 *
 * Photos uploaded through the dashboard arrive as Vercel Blob URLs (or
 * /api/media/... locally). Those are already resized and converted to WebP on
 * upload, so they bypass the image optimiser rather than count against the
 * account-wide optimisation cap.
 */
export default function Img(props: ImageProps) {
  const raw = typeof props.src === 'string' ? props.src : null;
  const src = raw ? img(raw) : props.src;
  const external = Boolean(raw && !raw.startsWith('/images/'));
  return <NextImage {...props} src={src} unoptimized={props.unoptimized ?? external} />;
}
