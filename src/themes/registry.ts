import type { ThemeDefinition } from './types';
import { organicDark } from './organic-dark';
import { organicLight } from './organic-light';
import { kineticBrutalism } from './kinetic-brutalism';

export const themes: ThemeDefinition[] = [
  organicDark,
  organicLight,
  kineticBrutalism,
];

export const DEFAULT_THEME_ID = 'organic-dark';

export function getTheme(id: string): ThemeDefinition {
  return themes.find((t) => t.id === id) ?? themes[0];
}
