import { Activity, User } from "@/types";

const DB_NAME = "ActivityTrackerDB";
const DB_VERSION = 1;
const USERS_STORE = "users";
const ACTIVITIES_STORE = "activities";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        const userStore = db.createObjectStore(USERS_STORE, { keyPath: "id", autoIncrement: true });
        userStore.createIndex("email", "email", { unique: true });
      }
      if (!db.objectStoreNames.contains(ACTIVITIES_STORE)) {
        const activityStore = db.createObjectStore(ACTIVITIES_STORE, { keyPath: "id", autoIncrement: true });
        activityStore.createIndex("userEmail_date", ["userEmail", "date"], { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      const transaction = db.transaction(USERS_STORE, "readwrite");
      const store = transaction.objectStore(USERS_STORE);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        if (countRequest.result === 0) {
          // No users, add the default admin
          store.add({ email: "admin@example.com", name: "admin", password: "admin" });
        }
      };
      
      transaction.oncomplete = () => {
        // The transaction (either just counting, or counting and adding) is complete.
        // Now it's safe to resolve.
        resolve(db);
      };

      transaction.onerror = (event) => {
        reject("Database transaction error: " + (event.target as IDBTransaction).error);
      };
    };

    request.onerror = (event) => {
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

export async function deleteUser(id: number): Promise<void> {
  const store = await getStore(USERS_STORE, "readwrite");
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
    const store = await getStore(USERS_STORE, "readonly");
    const index = store.index("email");
    return new Promise((resolve, reject) => {
        const request = index.get(email);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getUserByName(name: string): Promise<User | undefined> {
    const users = await getUsers();
    return users.find(user => user.name === name);
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