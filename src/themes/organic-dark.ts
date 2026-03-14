import type { ThemeDefinition } from './types';

export const organicDark: ThemeDefinition = {
  id: 'organic-dark',
  name: 'Organic Dark',
  description: 'Warm, earthy tones with soft edges',
  mode: 'dark',
  tokens: {
    colors: {
      primary: '#c59f59',
      primaryHover: '#d4b06a',
      background: '#1e1a14',
      surface: '#2a2520',
      surfaceHover: '#342e27',
      surfaceAlt: '#252019',
      text: '#f8f7f6',
      textSecondary: '#a89e91',
      textInverse: '#1e1a14',
      border: '#3d362e',
      borderLight: '#4a423a',
      success: '#7ab87a',
      warning: '#d4a843',
      error: '#c45e5e',
      info: '#6a9ec4',
      accent1: '#c4956a',
      accent2: '#b85c38',
      accent3: '#6b9e6b',
      accent4: '#8b7bb0',
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
      sm: '0 1px 3px rgba(0,0,0,0.3)',
      DEFAULT: '0 2px 8px rgba(0,0,0,0.35)',
      lg: '0 8px 24px rgba(0,0,0,0.45)',
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
