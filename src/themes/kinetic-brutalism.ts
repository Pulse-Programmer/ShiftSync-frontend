import type { ThemeDefinition } from './types';

export const kineticBrutalism: ThemeDefinition = {
  id: 'kinetic-brutalism',
  name: 'Blueprint',
  description: 'Bold, high-contrast with hard edges and offset shadows',
  mode: 'dark',
  tokens: {
    colors: {
      primary: '#137fec',
      primaryHover: '#3d9aff',
      background: '#101922',
      surface: '#1a2633',
      surfaceHover: '#243444',
      surfaceAlt: '#0d1319',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      textInverse: '#101922',
      border: '#137fec',
      borderLight: '#1e3a5f',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      info: '#137fec',
      accent1: '#ff6b35',
      accent2: '#00d4aa',
      accent3: '#ff3366',
      accent4: '#9945ff',
    },
    fontFamily: {
      display: '"Space Grotesk", sans-serif',
      body: '"Space Grotesk", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    borderRadius: {
      sm: '0',
      DEFAULT: '0',
      md: '0',
      lg: '0',
      xl: '0',
      full: '9999px',
    },
    shadow: {
      sm: '3px 3px 0px 0px #137fec',
      DEFAULT: '4px 4px 0px 0px #137fec',
      lg: '6px 6px 0px 0px #137fec',
    },
    motion: {
      duration: {
        fast: '80ms',
        normal: '150ms',
        slow: '250ms',
      },
      easing: {
        default: 'cubic-bezier(0.2, 0, 0, 1)',
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
        bounce: 'steps(4, end)',
      },
    },
  },
};
