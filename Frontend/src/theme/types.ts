export interface Theme {
  colors: {
    background: string;
    surface: string;
    surfaceVariant: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    primary: string;
    border: string;
    danger: string;
    warning: string;
    success: string;
    inputBackground: string;
    overlay: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    title: {
      fontSize: number;
      fontWeight: string;
    };
    subtitle: {
      fontSize: number;
      fontWeight: string;
    };
    body: {
      fontSize: number;
    };
    caption: {
      fontSize: number;
    };
  };
}
