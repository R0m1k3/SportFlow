import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { db, getSettings, getUser, migrate, nowIso, setSetting } from './db.js';
import { renderExerciseSvg } from './illustrations.js';
import { seed } from './seed.js';
import { getOrCreateTodayWorkout, hydrateWorkout, recalculateProgression, recordFeedback, weeklySummary } from './workouts.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const root = process.cwd();

migrate();
seed();

app.use(cors());
app.use(express.json());

app.get('/exercises/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const imagePath = path.join(root, 'public', 'exercises', filename);
  if (fs.existsSync(imagePath)) return res.sendFile(imagePath);
  res.type('image/svg+xml').send(renderExerciseSvg(filename));
});

app.get('/api/today', (_req, res) => {
  const workout = getOrCreateTodayWorkout();
  res.json({ workout, user: getUser(), settings: getSettings(), weekly: weeklySummary() });
});

app.post('/api/workout/:id/start', (req, res) => {
  db.prepare('UPDATE workouts SET started_at = ? WHERE id = ?').run(nowIso(), req.params.id);
  res.json(hydrateWorkout(req.params.id));
});

app.post('/api/workout/:id/complete', (req, res) => {
  db.prepare('UPDATE workouts SET completed = 1, completed_at = ?, feedback = ? WHERE id = ?').run(nowIso(), req.body?.feedback || 'completed', req.params.id);
  res.json({ workout: hydrateWorkout(req.params.id), progression: recalculateProgression() });
});

app.post('/api/exercise/:id/feedback', (req, res) => {
  recordFeedback({
    workoutId: req.body.workoutId,
    exerciseId: Number(req.params.id),
    feedbackType: req.body.feedbackType,
    painLocation: req.body.painLocation
  });
  res.json({ ok: true, workout: hydrateWorkout(req.body.workoutId) });
});

app.get('/api/exercises', (_req, res) => {
  res.json(db.prepare(`
    SELECT e.*, p.current_duration_seconds, p.current_repetitions, p.current_sets, p.current_level
    FROM exercises e
    LEFT JOIN progression p ON p.exercise_id = e.id
    ORDER BY e.category, e.id
  `).all());
});

app.get('/api/history', (_req, res) => {
  const workouts = db.prepare('SELECT * FROM workouts ORDER BY date DESC, id DESC LIMIT 90').all();
  const details = db.prepare(`
    SELECT we.*, e.name, e.category
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    WHERE we.workout_id = ?
    ORDER BY we.id
  `);
  res.json(workouts.map((workout) => ({ ...workout, exercises: details.all(workout.id) })));
});

app.get('/api/stats', (_req, res) => {
  const weekly = db.prepare(`
    SELECT strftime('%Y-%W', date) AS week, COUNT(*) AS sessions, SUM(planned_duration) AS minutes
    FROM workouts
    WHERE completed = 1
    GROUP BY week
    ORDER BY week DESC
    LIMIT 8
  `).all().reverse();
  const feedback = db.prepare(`
    SELECT feedback_type, COUNT(*) AS count
    FROM exercise_feedback
    GROUP BY feedback_type
  `).all();
  const progression = db.prepare(`
    SELECT e.name, e.category, p.current_duration_seconds, p.current_repetitions, p.current_sets, p.current_level
    FROM progression p
    JOIN exercises e ON e.id = p.exercise_id
    ORDER BY e.id
  `).all();
  const totals = db.prepare(`
    SELECT COUNT(*) AS completedSessions, COALESCE(SUM(planned_duration), 0) AS activeMinutes
    FROM workouts
    WHERE completed = 1
  `).get();
  res.json({ weekly, feedback, progression, totals });
});

app.get('/api/settings', (_req, res) => {
  res.json({ user: getUser(), settings: getSettings() });
});

app.post('/api/settings', (req, res) => {
  const { user, settings } = req.body;
  if (user) {
    db.prepare(`
      UPDATE users
      SET first_name = ?, age = ?, start_weight = ?, current_weight = ?, target_weight = ?
      WHERE id = 1
    `).run(user.first_name, user.age, user.start_weight || null, user.current_weight || null, user.target_weight || null);
  }
  if (settings) {
    for (const [key, value] of Object.entries(settings)) setSetting(key, value);
  }
  res.json({ user: getUser(), settings: getSettings() });
});

app.get('/api/progression', (_req, res) => {
  res.json(db.prepare(`
    SELECT p.*, e.name, e.category
    FROM progression p
    JOIN exercises e ON e.id = p.exercise_id
    ORDER BY e.id
  `).all());
});

app.post('/api/progression/recalculate', (_req, res) => {
  res.json(recalculateProgression());
});

const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(port, '0.0.0.0', () => {
  console.log(`SportFlow disponible sur http://0.0.0.0:${port}`);
});
