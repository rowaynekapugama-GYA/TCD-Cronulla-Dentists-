import type { Metadata } from 'next';
import { getPage } from '@/lib/content';
import { pageMetadata } from '@/lib/meta';
import type { ContactPage } from '@/content/types';
import { ContactTemplate } from '@/components/templates/ContactTemplate';

const page = getPage<ContactPage>('contact');

export const metadata: Metadata = pageMetadata(page.meta);

export default function Contact() {
  return <ContactTemplate page={page} />;
}
