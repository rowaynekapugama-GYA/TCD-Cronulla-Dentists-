import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "ape_promo_banner_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_panel_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_start_date" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_end_date" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_open_date" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_link" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_banner_text" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_banner_text_short" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_banner_button" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_banner_button_short" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_panel_text" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_panel_before" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_panel_after" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ape_promo_panel_button" varchar;`)

  // One-time fill for the existing Site Settings row, so the dashboard opens with the
  // launch wording and dates (Dr Lorna Gladwin, 18 Nov 2026) instead of empty boxes.
  // Only empty values are filled; this runs once, so later dashboard edits are kept.
  await db.execute(sql`
   UPDATE "site_settings" SET
    "ape_promo_start_date" = COALESCE("ape_promo_start_date", ${'2026-11-18'}),
    "ape_promo_end_date" = COALESCE("ape_promo_end_date", ${'2026-12-16'}),
    "ape_promo_open_date" = COALESCE("ape_promo_open_date", ${'2026-12-02'}),
    "ape_promo_link" = COALESCE("ape_promo_link", ${'https://theanxiouspatientexperience.com.au/'}),
    "ape_promo_banner_text" = COALESCE("ape_promo_banner_text", ${"Feeling anxious about visiting the dentist? We've designed an entire experience around you."}),
    "ape_promo_banner_text_short" = COALESCE("ape_promo_banner_text_short", ${'Feeling anxious about visiting the dentist?'}),
    "ape_promo_banner_button" = COALESCE("ape_promo_banner_button", ${'Discover the Anxious Patient Experience'}),
    "ape_promo_banner_button_short" = COALESCE("ape_promo_banner_button_short", ${'Discover the experience'}),
    "ape_promo_panel_text" = COALESCE("ape_promo_panel_text", ${"Feeling anxious about visiting the dentist? We've designed an entire experience around you. Discover the Anxious Patient Experience, a purpose-built dental programme specifically for anxious patients,"}),
    "ape_promo_panel_before" = COALESCE("ape_promo_panel_before", ${'opening 2 December at The Cronulla Dentists.'}),
    "ape_promo_panel_after" = COALESCE("ape_promo_panel_after", ${'now available at The Cronulla Dentists.'}),
    "ape_promo_panel_button" = COALESCE("ape_promo_panel_button", ${'Find out more and book'});`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "ape_promo_banner_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_panel_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_start_date";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_end_date";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_open_date";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_link";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_banner_text";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_banner_text_short";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_banner_button";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_banner_button_short";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_panel_text";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_panel_before";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_panel_after";
  ALTER TABLE "site_settings" DROP COLUMN "ape_promo_panel_button";`)
}
