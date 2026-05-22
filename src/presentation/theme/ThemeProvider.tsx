import React, { createContext, useContext, ReactNode } from 'react';
import { Theme } from './types';
import { darkTheme } from './themes/dark';

const ThemeContext = createContext<Theme>(darkTheme);

interface ThemeProviderProps {
  children: ReactNode;
  theme?: Theme;
}

/**
 * Provee el theme activo a toda la app. Wire UNA vez en `app/_layout.tsx`.
 * Por default usa darkTheme — la app es dark-first.
 */
export function ThemeProvider({ children, theme = darkTheme }: ThemeProviderProps) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/**
 * Hook para consumir el theme desde cualquier componente.
 * Reemplaza el patrón antiguo `import { colors } from '@/presentation/theme/colors'`.
 */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
