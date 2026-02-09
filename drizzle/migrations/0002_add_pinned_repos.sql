ALTER TABLE "user_preferences"
ADD COLUMN IF NOT EXISTS "pinnedRepos" jsonb DEFAULT '[]'::jsonb NOT NULL;
