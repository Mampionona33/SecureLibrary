import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { storage } from '@storage/mmkv';


export type ThemeMode = 'light' | 'dark' | 'system';


interface ThemeState {

  mode: ThemeMode;

  setThemeMode: (
    mode: ThemeMode
  ) => void;

}



export const useThemeStore = create<ThemeState>()(

  persist(

    (set) => ({

      mode: 'system',


      setThemeMode: (mode) =>
        set({
          mode,
        }),

    }),


    {
      name: 'theme-storage',


      storage: {

        getItem: (key) => {
          const value = storage.getString(key);

          return value
            ? JSON.parse(value)
            : null;
        },


        setItem: (key, value) => {
          storage.set(
            key,
            JSON.stringify(value)
          );
        },


        removeItem: (key) => {
          storage.delete(key);
        },

      },

    }

  )

);
