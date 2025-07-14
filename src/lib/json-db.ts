import fs from 'fs/promises';
import path from 'path';
import { hashPassword } from './auth';
import { User, Activity } from '@/types';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

interface DatabaseSchema {
  users: User[];
  activities: Activity[];
}

async function readDb(): Promise<DatabaseSchema> {
  try {
    const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File does not exist, initialize it with default admin user
      await fs.mkdir(path.dirname(DB_FILE_PATH), { recursive: true });
      const initialData: DatabaseSchema = {
        users: [
          {
            id: 1,
            email: "admin@example.com",
            name: "admin",
            password: hashPassword("admin"), // Hash the password
            role: "admin"
          }
        ],
        activities: []
      };
      await writeDb(initialData);
      return initialData;
    }
    console.error("Error reading database file:", error);
    throw new Error("Failed to read database.");
  }
}

async function writeDb(data: DatabaseSchema): Promise<void> {
  try {
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing database file:", error);
    throw new Error("Failed to write to database.");
  }
}

export { readDb, writeDb };