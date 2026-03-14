import type { ThemeDefinition } from './types';

function hexToRgbChannels(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function applyTheme(theme: ThemeDefinition): void {
  const root = document.documentElement;
  const { colors, fontFamily, borderRadius, shadow, motion } = theme.tokens;

  // Colors — set both hex and RGB channel formats
  const colorMap: Record<string, string> = {
    'primary': colors.primary,
    'primary-hover': colors.primaryHover,
    'bg': colors.background,
    'surface': colors.surface,
    'surface-hover': colors.surfaceHover,
    'surface-alt': colors.surfaceAlt,
    'text': colors.text,
    'text-secondary': colors.textSecondary,
    'text-inverse': colors.textInverse,
    'border': colors.border,
    'border-light': colors.borderLight,
    'success': colors.success,
    'warning': colors.warning,
    'error': colors.error,
    'info': colors.info,
    'accent-1': colors.accent1,
    'accent-2': colors.accent2,
    'accent-3': colors.accent3,
    'accent-4': colors.accent4,
  };

  for (const [key, value] of Object.entries(colorMap)) {
    root.style.setProperty(`--color-${key}`, value);
    root.style.setProperty(`--color-${key}-rgb`, hexToRgbChannels(value));
  }

  // Font families
  for (const [key, value] of Object.entries(fontFamily)) {
    root.style.setProperty(`--font-${camelToKebab(key)}`, value);
  }

  // Border radius
  const radiusMap: Record<string, string> = {
    'sm': borderRadius.sm,
    'default': borderRadius.DEFAULT,
    'md': borderRadius.md,
    'lg': borderRadius.lg,
    'xl': borderRadius.xl,
    'full': borderRadius.full,
  };

  for (const [key, value] of Object.entries(radiusMap)) {
    root.style.setProperty(`--radius-${key}`, value);
  }

  // Shadows
  root.style.setProperty('--shadow-sm', shadow.sm);
  root.style.setProperty('--shadow-default', shadow.DEFAULT);
  root.style.setProperty('--shadow-lg', shadow.lg);

  // Motion
  root.style.setProperty('--motion-duration-fast', motion.duration.fast);
  root.style.setProperty('--motion-duration-normal', motion.duration.normal);
  root.style.setProperty('--motion-duration-slow', motion.duration.slow);
  root.style.setProperty('--motion-easing-default', motion.easing.default);
  root.style.setProperty('--motion-easing-spring', motion.easing.spring);
  root.style.setProperty('--motion-easing-bounce', motion.easing.bounce);

  // Set mode attribute for any theme-mode-specific CSS
  root.setAttribute('data-theme-mode', theme.mode);
  root.setAttribute('data-theme', theme.id);
}
