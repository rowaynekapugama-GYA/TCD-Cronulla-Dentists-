import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// v2.7.0 (24 Nov 2026): "Show Alex and Lauren on the APE page" switch in Site Settings > APE promotion.
// Additive and on by default (the existing settings row gets true); IF NOT EXISTS makes a repeat run harmless.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ape_promo_team_enabled" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "ape_promo_team_enabled";`)
}
