import { createTheme, alpha, type Theme, type PaletteMode } from '@mui/material';
import {
  COLORS,
  EASING,
  FOCUS_RING,
  FONT_FAMILY_MONO,
  FONT_FAMILY_SANS,
  MOTION,
  RADIUS_BASE,
  SHADOWS,
  SURFACES,
} from './tokens';

export * from './tokens';

/** Theme preference stored by the user. `system` follows the OS setting. */
export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system'] as const;

/** localStorage key holding the `ThemeMode`. */
export const THEME_MODE_STORAGE_KEY = 'themeMode';

/** Legacy boolean key kept so existing installs keep their chosen theme. */
export const LEGACY_DARK_MODE_STORAGE_KEY = 'darkMode';

export const isThemeMode = (value: unknown): value is ThemeMode =>
  typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);

/**
 * Reads the persisted theme preference, migrating the legacy `darkMode` boolean.
 * Falls back to `system` so first-time visitors match their OS setting.
 */
export const readStoredThemeMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (isThemeMode(stored)) {
      return stored;
    }

    const legacy = localStorage.getItem(LEGACY_DARK_MODE_STORAGE_KEY);
    if (legacy === 'true') {
      return 'dark';
    }
    if (legacy === 'false') {
      return 'light';
    }
  } catch (error) {
    // Private browsing modes can throw on localStorage access.
    console.warn('Unable to read the stored theme preference:', error);
  }

  return 'system';
};

/** Persists the theme preference, keeping the legacy key in sync. */
export const storeThemeMode = (mode: ThemeMode, resolvedDark: boolean): void => {
  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    localStorage.setItem(LEGACY_DARK_MODE_STORAGE_KEY, String(resolvedDark));
  } catch (error) {
    console.warn('Unable to persist the theme preference:', error);
  }
};

/**
 * Builds the application theme for a resolved palette mode.
 *
 * Component overrides deliberately avoid hardcoding the primary colour into
 * hover states: doing so previously turned destructive (red) buttons blue on
 * hover. Everything derives from the active palette instead.
 */
export const createAppTheme = (mode: PaletteMode): Theme => {
  const isDark = mode === 'dark';
  const surfaces = isDark ? SURFACES.dark : SURFACES.light;
  const shadows = isDark ? SHADOWS.dark : SHADOWS.light;
  const outline = isDark ? alpha(COLORS.white, 0.12) : alpha(COLORS.slate900, 0.1);
  const hairline = isDark ? alpha(COLORS.white, 0.08) : alpha(COLORS.slate900, 0.07);

  return createTheme({
    typography: {
      fontFamily: FONT_FAMILY_SANS,
      // A single modular scale, so headings stay in proportion across pages.
      h1: { fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.15, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, fontSize: '2rem', lineHeight: 1.2, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.25, letterSpacing: '-0.015em' },
      h4: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.3, letterSpacing: '-0.015em' },
      h5: { fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.35, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.4 },
      subtitle1: { fontWeight: 600, lineHeight: 1.5 },
      subtitle2: { fontWeight: 600, lineHeight: 1.5 },
      body1: { lineHeight: 1.65 },
      body2: { lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
      caption: { lineHeight: 1.5 },
    },
    shape: {
      borderRadius: RADIUS_BASE,
    },
    palette: {
      mode,
      primary: {
        main: isDark ? COLORS.blue400 : COLORS.blue600,
        light: isDark ? COLORS.blue300 : COLORS.blue400,
        dark: isDark ? COLORS.blue500 : COLORS.blue700,
        contrastText: isDark ? COLORS.slate950 : COLORS.white,
      },
      secondary: {
        main: isDark ? COLORS.slate300 : COLORS.slate600,
        light: isDark ? COLORS.slate200 : COLORS.slate500,
        dark: isDark ? COLORS.slate400 : COLORS.slate700,
        contrastText: isDark ? COLORS.slate950 : COLORS.white,
      },
      background: {
        default: surfaces.default,
        paper: surfaces.paper,
      },
      divider: outline,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // A single, always-visible focus indicator for every focusable element.
          ':focus-visible': {
            outline: `${FOCUS_RING.width}px solid ${isDark ? COLORS.blue400 : COLORS.blue600}`,
            outlineOffset: FOCUS_RING.offset,
            borderRadius: RADIUS_BASE,
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
        },
      },
      MuiButtonBase: {
        defaultProps: {
          // Ripples are decorative; the focus ring above carries the meaning.
          disableTouchRipple: true,
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: RADIUS_BASE,
            paddingInline: 16,
            transition: `background-color ${MOTION.fast}ms ${EASING}, border-color ${MOTION.fast}ms ${EASING}, color ${MOTION.fast}ms ${EASING}`,
          },
          sizeLarge: {
            paddingBlock: 10,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: `background-color ${MOTION.fast}ms ${EASING}, color ${MOTION.fast}ms ${EASING}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: shadows.sm,
          },
          elevation2: {
            boxShadow: shadows.md,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
            borderBottom: `1px solid ${outline}`,
            backgroundColor: surfaces.paper,
            color: surfaces.text,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${outline}`,
            backgroundColor: surfaces.paper,
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: shadows.sm,
            border: `1px solid ${hairline}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS_BASE / 2,
            fontWeight: 600,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            borderRadius: RADIUS_BASE / 2,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: hairline,
          },
          head: {
            fontWeight: 600,
            whiteSpace: 'nowrap',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS_BASE,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS_BASE / 2,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS_BASE / 2,
          },
        },
      },
    },
  });
};

export { FONT_FAMILY_MONO };
