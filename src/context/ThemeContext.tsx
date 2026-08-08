import { createContext, useContext } from 'react';
import type { ThemeMode } from '../theme';

export interface ThemeContextValue {
  /** The user's preference: an explicit mode, or `system` to follow the OS. */
  mode: ThemeMode;
  /** Whether the dark palette is currently applied. */
  darkMode: boolean;
  /** Sets an explicit preference. */
  setMode: (mode: ThemeMode) => void;
  /** Flips between light and dark, leaving `system` behind. */
  toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  darkMode: false,
  setMode: () => {},
  toggleDarkMode: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);
