import { UnistylesRegistry } from 'react-native-unistyles';

// 1. Définition des breakpoints (Design Responsif)
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
} as const;

// 2. Définition du thème Sombre
export const darkTheme = {
  colors: {
    background: '#0f172a',     
    cardBackground: '#1e293b', 
    border: '#334155',         
    borderError: '#ef4444',    
    text: '#ffffff',
    textMuted: '#94a3b8',      
    primary: '#3b82f6',        
    error: '#ef4444',
  },
  margins: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  }
} as const;

// 3. Définition du thème Clair
export const lightTheme = {
  colors: {
    background: '#f8fafc', 
    cardBackground: '#ffffff',
    border: '#e2e8f0',
    borderError: '#ef4444',
    text: '#0f172a',
    textMuted: '#64748b',
    primary: '#3b82f6',
    error: '#ef4444',
  },
  margins: darkTheme.margins,
} as const;

// 4. Enregistrement et Injection des Types auprès d'Unistyles
type AppBreakpoints = typeof breakpoints;
type AppThemes = {
  light: typeof lightTheme,
  dark: typeof darkTheme,
};

declare module 'react-native-unistyles' {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
}

// 🟢 LA CORRECTION : Utiliser le cycle d'enregistrement moderne d'Unistyles
UnistylesRegistry
  .addBreakpoints(breakpoints)
  .addThemes({
    light: lightTheme,
    dark: darkTheme,
  })
  .addConfig({
    initialTheme: 'dark',
  });
