# Changelog: The Cronulla Dentists website

## 2.2.0 – 28 September 2026: visual page editor (Coastal / Footscray style)

- Pages > a page now opens a visual editor like the Coastal Dental and Footscray dashboards: top bar
  (Pages, page name, Desktop / Mobile, save state, View, Publish website, Save changes), the real page
  on the left, and Content / SEO / Sections tabs on the right. Rowayne's feedback, 28 Sep 2026.
- Click any wording on the page and type over it. Wording the design reshapes (capitals, a coloured
  word, the bold lead-in cards in service pages) is selected on click and edited in the side panel.
  Click a photo to swap it (library or upload) and edit its alt text. Links and forms do nothing while
  editing.
- Side-panel edits show on the page straight away; structural changes (adding, removing or reordering
  sections, new photos) re-render the page in the background with the unsaved draft and swap it in at
  the same scroll position.
- Sections tab: the page top to bottom, click to jump; the page's own section list (service "In detail"
  sections, information page sections) can be dragged, added and removed; page settings live here.
- New logged-in route /edit-preview/<id>/ renders the page from the dashboard (saved, or the draft with
  ?draft=1 stored as the user's Payload preference). 404 for anyone not signed in, noindex, disallowed in
  robots.txt, GA4 and Meta Pixel switched off on it. components/EditorBridge.tsx loads only there.
- Home, Services and Contact templates moved to components/templates/ so a draft can be rendered. Home
  headings (page heading, welcome heading, payment band and note headings) now read from their dashboard
  fields instead of fixed text, so editing them changes the site. Rendered HTML of all 30 public pages
  is unchanged (compared file by file, from files and from a freshly imported database).
- Choosing a new library photo for a slot now takes that photo's alt text.

## 2.1.2 – 28 September 2026: Book online asks which location

- Clicking any Book online button or link (nav, mobile bar, CTA bands, links in the copy) now opens a
  "Select your location" pop-up: The Cronulla Dentists or The Caringbah Dentists, each opening its own
  Core Practice booking page in a new tab. Client request, 28 Sep 2026.
- Caringbah link: https://www.corepractice.is/practices/tcd/the-caringbah-dentists (same Core Practice
  account as Cronulla). Confirm with the practice.
- Buttons are unchanged underneath (they still point at the Cronulla booking page), so without JavaScript,
  or with the pop-up switched off, Book online goes straight to Cronulla as before. Ctrl/Cmd-click skips it.
- The pop-up is only rendered after a click, so the Caringbah address is not part of any page's visible
  HTML (no local-search confusion) and no Caringbah phone number is shown. Rendered HTML of all 31 pages
  is unchanged.
- Dashboard: Site Settings > Booking and payment has an on/off switch and the list of locations (name,
  address, booking link, note), drag to reorder. Migration 20260928_booking_locations.
- GA4 events book_online_click and book_online_location (with the practice chosen).

## 2.1.1 – 28 September 2026: preview fix and terminal deploy script

- Payload no longer uses the live domain as its server URL on Vercel previews (VERCEL_ENV=preview), so
  /cms first-account setup, sign-in and Import work on the `cms` preview even with NEXT_PUBLIC_SERVER_URL
  set to the live domain. Production is unchanged.
- scripts/push-to-github.sh: stage (zip to the `cms` branch, shows removed files, asks first), promote
  (fast-forward `main` to the tested `cms` commit, refuses if `main` moved), rollback, status.

## 2.1.0 – 28 September 2026: WordPress-style client dashboard

- New dashboard at /admin built for the practice (app/(dashboard) + dashboard/), matching the Coastal
  Dental standard: navy sidebar with Dashboard, Pages, Blog Posts, Media Library, Team, Enquiries, SEO,
  Site Settings, and Redirects + Users for GYA admins; top bar with View site and the signed-in user.
- Dashboard home: welcome, changes-waiting notice with Publish website, quick actions, latest enquiries,
  recently edited pages. Import / Reset from files for admins.
- Pages: each page opens as numbered, collapsed sections in page order; drag-to-reorder for detail
  sections, paragraphs, tiles, cards and slides; every photo slot has Choose from library / Upload plus
  alt text; SEO tab with character counters, Google-style snippet, share image, canonical and noindex;
  View page link.
- Blog Posts: TipTap editor (headings, lists, links, quotes, inline photos), featured image, categories,
  author, date, slug, per-post SEO and share image, draft / publish / unpublish / delete, AHPRA reminder.
  Article bodies are now sanitised HTML (allow-list) instead of Lexical JSON.
- Media Library: grid, multi-upload, edit alt text, replace a photo everywhere it is used, delete.
- Team: reorder, hide, add, edit (photo, bio, qualifications, AHPRA number). Bios seeded from the About
  page copy; the About page team cards now render from Team.
- Enquiries: list with filters, detail with notes and Followed up, CSV export (/api/enquiries-export.csv).
- SEO overview of every page with Good / Short / Too long flags; site-wide defaults.
- Site Settings in one place with tabs; Brand tab adds logo and two colour overrides; tracking IDs are
  admin-only at field level.
- Payload's own admin moved from /admin to /cms (GYA admins only).
- Migration 20260928_dashboard_fields: posts.body -> text, pages.canonical, team.bio + hidden,
  site_settings.colours, posts.og_image.
- Verified: HTML of all 31 pages identical between the file-based build and the database build, and
  identical to 2.0 (ignoring bundle chunk tags); pixel diffs at the noise floor on six pages at 1280 and 390.

## 2.0.0 – 25 September 2026: client dashboard

- Client dashboard added at /admin (Payload CMS 3.90, Neon Postgres, Vercel Blob). See README-CMS.md.
- Editable from the dashboard: every page's wording, photos and alt text, per-page SEO (title, description,
  share image, noindex), site settings (details, hours, booking link, feature switches, tracking IDs),
  team, blog articles, redirects. Drag-and-drop reordering of sections and copy blocks.
- Enquiries collection: every contact/EOI form submission is stored as well as emailed.
- Blog: /blog/ index and /blog/<slug>/ articles in the site's design, appearing only once an article is
  published (footer link and sitemap entries included).
- Publish flow: Save in the dashboard, then "Publish website" triggers a Vercel rebuild (PUBLISH_HOOK_URL).
  The build pulls dashboard content into /content before building, so the public site stays static.
- Next.js 14 -> 15.4.11, React 18 -> 19. Public routes moved into app/(frontend); Payload routes in
  app/(payload). Trailing-slash redirect handled in middleware.ts so /admin and /api are unaffected.
- Meta Pixel slot added to site settings (loads only when an ID is set). robots.txt now disallows /admin/.
- Custom 404 page now covers deep paths too.
- No change to the rendered public pages: body HTML, meta tags and JSON-LD verified identical to 1.x.

## 1.x – August to September 2026

- 24 Sep: SEO brief v1.1: image alt text sitewide and Person schema on /about/.
- 22 Sep: Tuesday hours 8am to 5pm.
- 21 Sep: online booking (Core Practice) replaces expression of interest; sticky mobile Book/Call bar;
  no-gap kids hero slide; image swaps; desktop menu fix; contact form verified.
- 17 Sep: GA4 inlined; fresh private repo; SMTP2GO relay hardening.
- Aug: full 29-page site build from the client copy doc.
