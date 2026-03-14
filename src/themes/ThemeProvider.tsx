import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { ThemeDefinition } from './types';
import { DEFAULT_THEME_ID, getTheme, themes } from './registry';
import { applyTheme } from './apply';

const STORAGE_KEY = 'shiftsync-theme';

export interface ThemeContextValue {
  theme: ThemeDefinition;
  themes: ThemeDefinition[];
  setTheme: (id: string) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialThemeId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && themes.some((t) => t.id === stored)) {
      return stored;
    }
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_THEME_ID;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeDefinition>(() =>
    getTheme(getInitialThemeId()),
  );

  const setTheme = useCallback((id: string) => {
    const next = getTheme(id);
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // localStorage unavailable
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themes, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
