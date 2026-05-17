import { db, getSettings, nowIso, recentPain, todayIso } from './db.js';

const plans = {
  1: ['Vélo d’appartement', 'Gainage contre un mur', 'Respiration abdominale', 'Talon glissé', 'Genou levé alterné'],
  2: ['Cercles d’épaules', 'Cercles de chevilles'],
  3: ['Marche douce', 'Gainage contre un mur', 'Respiration abdominale', 'Talon glissé', 'Genou levé alterné'],
  4: ['Tirage élastique coude au corps', 'Rotation externe avec élastique léger', 'Serrage des omoplates', 'Curl biceps léger', 'Extension triceps assis avec élastique bas', 'Pompes contre le mur', 'Rowing avec bouteille très légère'],
  5: ['Vélo d’appartement', 'Gainage contre un mur', 'Respiration abdominale', 'Talon glissé', 'Genou levé alterné'],
  6: ['Cercles d’épaules', 'Cercles de chevilles'],
  0: ['Gainage contre un mur', 'Respiration abdominale', 'Talon glissé', 'Genou levé alterné']
};

function plannedMinutes(exercises) {
  return Math.round(exercises.reduce((total, item) => {
    const work = item.planned_duration_seconds ? item.planned_duration_seconds * item.planned_sets : (item.planned_repetitions || 8) * 4 * item.planned_sets;
    const rest = item.rest_seconds * Math.max(0, item.planned_sets - 1);
    return total + work + rest;
  }, 0) / 60);
}

function blockedExerciseIds() {
  const pains = recentPain(7);
  const ids = new Set(pains.map((pain) => pain.exercise_id));
  const shoulderPain = pains.some((pain) => pain.pain_location === 'épaule' || pain.body_area === 'epaule');
  const footPain = pains.some((pain) => pain.pain_location === 'pieds' || pain.body_area === 'pieds');

  if (shoulderPain) {
    for (const row of db.prepare(`
      SELECT id FROM exercises
      WHERE shoulder_safe = 0
         OR equipment LIKE '%élastique%'
         OR name = 'Gainage latéral simplifié'
    `).all()) ids.add(row.id);
  }
  if (footPain) {
    for (const row of db.prepare("SELECT id FROM exercises WHERE name = 'Marche douce'").all()) ids.add(row.id);
  }
  return { ids, shoulderPain, footPain };
}

function exerciseByName(name) {
  return db.prepare(`
    SELECT e.*, p.current_duration_seconds, p.current_repetitions, p.current_sets, p.current_level
    FROM exercises e
    LEFT JOIN progression p ON p.exercise_id = e.id
    WHERE e.name = ?
  `).get(name);
}

export function getOrCreateTodayWorkout() {
  const date = todayIso();
  const existing = db.prepare('SELECT * FROM workouts WHERE date = ? ORDER BY id DESC LIMIT 1').get(date);
  if (existing) return hydrateWorkout(existing.id);

  const day = new Date(`${date}T12:00:00`).getDay();
  const { ids, shoulderPain, footPain } = blockedExerciseIds();
  const settings = getSettings();
  const names = plans[day] || plans[0];
  const selected = [];

  for (const name of names) {
    const exercise = exerciseByName(name);
    if (!exercise || ids.has(exercise.id)) continue;
    if (footPain && exercise.name === 'Marche douce') {
      const bike = exerciseByName('Vélo d’appartement');
      if (bike && !ids.has(bike.id)) selected.push(bike);
      continue;
    }
    selected.push(exercise);
  }

  if (shoulderPain) {
    const safeNames = ['Respiration abdominale', 'Talon glissé', 'Serrage des omoplates', 'Gainage contre un mur'];
    for (const name of safeNames) {
      const safe = exerciseByName(name);
      if (safe && !selected.some((item) => item.id === safe.id) && !ids.has(safe.id)) selected.push(safe);
    }
  }

  const planned = selected.map((exercise) => ({
    ...exercise,
    planned_duration_seconds: exercise.current_duration_seconds ?? exercise.base_duration_seconds,
    planned_repetitions: exercise.current_repetitions ?? exercise.base_repetitions,
    planned_sets: exercise.current_sets ?? exercise.default_sets,
    rest_seconds: exercise.default_rest_seconds || settings.defaultRestSeconds || 30
  }));

  const workout = db.prepare(`
    INSERT INTO workouts (date, planned_duration, created_at)
    VALUES (?, ?, ?)
  `).run(date, plannedMinutes(planned), nowIso());

  const insert = db.prepare(`
    INSERT INTO workout_exercises (
      workout_id, exercise_id, planned_duration_seconds, planned_repetitions,
      planned_sets, rest_seconds, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of planned) {
    insert.run(workout.lastInsertRowid, item.id, item.planned_duration_seconds, item.planned_repetitions, item.planned_sets, item.rest_seconds, nowIso());
  }
  return hydrateWorkout(workout.lastInsertRowid);
}

export function hydrateWorkout(workoutId) {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId);
  const exercises = db.prepare(`
    SELECT we.*, e.name, e.category, e.body_area, e.description, e.instructions, e.precautions, e.image_path,
           e.equipment, e.shoulder_safe, e.foot_safe, e.easy_variant, e.hard_variant, e.progression_rule
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    WHERE we.workout_id = ?
    ORDER BY we.id ASC
  `).all(workoutId);
  const next = exercises.find((exercise) => !exercise.completed && !exercise.skipped);
  return { ...workout, exercises, currentExerciseId: next?.id || null };
}

export function weeklySummary() {
  return db.prepare(`
    SELECT
      COUNT(CASE WHEN completed = 1 THEN 1 END) AS completedSessions,
      COALESCE(SUM(CASE WHEN completed = 1 THEN planned_duration ELSE 0 END), 0) AS activeMinutes
    FROM workouts
    WHERE date >= date('now', 'weekday 1', '-7 days')
  `).get();
}

export function recordFeedback({ workoutId, exerciseId, feedbackType, painLocation }) {
  const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(exerciseId);
  const workoutExercise = db.prepare('SELECT * FROM workout_exercises WHERE workout_id = ? AND exercise_id = ? ORDER BY id DESC LIMIT 1').get(workoutId, exerciseId);
  db.prepare(`
    INSERT INTO exercise_feedback (exercise_id, workout_id, feedback_type, pain_location, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(exerciseId, workoutId, feedbackType, painLocation || null, nowIso());

  if (workoutExercise) {
    db.prepare(`
      UPDATE workout_exercises
      SET completed = ?, skipped = ?, feedback = ?, pain_reported = ?, pain_location = ?, completed_sets = ?
      WHERE id = ?
    `).run(feedbackType === 'completed' || feedbackType === 'too_easy' || feedbackType === 'too_hard' ? 1 : 0, feedbackType === 'skipped' ? 1 : 0, feedbackType, feedbackType === 'pain' ? 1 : 0, painLocation || null, workoutExercise.planned_sets, workoutExercise.id);
  }

  if (feedbackType === 'pain') {
    db.prepare('UPDATE workouts SET pain_reported = 1 WHERE id = ?').run(workoutId);
  }
  applyExerciseProgression(exercise, feedbackType);
}

function applyExerciseProgression(exercise, feedbackType) {
  const progression = db.prepare('SELECT * FROM progression WHERE exercise_id = ?').get(exercise.id);
  if (!progression) return;

  let duration = progression.current_duration_seconds;
  let reps = progression.current_repetitions;
  let sets = progression.current_sets;

  if (feedbackType === 'too_hard' || feedbackType === 'pain') {
    if (duration) duration = Math.max(5, Math.round(duration * (feedbackType === 'pain' && exercise.category === 'haut du corps' ? 0.7 : 0.8)));
    if (reps) reps = Math.max(3, Math.round(reps * (feedbackType === 'pain' && exercise.category === 'haut du corps' ? 0.7 : 0.8)));
  }

  if (feedbackType === 'too_easy') {
    const easyCount = db.prepare(`
      SELECT COUNT(*) AS count FROM (
        SELECT feedback_type FROM exercise_feedback
        WHERE exercise_id = ? AND feedback_type = 'too_easy'
        ORDER BY created_at DESC LIMIT 2
      )
    `).get(exercise.id).count;
    if (easyCount >= 2) {
      if (duration) duration += 5;
      else if (reps) reps += 2;
      else sets += 1;
    }
  }

  db.prepare(`
    UPDATE progression
    SET current_duration_seconds = ?, current_repetitions = ?, current_sets = ?, last_updated = ?
    WHERE exercise_id = ?
  `).run(duration, reps, sets, nowIso(), exercise.id);
}

export function recalculateProgression() {
  const weekly = weeklySummary();
  const painCount = db.prepare(`
    SELECT COUNT(*) AS count FROM exercise_feedback
    WHERE feedback_type = 'pain' AND date(created_at) >= date('now', '-7 days')
  `).get().count;

  if (weekly.completedSessions >= 3 && painCount === 0) {
    const wall = exerciseByName('Gainage contre un mur');
    if (wall) {
      db.prepare(`
        UPDATE progression
        SET current_duration_seconds = COALESCE(current_duration_seconds, ?) + 5,
            last_updated = ?
        WHERE exercise_id = ?
      `).run(wall.base_duration_seconds || 20, nowIso(), wall.id);
    }
    return { changed: true, message: 'Gainage augmenté de 5 secondes pour la semaine suivante.' };
  }
  return { changed: false, message: 'Progression conservée : régularité ou absence de douleur insuffisante.' };
}
