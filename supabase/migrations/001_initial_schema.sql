-- FitTrack Database Migration
-- Run this in the Supabase SQL editor or via supabase db push
-- All tables use RLS — users can only access their own records.

-- ─── Extensions ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- fuzzy food search

-- ─── Profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT '',
  age             INTEGER CHECK (age BETWEEN 13 AND 120),
  height_cm       NUMERIC(5,1),
  weight_kg       NUMERIC(5,1),
  goal_type       TEXT CHECK (goal_type IN ('lose_weight','gain_muscle','maintain','endurance','general_health')),
  activity_level  TEXT CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
  unit_system     TEXT NOT NULL DEFAULT 'metric' CHECK (unit_system IN ('metric','imperial')),
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_profile" ON profiles FOR ALL USING (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Hydration ────────────────────────────────────────────────────────────────

CREATE TABLE hydration_goals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_ml     INTEGER NOT NULL DEFAULT 2500 CHECK (goal_ml BETWEEN 500 AND 10000),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE hydration_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_hydration_goals" ON hydration_goals FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_hydration_goals_user ON hydration_goals(user_id, is_active);

CREATE TABLE hydration_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml   INTEGER NOT NULL CHECK (amount_ml BETWEEN 1 AND 5000),
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  source      TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','quick_add','reminder')),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE hydration_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_hydration_entries" ON hydration_entries FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_hydration_entries_user_date ON hydration_entries(user_id, date);

CREATE TABLE hydration_reminders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  enabled           BOOLEAN NOT NULL DEFAULT true,
  start_time        TIME NOT NULL DEFAULT '08:00',
  end_time          TIME NOT NULL DEFAULT '22:00',
  interval_minutes  INTEGER NOT NULL DEFAULT 90 CHECK (interval_minutes BETWEEN 15 AND 480),
  quiet_hours_from  TIME,
  quiet_hours_to    TIME,
  days_of_week      INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
  smart_mode        BOOLEAN NOT NULL DEFAULT true,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE hydration_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_reminders" ON hydration_reminders FOR ALL USING (user_id = auth.uid());

-- ─── Exercise Library (public read) ──────────────────────────────────────────

CREATE TABLE exercises (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  description           TEXT,
  category              TEXT CHECK (category IN ('full_body','beginner','abs','chest','back','arms','legs','glutes','hiit','mobility','stretching','cardio','other')),
  difficulty            TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  equipment             TEXT NOT NULL DEFAULT 'none',
  target_muscles        TEXT[] NOT NULL DEFAULT '{}',
  instructions          TEXT[] NOT NULL DEFAULT '{}',
  default_sets          INTEGER,
  default_reps          INTEGER,
  default_duration_sec  INTEGER,
  estimated_cal_per_min NUMERIC(4,1),
  is_bodyweight         BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercises_public_read" ON exercises FOR SELECT USING (true);

-- ─── Workouts ─────────────────────────────────────────────────────────────────

CREATE TABLE workout_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT,
  category        TEXT,
  type            TEXT NOT NULL CHECK (type IN ('home_workout','walking','running','gym','other')),
  duration_min    INTEGER NOT NULL CHECK (duration_min > 0),
  intensity       TEXT CHECK (intensity IN ('low','moderate','high')),
  calories_burned INTEGER,
  notes           TEXT,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_workouts" ON workout_sessions FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, date);

CREATE TABLE workout_exercises (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id     UUID NOT NULL REFERENCES exercises(id),
  sets_completed  INTEGER,
  reps_per_set    INTEGER[],
  duration_sec    INTEGER,
  rest_sec        INTEGER,
  weight_kg       NUMERIC(5,1),
  difficulty_felt TEXT CHECK (difficulty_felt IN ('low','moderate','high')),
  notes           TEXT,
  order_index     INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_workout_exercises" ON workout_exercises FOR ALL
  USING (session_id IN (SELECT id FROM workout_sessions WHERE user_id = auth.uid()));

-- ─── Walking / Running ────────────────────────────────────────────────────────

CREATE TABLE walking_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  distance_km     NUMERIC(6,2) NOT NULL,
  duration_min    INTEGER NOT NULL,
  avg_pace_min_km NUMERIC(5,2),
  calories_burned INTEGER,
  steps           INTEGER,
  route_geojson   JSONB,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE walking_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_walks" ON walking_sessions FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_walking_sessions_user_date ON walking_sessions(user_id, date);

CREATE TABLE running_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  distance_km     NUMERIC(6,2) NOT NULL,
  duration_min    INTEGER NOT NULL,
  avg_pace_min_km NUMERIC(5,2),
  calories_burned INTEGER,
  steps           INTEGER,
  route_geojson   JSONB,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE running_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_runs" ON running_sessions FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_running_sessions_user_date ON running_sessions(user_id, date);

-- ─── Foods ────────────────────────────────────────────────────────────────────

CREATE TABLE foods (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  name_local        TEXT,
  category          TEXT,
  cuisine           TEXT DEFAULT 'general',
  calories_per_100g NUMERIC(7,2) NOT NULL,
  protein_per_100g  NUMERIC(6,2) NOT NULL DEFAULT 0,
  carbs_per_100g    NUMERIC(6,2) NOT NULL DEFAULT 0,
  fat_per_100g      NUMERIC(6,2) NOT NULL DEFAULT 0,
  fiber_per_100g    NUMERIC(6,2),
  serving_size_g    NUMERIC(7,1) NOT NULL DEFAULT 100,
  serving_desc      TEXT NOT NULL DEFAULT '100g',
  aliases           TEXT[] NOT NULL DEFAULT '{}',
  is_indian         BOOLEAN NOT NULL DEFAULT false,
  verified          BOOLEAN NOT NULL DEFAULT false,
  source            TEXT NOT NULL DEFAULT 'manual',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "foods_public_read" ON foods FOR SELECT USING (true);
CREATE INDEX idx_foods_name_trgm ON foods USING gin (name gin_trgm_ops);
CREATE INDEX idx_foods_is_indian ON foods(is_indian, verified);

-- ─── Nutrition ────────────────────────────────────────────────────────────────

CREATE TABLE ai_food_analysis (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_type      TEXT NOT NULL CHECK (input_type IN ('image','text','voice')),
  raw_input       TEXT,
  image_path      TEXT,
  provider        TEXT NOT NULL,
  model           TEXT NOT NULL,
  raw_response    JSONB,
  detected_foods  JSONB NOT NULL DEFAULT '[]',
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ai_food_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_ai_analysis" ON ai_food_analysis FOR ALL USING (user_id = auth.uid());

CREATE TABLE nutrition_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id         UUID REFERENCES foods(id),
  meal_type       TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  food_name       TEXT NOT NULL,
  quantity_g      NUMERIC(8,2) NOT NULL,
  quantity_desc   TEXT,
  calories        NUMERIC(8,2) NOT NULL DEFAULT 0,
  protein_g       NUMERIC(7,2) NOT NULL DEFAULT 0,
  carbs_g         NUMERIC(7,2) NOT NULL DEFAULT 0,
  fat_g           NUMERIC(7,2) NOT NULL DEFAULT 0,
  fiber_g         NUMERIC(7,2),
  input_method    TEXT NOT NULL DEFAULT 'manual',
  ai_analysis_id  UUID REFERENCES ai_food_analysis(id),
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE nutrition_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_nutrition" ON nutrition_entries FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_nutrition_entries_user_date ON nutrition_entries(user_id, date);

-- ─── Sleep ────────────────────────────────────────────────────────────────────

CREATE TABLE sleep_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bedtime     TIMESTAMPTZ NOT NULL,
  wake_time   TIMESTAMPTZ NOT NULL,
  duration_min INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (wake_time - bedtime))::INTEGER / 60
  ) STORED,
  quality     INTEGER CHECK (quality BETWEEN 1 AND 5),
  notes       TEXT,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_sleep_times CHECK (wake_time > bedtime)
);

ALTER TABLE sleep_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_sleep" ON sleep_entries FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_sleep_entries_user_date ON sleep_entries(user_id, date);

-- ─── Weight ───────────────────────────────────────────────────────────────────

CREATE TABLE weight_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg   NUMERIC(5,1) NOT NULL CHECK (weight_kg BETWEEN 20 AND 600),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_weight" ON weight_entries FOR ALL USING (user_id = auth.uid());

CREATE TABLE body_measurements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  waist_cm    NUMERIC(5,1),
  chest_cm    NUMERIC(5,1),
  arms_cm     NUMERIC(5,1),
  thighs_cm   NUMERIC(5,1),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_measurements" ON body_measurements FOR ALL USING (user_id = auth.uid());

-- ─── Goals ────────────────────────────────────────────────────────────────────

CREATE TABLE goals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  target_value    NUMERIC NOT NULL,
  current_value   NUMERIC NOT NULL DEFAULT 0,
  unit            TEXT,
  deadline        DATE,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_goals" ON goals FOR ALL USING (user_id = auth.uid());

-- ─── Achievements ─────────────────────────────────────────────────────────────

CREATE TABLE achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT '🏆',
  category    TEXT,
  condition   JSONB NOT NULL DEFAULT '{}',
  points      INTEGER NOT NULL DEFAULT 10,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_public_read" ON achievements FOR SELECT USING (true);

CREATE TABLE user_achievements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id  UUID NOT NULL REFERENCES achievements(id),
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_achievements" ON user_achievements FOR ALL USING (user_id = auth.uid());

-- ─── Daily Stats ──────────────────────────────────────────────────────────────

CREATE TABLE daily_stats (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date                DATE NOT NULL,
  water_ml            INTEGER NOT NULL DEFAULT 0,
  calories_consumed   NUMERIC(8,2) NOT NULL DEFAULT 0,
  steps               INTEGER NOT NULL DEFAULT 0,
  sleep_min           INTEGER NOT NULL DEFAULT 0,
  workout_count       INTEGER NOT NULL DEFAULT 0,
  walk_km             NUMERIC(6,2) NOT NULL DEFAULT 0,
  run_km              NUMERIC(6,2) NOT NULL DEFAULT 0,
  wellness_score      INTEGER DEFAULT 0,
  hydration_streak    INTEGER NOT NULL DEFAULT 0,
  workout_streak      INTEGER NOT NULL DEFAULT 0,
  score_breakdown     JSONB,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_daily_stats" ON daily_stats FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date);

-- ─── Notifications Log ────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at     TIMESTAMPTZ,
  data        JSONB
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_notifications" ON notifications FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
