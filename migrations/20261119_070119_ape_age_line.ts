import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// v2.6.0 (19 Nov 2026): "Show the 15 and over line" switch in Site Settings > APE promotion.
// Additive and off by default; IF NOT EXISTS makes a repeat run harmless.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ape_promo_age_line_enabled" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "ape_promo_age_line_enabled";`)
}
