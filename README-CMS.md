# The Cronulla Dentists: client dashboard deployment

Version 2.1, 28 September 2026. This adds the GYA client dashboard at `/admin` to the existing site,
in the Coastal Dental / WordPress style: navy sidebar (Dashboard, Pages, Blog Posts, Media Library, Team,
Enquiries, SEO, Site Settings, and for GYA admins Redirects and Users), top bar with View site and the
signed-in user. Payload CMS itself sits underneath at `/cms` for GYA only.

The public website looks and behaves exactly as it does today; nothing about the design, copy, URLs or
metadata changes until someone edits it in the dashboard and clicks Publish website.

Read this top to bottom once. Steps 1 to 4 take about 20 minutes. Do them on the staging branch first.

---

## How it works (one paragraph)

The site is still built statically. Before every Vercel build, `scripts/pull-content.ts` copies the latest
published content from the dashboard database into the JSON files the templates already read
(`content/pages/*.json`, `content/site-settings.json`, `content/posts.json`, `content/redirects.json`).
Saving in the dashboard stores the change in the database; **Publish website** on the dashboard calls a
Vercel deploy hook, Vercel rebuilds, and the change is live two to three minutes later. If the database is
ever unreachable the build falls back to the files in the repo, so the live site cannot go down because
of the dashboard.

Stack: Next.js 15.4, Payload CMS 3.90 (at `/cms`), custom dashboard at `/admin` (app/(dashboard) + dashboard/),
Neon Postgres, Vercel Blob for photos. Same environment variables as Coastal Dental and Footscray.

---

## Step 1: put the code on a staging branch (Terminal, same as Footscray)

This is a full-repo replacement (package.json, the Next version and the `app` folder all change, and some
old files must be removed), so use `scripts/push-to-github.sh` rather than GitHub's web uploader. It works
in a fresh copy of the repo in `~/gya-deploy`, shows every file it will remove, asks before pushing, and
only ever touches the `cms` branch until you run `promote`.

```bash
cd ~/Downloads
unzip -o cronulla-CMS-v2.2.1-FULL-REPO.zip
bash cronulla-cms/scripts/push-to-github.sh stage cronulla-CMS-v2.2.1-FULL-REPO.zip
```

First run asks for the repo address (GitHub > the repo > green **Code** button > HTTPS). If git asks you
to sign in, run `gh auth login` once (or sign in to GitHub Desktop) and try again. Type `yes` at the prompt.

Vercel builds the `cms` branch as a Preview. That first build fails with "PAYLOAD_SECRET is not set"
until Step 3 is done. That is expected; the live site is unaffected.

Other commands: `bash cronulla-cms/scripts/push-to-github.sh status` (what is live and what is staged),
`promote` (Step 6), `rollback` (undo the last promote).

## Step 2: create the database and the photo store (Vercel Storage)

Both are one click from the Vercel project and both have free tiers that are more than enough.

1. Vercel > the `tcd-cronulla-dentists-ygl2` project > **Storage** tab > **Create Database** > **Neon**
   (Postgres). Region: Sydney (ap-southeast-2) if offered, otherwise Singapore. Accept the defaults.
   Connect it to the project for **all environments**. Vercel adds `DATABASE_URL` (and a few `POSTGRES_*`
   variables) to the project automatically.
2. Storage tab > **Create** > **Blob**. Connect it to the project for all environments. Vercel adds
   `BLOB_READ_WRITE_TOKEN` automatically.

If you would rather create the database at neon.tech directly, copy its connection string (the one with
`?sslmode=require`) into an environment variable called `DATABASE_URL` yourself.

## Step 3: environment variables

Vercel > Settings > Environment Variables. Add these for Production and Preview. The four form variables
from the current site stay exactly as they are.

| Name | Value |
|---|---|
| `DATABASE_URL` | added by the Neon integration in step 2 |
| `BLOB_READ_WRITE_TOKEN` | added by the Blob integration in step 2 |
| `PAYLOAD_SECRET` | any long random string, for example the output of `openssl rand -hex 32`, or 40+ random characters typed by hand. Mark it Sensitive. Never change it later without telling everyone to log in again. |
| `NEXT_PUBLIC_SERVER_URL` | `https://www.thecronulladentists.com.au` (Production and Preview; previews automatically use their own address) |
| `PUBLISH_HOOK_URL` | see step 4 |
| `SMTP2GO_API_KEY`, `SMTP2GO_SENDER`, `SMILEOX_INTAKE_EMAIL`, `NOTIFY_EMAIL` | unchanged from today |

The build fails on purpose with a clear message if `PAYLOAD_SECRET` is missing, so a half-configured
deploy can never expose the dashboard with a known secret.

## Step 4: the Publish button (deploy hook)

Vercel > Settings > Git > **Deploy Hooks** > Create Hook. Name `publish-website`, branch `main`. Copy the
URL it gives you into the `PUBLISH_HOOK_URL` environment variable. This is what the Publish website
button calls.

For the staging period, create a second hook on the `cms` branch and put that URL in `PUBLISH_HOOK_URL`
for the **Preview** environment only, so Publish on the staging dashboard rebuilds staging. Switch it to the
`main` hook when you merge.

After adding variables: Deployments > latest > **Redeploy** (variables are baked in at build time).

## Step 5: first login and import

1. First account (brand-new database only). Since v2.2.1 the public "create first user" screen is closed.
   Add `ALLOW_FIRST_USER` = `true` in Vercel (the environment you are setting up), redeploy, then open
   `https://<site>/cms`. The first visit shows Payload's **Create first user**. Use
   `rowayne@gyaclients.com`, a strong password, name "Rowayne (GYA)", and set **Role: Admin (GYA)**.
   (Only this first account is created at /cms; everything else happens at /admin.) Then **delete
   `ALLOW_FIRST_USER` and redeploy**. Every other account is added by an admin under Users.
2. Open `https://<preview-url>/admin` and sign in. On the Dashboard click **Import missing content**.
   This loads all 29 pages, the two dentists (with the bios from the About page) and the site settings from
   the files in the repo into the database. It takes a few seconds and is safe to click again at any time
   (it never overwrites dashboard edits; "Reset from files" does). Nothing is blank on first login.
3. Click **Publish website**. Vercel rebuilds; the notice turns from "changes waiting" to "up to date".
4. **Users** (in the sidebar, admins only) > Add a user for the practice: reception's email, role
   **Editor (practice team)**, a password of 10+ characters. Editors see everything except Users,
   Redirects and the Tracking tab in Site Settings.

Password resets: there is no outbound email from the dashboard, so if someone forgets their password an
admin opens Users and clicks **Set new password**. (Adding `@payloadcms/email-nodemailer` with
SMTP2GO's SMTP credentials would turn on the "Forgot password" link; not needed for launch.)

## Step 6: check staging, then go live

Check on the preview URL:

- Every public page looks identical to production (it will; the templates did not change).
- Edit something small on a page, Save changes, Publish website, wait three minutes, refresh the preview.
- Upload a photo in Media Library and choose it on a page (for example the home hero) to confirm Blob works.
- Submit the contact form once and confirm it appears under Enquiries as well as arriving by email.
- Sign in as the editor account and confirm Users, Redirects and Tracking are not visible.

Then run `bash cronulla-cms/scripts/push-to-github.sh promote` and type `LIVE`. It moves `main` to the
exact commit you just tested on the preview (and refuses if anyone changed `main` in the meantime).
Production rebuilds from `main`, runs the same migrations against the same database (the content imported
on staging is already there because both environments share it), and the dashboard is live at
`https://www.thecronulladentists.com.au/admin`. If anything looks wrong, Vercel > Deployments > previous
Production deployment > Instant Rollback, or `push-to-github.sh rollback`.

Point `PUBLISH_HOOK_URL` (Production) at the `main` hook if you have not already.

---

## Day-to-day

- Pages open in the visual editor (v2.2): the real page on the left, Content / SEO / Sections on the
  right, Desktop / Mobile toggle. Click wording on the page to type over it, click a photo to swap it.
  The page is rendered by the logged-in route `/edit-preview/<id>/` (404 for visitors, noindex, no
  analytics); unsaved drafts are stored as the signed-in user's Payload preference `page-draft-<id>`.
- `docs/HOW-TO-UPDATE.md` is the guide for the practice. Send it with their login.
- The dashboard banner always says whether there are unpublished changes and when the site was last
  published, and by whom.
- Enquiries do not need publishing; they appear in the dashboard the moment the form is submitted.
- A page created in the dashboard (Pages > Create New, kind "Service page") is added to the site, the
  Services menu and the sitemap on the next publish. A page deleted in the dashboard disappears on the
  next publish; add a Redirect for its old address first.

## What the current site and the brief disagreed on (decisions taken)

| Brief asked for | What was done and why |
|---|---|
| Preview link on every page | "View page" opens the live page. The site is fully static and never reads the database, so there is no draft preview; saved changes show after Publish website. A draft-preview route can be added later. |
| Drag handle to reorder sections | Reordering works for everything that is a list on the page: the "In detail" sections on service pages, the sections on information pages, and paragraphs, tiles, cards and slides inside a section. The template's fixed blocks (hero, welcome, tiles, payment band and so on) stay in their designed order, which is what keeps the pages pixel-identical. |
| Colours in Site Settings | Two overrides (main navy, accent cyan) under Site Settings > Brand. Empty by default, so the designed palette is untouched. |
| Team with credentials and bio | Seeded from site.config.ts (titles, universities, qualifications from the approved About copy) and the About page's Meet the team bios, exactly as on the live site. AHPRA numbers are blank until the client supplies them. The About page's team section now reads from Team; its old copy stays in the page as a fallback and the page editor points editors to Team. |
| Replace an image everywhere it is used | Works for photos in the Media Library (replace keeps the same record). The photos built into the repo are swapped per slot by choosing a library photo; "Use the built-in photo" reverts. |
| Blog editor with inline images | TipTap editor storing sanitised HTML (allow-list), rendered by the site's `.prose` styles. Payload's Lexical field is no longer used for articles; edit articles at /admin, not /cms. |
| Book online pop-up (Cronulla or Caringbah) | Global click handler on every link to the Cronulla booking URL; buttons themselves unchanged. Caringbah Core Practice link taken from Core Practice's public listing (`/practices/tcd/the-caringbah-dentists`), please confirm with the practice. No Caringbah phone shown (the site rule keeps 9525 0595 off the Cronulla site). |
| Enquiries with the page | The `Page` column is the form's source path (/contact or /register). |
| Editors do not see Users, Redirects or tracking IDs | Enforced in the sidebar, the routes (404 for editors) and at field level in Payload (GA4/GTM/Pixel readable and editable by admins only). |

## For developers

```
app/(dashboard)/         the practice's dashboard at /admin (login, layout, one route per screen)
app/(frontend)/edit-preview/[id]/  logged-in page render for the visual editor (saved or ?draft=1)
components/EditorBridge.tsx        click-to-edit layer, loaded only by /edit-preview/
components/templates/    Home, Services and Contact templates (take the page as a prop)
dashboard/editors/visual/          the visual page editor and its field index
dashboard/lib/           auth (Payload session -> user), REST client
dashboard/ui/            shell, sidebar, fields, sortable list, media picker, image slot, toasts
dashboard/editors/       page editor (schema in pageSchema.ts), post editor (TipTap), settings, team,
                         media library, enquiries, redirects, users, SEO panel
app/(payload)/cms/       Payload's own admin (GYA only), generated boilerplate
payload.config.ts        Payload config: collections, globals, endpoints, plugins
cms/collections/         Pages, Media, Team, Posts + Categories, Enquiries, Redirects, Users
cms/globals/             SiteSettings, SeoDefaults, SiteStatus (hidden bookkeeping)
cms/fields.ts            reusable field builders mirroring content/types.ts (nodes, sections, cards, images)
cms/sync.ts              JSON <-> Payload mapping, both directions
cms/importContent.ts     files -> database (idempotent)
cms/endpoints.ts         POST /api/publish-site, POST /api/import-content, GET /api/site-status,
                         GET /api/enquiries-export.csv
cms/components/          dashboard panel, array row labels, branding
scripts/build.mjs        image manifest -> payload migrate -> pull-content -> next build
scripts/pull-content.ts  database -> content/*.json (never fails the build)
scripts/seed.ts          npm run seed [-- --reset]
migrations/              committed Postgres migrations; run automatically by the build
app/(frontend)/          the public site (unchanged templates)
app/(payload)/           Payload's admin and REST routes (generated boilerplate)
middleware.ts            trailing-slash redirect for public pages only (not /admin or /api)
```

Local development:

```bash
npm install
cp .env.example .env            # fill DATABASE_URL (a local Postgres or a Neon dev branch) and PAYLOAD_SECRET
npm run migrate                 # create the tables
npm run seed                    # load content/pages + site.config into the dashboard
npm run dev                     # http://localhost:3000, /admin (dashboard) and /cms (Payload)
npm run pull:content            # write dashboard content back to /content (what the build does)
npm run build                   # full production build, same as Vercel
```

Changing the schema (adding a field to a collection): edit the collection, then
`npm run migrate:create <name>` and commit the new file in `migrations/`. The build applies it. Schema push
in dev mode is deliberately off so every environment is migrated the same way (the dev server will 500 on
a field that has no migration yet, which is the reminder). After adding or removing custom Payload admin
components run `npm run generate:importmap`; after changing fields, `npm run generate:types`.

The /admin dashboard talks to Payload's REST API with the session cookie. `NEXT_PUBLIC_SERVER_URL` must be
the address the dashboard is opened on (or in `csrf` in payload.config.ts), otherwise saves silently act as
logged out. Preview and branch URLs are added from Vercel's system variables automatically.

The page editor is schema-driven: `dashboard/editors/pageSchema.ts` lists, per page kind, the sections in
page order and the fields in each. Adding a field to the Pages collection means adding it there too.

Content model: the dashboard fields are the JSON page shapes in `content/types.ts` one for one (see
`cms/sync.ts`). Untouched pages round-trip byte for byte, which is how pixel parity is guaranteed.

Photos chosen from the media library are served from Vercel Blob as already-resized WebP (max 2400px,
quality 82, done on upload), so they bypass Next's image optimiser and its account-wide cap.

## Known limits (deliberate for launch)

- No live preview of drafts; editors save, then publish, then look at the site. A draft-preview route can be
  added later.
- Every save publishes to the database (no draft state for pages). Blog posts do have Draft / Published.
- No scheduled publishing.
- No outbound email from the dashboard (password resets via an admin).
- `content/*.json` in the repo is a fallback snapshot. After the dashboard is the source of truth, a
  developer content change should be made in the dashboard (or via "Reset from files" after editing the
  JSON and pushing).
