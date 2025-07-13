import { Activity, User } from "@/types";
import { hashPassword } from "./auth";

const DB_NAME = "ActivityTrackerDB";
const DB_VERSION = 8; // Version incrémentée pour forcer la mise à jour de la structure
const USERS_STORE = "users";
const ACTIVITIES_STORE = "activities";

let dbPromise: Promise<IDBDatabase>;

function getDbInstance(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Database error:", (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log(`IndexedDB upgrade needed. Old version: ${event.oldVersion}, New version: ${event.newVersion}`);

      // Crée les stores uniquement s'ils n'existent pas déjà
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        console.log(`Creating ${USERS_STORE} object store.`);
        const userStore = db.createObjectStore(USERS_STORE, { keyPath: "id", autoIncrement: true });
        userStore.createIndex("email", "email", { unique: true });
        userStore.createIndex("name", "name", { unique: true });
      } else {
        console.log(`${USERS_STORE} object store already exists.`);
      }

      if (!db.objectStoreNames.contains(ACTIVITIES_STORE)) {
        console.log(`Creating ${ACTIVITIES_STORE} object store.`);
        const activityStore = db.createObjectStore(ACTIVITIES_STORE, { keyPath: "id", autoIncrement: true });
        activityStore.createIndex("userEmail_date", ["userEmail", "date"], { unique: false });
      } else {
        console.log(`${ACTIVITIES_STORE} object store already exists.`);
      }
    };

    request.onsuccess = async (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      try {
        // Vérifie si l'utilisateur admin existe et l'ajoute si ce n'est pas le cas
        const transaction = db.transaction(USERS_STORE, "readwrite");
        const store = transaction.objectStore(USERS_STORE);
        const countRequest = store.count();

        countRequest.onsuccess = () => {
          if (countRequest.result === 0) {
            // Le store des utilisateurs est vide, ajoute l'utilisateur admin
            store.add({ email: "admin@example.com", name: "admin", password: hashPassword("admin"), role: "admin" });
            console.log("Admin user added on initial database creation.");
          }
        };
        countRequest.onerror = (e) => console.error("Error counting users:", e);

        resolve(db);
      } catch (error) {
        console.error("Error during onsuccess processing:", error);
        reject(error);
      }
    };
  });

  return dbPromise;
}

async function getStore(storeName: string, mode: IDBTransactionMode) {
  const db = await getDbInstance();
  return db.transaction(storeName, mode).objectStore(storeName);
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getUsers(): Promise<User[]> {
  const store = await getStore(USERS_STORE, "readonly");
  return promisifyRequest(store.getAll());
}

export async function getUserByName(name: string): Promise<User | undefined> {
  const store = await getStore(USERS_STORE, "readonly");
  const index = store.index("name");
  return promisifyRequest(index.get(name));
}

export async function addUser(user: Omit<User, 'id'>): Promise<IDBValidKey> {
  const store = await getStore(USERS_STORE, "readwrite");
  const userToStore = {
    ...user,
    password: hashPassword(user.password),
  };
  return promisifyRequest(store.add(userToStore));
}

export async function updateUser(user: User): Promise<IDBValidKey> {
    const db = await getDbInstance();
    const transaction = db.transaction(USERS_STORE, "readwrite");
    const store = transaction.objectStore(USERS_STORE);

    const existingUser = await promisifyRequest<User | undefined>(store.get(user.id!));

    if (!existingUser) {
        throw new Error("User not found");
    }

    const userToUpdate: User = {
        ...existingUser,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    // Only hash and update password if a new one is provided
    if (user.password) {
        userToUpdate.password = hashPassword(user.password);
    }

    return promisifyRequest(store.put(userToUpdate));
}

export async function deleteUser(userId: number): Promise<void> {
  const store = await getStore(USERS_STORE, "readwrite");
  const request = store.delete(userId);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getActivities(userEmail: string): Promise<Activity[]> {
  const store = await getStore(ACTIVITIES_STORE, "readonly");
  const index = store.index("userEmail_date");
  const range = IDBKeyRange.bound([userEmail, ''], [userEmail, new Date(8640000000000000).toISOString()]);
  return promisifyRequest(index.getAll(range));
}

export async function addActivity(activity: Omit<Activity, 'id'>): Promise<IDBValidKey> {
  const store = await getStore(ACTIVITIES_STORE, "readwrite");
  return promisifyRequest(store.add(activity));
}