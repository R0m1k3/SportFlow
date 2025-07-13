import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { hashPassword } from './auth';

const dbPath = path.join(process.cwd(), 'data', 'app.db');

type DbInstance = InstanceType<typeof Database>;

// Use global variables to store the database instance and a queue for serializing access.
// This ensures the database is only initialized once and accessed sequentially.
declare global {
  var __db: DbInstance | undefined;
  var __dbQueue: Promise<any> | undefined;
}

let db: DbInstance;
let dbQueue: Promise<any> = Promise.resolve(); // Initialize with a resolved promise

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
    globalThis.__dbQueue = dbQueue; // Store the queue globally too

  } catch (error) {
    console.error("FATAL ERROR: Failed to initialize SQLite database:", error);
    // Re-throw the error to ensure the process exits or crashes visibly
    throw error;
  }
} else {
  db = globalThis.__db;
  dbQueue = globalThis.__dbQueue || Promise.resolve(); // Retrieve existing queue
  console.log("Reusing existing SQLite database connection.");
}

// Wrapper function to serialize database access
const execute = async <T>(fn: (db: DbInstance) => T): Promise<T> => {
  // Enqueue the operation
  dbQueue = dbQueue.then(() => {
    try {
      return fn(db);
    } catch (e) {
      return Promise.reject(e);
    }
  });
  return dbQueue as Promise<T>; // Return the promise for the current operation
};

// Export an object with methods that use the serialized executor
const dbWrapper = {
  prepare: (sql: string) => {
    // Prepare statement synchronously, but execute operations asynchronously via the queue
    const stmt = db.prepare(sql);
    return {
      run: async (...params: any[]) => execute(() => stmt.run(...params)),
      get: async (...params: any[]) => execute(() => stmt.get(...params)),
      all: async (...params: any[]) => execute(() => stmt.all(...params)),
    };
  },
  exec: async (sql: string) => execute(() => db.exec(sql)),
};

export default dbWrapper;