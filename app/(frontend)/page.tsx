import type { Metadata } from 'next';
import { getPage } from '@/lib/content';
import { pageMetadata } from '@/lib/meta';
import type { HomePage } from '@/content/types';
import { HomeTemplate } from '@/components/templates/HomeTemplate';

const page = getPage<HomePage>('home');

export const metadata: Metadata = pageMetadata(page.meta);

export default function Home() {
  return <HomeTemplate page={page} />;
}
