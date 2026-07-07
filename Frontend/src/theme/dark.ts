import type { AppTheme } from './light';

export const darkTheme: AppTheme = {
  dark: true,

  colors: {
    // Backgrounds
    background: '#171412',
    surface: '#221F1C',
    surfaceVariant: '#2B2622',

    // Brand
    primary: '#C89B6D',
    primaryLight: '#D9AE82',
    secondary: '#7FA36E',

    // Text
    text: '#F2ECE4',
    textSecondary: '#B8AEA2',
    textMuted: '#8A8177',
    textInverse: '#171412',

    // Borders
    border: '#3A342E',
    divider: '#312C28',

    // Status
    success: '#6FB06A',
    warning: '#E9A63B',
    danger: '#E36A5E',
    info: '#60A5FA',

    // UI
    placeholder: '#8A8177',
    disabled: '#4B453F',

    // Cards
    card: '#221F1C',

    // Inputs
    inputBackground: '#2B2622',
    inputBorder: '#433D37',

    // Buttons
    buttonPrimary: '#C89B6D',
    buttonPrimaryText: '#171412',

    buttonSecondary: '#2F2A26',
    buttonSecondaryText: '#F2ECE4',

    // Navigation
    tabBar: '#221F1C',
    tabBarActive: '#C89B6D',
    tabBarInactive: '#7B746B',

    // Overlay
    overlay: 'rgba(0,0,0,0.55)',

    // Shadow
    shadow: '#000000',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 999,
  },
};
