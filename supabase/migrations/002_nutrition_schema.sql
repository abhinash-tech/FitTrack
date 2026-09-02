-- 002_nutrition_schema.sql

-- Drop old tables from 001 that are being replaced
DROP TABLE IF EXISTS nutrition_entries CASCADE;
DROP TABLE IF EXISTS ai_food_analysis CASCADE;
DROP TABLE IF EXISTS foods CASCADE;

-- Create new ones

CREATE TABLE food_sources (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT UNIQUE NOT NULL, -- 'IFCT', 'CURATED', 'USDA', 'AI_ESTIMATE'
  priority_level  INTEGER NOT NULL, -- 1 (Highest) to 4 (Lowest)
  description     TEXT
);

ALTER TABLE food_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_sources_public_read" ON food_sources FOR SELECT USING (true);

CREATE TABLE foods (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  category        TEXT,
  cuisine         TEXT DEFAULT 'general',
  source_id       UUID REFERENCES food_sources(id) ON DELETE SET NULL,
  calories_per_100g NUMERIC(7,2) NOT NULL DEFAULT 0,
  protein_per_100g  NUMERIC(6,2) NOT NULL DEFAULT 0,
  carbs_per_100g    NUMERIC(6,2) NOT NULL DEFAULT 0,
  fat_per_100g      NUMERIC(6,2) NOT NULL DEFAULT 0,
  fiber_per_100g    NUMERIC(6,2),
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "foods_public_read" ON foods FOR SELECT USING (true);

CREATE TABLE food_aliases (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id         UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  alias_name      TEXT NOT NULL,
  locale          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE food_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_aliases_public_read" ON food_aliases FOR SELECT USING (true);
CREATE INDEX idx_food_aliases_name_trgm ON food_aliases USING gin (alias_name gin_trgm_ops);

CREATE TABLE food_servings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id         UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  serving_desc    TEXT NOT NULL,
  weight_g        NUMERIC(7,1) NOT NULL,
  is_default      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE food_servings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_servings_public_read" ON food_servings FOR SELECT USING (true);

CREATE TABLE ai_nutrition_cache (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raw_query       TEXT UNIQUE NOT NULL,
  resolved_food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
  resolved_qty    NUMERIC(8,2),
  resolved_unit   TEXT,
  confidence      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ai_nutrition_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_nutrition_cache_public_read" ON ai_nutrition_cache FOR SELECT USING (true);
-- Typically Edge Functions insert here via service role, so we don't necessarily need wide INSERT policies for users.
-- CREATE POLICY "ai_nutrition_cache_insert" ON ai_nutrition_cache FOR INSERT WITH CHECK (true); 

CREATE TABLE nutrition_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id         UUID REFERENCES foods(id) ON DELETE SET NULL,
  meal_type       TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  food_name       TEXT NOT NULL,
  quantity        NUMERIC(8,2) NOT NULL,
  unit            TEXT NOT NULL,
  quantity_g      NUMERIC(8,2) NOT NULL,
  calories        NUMERIC(8,2) NOT NULL DEFAULT 0,
  protein_g       NUMERIC(7,2) NOT NULL DEFAULT 0,
  carbs_g         NUMERIC(7,2) NOT NULL DEFAULT 0,
  fat_g           NUMERIC(7,2) NOT NULL DEFAULT 0,
  fiber_g         NUMERIC(7,2),
  source_used     TEXT,
  ai_confidence   TEXT,
  is_edited       BOOLEAN NOT NULL DEFAULT false,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE nutrition_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_nutrition" ON nutrition_entries FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_nutrition_entries_user_date ON nutrition_entries(user_id, date);
