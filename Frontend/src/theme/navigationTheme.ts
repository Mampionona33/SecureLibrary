import {
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';

import {
  lightTheme
} from './light';

import {
  darkTheme
} from './dark';


export const navigationLightTheme = {
  ...DefaultTheme,

  colors: {
    ...DefaultTheme.colors,

    background:
      lightTheme.colors.background,

    card:
      lightTheme.colors.surface,

    text:
      lightTheme.colors.text,

    border:
      lightTheme.colors.border,

    primary:
      lightTheme.colors.primary,
  },
};



export const navigationDarkTheme = {
  ...DarkTheme,

  colors: {
    ...DarkTheme.colors,

    background:
      darkTheme.colors.background,

    card:
      darkTheme.colors.surface,

    text:
      darkTheme.colors.text,

    border:
      darkTheme.colors.border,

    primary:
      darkTheme.colors.primary,
  },
};
