export const lightTheme = {
  dark: false,

  colors: {
    // Backgrounds
    background: '#FAF8F3',
    surface: '#FFFFFF',
    surfaceVariant: '#F3EFE8',

    // Brand
    primary: '#8B5E34',
    primaryLight: '#A6764C',
    secondary: '#6B8E5A',

    // Text
    text: '#2F2F2F',
    textSecondary: '#777777',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',

    // Borders
    border: '#E6DFD4',
    divider: '#EFE8DD',

    // Status
    success: '#4F7A52',
    warning: '#D97706',
    danger: '#B42318',
    info: '#2563EB',

    // UI
    placeholder: '#A8A29E',
    disabled: '#D6D3D1',

    // Cards
    card: '#FFFFFF',

    // Inputs
    inputBackground: '#FFFFFF',
    inputBorder: '#DDD6CE',

    // Buttons
    buttonPrimary: '#8B5E34',
    buttonPrimaryText: '#FFFFFF',

    buttonSecondary: '#EFE8DD',
    buttonSecondaryText: '#2F2F2F',

    // Navigation
    tabBar: '#FFFFFF',
    tabBarActive: '#8B5E34',
    tabBarInactive: '#9CA3AF',

    // Overlay
    overlay: 'rgba(0,0,0,0.35)',

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

export type AppTheme = typeof lightTheme;
