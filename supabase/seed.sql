-- Seed data for FitTrack

-- 1. Food Sources
INSERT INTO public.food_sources (id, name, priority_level, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'IFCT', 1, 'Indian Food Composition Tables'),
  ('00000000-0000-0000-0000-000000000002', 'CURATED', 2, 'Curated by Admin'),
  ('00000000-0000-0000-0000-000000000003', 'USDA', 3, 'US Department of Agriculture'),
  ('00000000-0000-0000-0000-000000000004', 'AI_ESTIMATE', 4, 'Estimated by AI Provider')
ON CONFLICT (name) DO NOTHING;

-- 2. Base Foods (South Indian Focus)
WITH inserted_foods AS (
  INSERT INTO public.foods (name, category, cuisine, source_id, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_verified) VALUES
  ('Idli', 'indian_breakfast', 'south_indian', '00000000-0000-0000-0000-000000000001', 142, 4.3, 31, 0.4, 1.2, true),
  ('Masala Dosa', 'indian_breakfast', 'south_indian', '00000000-0000-0000-0000-000000000001', 208, 4.5, 30.5, 7.8, 2.3, true),
  ('Sambar', 'curry', 'south_indian', '00000000-0000-0000-0000-000000000001', 65, 3.2, 10.5, 1.2, 1.8, true),
  ('White Rice (Cooked)', 'rice', 'general', '00000000-0000-0000-0000-000000000001', 130, 2.7, 28, 0.3, 0.4, true)
  RETURNING id, name
)
-- We cannot do multi-table inserts in a single WITH easily without knowing IDs statically, so let's do it procedurally or manually map IDs.
SELECT * FROM inserted_foods;

-- For seed predictability, let's use explicit IDs
INSERT INTO public.foods (id, name, category, cuisine, source_id, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_verified) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Idli', 'indian_breakfast', 'south_indian', '00000000-0000-0000-0000-000000000001', 142, 4.3, 31, 0.4, 1.2, true),
  ('f0000000-0000-0000-0000-000000000002', 'Masala Dosa', 'indian_breakfast', 'south_indian', '00000000-0000-0000-0000-000000000001', 208, 4.5, 30.5, 7.8, 2.3, true),
  ('f0000000-0000-0000-0000-000000000003', 'Sambar', 'curry', 'south_indian', '00000000-0000-0000-0000-000000000001', 65, 3.2, 10.5, 1.2, 1.8, true),
  ('f0000000-0000-0000-0000-000000000004', 'White Rice (Cooked)', 'rice', 'general', '00000000-0000-0000-0000-000000000001', 130, 2.7, 28, 0.3, 0.4, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Food Aliases
INSERT INTO public.food_aliases (food_id, alias_name, locale) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'idly', 'en'),
  ('f0000000-0000-0000-0000-000000000002', 'masala dose', 'en'),
  ('f0000000-0000-0000-0000-000000000003', 'sambhar', 'en'),
  ('f0000000-0000-0000-0000-000000000004', 'chawal', 'hi'),
  ('f0000000-0000-0000-0000-000000000004', 'annam', 'te')
ON CONFLICT DO NOTHING;

-- 4. Food Servings (Crucial for text-based fallback)
INSERT INTO public.food_servings (food_id, serving_desc, weight_g, is_default) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'piece', 39, true),
  ('f0000000-0000-0000-0000-000000000002', 'piece', 180, true),
  ('f0000000-0000-0000-0000-000000000003', 'cup', 150, true),
  ('f0000000-0000-0000-0000-000000000003', 'bowl', 250, false),
  ('f0000000-0000-0000-0000-000000000004', 'cup', 150, true),
  ('f0000000-0000-0000-0000-000000000004', 'bowl', 200, false)
ON CONFLICT DO NOTHING;
