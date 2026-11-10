import { GameSave, SaveMetadata } from '../types/game';

const DB_NAME = 'SantakoFutbolDB';
const DB_VERSION = 1;
const SAVES_STORE = 'saves';
const APP_STATE_STORE = 'app_state';

// Helper to open IndexedDB with Promise
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este navegador.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SAVES_STORE)) {
        db.createObjectStore(SAVES_STORE, { keyPath: 'metadata.id' });
      }
      if (!db.objectStoreNames.contains(APP_STATE_STORE)) {
        db.createObjectStore(APP_STATE_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// LocalStorage fallback in case of strict sandboxing
const LS_PREFIX = 'santako_save_';
const LS_LAST_KEY = 'santako_last_active_save_id';

export async function getAllSaveMetadata(): Promise<SaveMetadata[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SAVES_STORE, 'readonly');
      const store = tx.objectStore(SAVES_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const saves = req.result as GameSave[];
        const metadatas = saves
          .map((s) => s.metadata)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(metadatas);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB falló, usando fallback de LocalStorage:', err);
    const metadatas: SaveMetadata[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LS_PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item && item.metadata) {
            metadatas.push(item.metadata);
          }
        } catch {
          // Ignore invalid parse
        }
      }
    }
    return metadatas.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}

export async function getSaveById(id: string): Promise<GameSave | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SAVES_STORE, 'readonly');
      const store = tx.objectStore(SAVES_STORE);
      const req = store.get(id);

      req.onsuccess = () => {
        resolve(req.result ? (req.result as GameSave) : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB get error, trying LocalStorage:', err);
    const raw = localStorage.getItem(`${LS_PREFIX}${id}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function saveGame(save: GameSave): Promise<void> {
  const updatedSave: GameSave = {
    ...save,
    metadata: {
      ...save.metadata,
      updatedAt: new Date().toISOString(),
      currentDate: save.currentDate,
      currentSeason: save.currentSeason,
    },
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(SAVES_STORE, 'readwrite');
      const store = tx.objectStore(SAVES_STORE);
      const req = store.put(updatedSave);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB put error, saving to LocalStorage:', err);
    localStorage.setItem(`${LS_PREFIX}${updatedSave.metadata.id}`, JSON.stringify(updatedSave));
  }

  await setLastActiveSaveId(updatedSave.metadata.id);
}

export async function deleteSaveById(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(SAVES_STORE, 'readwrite');
      const store = tx.objectStore(SAVES_STORE);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete error, removing from LocalStorage:', err);
    localStorage.removeItem(`${LS_PREFIX}${id}`);
  }

  const lastId = await getLastActiveSaveId();
  if (lastId === id) {
    await setLastActiveSaveId(null);
  }
}

export async function duplicateSave(id: string, newCustomName?: string): Promise<GameSave> {
  const original = await getSaveById(id);
  if (!original) {
    throw new Error('Partida original no encontrada');
  }

  const newId = `save_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const duplicated: GameSave = {
    ...original,
    metadata: {
      ...original.metadata,
      id: newId,
      saveName: newCustomName || `${original.metadata.saveName} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  await saveGame(duplicated);
  return duplicated;
}

export async function renameSave(id: string, newName: string): Promise<void> {
  const save = await getSaveById(id);
  if (!save) throw new Error('Partida no encontrada');

  save.metadata.saveName = newName.trim();
  await saveGame(save);
}

export async function getLastActiveSaveId(): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(APP_STATE_STORE, 'readonly');
      const store = tx.objectStore(APP_STATE_STORE);
      const req = store.get('last_active_save');

      req.onsuccess = () => {
        resolve(req.result ? req.result.value : localStorage.getItem(LS_LAST_KEY));
      };
      req.onerror = () => {
        resolve(localStorage.getItem(LS_LAST_KEY));
      };
    });
  } catch {
    return localStorage.getItem(LS_LAST_KEY);
  }
}

export async function setLastActiveSaveId(id: string | null): Promise<void> {
  if (id) {
    localStorage.setItem(LS_LAST_KEY, id);
  } else {
    localStorage.removeItem(LS_LAST_KEY);
  }

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(APP_STATE_STORE, 'readwrite');
      const store = tx.objectStore(APP_STATE_STORE);
      const req = store.put({ key: 'last_active_save', value: id });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore app state write errors in sandboxed environments
  }
}

export async function clearActiveSaveId(): Promise<void> {
  await setLastActiveSaveId(null);
}

// Export a game save as a downloadable JSON file
export function exportSaveToFile(save: GameSave): void {
  const jsonString = JSON.stringify(save, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  const sanitizedName = save.metadata.saveName.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.href = url;
  a.download = `SantakoFutbol_${sanitizedName}_${dateStr}.santako.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import and validate a game save JSON file
export async function importSaveFromFile(file: File): Promise<GameSave> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          throw new Error('El archivo seleccionado está vacío.');
        }

        const parsed = JSON.parse(text) as GameSave;

        // Validation of essential keys
        if (
          !parsed.version ||
          !parsed.metadata ||
          !parsed.manager ||
          !parsed.userClubId ||
          !parsed.clubs ||
          !parsed.players ||
          !parsed.competitions
        ) {
          throw new Error('El archivo no contiene una partida válida de SANTAKO FÚTBOL.');
        }

        // Generate a fresh unique save ID to prevent accidental collision
        const importedId = `save_imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        parsed.metadata.id = importedId;
        parsed.metadata.saveName = `${parsed.metadata.saveName} (Importada)`;
        parsed.metadata.updatedAt = new Date().toISOString();

        await saveGame(parsed);
        resolve(parsed);
      } catch (err: any) {
        reject(new Error(err?.message || 'Error al procesar el archivo de partida.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsText(file);
  });
}
