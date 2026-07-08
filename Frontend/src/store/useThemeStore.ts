// src/store/useThemeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from '@storage/mmkv';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setThemeMode: (mode) => set({ mode }),
    }),
    {
      name: 'theme-storage',
      storage: {
        getItem: (key) => {
          try {
            const value = storage.getString(key);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.warn(`Failed to read storage key "${key}":`, error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            storage.set(key, JSON.stringify(value));
          } catch (error) {
            console.warn(`Failed to write storage key "${key}":`, error);
          }
        },
        removeItem: (key) => {
          try {
            storage.delete(key);
          } catch (error) {
            console.warn(`Failed to delete storage key "${key}":`, error);
          }
        },
      },
    }
  )
);
