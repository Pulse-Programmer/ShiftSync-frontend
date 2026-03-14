import type { ThemeDefinition } from './types';

export const organicLight: ThemeDefinition = {
  id: 'organic-light',
  name: 'Organic Light',
  description: 'Warm, earthy tones with soft edges — light mode',
  mode: 'light',
  tokens: {
    colors: {
      primary: '#c59f59',
      primaryHover: '#b08d4a',
      background: '#faf8f4',
      surface: '#ffffff',
      surfaceHover: '#f5f2ec',
      surfaceAlt: '#f0ece4',
      text: '#2c2418',
      textSecondary: '#7a6f61',
      textInverse: '#faf8f4',
      border: '#e0d8cc',
      borderLight: '#ebe5db',
      success: '#4a8c4a',
      warning: '#b8912e',
      error: '#b04040',
      info: '#4a7eb0',
      accent1: '#a67b4a',
      accent2: '#a04e2e',
      accent3: '#4a7e4a',
      accent4: '#6e5e96',
    },
    fontFamily: {
      display: '"Manrope", sans-serif',
      body: '"Manrope", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    borderRadius: {
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadow: {
      sm: '0 1px 3px rgba(44,36,24,0.06)',
      DEFAULT: '0 2px 8px rgba(44,36,24,0.08)',
      lg: '0 8px 24px rgba(44,36,24,0.12)',
    },
    motion: {
      duration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },
    },
  },
};
