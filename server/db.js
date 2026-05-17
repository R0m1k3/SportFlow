import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'sportflow.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

export function migrate() {
  db.exec(fs.readFileSync(path.join(process.cwd(), 'server', 'schema.sql'), 'utf8'));
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function nowIso() {
  return new Date().toISOString();
}

export function getUser() {
  return db.prepare('SELECT * FROM users WHERE id = 1').get();
}

export function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  return Object.fromEntries(rows.map((row) => [row.key, JSON.parse(row.value)]));
}

export function setSetting(key, value) {
  db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, JSON.stringify(value), nowIso());
}

export function recentPain(days = 7) {
  return db.prepare(`
    SELECT ef.*, e.body_area, e.name, e.category
    FROM exercise_feedback ef
    JOIN exercises e ON e.id = ef.exercise_id
    WHERE ef.feedback_type = 'pain'
      AND date(ef.created_at) >= date('now', ?)
  `).all(`-${days} days`);
}
