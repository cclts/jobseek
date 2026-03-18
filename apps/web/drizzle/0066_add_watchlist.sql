CREATE TABLE IF NOT EXISTS "watchlist" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "is_public" boolean DEFAULT true NOT NULL,
  "alerts_enabled" boolean DEFAULT false NOT NULL,
  "filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "source_watchlist_id" uuid,
  "last_accessed_at" timestamptz DEFAULT now() NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "watchlist_company" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "watchlist_id" uuid NOT NULL REFERENCES "watchlist"("id") ON DELETE CASCADE,
  "company_id" uuid NOT NULL REFERENCES "company"("id") ON DELETE CASCADE,
  "added_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_wl_user_slug" ON "watchlist" ("user_id", "slug");
CREATE INDEX IF NOT EXISTS "idx_wl_user_accessed" ON "watchlist" ("user_id", "last_accessed_at");
CREATE INDEX IF NOT EXISTS "idx_wl_public" ON "watchlist" ("is_public") WHERE is_public = true;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_wlc_watchlist_company" ON "watchlist_company" ("watchlist_id", "company_id");
CREATE INDEX IF NOT EXISTS "idx_wlc_company" ON "watchlist_company" ("company_id");

-- Add self-referencing FK for copied-from tracking
DO $$ BEGIN
  ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_source_watchlist_id_fkey"
    FOREIGN KEY ("source_watchlist_id") REFERENCES "watchlist"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
