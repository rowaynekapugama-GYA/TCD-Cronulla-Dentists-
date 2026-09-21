import { primaryCta, secondaryCta, bookingOpen } from '@/lib/cta';
import { I } from '@/components/Icons';

/**
 * Fixed bottom bar with Call + Book online, always on screen in the mobile
 * layout (the same ≤1060px breakpoint where the nav collapses to a burger).
 *
 * On a phone the nav pill's CTA shrinks to a single short "Book" and the phone
 * number disappears into the drawer, so without this bar a visitor mid-way down
 * a long service page has to scroll back up, or open the menu, to act. Both
 * actions stay one tap away on every page instead.
 *
 * Renders nothing until bookings are open, so it never offers a booking the
 * practice cannot take. Hidden on desktop entirely via CSS, where the nav
 * already carries both actions.
 */
export default function MobileBar() {
  if (!bookingOpen()) return null;
  const book = primaryCta();
  const call = secondaryCta();
  return (
    <div className="mobile-bar" role="region" aria-label="Book or call">
      {call && (
        <a href={call.href} className="mb-call" aria-label={call.label}>
          <I name="phone" />
          <span>Call</span>
        </a>
      )}
      <a href={book.href} className="mb-book" {...(book.external ? { target: '_blank', rel: 'noopener' } : {})}>
        {book.label}
      </a>
    </div>
  );
}
