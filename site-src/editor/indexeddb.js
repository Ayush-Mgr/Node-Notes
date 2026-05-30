const DB_NAME = "NodeNotesDB";
const DB_VERSION = 2;
const STORE_NAME = "pendingAssets";
const META_STORE = "noteMetadata";

let dbInstance = null;

export function initPendingAssetDb() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB open error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "pendingId" });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "path" });
      }
    };
  });
}

export async function savePendingAsset(asset) {
  const db = await initPendingAssetDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(asset);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function loadPendingAssets() {
  const db = await initPendingAssetDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function deletePendingAsset(id) {
  const db = await initPendingAssetDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

// --- Note Metadata Cache ---
// Each record: { path, sha, frontmatterDate, tags, outgoing_links }
// frontmatterDate: ISO date string or null if missing in frontmatter
// tags: string[] or []
// outgoing_links: string[] or []

export async function saveNoteMetadata(metadata) {
  const db = await initPendingAssetDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([META_STORE], "readwrite");
    const store = transaction.objectStore(META_STORE);
    const request = store.put(metadata);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function loadAllNoteMetadata() {
  const db = await initPendingAssetDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([META_STORE], "readonly");
    const store = transaction.objectStore(META_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function deleteNoteMetadata(path) {
  const db = await initPendingAssetDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([META_STORE], "readwrite");
    const store = transaction.objectStore(META_STORE);
    const request = store.delete(path);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}
