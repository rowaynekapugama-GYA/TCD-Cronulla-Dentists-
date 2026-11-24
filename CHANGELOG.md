# Changelog: The Cronulla Dentists website

## 2.7.0 – 24 Nov 2026: the APE page identical to the APE website

An update to the existing repo. Dr Lorna Gladwin (23 Nov) asked for the APE page here to match the APE
website; Rowayne's instruction (24 Nov): identical. Built from the APE source pack of 24 Nov 2026
(APE website v1.14.0), which is now the source of truth for this page.

- /dental-anxiety/: between this site's header and footer there are only the 16 sections of the APE
  home page, in the APE order, with the APE wording (content/ape.json is the pack's ape-page.json,
  unchanged), the pack's photos at the APE crops and sizes (800, 1400 and 2400 px), the APE styles
  re-ported from the pack's stylesheet (app/ape.css) and the same elements, classes, scroll reveals,
  "Read more" and FAQ viewer as the APE page (components/ape/ApeTemplate.tsx, ApeBehaviour.tsx).
- New on the page: Alex Loupos and Lauren Bright in Meet the team, as on the APE website (switch
  "Show Alex and Lauren on the APE page" in Site Settings > APE promotion, on); "Read more" on the
  three bios; the FAQ question list with one open answer, arrows and the "1 / 11" counter; and
  section 16, the APE website's footer details and disclaimer (id="ape-contact"), where both "Reach out
  to Alex" buttons now land (they went to /contact/).
- Removed from the page: the breadcrumb line, the location line under the closing Book Now (the same
  details are in section 16), the separate disclaimer strip and the hidden "Back to all services" link.
  The practice's own dental anxiety copy stays in the dashboard, switched off for this page
  (site.config.ts `ape.practiceCopy: false`).
- The five differences from the APE website, all on purpose: this site's header and footer; the page's
  own URL, title, description and H1 ("Dental Anxiety in Cronulla", one small line above the hero's
  small heading, with the hero question as an h2 in the APE h1 look); Book Now to the APE booking page
  with utm_content=ape-page in a new tab; "Reach out to Alex" to #ape-contact and "Discover the
  Experience" to #intro; no "Opening special" ribbon, FAQ note or pop-up.
- Elsewhere: the About menu APE card and the page photo use the pack's armchair files; the Book online
  pop-up shows the real rounded APE logo (was a stand-in); the share image alt text is the armchair
  alt, now also sent with the X/Twitter card (lib/meta.ts, only for a page with its own share image). Fonts: the six files the APE site serves (three unused weights removed).
- Dashboard: migration 20261124_011410_ape_team adds the new switch (additive, on by default, safe
  to run twice). cms/contentFixes.ts moves the stored page photo to the pack's file name, once.
- New check: `npm run qa:ape` (scripts/ape/tools/check-ape-match.mjs with scripts/ape/expected-text.json,
  both from the pack) compares the built page with the APE wording, photos and alt text.
- Deleted: public/images/ape/ape-armchair-corner.webp, ape-candle-book.webp, ape-textured-napkin.webp,
  ape-toothbrushes-eucalyptus.webp and team-lorna-gladwin.webp (replaced by the pack's files), and
  components/ape/fonts/playfair-display-latin-500-italic, -600-normal and -600-italic.woff2.
- Not changed: "Opening late November 2026" elsewhere on the site, the homepage banner, the pop-up
  wording and dates, the 15 and over switch (off).

## 2.6.2 – 23 Nov 2026: /dental-anxiety/ matches the APE website

Dr Lorna Gladwin (phone, 23 Nov 2026): the Cronulla APE page mentions things that are not on the APE
website and its images are old. Every section was compared with the live APE site (v1.13.0).

- The APE sections were already word for word and photo for photo with the APE site (v2.6.0/2.6.1).
  One crop corrected: the "Our approach" photo (textured napkin) now sits at 50% 62%, as on the APE site.
- Removed from the page (Cronulla only, not on the APE site): the "You are not alone in this" Cronulla
  copy, the five numbered "in detail" sections, the Cronulla booking strip ("Opening late November 2026.
  Book online now or give us a call", address, hours, Book online and Call buttons) and Related
  treatments. The page's own H1, title, description, URL, canonical and schema stay. The APE site's
  closing section ("When you are ready", Book Now to the APE booking page, utm_content=ape-page) is the
  last section, as on the APE site. Book online and Call stay in the header and footer.
- One line under that closing Book Now says where APE appointments are held, in the APE site's own
  wording: "The Cronulla Dentists, 13 Cronulla Street, Cronulla NSW 2230".
- Services page tile for the APE page: APE's armchair photo (tiles/dental-anxiety.jpg, 4:3 crop) with
  the APE site's alt text, instead of the old stock photo. The page photo field is also the armchair.
  Deleted: services/dental-anxiety-cronulla.jpg and tiles/dental-anxiety-cronulla.jpg (no longer used).
- Dashboard: cms/contentFixes.ts (applyApePhotos) swaps the old tile and page photos stored in the
  dashboard on the next build, once; a photo uploaded in the dashboard is left alone and reported.
- "Opening late November 2026" elsewhere on the site is unchanged (waiting for the opening date).

## 2.6.1 – 23 Nov 2026: v2.6.0 plus Dr Lorna Gladwin shown as Associate Dentist

The APE update (2.6.0, below) together with the 2.5.1 correction, so it can go up after 2.5.1 or on
its own in place of both.

## 2.5.1 – 23 Nov 2026: Dr Lorna Gladwin shown as Associate Dentist

Alex (23 Nov 2026): Dr Lorna is an associate dentist at The Cronulla Dentists, not a principal
alongside Dr Ram.

- Her role is now "Associate Dentist" (About page team card and the Person schema). site.config.ts
  default updated.
- Homepage and About page: "The practice is led by Dr Ram Nathwani and Dr Lorna Gladwin" is now "The
  practice is led by Principal Dentist Dr Ram Nathwani, and Dr Lorna Gladwin joins him as Associate
  Dentist." The rest of each paragraph is unchanged.
- The live wording lives in the dashboard database, so cms/contentFixes.ts (applyLornaAssociate)
  makes the same corrections there on the next build: her Team role, if it still says Principal, and
  the two sentences, if they still read as before. It runs once; later dashboard edits are kept, and
  any other wording that still puts her as a principal is reported in the build log.

## 2.6.0 – 19 Nov 2026: APE sections in the current APE style

Dr Lorna Gladwin's email of 19 Nov 2026: "update the APE bits ... as they are the old style". The APE
parts of this site were built from the APE website as it was on 15 Oct (v1.2.5); they now match the
current APE website (v1.12.0 content plus the v1.13.0 changes).

- /dental-anxiety/ APE sections: stylesheet re-ported from the current APE site (app/ape.css, only the
  rules this page uses), copy brought up to date word for word (content/ape.json): intro heading
  "The Anxious Patient Experience™ (APE)", two more nervous-system items ("People you don’t know",
  "Lack of control"), the approach text as one paragraph, "Health fund rebates are available." in the
  cost answer, "Alex, our APE Lead, is happy to talk it through with you." / "Reach out to Alex". The
  "What if your dental care..." band is now a two-tone quote with no photo, as on the APE site.
- Photos: only APE's own four (armchair corner, candle and book, textured napkin, toothbrushes and
  eucalyptus) plus Dr Lorna's current portrait. Removed the stock photos of faces and the old images:
  home-hero-calm-smile, home-heart-aligner-smile, toothpaste-smile, understanding-approach-braces-smile,
  brushing-demo, social-share.jpg, ape-logo.webp. The hands photo the APE site dropped is not used.
  The Cronulla block on the page no longer shows a photo. Share image: APE's armchair image.
- Book Now buttons on /dental-anxiety/ now carry utm_content=ape-page (still open the APE booking page
  in a new tab). The About menu's APE card uses the armchair photo.
- APE fonts (Playfair Display, Figtree) are no longer preloaded, like the launch banner's Figtree.
- Book online pop-up: the APE panel's logo is now the rounded APE logo at 48 px. Wording, dates,
  switches and tracking unchanged; the banner is unchanged.
- New switch "Show the 15 and over line" (Site Settings > APE promotion, off): shows "The Anxious
  Patient Experience is for patients aged 15 and over. Patients under 18 need a parent or guardian's
  name to book." next to the first and last Book Now on /dental-anxiety/. Waiting for Lorna's approval.
  Migration 20261119_070119_ape_age_line (additive, off by default, safe to run twice).
- House rule, no em dashes: the 106 left in the repo (code comments, IMAGES-NEEDED.md, the dashboard's
  empty-field placeholder) are now commas, colons or hyphens. Two of them reached the pages: the
  DentiCare and HICAPS logo alt text ("DentiCare: Payment plans", "HICAPS: Claim on the spot") and the
  schema description ("The Cronulla Dentists, a new dental practice at 13 Cronulla Street..."). Nothing
  else on the site changes.

## 2.5.0 – 18 Nov 2026: APE launch banner and Book Now panel

Dr Lorna Gladwin's email of 18 Nov 2026: promote The Anxious Patient Experience (APE) around its
opening at The Cronulla Dentists on 2 December 2026.

- APE links now use the live domain: site.config.ts `ape.url` https://theanxiouspatientexperience.com.au/
  and `ape.bookUrl` .../book-now/ (were the vercel.app address). This changes the three Book Now
  buttons on /dental-anxiety/. The menu link and the homepage "Nervous patients welcome" link stay on
  /dental-anxiety/ (this site).
- Homepage only: a slim APE banner above the header (navy #284858, cream text, #D2B490 button,
  Figtree), linking to the APE homepage with utm_content=banner. Dismissible for 7 days per browser,
  gentle fade (none with reduced motion), height reserved before first paint, menu sits under it and
  slides back as it scrolls away. Shorter text and button on phones.
- Book online location pop-up: an APE panel after the two location choices, with Lorna's wording
  (her "The Cronulla Dentist" corrected to "The Cronulla Dentists") ending "opening 2 December at The
  Cronulla Dentists." before 2 December and "now available at The Cronulla Dentists." from it (Sydney
  time), and a "Find out more and book" button to the APE homepage with utm_content=book-now-tab.
  The location choices, their order and their links are unchanged, and they still get the focus.
- Both run from 18 Nov to 16 Dec 2026 inclusive, checked in the visitor's browser so they stop on
  their own. Clicks push `ape_promo_click` with `placement` to the GTM dataLayer (no new tags).
- Dashboard: new Site Settings tab "APE promotion" (both the /admin dashboard and /cms) with the two
  on/off switches, start, end and APE opening dates, link and all wording. Migration
  20261118_004913_ape_promo adds the fields and fills the existing settings row once with the launch
  values; later edits in the dashboard are kept.
- New: lib/apePromo.ts, components/ape/ApePromoBanner.tsx, components/ape/promoFont.ts (Figtree, not
  preloaded on other pages).

## 2.4.1 – 11 Nov 2026: Google Search Console verification file

- Added public/google4e7c6f675ceaec49.html, Google's HTML verification file, exactly as issued (one
  line, trailing newline). Served as a plain 200 at /google4e7c6f675ceaec49.html: the middleware lets
  file paths through untouched and Next serves public files before the [slug] route.
- The file must stay for good: Google re-checks it and removing it unverifies the property.
  scripts/check-verification.mjs now runs at the start of every build and as
  `npm run qa:verification`, and fails if the file is missing or its content changes.
- Not added to the sitemap. GTM GTM-TNWQ82NH, GA4 and everything else unchanged.

## 2.4.0 – 5 Nov 2026: Google Tag Manager

- Google Tag Manager container GTM-TNWQ82NH added (Brian, Google Ads, 4 Nov 2026), using the shorter
  snippet Google now issues for new containers, as the first thing inside <head> on every page
  (components/Gtm.tsx, app/(frontend)/layout.tsx). The noscript fallback after <body> is kept.
- The live value comes from the dashboard (Site Settings > Tracking), which was blank, so
  cms/contentFixes.ts fills that field with GTM-TNWQ82NH on the next build when it is empty. The repo
  default in site.config.ts is set to the same ID.
- GA4 (G-XDZHHZLVYL) still loads directly as before. If the GTM container also fires GA4 for that ID,
  clear the GA4 field in Site Settings > Tracking and Publish, or page views are counted twice.
- Carried into this release (prepared 23 Oct 2026, never pushed): the Services page Dental Anxiety card
  now has a photo (public/images/tiles/dental-anxiety.jpg, alt text in lib/image-alt.ts; it was broken
  after the page moved to /dental-anxiety/), and the Questions section on the APE page is centred under
  its heading (app/ape.css).

## 2.3.0 – 23 Oct 2026: The Anxious Patient Experience page

New page at /dental-anxiety/ for The Anxious Patient Experience(TM) (APE), Dr Lorna Gladwin's dental
anxiety pathway, built from the APE website build v1.2.5 (15 Oct 2026).

- The page is the APE homepage rebuilt inside this site: same sections in the same order, the APE wording
  word for word (content/ape.json, trademark kept), the APE stylesheet ported with an `ape-` prefix and
  scoped to the page (app/ape.css, generated by scripts/port-ape-css.py), the APE photos copied locally
  (public/images/ape/) and the APE fonts self-hosted (components/ape/fonts, Playfair Display + Figtree).
  Nothing outside the page is affected.
- The practice's own dental anxiety copy (eyebrow, heading, hook, body, photo) and the numbered "in detail"
  sections sit between the APE "Book Now" quote band and "Meet the team", and stay editable in the dashboard
  like any other service page. The APE wording itself is fixed in the repo (it is a trademarked programme).
- The old page /dental-anxiety-cronulla/ is renamed to /dental-anxiety/ (slug, route, SEO title and
  description), with a permanent redirect from the old address. cms/contentFixes.ts applies the same rename
  and relinks the internal links in the dashboard database on the next build, once and idempotently.
- SEO: title "Dental Anxiety and Phobia | Trustable Dentist in Sutherland Shire", new meta description,
  FAQPage schema from the 11 APE questions, sitemap entry /dental-anxiety/.
- Navigation: "The Anxious Patient Experience" in the top menu after Contact (before the phone number and
  Book online), first after Home in the mobile menu, an APE image card in the About panel (replacing the
  "Nervous patients" card), "Dental Anxiety" under General & Children in the grouped services list, and an
  APE link in the footer Patients column. Desktop menu spacing tightened so the longer label fits at 1100px+.
- "Book Now" buttons open the APE website's booking page (site.config `ape.bookUrl`); "Talk to Alex" goes
  to the practice contact page.
- Only Dr Lorna Gladwin is listed under "Meet the team": the APE build marks its other two team cards as
  placeholders (no photo, "Bio coming soon"), so they are left out until the client supplies them.
- Housekeeping: three em dashes removed from components/Nav.tsx (one in the About panel footer line).

## 2.2.4 – 23 Oct 2026: nib removed

23 Oct 2026: NIB removed per client request, pending NIB provider approval. Reinstate when confirmed.

- Ram (Principal Dentist, email 23 Oct 2026): the Cronulla practice has applied to be an nib provider
  but is not approved yet, so nib comes off the website in case the application is unsuccessful.
  Cronulla only; the Caringbah site is a separate repo and is untouched. No other health fund, payment
  option or content changed.
- Home: the nib card is gone from the provider cards (DentiCare and HICAPS now sit as two centred cards;
  the grid sizes itself to the number of cards) and from the partner strip near the footer.
- Finances: meta description and the health funds paragraph no longer mention nib. Contact and Dental
  implants: the nib sentence fragment is removed; the HICAPS and DentiCare wording is unchanged.
- Logo files deleted: public/images/providers/nib.png, assets-source/providers/nib-original.png.
- Site Settings default payment lines and the dashboard help text no longer mention nib.
- The live wording is in the dashboard database, so cms/contentFixes.ts applies the same removals to
  the database on the next build (before the content pull) and logs anything it could not match.
- scripts/check-banned.mjs now fails on "nib" in any rendered page, so it cannot come back by accident.

To reinstate once approved: delete the 'nib' line in scripts/check-banned.mjs and NIB_RULES in
cms/contentFixes.ts, restore the two logo files and lib/providers.ts / the content files from the 2.2.3
commit, then put the wording back in the dashboard (Pages: Home, Finances, Contact, Dental implants;
Site Settings > Booking and payment) and Publish website.

## 2.2.3 – 28 September 2026: form emails

- Every form submission is always emailed to reception@thecronulladentists.com.au and
  rowayne@gyaclients.com (fixed in lib/relay.ts, ALWAYS_NOTIFY), plus anyone in NOTIFY_EMAIL. Addresses are
  trimmed, lower-cased, checked and de-duplicated. Rowayne, 28 Sep 2026.
- Reply-To on the notification email is the visitor, so reception can reply straight from the inbox.
- When there is no SmileOx intake address, a failed notification now counts as a failed send (the visitor
  sees the error, Enquiries shows "failed") instead of reporting success.
- docs/EMAIL-FORMS-SETUP.md: SMTP2GO domain verification, API key, Vercel settings, test and
  troubleshooting. README forms section updated; the stale VERCEL-ENV-VARIABLES.txt reference removed.

## 2.2.2 – 28 September 2026: sign-in rescue

- If the dashboard password is lost (the dashboard cannot email a reset link yet): set ADMIN_EMAIL and
  ADMIN_PASSWORD in Vercel (Production, Secret), redeploy, and sign in at /admin with exactly those. The
  account is created, or its password reset, made admin and unlocked. Delete ADMIN_PASSWORD afterwards and
  redeploy (or Publish website) to switch it off. app/api/ensure-admin/route.ts, same as Footscray.

## 2.2.1 – 28 September 2026: first-account screen closed

- The dashboard login no longer shows "No accounts yet, create the first admin at /cms" (Rowayne, after
  seeing it on the live site).
- Payload's public "create first user" is closed: /cms/create-first-user returns 404 and any account
  creation without a signed-in admin is refused (cms/collections/Users.ts, middleware.ts). Admins still add
  accounts under Users; GYA's scripts are unaffected. For a brand-new site set ALLOW_FIRST_USER=true in
  Vercel, create the first account at /cms, then delete the variable and redeploy.

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
