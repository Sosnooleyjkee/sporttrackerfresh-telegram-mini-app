export const schemaSql = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS questionnaires (
  id TEXT PRIMARY KEY NOT NULL,
  age INTEGER NOT NULL,
  height_cm REAL NOT NULL,
  weight_kg REAL NOT NULL,
  goal TEXT NOT NULL,
  level TEXT NOT NULL,
  daily_steps_target INTEGER NOT NULL,
  weekly_training_target INTEGER NOT NULL,
  is_completed INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS exercise_templates (
  id TEXT PRIMARY KEY NOT NULL,
  group_name TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  default_weight REAL NOT NULL,
  default_reps INTEGER NOT NULL,
  default_sets INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  group_name TEXT NOT NULL,
  performed_at TEXT NOT NULL,
  group_volume REAL NOT NULL,
  previous_group_volume REAL,
  progress_threshold REAL NOT NULL,
  is_qualified INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id TEXT PRIMARY KEY NOT NULL,
  session_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  sets INTEGER NOT NULL,
  volume REAL NOT NULL,
  FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS personal_records (
  id TEXT PRIMARY KEY NOT NULL,
  group_name TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  best_weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  achieved_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_activity (
  id TEXT PRIMARY KEY NOT NULL,
  activity_date TEXT NOT NULL,
  steps INTEGER NOT NULL,
  active_minutes INTEGER NOT NULL,
  walking_minutes INTEGER NOT NULL,
  running_minutes INTEGER NOT NULL,
  cycling_minutes INTEGER NOT NULL,
  swimming_minutes INTEGER NOT NULL,
  strength_minutes INTEGER NOT NULL,
  hiit_minutes INTEGER NOT NULL,
  mobility_minutes INTEGER NOT NULL,
  yoga_minutes INTEGER NOT NULL,
  stairs_minutes INTEGER NOT NULL,
  boxing_minutes INTEGER NOT NULL,
  team_sport_minutes INTEGER NOT NULL,
  hiking_minutes INTEGER NOT NULL,
  elliptical_minutes INTEGER NOT NULL,
  other_minutes INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS health_connections (
  provider TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL,
  last_sync_at TEXT
);

CREATE TABLE IF NOT EXISTS food_catalog (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  kcal_per_100g REAL NOT NULL,
  protein_per_100g REAL NOT NULL,
  fat_per_100g REAL NOT NULL,
  carbs_per_100g REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS food_log_entries (
  id TEXT PRIMARY KEY NOT NULL,
  food_id TEXT NOT NULL,
  food_name TEXT NOT NULL,
  grams REAL NOT NULL,
  meal_type TEXT NOT NULL,
  consumed_at TEXT NOT NULL,
  kcal REAL NOT NULL,
  protein REAL NOT NULL,
  fat REAL NOT NULL,
  carbs REAL NOT NULL,
  FOREIGN KEY (food_id) REFERENCES food_catalog(id)
);

CREATE TABLE IF NOT EXISTS coaches (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  brand_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY NOT NULL,
  coach_id TEXT,
  full_name TEXT NOT NULL,
  goal TEXT NOT NULL,
  FOREIGN KEY (coach_id) REFERENCES coaches(id)
);

CREATE TABLE IF NOT EXISTS training_plans (
  id TEXT PRIMARY KEY NOT NULL,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  focus TEXT NOT NULL,
  is_active INTEGER NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nutrition_plans (
  id TEXT PRIMARY KEY NOT NULL,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  target_kcal REAL NOT NULL,
  target_protein REAL NOT NULL,
  target_fat REAL NOT NULL,
  target_carbs REAL NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS client_progress (
  id TEXT PRIMARY KEY NOT NULL,
  client_id TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  chest_cm REAL,
  waist_cm REAL,
  thigh_cm REAL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
`;
