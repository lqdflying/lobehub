-- Ensures picbed_images table exists (idempotent re-run of 0041).
-- Drizzle may have recorded 0041 as applied before the table was actually
-- created, so this migration guarantees the table exists on any container start.
CREATE TABLE IF NOT EXISTS "picbed_images" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"name" text NOT NULL,
	"size" integer NOT NULL,
	"file_type" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "picbed_images" ADD CONSTRAINT "picbed_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
 WHEN undefined_table THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "picbed_images_user_id_idx" ON "picbed_images" USING btree ("user_id");
