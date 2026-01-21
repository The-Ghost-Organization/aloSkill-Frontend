import { getItem, removeItem, setItem } from "./storage";

const storageKeys = {
  theme: `lms:theme`,
  sidebarState: `lms:sidebar`,
  courseDraft: `lms:course:draft`,
  editorLayout: `lms:editor:layout`,
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
