import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_body_type" AS ENUM('p', 'ul', 'h4', 'table');
  CREATE TYPE "public"."enum_pages_body_mode" AS ENUM('pre-opening', 'open', 'booking');
  CREATE TYPE "public"."enum_pages_body_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_details_nodes_type" AS ENUM('p', 'ul', 'h4', 'table');
  CREATE TYPE "public"."enum_pages_details_nodes_mode" AS ENUM('pre-opening', 'open', 'booking');
  CREATE TYPE "public"."enum_pages_details_nodes_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_details_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_sections_nodes_type" AS ENUM('p', 'ul', 'h4', 'table');
  CREATE TYPE "public"."enum_pages_sections_nodes_mode" AS ENUM('pre-opening', 'open', 'booking');
  CREATE TYPE "public"."enum_pages_sections_nodes_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_sections_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_slides_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_pillars_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_category_cards_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_treatments_tiles_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_icon_blocks_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_featured_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_blurbs_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_kind" AS ENUM('service', 'prose', 'home', 'hub', 'contact');
  CREATE TYPE "public"."enum_pages_category" AS ENUM('general', 'children', 'cosmetic', 'restorative', 'gum', 'other');
  CREATE TYPE "public"."enum_pages_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_body_type" AS ENUM('p', 'ul', 'h4', 'table');
  CREATE TYPE "public"."enum__pages_v_version_body_mode" AS ENUM('pre-opening', 'open', 'booking');
  CREATE TYPE "public"."enum__pages_v_version_body_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_details_nodes_type" AS ENUM('p', 'ul', 'h4', 'table');
  CREATE TYPE "public"."enum__pages_v_version_details_nodes_mode" AS ENUM('pre-opening', 'open', 'booking');
  CREATE TYPE "public"."enum__pages_v_version_details_nodes_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_details_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_sections_nodes_type" AS ENUM('p', 'ul', 'h4', 'table');
  CREATE TYPE "public"."enum__pages_v_version_sections_nodes_mode" AS ENUM('pre-opening', 'open', 'booking');
  CREATE TYPE "public"."enum__pages_v_version_sections_nodes_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_sections_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_slides_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_pillars_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_category_cards_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_treatments_tiles_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_icon_blocks_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_featured_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_blurbs_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_kind" AS ENUM('service', 'prose', 'home', 'hub', 'contact');
  CREATE TYPE "public"."enum__pages_v_version_category" AS ENUM('general', 'children', 'cosmetic', 'restorative', 'gum', 'other');
  CREATE TYPE "public"."enum__pages_v_version_gate" AS ENUM('emergency', 'cdbs', 'zipAfterpay');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_enquiries_form" AS ENUM('contact', 'eoi');
  CREATE TYPE "public"."enum_enquiries_email_status" AS ENUM('sent', 'failed', 'skipped');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_users_role" AS ENUM('editor', 'admin');
  CREATE TYPE "public"."enum_site_settings_hours_day" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
  CREATE TYPE "public"."enum_site_settings_mode" AS ENUM('pre-opening', 'open');
  CREATE TABLE "pages_body_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_pages_body_type" DEFAULT 'p',
  	"text" varchar,
  	"rows_text" varchar,
  	"mode" "enum_pages_body_mode",
  	"gate" "enum_pages_body_gate"
  );
  
  CREATE TABLE "pages_details_nodes_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_details_nodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_pages_details_nodes_type" DEFAULT 'p',
  	"text" varchar,
  	"rows_text" varchar,
  	"mode" "enum_pages_details_nodes_mode",
  	"gate" "enum_pages_details_nodes_gate"
  );
  
  CREATE TABLE "pages_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"gate" "enum_pages_details_gate"
  );
  
  CREATE TABLE "pages_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_sections_nodes_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_sections_nodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_pages_sections_nodes_type" DEFAULT 'p',
  	"text" varchar,
  	"rows_text" varchar,
  	"mode" "enum_pages_sections_nodes_mode",
  	"gate" "enum_pages_sections_nodes_gate"
  );
  
  CREATE TABLE "pages_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"gate" "enum_pages_sections_gate"
  );
  
  CREATE TABLE "pages_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"sub" varchar,
  	"link_text" varchar,
  	"link_href" varchar,
  	"gate" "enum_pages_slides_gate"
  );
  
  CREATE TABLE "pages_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"href" varchar,
  	"icon" varchar,
  	"gate" "enum_pages_pillars_gate",
  	"fallback_title" varchar,
  	"fallback_text" varchar,
  	"fallback_href" varchar,
  	"fallback_icon" varchar
  );
  
  CREATE TABLE "pages_welcome_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_category_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"href" varchar,
  	"icon" varchar,
  	"gate" "enum_pages_category_cards_gate",
  	"fallback_title" varchar,
  	"fallback_text" varchar,
  	"fallback_href" varchar,
  	"fallback_icon" varchar
  );
  
  CREATE TABLE "pages_treatments_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"href" varchar,
  	"image_upload_id" integer,
  	"image_path" varchar,
  	"image_alt" varchar,
  	"gate" "enum_pages_treatments_tiles_gate"
  );
  
  CREATE TABLE "pages_icon_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"href" varchar,
  	"icon" varchar,
  	"gate" "enum_pages_icon_blocks_gate",
  	"fallback_title" varchar,
  	"fallback_text" varchar,
  	"fallback_href" varchar,
  	"fallback_icon" varchar
  );
  
  CREATE TABLE "pages_payment_band_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_note_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_service_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_featured" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"href" varchar,
  	"image_upload_id" integer,
  	"image_path" varchar,
  	"image_alt" varchar,
  	"gate" "enum_pages_featured_gate",
  	"fallback_title" varchar,
  	"fallback_text" varchar,
  	"fallback_href" varchar
  );
  
  CREATE TABLE "pages_blurbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"href" varchar,
  	"icon" varchar,
  	"gate" "enum_pages_blurbs_gate",
  	"fallback_title" varchar,
  	"fallback_text" varchar,
  	"fallback_href" varchar,
  	"fallback_icon" varchar
  );
  
  CREATE TABLE "pages_closing_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_breadcrumb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"h1" varchar,
  	"eyebrow" varchar,
  	"h2" varchar,
  	"h3" varchar,
  	"hook" varchar,
  	"image_upload_id" integer,
  	"image_path" varchar,
  	"image_alt" varchar,
  	"cta_band" varchar,
  	"closing_cta" varchar,
  	"gated_text_hook" varchar,
  	"gated_text_body_intro" varchar,
  	"hero_image_upload_id" integer,
  	"hero_image_path" varchar,
  	"hero_image_alt" varchar,
  	"welcome_h2" varchar,
  	"welcome_h3" varchar,
  	"welcome_image_upload_id" integer,
  	"welcome_image_path" varchar,
  	"welcome_image_alt" varchar,
  	"treatments_h2" varchar,
  	"treatments_h3" varchar,
  	"payment_band_h2" varchar,
  	"payment_band_logo" varchar,
  	"note_h2" varchar,
  	"note_h3" varchar,
  	"note_signoff" varchar,
  	"dentists_image_upload_id" integer,
  	"dentists_image_path" varchar,
  	"dentists_image_alt" varchar,
  	"intro_line" varchar,
  	"closing_line" varchar,
  	"closing_h2" varchar,
  	"closing_closing_line" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"og_image_id" integer,
  	"noindex" boolean DEFAULT false,
  	"primary_keyword" varchar,
  	"meta_title_gated" varchar,
  	"meta_description_gated" varchar,
  	"kind" "enum_pages_kind" DEFAULT 'service',
  	"slug" varchar,
  	"route" varchar,
  	"category" "enum_pages_category",
  	"gate" "enum_pages_gate",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v_version_body_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__pages_v_version_body_type" DEFAULT 'p',
  	"text" varchar,
  	"rows_text" varchar,
  	"mode" "enum__pages_v_version_body_mode",
  	"gate" "enum__pages_v_version_body_gate",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_details_nodes_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_details_nodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__pages_v_version_details_nodes_type" DEFAULT 'p',
  	"text" varchar,
  	"rows_text" varchar,
  	"mode" "enum__pages_v_version_details_nodes_mode",
  	"gate" "enum__pages_v_version_details_nodes_gate",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"gate" "enum__pages_v_version_details_gate",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_sections_nodes_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_sections_nodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__pages_v_version_sections_nodes_type" DEFAULT 'p',
  	"text" varchar,
  	"rows_text" varchar,
  	"mode" "enum__pages_v_version_sections_nodes_mode",
  	"gate" "enum__pages_v_version_sections_nodes_gate",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"gate" "enum__pages_v_version_sections_gate",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"sub" varchar,
  	"link_text" varchar,
  	"link_href" varchar,
  	"gate" "enum__pages_v_version_slides_gate",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"href" varchar,
  	"icon" varchar,
  	"gate" "enum__pages_v_version_pillars_gate",
  	"fallback_title" varchar,
  	"fallback_text" varchar,
  	"fallback_href" varchar,
  	"fallback_icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_welcome_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_category_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"href" varchar,
  	"icon" varchar,
  	"gate" "enum__pages_v_version_category_cards_gate",
  	"fallback_title" varchar,
  	"fallback_text" varchar,
  	"fallback_href" varchar,
  	"fallback_icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_treatments_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"href" varchar,
  	"image_upload_id" integer,
  	"image_path" varchar,
  	"image_alt" varchar,
  	"gate" "enum__pages_v_version_treatments_tiles_gate",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_icon_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"href" varchar,
  	"icon" varchar,
  	"gate" "enum__pages_v_version_icon_blocks_gate",
  	"fallback_title" varchar,
  	"fallback_text" varchar,
  	"fallback_href" varchar,
  	"fallback_icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_payment_band_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_note_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_service_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_featured" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"href" varchar,
  	"image_upload_id" integer,
  	"image_path" varchar,
  	"image_alt" varchar,
  	"gate" "enum__pages_v_version_featured_gate",
  	"fallback_title" varchar,
  	"fallback_text" varchar,
  	"fallback_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_blurbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"href" varchar,
  	"icon" varchar,
  	"gate" "enum__pages_v_version_blurbs_gate",
  	"fallback_title" varchar,
  	"fallback_text" varchar,
  	"fallback_href" varchar,
  	"fallback_icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_closing_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_breadcrumb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_h1" varchar,
  	"version_eyebrow" varchar,
  	"version_h2" varchar,
  	"version_h3" varchar,
  	"version_hook" varchar,
  	"version_image_upload_id" integer,
  	"version_image_path" varchar,
  	"version_image_alt" varchar,
  	"version_cta_band" varchar,
  	"version_closing_cta" varchar,
  	"version_gated_text_hook" varchar,
  	"version_gated_text_body_intro" varchar,
  	"version_hero_image_upload_id" integer,
  	"version_hero_image_path" varchar,
  	"version_hero_image_alt" varchar,
  	"version_welcome_h2" varchar,
  	"version_welcome_h3" varchar,
  	"version_welcome_image_upload_id" integer,
  	"version_welcome_image_path" varchar,
  	"version_welcome_image_alt" varchar,
  	"version_treatments_h2" varchar,
  	"version_treatments_h3" varchar,
  	"version_payment_band_h2" varchar,
  	"version_payment_band_logo" varchar,
  	"version_note_h2" varchar,
  	"version_note_h3" varchar,
  	"version_note_signoff" varchar,
  	"version_dentists_image_upload_id" integer,
  	"version_dentists_image_path" varchar,
  	"version_dentists_image_alt" varchar,
  	"version_intro_line" varchar,
  	"version_closing_line" varchar,
  	"version_closing_h2" varchar,
  	"version_closing_closing_line" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_og_image_id" integer,
  	"version_noindex" boolean DEFAULT false,
  	"version_primary_keyword" varchar,
  	"version_meta_title_gated" varchar,
  	"version_meta_description_gated" varchar,
  	"version_kind" "enum__pages_v_version_kind" DEFAULT 'service',
  	"version_slug" varchar,
  	"version_route" varchar,
  	"version_category" "enum__pages_v_version_category",
  	"version_gate" "enum__pages_v_version_gate",
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar
  );
  
  CREATE TABLE "team_credentials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "team_knows_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"short_name" varchar NOT NULL,
  	"given_name" varchar NOT NULL,
  	"family_name" varchar NOT NULL,
  	"title" varchar DEFAULT 'Dentist' NOT NULL,
  	"photo_id" integer,
  	"photo_path" varchar,
  	"order" numeric DEFAULT 1,
  	"key" varchar,
  	"alumni_of" varchar,
  	"same_as" varchar,
  	"ahpra" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"excerpt" varchar,
  	"featured_image_id" integer,
  	"body" jsonb,
  	"author" varchar DEFAULT 'The Cronulla Dentists',
  	"published_at" timestamp(3) with time zone,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"noindex" boolean DEFAULT false,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_featured_image_id" integer,
  	"version_body" jsonb,
  	"version_author" varchar DEFAULT 'The Cronulla Dentists',
  	"version_published_at" timestamp(3) with time zone,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_noindex" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form" "enum_enquiries_form" NOT NULL,
  	"name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"message" varchar,
  	"source" varchar,
  	"email_status" "enum_enquiries_email_status",
  	"email_error" varchar,
  	"followed_up" boolean DEFAULT false,
  	"notes" varchar,
  	"raw" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"type" "enum_redirects_type" DEFAULT '301',
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"media_id" integer,
  	"team_id" integer,
  	"posts_id" integer,
  	"categories_id" integer,
  	"enquiries_id" integer,
  	"redirects_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_site_settings_hours_day" NOT NULL,
  	"closed" boolean DEFAULT false,
  	"open" varchar,
  	"close" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "site_settings_payment" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_parking_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"phone_e164" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"address_street" varchar NOT NULL,
  	"address_suburb" varchar NOT NULL,
  	"address_state" varchar DEFAULT 'NSW' NOT NULL,
  	"address_postcode" varchar NOT NULL,
  	"geo_lat" numeric,
  	"geo_lng" numeric,
  	"gbp_share_url" varchar,
  	"logo_id" integer,
  	"hooks_late_monday" varchar,
  	"hooks_early_friday" varchar,
  	"mode" "enum_site_settings_mode" DEFAULT 'pre-opening' NOT NULL,
  	"opening_date_label" varchar,
  	"opening_date" varchar,
  	"opening_date_time" varchar,
  	"booking_url" varchar,
  	"features_emergency" boolean DEFAULT false,
  	"features_cdbs" boolean DEFAULT true,
  	"features_zip_afterpay" boolean DEFAULT false,
  	"team_names_confirmed" boolean DEFAULT true,
  	"privacy_last_updated" varchar,
  	"ga4_id" varchar,
  	"gtm_id" varchar,
  	"meta_pixel_id" varchar,
  	"same_as_facebook" varchar,
  	"same_as_instagram" varchar,
  	"sister_name" varchar,
  	"sister_url" varchar,
  	"sister_heritage" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "seo_defaults" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"og_image_id" integer,
  	"default_description" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_status" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"last_changed_at" timestamp(3) with time zone,
  	"last_published_at" timestamp(3) with time zone,
  	"last_published_by" varchar,
  	"last_publish_status" varchar,
  	"last_import_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_body_items" ADD CONSTRAINT "pages_body_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_body"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_body" ADD CONSTRAINT "pages_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_details_nodes_items" ADD CONSTRAINT "pages_details_nodes_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_details_nodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_details_nodes" ADD CONSTRAINT "pages_details_nodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_details"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_details" ADD CONSTRAINT "pages_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_intro" ADD CONSTRAINT "pages_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections_nodes_items" ADD CONSTRAINT "pages_sections_nodes_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections_nodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections_nodes" ADD CONSTRAINT "pages_sections_nodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections" ADD CONSTRAINT "pages_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_slides" ADD CONSTRAINT "pages_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_providers" ADD CONSTRAINT "pages_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_pillars" ADD CONSTRAINT "pages_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_welcome_paragraphs" ADD CONSTRAINT "pages_welcome_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_category_cards" ADD CONSTRAINT "pages_category_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_treatments_tiles" ADD CONSTRAINT "pages_treatments_tiles_image_upload_id_media_id_fk" FOREIGN KEY ("image_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_treatments_tiles" ADD CONSTRAINT "pages_treatments_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_icon_blocks" ADD CONSTRAINT "pages_icon_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_payment_band_lines" ADD CONSTRAINT "pages_payment_band_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_note_paragraphs" ADD CONSTRAINT "pages_note_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_service_list" ADD CONSTRAINT "pages_service_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_featured" ADD CONSTRAINT "pages_featured_image_upload_id_media_id_fk" FOREIGN KEY ("image_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_featured" ADD CONSTRAINT "pages_featured_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blurbs" ADD CONSTRAINT "pages_blurbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_closing_paragraphs" ADD CONSTRAINT "pages_closing_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_breadcrumb" ADD CONSTRAINT "pages_breadcrumb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_image_upload_id_media_id_fk" FOREIGN KEY ("image_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_image_upload_id_media_id_fk" FOREIGN KEY ("hero_image_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_welcome_image_upload_id_media_id_fk" FOREIGN KEY ("welcome_image_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_dentists_image_upload_id_media_id_fk" FOREIGN KEY ("dentists_image_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_body_items" ADD CONSTRAINT "_pages_v_version_body_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_body"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_body" ADD CONSTRAINT "_pages_v_version_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_details_nodes_items" ADD CONSTRAINT "_pages_v_version_details_nodes_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_details_nodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_details_nodes" ADD CONSTRAINT "_pages_v_version_details_nodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_details"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_details" ADD CONSTRAINT "_pages_v_version_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_intro" ADD CONSTRAINT "_pages_v_version_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections_nodes_items" ADD CONSTRAINT "_pages_v_version_sections_nodes_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_sections_nodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections_nodes" ADD CONSTRAINT "_pages_v_version_sections_nodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections" ADD CONSTRAINT "_pages_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_slides" ADD CONSTRAINT "_pages_v_version_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_providers" ADD CONSTRAINT "_pages_v_version_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_pillars" ADD CONSTRAINT "_pages_v_version_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_welcome_paragraphs" ADD CONSTRAINT "_pages_v_version_welcome_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_category_cards" ADD CONSTRAINT "_pages_v_version_category_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_treatments_tiles" ADD CONSTRAINT "_pages_v_version_treatments_tiles_image_upload_id_media_id_fk" FOREIGN KEY ("image_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_treatments_tiles" ADD CONSTRAINT "_pages_v_version_treatments_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_icon_blocks" ADD CONSTRAINT "_pages_v_version_icon_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_payment_band_lines" ADD CONSTRAINT "_pages_v_version_payment_band_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_note_paragraphs" ADD CONSTRAINT "_pages_v_version_note_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_service_list" ADD CONSTRAINT "_pages_v_version_service_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_featured" ADD CONSTRAINT "_pages_v_version_featured_image_upload_id_media_id_fk" FOREIGN KEY ("image_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_featured" ADD CONSTRAINT "_pages_v_version_featured_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_blurbs" ADD CONSTRAINT "_pages_v_version_blurbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_closing_paragraphs" ADD CONSTRAINT "_pages_v_version_closing_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_breadcrumb" ADD CONSTRAINT "_pages_v_version_breadcrumb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_image_upload_id_media_id_fk" FOREIGN KEY ("version_image_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_upload_id_media_id_fk" FOREIGN KEY ("version_hero_image_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_welcome_image_upload_id_media_id_fk" FOREIGN KEY ("version_welcome_image_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_dentists_image_upload_id_media_id_fk" FOREIGN KEY ("version_dentists_image_upload_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_credentials" ADD CONSTRAINT "team_credentials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_knows_about" ADD CONSTRAINT "team_knows_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_hours" ADD CONSTRAINT "site_settings_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_payment" ADD CONSTRAINT "site_settings_payment_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_parking_notes" ADD CONSTRAINT "site_settings_parking_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo_defaults" ADD CONSTRAINT "seo_defaults_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_body_items_order_idx" ON "pages_body_items" USING btree ("_order");
  CREATE INDEX "pages_body_items_parent_id_idx" ON "pages_body_items" USING btree ("_parent_id");
  CREATE INDEX "pages_body_order_idx" ON "pages_body" USING btree ("_order");
  CREATE INDEX "pages_body_parent_id_idx" ON "pages_body" USING btree ("_parent_id");
  CREATE INDEX "pages_details_nodes_items_order_idx" ON "pages_details_nodes_items" USING btree ("_order");
  CREATE INDEX "pages_details_nodes_items_parent_id_idx" ON "pages_details_nodes_items" USING btree ("_parent_id");
  CREATE INDEX "pages_details_nodes_order_idx" ON "pages_details_nodes" USING btree ("_order");
  CREATE INDEX "pages_details_nodes_parent_id_idx" ON "pages_details_nodes" USING btree ("_parent_id");
  CREATE INDEX "pages_details_order_idx" ON "pages_details" USING btree ("_order");
  CREATE INDEX "pages_details_parent_id_idx" ON "pages_details" USING btree ("_parent_id");
  CREATE INDEX "pages_intro_order_idx" ON "pages_intro" USING btree ("_order");
  CREATE INDEX "pages_intro_parent_id_idx" ON "pages_intro" USING btree ("_parent_id");
  CREATE INDEX "pages_sections_nodes_items_order_idx" ON "pages_sections_nodes_items" USING btree ("_order");
  CREATE INDEX "pages_sections_nodes_items_parent_id_idx" ON "pages_sections_nodes_items" USING btree ("_parent_id");
  CREATE INDEX "pages_sections_nodes_order_idx" ON "pages_sections_nodes" USING btree ("_order");
  CREATE INDEX "pages_sections_nodes_parent_id_idx" ON "pages_sections_nodes" USING btree ("_parent_id");
  CREATE INDEX "pages_sections_order_idx" ON "pages_sections" USING btree ("_order");
  CREATE INDEX "pages_sections_parent_id_idx" ON "pages_sections" USING btree ("_parent_id");
  CREATE INDEX "pages_slides_order_idx" ON "pages_slides" USING btree ("_order");
  CREATE INDEX "pages_slides_parent_id_idx" ON "pages_slides" USING btree ("_parent_id");
  CREATE INDEX "pages_providers_order_idx" ON "pages_providers" USING btree ("_order");
  CREATE INDEX "pages_providers_parent_id_idx" ON "pages_providers" USING btree ("_parent_id");
  CREATE INDEX "pages_pillars_order_idx" ON "pages_pillars" USING btree ("_order");
  CREATE INDEX "pages_pillars_parent_id_idx" ON "pages_pillars" USING btree ("_parent_id");
  CREATE INDEX "pages_welcome_paragraphs_order_idx" ON "pages_welcome_paragraphs" USING btree ("_order");
  CREATE INDEX "pages_welcome_paragraphs_parent_id_idx" ON "pages_welcome_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "pages_category_cards_order_idx" ON "pages_category_cards" USING btree ("_order");
  CREATE INDEX "pages_category_cards_parent_id_idx" ON "pages_category_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_treatments_tiles_order_idx" ON "pages_treatments_tiles" USING btree ("_order");
  CREATE INDEX "pages_treatments_tiles_parent_id_idx" ON "pages_treatments_tiles" USING btree ("_parent_id");
  CREATE INDEX "pages_treatments_tiles_image_image_upload_idx" ON "pages_treatments_tiles" USING btree ("image_upload_id");
  CREATE INDEX "pages_icon_blocks_order_idx" ON "pages_icon_blocks" USING btree ("_order");
  CREATE INDEX "pages_icon_blocks_parent_id_idx" ON "pages_icon_blocks" USING btree ("_parent_id");
  CREATE INDEX "pages_payment_band_lines_order_idx" ON "pages_payment_band_lines" USING btree ("_order");
  CREATE INDEX "pages_payment_band_lines_parent_id_idx" ON "pages_payment_band_lines" USING btree ("_parent_id");
  CREATE INDEX "pages_note_paragraphs_order_idx" ON "pages_note_paragraphs" USING btree ("_order");
  CREATE INDEX "pages_note_paragraphs_parent_id_idx" ON "pages_note_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "pages_service_list_order_idx" ON "pages_service_list" USING btree ("_order");
  CREATE INDEX "pages_service_list_parent_id_idx" ON "pages_service_list" USING btree ("_parent_id");
  CREATE INDEX "pages_featured_order_idx" ON "pages_featured" USING btree ("_order");
  CREATE INDEX "pages_featured_parent_id_idx" ON "pages_featured" USING btree ("_parent_id");
  CREATE INDEX "pages_featured_image_image_upload_idx" ON "pages_featured" USING btree ("image_upload_id");
  CREATE INDEX "pages_blurbs_order_idx" ON "pages_blurbs" USING btree ("_order");
  CREATE INDEX "pages_blurbs_parent_id_idx" ON "pages_blurbs" USING btree ("_parent_id");
  CREATE INDEX "pages_closing_paragraphs_order_idx" ON "pages_closing_paragraphs" USING btree ("_order");
  CREATE INDEX "pages_closing_paragraphs_parent_id_idx" ON "pages_closing_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "pages_breadcrumb_order_idx" ON "pages_breadcrumb" USING btree ("_order");
  CREATE INDEX "pages_breadcrumb_parent_id_idx" ON "pages_breadcrumb" USING btree ("_parent_id");
  CREATE INDEX "pages_image_image_upload_idx" ON "pages" USING btree ("image_upload_id");
  CREATE INDEX "pages_hero_image_hero_image_upload_idx" ON "pages" USING btree ("hero_image_upload_id");
  CREATE INDEX "pages_welcome_image_welcome_image_upload_idx" ON "pages" USING btree ("welcome_image_upload_id");
  CREATE INDEX "pages_dentists_image_dentists_image_upload_idx" ON "pages" USING btree ("dentists_image_upload_id");
  CREATE INDEX "pages_og_image_idx" ON "pages" USING btree ("og_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_version_body_items_order_idx" ON "_pages_v_version_body_items" USING btree ("_order");
  CREATE INDEX "_pages_v_version_body_items_parent_id_idx" ON "_pages_v_version_body_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_body_order_idx" ON "_pages_v_version_body" USING btree ("_order");
  CREATE INDEX "_pages_v_version_body_parent_id_idx" ON "_pages_v_version_body" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_details_nodes_items_order_idx" ON "_pages_v_version_details_nodes_items" USING btree ("_order");
  CREATE INDEX "_pages_v_version_details_nodes_items_parent_id_idx" ON "_pages_v_version_details_nodes_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_details_nodes_order_idx" ON "_pages_v_version_details_nodes" USING btree ("_order");
  CREATE INDEX "_pages_v_version_details_nodes_parent_id_idx" ON "_pages_v_version_details_nodes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_details_order_idx" ON "_pages_v_version_details" USING btree ("_order");
  CREATE INDEX "_pages_v_version_details_parent_id_idx" ON "_pages_v_version_details" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_intro_order_idx" ON "_pages_v_version_intro" USING btree ("_order");
  CREATE INDEX "_pages_v_version_intro_parent_id_idx" ON "_pages_v_version_intro" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_sections_nodes_items_order_idx" ON "_pages_v_version_sections_nodes_items" USING btree ("_order");
  CREATE INDEX "_pages_v_version_sections_nodes_items_parent_id_idx" ON "_pages_v_version_sections_nodes_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_sections_nodes_order_idx" ON "_pages_v_version_sections_nodes" USING btree ("_order");
  CREATE INDEX "_pages_v_version_sections_nodes_parent_id_idx" ON "_pages_v_version_sections_nodes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_sections_order_idx" ON "_pages_v_version_sections" USING btree ("_order");
  CREATE INDEX "_pages_v_version_sections_parent_id_idx" ON "_pages_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_slides_order_idx" ON "_pages_v_version_slides" USING btree ("_order");
  CREATE INDEX "_pages_v_version_slides_parent_id_idx" ON "_pages_v_version_slides" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_providers_order_idx" ON "_pages_v_version_providers" USING btree ("_order");
  CREATE INDEX "_pages_v_version_providers_parent_id_idx" ON "_pages_v_version_providers" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_pillars_order_idx" ON "_pages_v_version_pillars" USING btree ("_order");
  CREATE INDEX "_pages_v_version_pillars_parent_id_idx" ON "_pages_v_version_pillars" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_welcome_paragraphs_order_idx" ON "_pages_v_version_welcome_paragraphs" USING btree ("_order");
  CREATE INDEX "_pages_v_version_welcome_paragraphs_parent_id_idx" ON "_pages_v_version_welcome_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_category_cards_order_idx" ON "_pages_v_version_category_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_version_category_cards_parent_id_idx" ON "_pages_v_version_category_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_treatments_tiles_order_idx" ON "_pages_v_version_treatments_tiles" USING btree ("_order");
  CREATE INDEX "_pages_v_version_treatments_tiles_parent_id_idx" ON "_pages_v_version_treatments_tiles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_treatments_tiles_image_image_upload_idx" ON "_pages_v_version_treatments_tiles" USING btree ("image_upload_id");
  CREATE INDEX "_pages_v_version_icon_blocks_order_idx" ON "_pages_v_version_icon_blocks" USING btree ("_order");
  CREATE INDEX "_pages_v_version_icon_blocks_parent_id_idx" ON "_pages_v_version_icon_blocks" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_payment_band_lines_order_idx" ON "_pages_v_version_payment_band_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_version_payment_band_lines_parent_id_idx" ON "_pages_v_version_payment_band_lines" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_note_paragraphs_order_idx" ON "_pages_v_version_note_paragraphs" USING btree ("_order");
  CREATE INDEX "_pages_v_version_note_paragraphs_parent_id_idx" ON "_pages_v_version_note_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_service_list_order_idx" ON "_pages_v_version_service_list" USING btree ("_order");
  CREATE INDEX "_pages_v_version_service_list_parent_id_idx" ON "_pages_v_version_service_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_featured_order_idx" ON "_pages_v_version_featured" USING btree ("_order");
  CREATE INDEX "_pages_v_version_featured_parent_id_idx" ON "_pages_v_version_featured" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_featured_image_image_upload_idx" ON "_pages_v_version_featured" USING btree ("image_upload_id");
  CREATE INDEX "_pages_v_version_blurbs_order_idx" ON "_pages_v_version_blurbs" USING btree ("_order");
  CREATE INDEX "_pages_v_version_blurbs_parent_id_idx" ON "_pages_v_version_blurbs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_closing_paragraphs_order_idx" ON "_pages_v_version_closing_paragraphs" USING btree ("_order");
  CREATE INDEX "_pages_v_version_closing_paragraphs_parent_id_idx" ON "_pages_v_version_closing_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_breadcrumb_order_idx" ON "_pages_v_version_breadcrumb" USING btree ("_order");
  CREATE INDEX "_pages_v_version_breadcrumb_parent_id_idx" ON "_pages_v_version_breadcrumb" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_image_version_image_upload_idx" ON "_pages_v" USING btree ("version_image_upload_id");
  CREATE INDEX "_pages_v_version_hero_image_version_hero_image_upload_idx" ON "_pages_v" USING btree ("version_hero_image_upload_id");
  CREATE INDEX "_pages_v_version_welcome_image_version_welcome_image_upl_idx" ON "_pages_v" USING btree ("version_welcome_image_upload_id");
  CREATE INDEX "_pages_v_version_dentists_image_version_dentists_image_u_idx" ON "_pages_v" USING btree ("version_dentists_image_upload_id");
  CREATE INDEX "_pages_v_version_version_og_image_idx" ON "_pages_v" USING btree ("version_og_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "team_credentials_order_idx" ON "team_credentials" USING btree ("_order");
  CREATE INDEX "team_credentials_parent_id_idx" ON "team_credentials" USING btree ("_parent_id");
  CREATE INDEX "team_knows_about_order_idx" ON "team_knows_about" USING btree ("_order");
  CREATE INDEX "team_knows_about_parent_id_idx" ON "team_knows_about" USING btree ("_parent_id");
  CREATE INDEX "team_photo_idx" ON "team" USING btree ("photo_id");
  CREATE INDEX "team_updated_at_idx" ON "team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");
  CREATE INDEX "posts_featured_image_idx" ON "posts" USING btree ("featured_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_featured_image_idx" ON "_posts_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_hours_order_idx" ON "site_settings_hours" USING btree ("_order");
  CREATE INDEX "site_settings_hours_parent_id_idx" ON "site_settings_hours" USING btree ("_parent_id");
  CREATE INDEX "site_settings_payment_order_idx" ON "site_settings_payment" USING btree ("_order");
  CREATE INDEX "site_settings_payment_parent_id_idx" ON "site_settings_payment" USING btree ("_parent_id");
  CREATE INDEX "site_settings_parking_notes_order_idx" ON "site_settings_parking_notes" USING btree ("_order");
  CREATE INDEX "site_settings_parking_notes_parent_id_idx" ON "site_settings_parking_notes" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "seo_defaults_og_image_idx" ON "seo_defaults" USING btree ("og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_body_items" CASCADE;
  DROP TABLE "pages_body" CASCADE;
  DROP TABLE "pages_details_nodes_items" CASCADE;
  DROP TABLE "pages_details_nodes" CASCADE;
  DROP TABLE "pages_details" CASCADE;
  DROP TABLE "pages_intro" CASCADE;
  DROP TABLE "pages_sections_nodes_items" CASCADE;
  DROP TABLE "pages_sections_nodes" CASCADE;
  DROP TABLE "pages_sections" CASCADE;
  DROP TABLE "pages_slides" CASCADE;
  DROP TABLE "pages_providers" CASCADE;
  DROP TABLE "pages_pillars" CASCADE;
  DROP TABLE "pages_welcome_paragraphs" CASCADE;
  DROP TABLE "pages_category_cards" CASCADE;
  DROP TABLE "pages_treatments_tiles" CASCADE;
  DROP TABLE "pages_icon_blocks" CASCADE;
  DROP TABLE "pages_payment_band_lines" CASCADE;
  DROP TABLE "pages_note_paragraphs" CASCADE;
  DROP TABLE "pages_service_list" CASCADE;
  DROP TABLE "pages_featured" CASCADE;
  DROP TABLE "pages_blurbs" CASCADE;
  DROP TABLE "pages_closing_paragraphs" CASCADE;
  DROP TABLE "pages_breadcrumb" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v_version_body_items" CASCADE;
  DROP TABLE "_pages_v_version_body" CASCADE;
  DROP TABLE "_pages_v_version_details_nodes_items" CASCADE;
  DROP TABLE "_pages_v_version_details_nodes" CASCADE;
  DROP TABLE "_pages_v_version_details" CASCADE;
  DROP TABLE "_pages_v_version_intro" CASCADE;
  DROP TABLE "_pages_v_version_sections_nodes_items" CASCADE;
  DROP TABLE "_pages_v_version_sections_nodes" CASCADE;
  DROP TABLE "_pages_v_version_sections" CASCADE;
  DROP TABLE "_pages_v_version_slides" CASCADE;
  DROP TABLE "_pages_v_version_providers" CASCADE;
  DROP TABLE "_pages_v_version_pillars" CASCADE;
  DROP TABLE "_pages_v_version_welcome_paragraphs" CASCADE;
  DROP TABLE "_pages_v_version_category_cards" CASCADE;
  DROP TABLE "_pages_v_version_treatments_tiles" CASCADE;
  DROP TABLE "_pages_v_version_icon_blocks" CASCADE;
  DROP TABLE "_pages_v_version_payment_band_lines" CASCADE;
  DROP TABLE "_pages_v_version_note_paragraphs" CASCADE;
  DROP TABLE "_pages_v_version_service_list" CASCADE;
  DROP TABLE "_pages_v_version_featured" CASCADE;
  DROP TABLE "_pages_v_version_blurbs" CASCADE;
  DROP TABLE "_pages_v_version_closing_paragraphs" CASCADE;
  DROP TABLE "_pages_v_version_breadcrumb" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "team_credentials" CASCADE;
  DROP TABLE "team_knows_about" CASCADE;
  DROP TABLE "team" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_hours" CASCADE;
  DROP TABLE "site_settings_payment" CASCADE;
  DROP TABLE "site_settings_parking_notes" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "seo_defaults" CASCADE;
  DROP TABLE "site_status" CASCADE;
  DROP TYPE "public"."enum_pages_body_type";
  DROP TYPE "public"."enum_pages_body_mode";
  DROP TYPE "public"."enum_pages_body_gate";
  DROP TYPE "public"."enum_pages_details_nodes_type";
  DROP TYPE "public"."enum_pages_details_nodes_mode";
  DROP TYPE "public"."enum_pages_details_nodes_gate";
  DROP TYPE "public"."enum_pages_details_gate";
  DROP TYPE "public"."enum_pages_sections_nodes_type";
  DROP TYPE "public"."enum_pages_sections_nodes_mode";
  DROP TYPE "public"."enum_pages_sections_nodes_gate";
  DROP TYPE "public"."enum_pages_sections_gate";
  DROP TYPE "public"."enum_pages_slides_gate";
  DROP TYPE "public"."enum_pages_pillars_gate";
  DROP TYPE "public"."enum_pages_category_cards_gate";
  DROP TYPE "public"."enum_pages_treatments_tiles_gate";
  DROP TYPE "public"."enum_pages_icon_blocks_gate";
  DROP TYPE "public"."enum_pages_featured_gate";
  DROP TYPE "public"."enum_pages_blurbs_gate";
  DROP TYPE "public"."enum_pages_kind";
  DROP TYPE "public"."enum_pages_category";
  DROP TYPE "public"."enum_pages_gate";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_body_type";
  DROP TYPE "public"."enum__pages_v_version_body_mode";
  DROP TYPE "public"."enum__pages_v_version_body_gate";
  DROP TYPE "public"."enum__pages_v_version_details_nodes_type";
  DROP TYPE "public"."enum__pages_v_version_details_nodes_mode";
  DROP TYPE "public"."enum__pages_v_version_details_nodes_gate";
  DROP TYPE "public"."enum__pages_v_version_details_gate";
  DROP TYPE "public"."enum__pages_v_version_sections_nodes_type";
  DROP TYPE "public"."enum__pages_v_version_sections_nodes_mode";
  DROP TYPE "public"."enum__pages_v_version_sections_nodes_gate";
  DROP TYPE "public"."enum__pages_v_version_sections_gate";
  DROP TYPE "public"."enum__pages_v_version_slides_gate";
  DROP TYPE "public"."enum__pages_v_version_pillars_gate";
  DROP TYPE "public"."enum__pages_v_version_category_cards_gate";
  DROP TYPE "public"."enum__pages_v_version_treatments_tiles_gate";
  DROP TYPE "public"."enum__pages_v_version_icon_blocks_gate";
  DROP TYPE "public"."enum__pages_v_version_featured_gate";
  DROP TYPE "public"."enum__pages_v_version_blurbs_gate";
  DROP TYPE "public"."enum__pages_v_version_kind";
  DROP TYPE "public"."enum__pages_v_version_category";
  DROP TYPE "public"."enum__pages_v_version_gate";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_enquiries_form";
  DROP TYPE "public"."enum_enquiries_email_status";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_site_settings_hours_day";
  DROP TYPE "public"."enum_site_settings_mode";`)
}
