import { getItem, removeItem, setItem } from "./storage";

const storageKeys = {
  theme: `lms:theme`,
  sidebarState: `lms:sidebar`,
  courseDraft: `lms:course`,
  bookDraft: `lms:book`,
  editorLayout: `lms:editor:layout`,
  checkoutData: `lms:checkout:data`,
};

export const courseDraftStorage = {
  get<T>() {
    return getItem<T>(storageKeys.courseDraft);
  },

  save(draft: unknown): void {
    setItem(storageKeys.courseDraft, draft);
  },

  clear() {
    removeItem(storageKeys.courseDraft);
  },
};

export const bookDraftStorage = {
  get<T>() {
    return getItem<T>(storageKeys.bookDraft);
  },

  save(draft: unknown): void {
    setItem(storageKeys.bookDraft, draft);
  },

  clear() {
    removeItem(storageKeys.bookDraft);
  },
};

export const checkoutDataStorage = {
  get<T>() {
    return getItem<T>(storageKeys.checkoutData);
  },

  save(data: unknown): void {
    setItem(storageKeys.checkoutData, data);
  },

  clear() {
    removeItem(storageKeys.checkoutData);
  },
};
