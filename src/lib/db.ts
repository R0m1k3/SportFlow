import { Activity, User } from "@/types";

const DB_NAME = "ActivityTrackerDB";
const DB_VERSION = 2; // Version incrémentée pour forcer la mise à jour du schéma
const USERS_STORE = "users";
const ACTIVITIES_STORE = "activities";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction;

      // Créer le store des utilisateurs s'il n'existe pas
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        const userStore = db.createObjectStore(USERS_STORE, { keyPath: "id", autoIncrement: true });
        userStore.createIndex("email", "email", { unique: true });
        userStore.createIndex("name", "name", { unique: true });
        
        // Ajouter l'utilisateur admin uniquement lors de la création du store
        if (transaction) {
          const store = transaction.objectStore(USERS_STORE);
          store.add({ email: "admin@example.com", name: "admin", password: "admin", role: "admin" });
        }
      }

      // Créer le store des activités s'il n'existe pas
      if (!db.objectStoreNames.contains(ACTIVITIES_STORE)) {
        const activityStore = db.createObjectStore(ACTIVITIES_STORE, { keyPath: "id", autoIncrement: true });
        activityStore.createIndex("userEmail_date", ["userEmail", "date"], { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      console.error("Database error:", (event.target as IDBOpenDBRequest).error);
      reject("Database error: " + (event.target as IDBOpenDBRequest).error);
    };
  });
}

async function getStore(storeName: string, mode: IDBTransactionMode) {
  const db = await openDB();
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

// User Functions
export async function getUsers(): Promise<User[]> {
  const store = await getStore(USERS_STORE, "readonly");
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getUserByName(name: string): Promise<User | undefined> {
    const users = await getUsers();
    return users.find(user => user.name === name);
}

export async function addUser(user: Omit<User, 'id'>): Promise<IDBValidKey> {
  const store = await getStore(USERS_STORE, "readwrite");
  return new Promise((resolve, reject) => {
    const request = store.add(user);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateUser(user: User): Promise<IDBValidKey> {
  const store = await getStore(USERS_STORE, "readwrite");
  return new Promise((resolve, reject) => {
    const request = store.put(user);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteUser(userId: number): Promise<void> {
  const store = await getStore(USERS_STORE, "readwrite");
  return new Promise((resolve, reject) => {
    const request = store.delete(userId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Activity Functions
export async function getActivities(userEmail: string): Promise<Activity[]> {
  const store = await getStore(ACTIVITIES_STORE, "readonly");
  const index = store.index("userEmail_date");
  const range = IDBKeyRange.bound([userEmail, ''], [userEmail, new Date(8640000000000000).toISOString()]);
  return new Promise((resolve, reject) => {
    const request = index.getAll(range);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addActivity(activity: Omit<Activity, 'id'>): Promise<IDBValidKey> {
  const store = await getStore(ACTIVITIES_STORE, "readwrite");
  return new Promise((resolve, reject) => {
    const request = store.add(activity);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}