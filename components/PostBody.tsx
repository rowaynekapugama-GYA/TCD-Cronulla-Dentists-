import { sanitiseHtml } from '@/lib/sanitise';

/**
 * Renders a blog article written in the dashboard editor. The HTML was
 * sanitised when it was pulled from the dashboard and is sanitised again here.
 * Headings, lists, links, quotes and photos pick up the site's `.prose` styles.
 */
export function PostBody({ data }: { data: string }) {
  if (!data) return null;
  return <div dangerouslySetInnerHTML={{ __html: sanitiseHtml(data) }} />;
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Sydney' });
  } catch {
    return '';
  }
}
