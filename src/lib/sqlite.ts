import DatabaseConstructor, { Statement } from 'better-sqlite3'; // Import the default as DatabaseConstructor
import path from 'path';
import fs from 'fs';
import { hashPassword } from './auth';
import { Activity, ActivityType, User, UserRole } from '@/types';

// Define the type for the Database instance
type DatabaseInstance = InstanceType<typeof DatabaseConstructor>;

// Path to the database file
const dbFilePath = path.join(process.cwd(), 'data', 'app.db');
const dataDir = path.join(process.cwd(), 'data');

// Global variable to store the database instance
// This ensures it is initialized once and reused across requests
declare global {
  var __SQL_DB_INSTANCE: DatabaseInstance | undefined; // Use the new type alias
}

// Define the type for the result of a run operation
interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

// Define the type for the prepared statement wrapper
export interface WrappedStatement {
  run: (...params: any[]) => RunResult;
  get: (...params: any[]) => any | undefined; // better-sqlite3 returns object or undefined
  all: (...params: any[]) => any[]; // better-sqlite3 returns array of objects
}

// Function to get or initialize the database
const getDb = (): DatabaseInstance => { // Use the new type alias
  if (globalThis.__SQL_DB_INSTANCE) {
    console.log("Reusing existing SQLite database instance.");
    return globalThis.__SQL_DB_INSTANCE;
  }

  try {
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log("Data directory created.");
    }

    // Create a new database instance (or open existing)
    globalThis.__SQL_DB_INSTANCE = new DatabaseConstructor(dbFilePath); // Use DatabaseConstructor for instantiation
    console.log("SQLite database instance created/opened at:", dbFilePath);

    // Create tables if they don't exist
    globalThis.__SQL_DB_INSTANCE.exec(`
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

    // Add admin user if the table is empty
    const adminCountStmt = globalThis.__SQL_DB_INSTANCE.prepare("SELECT COUNT(*) FROM users WHERE email = 'admin@example.com'");
    const adminCount = (adminCountStmt.get() as { 'COUNT(*)': number })['COUNT(*)'] || 0; // better-sqlite3 returns object
    adminCountStmt.free(); // Release the statement
    
    if (adminCount === 0) {
      const hashedPassword = hashPassword("admin");
      const insertAdminStmt = globalThis.__SQL_DB_INSTANCE.prepare("INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)");
      insertAdminStmt.run("admin@example.com", "admin", hashedPassword, "admin"); // better-sqlite3 takes individual args
      insertAdminStmt.free(); // Release the statement
      console.log("Admin user added to SQLite database.");
    } else {
      console.log("Admin user already exists in SQLite database.");
    }

    // better-sqlite3 automatically persists changes to disk
    console.log("SQLite database initialized.");

    return globalThis.__SQL_DB_INSTANCE;
  } catch (error) {
    console.error("FATAL ERROR: Failed to initialize SQLite database:", error);
    // Clear instance on fatal error to force re-initialization on next attempt
    globalThis.__SQL_DB_INSTANCE = undefined;
    throw error;
  }
};

// Wrapper for database operations
const dbWrapper = {
  prepare: (sql: string): WrappedStatement => { // No longer async
    const currentDb = getDb();
    const stmt: Statement = currentDb.prepare(sql);
    return {
      run: (...params: any[]): RunResult => {
        const result = stmt.run(...params);
        return result as RunResult; // better-sqlite3's run returns { changes, lastInsertRowid }
      },
      get: (...params: any[]): any | undefined => stmt.get(...params), // Returns object or undefined
      all: (...params: any[]): any[] => stmt.all(...params), // Returns array of objects
    };
  },
  exec: (sql: string) => { // No longer async
    const currentDb = getDb();
    const result = currentDb.exec(sql);
    return result;
  },
};

export default dbWrapper;

// mapRowToUser and mapRowToActivity are no longer needed as better-sqlite3 returns objects directly.
// You can remove these exports if they are not used elsewhere.
// For now, keeping them commented out in case they are referenced.
// export { mapRowToUser, mapRowToActivity };