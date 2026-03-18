ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "dismissed_banners" text[] NOT NULL DEFAULT '{}';
