import { Activity, User } from "@/types";

const DB_NAME = "ActivityTrackerDB";
const DB_VERSION = 4; // Version incrémentée pour forcer la mise à jour du schéma
const USERS_STORE = "users";
const ACTIVITIES_STORE = "activities";

let dbPromise: Promise<IDBDatabase>;

function getDbInstance(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction;
      
      if (!transaction) {
        console.error("Upgrade transaction is null, cannot proceed.");
        reject(new Error("Upgrade transaction is null."));
        return;
      }

      // USERS store
      let userStore;
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        userStore = db.createObjectStore(USERS_STORE, { keyPath: "id", autoIncrement: true });
      } else {
        userStore = transaction.objectStore(USERS_STORE);
      }

      if (!userStore.indexNames.contains("email")) {
        userStore.createIndex("email", "email", { unique: true });
      }
      if (!userStore.indexNames.contains("name")) {
        userStore.createIndex("name", "name", { unique: true });
      }

      // ACTIVITIES store
      let activityStore;
      if (!db.objectStoreNames.contains(ACTIVITIES_STORE)) {
        activityStore = db.createObjectStore(ACTIVITIES_STORE, { keyPath: "id", autoIncrement: true });
      } else {
        activityStore = transaction.objectStore(ACTIVITIES_STORE);
      }

      if (!activityStore.indexNames.contains("userEmail_date")) {
        activityStore.createIndex("userEmail_date", ["userEmail", "date"], { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db); // Résoudre la promesse dès que la connexion est réussie.

      // Effectuer le "seeding" dans une transaction séparée.
      const seedTransaction = db.transaction(USERS_STORE, 'readwrite');
      const store = seedTransaction.objectStore(USERS_STORE);
      const adminRequest = store.index('name').get('admin');
      
      adminRequest.onsuccess = () => {
        if (!adminRequest.result) {
          store.add({ email: "admin@example.com", name: "admin", password: "admin", role: "admin" });
        }
      };
      
      seedTransaction.onerror = () => {
        console.error("La transaction de seeding a échoué:", seedTransaction.error);
      }
    };

    request.onerror = (event) => {
      console.error("Erreur d'ouverture de la base de données:", (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
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