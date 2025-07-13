import initSqlJs, { SqlJsStatic, Database, SqlValue, Statement } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { hashPassword } from './auth';
import { Activity, ActivityType, User, UserRole } from '@/types';

// Path to the database file
const dbFilePath = path.join(process.cwd(), 'data', 'app.db');
const dataDir = path.join(process.cwd(), 'data');

// Global variables to store the SQL.js instance and the database instance
declare global {
  var __SQL_JS_INSTANCE: SqlJsStatic | undefined;
  var __SQL_DB_INSTANCE: Database | undefined;
}

// Helper function to map a row array to a User object
const mapRowToUser = (row: SqlValue[]): User => ({
  id: row[0] as number,
  email: row[1] as string,
  name: row[2] as string,
  password: row[3] as string,
  role: row[4] as UserRole,
});

// Helper function to map a row array to an Activity object
const mapRowToActivity = (row: SqlValue[]): Activity => ({
  id: row[0] as number,
  userEmail: row[1] as string,
  date: row[2] as string,
  type: row[3] as ActivityType,
  duration: row[4] as number,
});

// Define the type for the result of a run operation
interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

// Define the type for the prepared statement wrapper
export interface WrappedStatement {
  run: (...params: any[]) => RunResult;
  get: (...params: any[]) => SqlValue[] | null;
  all: (...params: any[]) => SqlValue[][];
  finalize: () => void;
}

// Function to get or initialize the database
const getDb = async (): Promise<Database> => {
  if (globalThis.__SQL_DB_INSTANCE) {
    console.log("Reusing existing SQLite database instance.");
    return globalThis.__SQL_DB_INSTANCE;
  }

  try {
    // Initialize SQL.js library if not already done
    if (!globalThis.__SQL_JS_INSTANCE) {
      globalThis.__SQL_JS_INSTANCE = await initSqlJs({
        locateFile: (file: string) => `/sql-wasm.wasm`, // Path relative to public directory
      });
      console.log("SQL.js library initialized.");
    }

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log("Data directory created.");
    }

    let buffer: Buffer | undefined;
    // Load existing database file if it exists
    if (fs.existsSync(dbFilePath)) {
      buffer = fs.readFileSync(dbFilePath);
      console.log("Existing SQLite database loaded from:", dbFilePath);
    }

    // Create a new database instance (from buffer if loaded, otherwise empty)
    globalThis.__SQL_DB_INSTANCE = new globalThis.__SQL_JS_INSTANCE.Database(buffer);
    console.log("SQLite database instance created.");

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
    const adminCount = (adminCountStmt.get() as SqlValue[] | null)?.[0] as number || 0;
    adminCountStmt.free(); // Release the statement
    
    if (adminCount === 0) {
      const hashedPassword = hashPassword("admin");
      const insertAdminStmt = globalThis.__SQL_DB_INSTANCE.prepare("INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)");
      // Fix for Error 1: Pass arguments as an array
      insertAdminStmt.run(["admin@example.com", "admin", hashedPassword, "admin"]);
      insertAdminStmt.free(); // Release the statement
      console.log("Admin user added to SQLite database.");
    } else {
      console.log("Admin user already exists in SQLite database.");
    }

    // Save the database to disk after initialization/updates
    fs.writeFileSync(dbFilePath, Buffer.from(globalThis.__SQL_DB_INSTANCE.export()));
    console.log("SQLite database saved to disk after initialization.");

    return globalThis.__SQL_DB_INSTANCE;
  } catch (error) {
    console.error("FATAL ERROR: Failed to initialize SQLite database:", error);
    // Clear instances on fatal error to force re-initialization on next attempt
    globalThis.__SQL_JS_INSTANCE = undefined;
    globalThis.__SQL_DB_INSTANCE = undefined;
    throw error;
  }
};

// Wrapper for database operations
const dbWrapper = {
  prepare: async (sql: string): Promise<WrappedStatement> => {
    const currentDb = await getDb();
    const stmt: Statement = currentDb.prepare(sql);
    return {
      run: (...params: any[]): RunResult => {
        const result = stmt.run(...params) as any; 
        fs.writeFileSync(dbFilePath, Buffer.from(currentDb.export()));
        return result as RunResult;
      },
      get: (...params: any[]): SqlValue[] | null => stmt.get(...params),
      // Fix for Error 2: Cast to any to access 'all' method
      all: (...params: any[]): SqlValue[][] => (stmt as any).all(...params),
      finalize: () => stmt.free(),
    };
  },
  exec: async (sql: string) => {
    const currentDb = await getDb();
    const result = currentDb.exec(sql);
    // Persist changes to disk after every write operation
    fs.writeFileSync(dbFilePath, Buffer.from(currentDb.export()));
    return result;
  },
};

export default dbWrapper;

export { mapRowToUser, mapRowToActivity }; // Export helper functions