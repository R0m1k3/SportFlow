import { Activity, User } from "@/types";

const DB_NAME = "ActivityTrackerDB";
const DB_VERSION = 5; // Version incrémentée pour forcer la mise à jour du schéma
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

      // Supprimer les anciens magasins d'objets s'ils existent pour repartir de zéro
      if (db.objectStoreNames.contains(USERS_STORE)) {
        db.deleteObjectStore(USERS_STORE);
      }
      if (db.objectStoreNames.contains(ACTIVITIES_STORE)) {
        db.deleteObjectStore(ACTIVITIES_STORE);
      }

      // Créer le magasin Users et l'utilisateur admin
      const userStore = db.createObjectStore(USERS_STORE, { keyPath: "id", autoIncrement: true });
      userStore.createIndex("email", "email", { unique: true });
      userStore.createIndex("name", "name", { unique: true });
      // Insérer les données initiales dans la même transaction de mise à jour
      userStore.add({ email: "admin@example.com", name: "admin", password: "admin", role: "admin" });

      // Créer le magasin Activities
      const activityStore = db.createObjectStore(ACTIVITIES_STORE, { keyPath: "id", autoIncrement: true });
      activityStore.createIndex("userEmail_date", ["userEmail", "date"], { unique: false });
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
  });

  return dbPromise;
}

async function getStore(storeName: string, mode: IDBTransactionMode) {
  const db = await getDbInstance();
  return db.transaction(storeName, mode).objectStore(storeName);
}

// --- Promise Wrapper ---
function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- User Functions ---
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
  return promisifyRequest(store.add(user));
}

export async function updateUser(user: User): Promise<IDBValidKey> {
  const store = await getStore(USERS_STORE, "readwrite");
  return promisifyRequest(store.put(user));
}

export async function deleteUser(userId: number): Promise<void> {
  const store = await getStore(USERS_STORE, "readwrite");
  const request = store.delete(userId);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// --- Activity Functions ---
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