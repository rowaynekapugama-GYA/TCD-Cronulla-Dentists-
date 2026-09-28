import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ALTER COLUMN "body" SET DATA TYPE varchar;
  ALTER TABLE "_posts_v" ALTER COLUMN "version_body" SET DATA TYPE varchar;
  ALTER TABLE "pages" ADD COLUMN "canonical" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_canonical" varchar;
  ALTER TABLE "team" ADD COLUMN "bio" varchar;
  ALTER TABLE "team" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_og_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "colours_navy" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "colours_cyan" varchar;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "posts_og_image_idx" ON "posts" USING btree ("og_image_id");
  CREATE INDEX "_posts_v_version_version_og_image_idx" ON "_posts_v" USING btree ("version_og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP CONSTRAINT "posts_og_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_og_image_id_media_id_fk";
  
  DROP INDEX "posts_og_image_idx";
  DROP INDEX "_posts_v_version_version_og_image_idx";
  ALTER TABLE "posts" ALTER COLUMN "body" SET DATA TYPE jsonb;
  ALTER TABLE "_posts_v" ALTER COLUMN "version_body" SET DATA TYPE jsonb;
  ALTER TABLE "pages" DROP COLUMN "canonical";
  ALTER TABLE "_pages_v" DROP COLUMN "version_canonical";
  ALTER TABLE "team" DROP COLUMN "bio";
  ALTER TABLE "team" DROP COLUMN "hidden";
  ALTER TABLE "posts" DROP COLUMN "og_image_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_og_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "colours_navy";
  ALTER TABLE "site_settings" DROP COLUMN "colours_cyan";`)
}
