import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'The Cronulla Dentists dashboard',
  robots: { index: false, follow: false },
};

/** Root layout for the practice's dashboard at /admin. Separate from the public site and from Payload's own admin at /cms. */
export default function DashboardRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
