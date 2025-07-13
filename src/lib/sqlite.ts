import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { hashPassword } from './auth';

const dbPath = path.join(process.cwd(), 'data', 'app.db');

// Use InstanceType<typeof Database> for the type of the database instance
type DbInstance = InstanceType<typeof Database>;

// Use a global variable to store the database instance
// This ensures the database is only initialized once, even with hot module reloading
declare global {
  var __db: DbInstance | undefined;
}

let db: DbInstance;

if (!globalThis.__db) {
  try {
    // Create the 'data' directory if it doesn't exist
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'));
      console.log("Data directory created.");
    }

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Improve concurrency and robustness
    console.log("SQLite database opened at:", dbPath);

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
    console.log("Tables checked/created.");

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
    } else {
      console.log("Admin user already exists in SQLite database.");
    }

    console.log("SQLite database initialization complete. DB object exported.");
    globalThis.__db = db;

  } catch (error) {
    console.error("FATAL ERROR: Failed to initialize SQLite database:", error);
    // Re-throw the error to ensure the process exits or crashes visibly
    throw error;
  }
} else {
  db = globalThis.__db;
  console.log("Reusing existing SQLite database connection.");
}

export default db;