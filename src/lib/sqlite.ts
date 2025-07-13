import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { hashPassword } from './auth';

const dbPath = path.join(process.cwd(), 'data', 'app.db');

type DbInstance = InstanceType<typeof Database>;

// Use global variables to store the database instance promise and a queue for serializing access.
// This ensures the database is only initialized once and accessed sequentially.
declare global {
  var __dbPromise: Promise<DbInstance> | undefined;
  var __dbQueue: Promise<any> | undefined;
}

let dbQueue: Promise<any> = Promise.resolve(); // Initialize with a resolved promise

const initializeDb = async (): Promise<DbInstance> => {
  if (globalThis.__dbPromise) {
    console.log("Reusing existing SQLite database connection promise.");
    return globalThis.__dbPromise;
  }

  const initPromise = new Promise<DbInstance>((resolve, reject) => {
    try {
      // Create the 'data' directory if it doesn't exist
      if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
        fs.mkdirSync(path.join(process.cwd(), 'data'));
        console.log("Data directory created.");
      }

      const db = new Database(dbPath);
      db.pragma('journal_mode = WAL'); // Improve concurrency and robustness
      console.log("SQLite database opened at:", dbPath);

      // Initialisation de la base de données (synchronous operations)
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

      console.log("SQLite database initialization complete.");
      resolve(db);
    } catch (error) {
      console.error("FATAL ERROR: Failed to initialize SQLite database:", error);
      reject(error);
    }
  });

  globalThis.__dbPromise = initPromise;
  return initPromise;
};

// Initialize the database promise immediately
const dbPromise = initializeDb();

// Wrapper function to serialize database access
const execute = async <T>(fn: (db: DbInstance) => T): Promise<T> => {
  // Ensure DB is initialized before queuing operations
  const currentDb = await dbPromise;
  dbQueue = dbQueue.then(() => {
    try {
      return fn(currentDb);
    } catch (e) {
      return Promise.reject(e);
    }
  });
  return dbQueue as Promise<T>;
};

// Export an object with methods that use the serialized executor
const dbWrapper = {
  prepare: (sql: string) => {
    // Prepare statement after DB is ready, then wrap its methods in the queue
    const stmtPromise = dbPromise.then(db => db.prepare(sql));
    return {
      run: async (...params: any[]) => execute(async (db) => (await stmtPromise).run(...params)),
      get: async (...params: any[]) => execute(async (db) => (await stmtPromise).get(...params)),
      all: async (...params: any[]) => execute(async (db) => (await stmtPromise).all(...params)),
    };
  },
  exec: async (sql: string) => execute(async (db) => db.exec(sql)),
};

export default dbWrapper;