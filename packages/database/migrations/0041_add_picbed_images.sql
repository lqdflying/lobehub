-- NOTE: This migration was written manually (no local PostgreSQL available for db:generate).
-- If db:generate is needed for future migrations, first sync the snapshot by running db:push against a live DB.
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
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "picbed_images_user_id_idx" ON "picbed_images" USING btree ("user_id");
