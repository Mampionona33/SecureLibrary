import { useColorScheme } from 'react-native';

import { useThemeStore } from '@store/useThemeStore';

import { lightTheme } from './light';
import { darkTheme } from './dark';


export function useAppTheme() {

  const mode = useThemeStore(
    state => state.mode
  );


  const systemTheme = useColorScheme();


  const isDark =
    mode === 'dark'
      ||
    (
      mode === 'system'
      &&
      systemTheme === 'dark'
    );


  return {
    theme: isDark
      ? darkTheme
      : lightTheme,

    isDark,
  };

}
