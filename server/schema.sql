CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  first_name TEXT DEFAULT 'Michael',
  age INTEGER DEFAULT 53,
  start_weight REAL,
  current_weight REAL,
  target_weight REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  body_area TEXT,
  description TEXT,
  instructions TEXT NOT NULL,
  precautions TEXT,
  image_path TEXT,
  base_duration_seconds INTEGER,
  base_repetitions INTEGER,
  default_sets INTEGER NOT NULL DEFAULT 1,
  default_rest_seconds INTEGER NOT NULL DEFAULT 30,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  equipment TEXT,
  shoulder_safe INTEGER NOT NULL DEFAULT 1,
  foot_safe INTEGER NOT NULL DEFAULT 1,
  easy_variant TEXT,
  hard_variant TEXT,
  progression_rule TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY,
  date TEXT NOT NULL,
  planned_duration INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  started_at TEXT,
  completed_at TEXT,
  feedback TEXT,
  pain_reported INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id INTEGER PRIMARY KEY,
  workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id),
  planned_duration_seconds INTEGER,
  planned_repetitions INTEGER,
  planned_sets INTEGER NOT NULL DEFAULT 1,
  completed_sets INTEGER NOT NULL DEFAULT 0,
  rest_seconds INTEGER NOT NULL DEFAULT 30,
  completed INTEGER NOT NULL DEFAULT 0,
  skipped INTEGER NOT NULL DEFAULT 0,
  feedback TEXT,
  pain_reported INTEGER NOT NULL DEFAULT 0,
  pain_location TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progression (
  id INTEGER PRIMARY KEY,
  exercise_id INTEGER NOT NULL UNIQUE REFERENCES exercises(id) ON DELETE CASCADE,
  current_duration_seconds INTEGER,
  current_repetitions INTEGER,
  current_sets INTEGER,
  current_level INTEGER NOT NULL DEFAULT 1,
  last_updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exercise_feedback (
  id INTEGER PRIMARY KEY,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  workout_id INTEGER REFERENCES workouts(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('completed','too_easy','too_hard','pain','skipped')),
  pain_location TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
