const isBrowser = () => typeof window !== "undefined";

export const getStorage = (): Storage | null => {
  if (!isBrowser()) return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export function setItem<T>(key: string, value: T): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`localStorage set failed for key: ${key}`, err);
  }
}

export function getItem<T>(key: string): T | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch {
    return null;
  }
}

export function removeItem(key: string): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(key);
  } catch {
    console.warn(`localStorage remove failed for key: ${key}`);
  }
}

export function clearStorage(): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.clear();
  } catch {
    console.warn("localStorage clear failed");
  }
}
