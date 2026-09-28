import type { Metadata } from 'next';
import { getPage } from '@/lib/content';
import { pageMetadata } from '@/lib/meta';
import type { ServicesHubPage } from '@/content/types';
import { ServicesTemplate } from '@/components/templates/ServicesTemplate';

const page = getPage<ServicesHubPage>('services');

export const metadata: Metadata = pageMetadata(page.meta);

export default function Services() {
  return <ServicesTemplate page={page} />;
}
