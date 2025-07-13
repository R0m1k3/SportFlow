import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { hashPassword } from './auth'; // Assurez-vous que le chemin est correct

const dbPath = path.join(process.cwd(), 'data', 'app.db');

// Créer le répertoire 'data' si il n'existe pas
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL'); // Améliore la concurrence et la robustesse

// Initialisation de la base de données
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userEmail TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    duration INTEGER NOT NULL
  );
`);

// Ajouter l'utilisateur admin si la table est vide
const adminCount = db.prepare("SELECT COUNT(*) FROM users WHERE email = 'admin@example.com'").get() as { 'COUNT(*)': number };
if (adminCount['COUNT(*)'] === 0) {
  const hashedPassword = hashPassword("admin");
  db.prepare("INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)").run(
    "admin@example.com",
    "admin",
    hashedPassword,
    "admin"
  );
  console.log("Admin user added to SQLite database.");
}

export default db;