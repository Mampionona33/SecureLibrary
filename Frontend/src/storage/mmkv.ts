// src/storage/mmkv.ts
import { MMKV } from 'react-native-mmkv';

let mmkvInstance: MMKV | null = null;

try {
  mmkvInstance = new MMKV({
    id: 'secure-library-storage',
  });
} catch (error) {
  console.warn('MMKV initialization failed, using in-memory fallback:', error);
}

// Fallback in-memory storage
const memoryStorage = new Map<string, string>();

export const storage = {
  getString: (key: string): string | undefined => {
    if (mmkvInstance) {
      return mmkvInstance.getString(key);
    }
    return memoryStorage.get(key);
  },
  set: (key: string, value: string): void => {
    if (mmkvInstance) {
      mmkvInstance.set(key, value);
    } else {
      memoryStorage.set(key, value);
    }
  },
  delete: (key: string): void => {
    if (mmkvInstance) {
      mmkvInstance.delete(key);
    } else {
      memoryStorage.delete(key);
    }
  },
};
