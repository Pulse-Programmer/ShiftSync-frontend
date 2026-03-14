export interface ThemeTokens {
  colors: {
    primary: string;
    primaryHover: string;
    background: string;
    surface: string;
    surfaceHover: string;
    surfaceAlt: string;
    text: string;
    textSecondary: string;
    textInverse: string;
    border: string;
    borderLight: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    accent1: string;
    accent2: string;
    accent3: string;
    accent4: string;
  };
  fontFamily: {
    display: string;
    body: string;
    mono: string;
  };
  borderRadius: {
    sm: string;
    DEFAULT: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadow: {
    sm: string;
    DEFAULT: string;
    lg: string;
  };
  motion: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      default: string;
      spring: string;
      bounce: string;
    };
  };
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  mode: 'light' | 'dark';
  tokens: ThemeTokens;
}
