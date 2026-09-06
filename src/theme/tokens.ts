/**
 * Design tokens for Ollama Web Manager.
 *
 * Single source of truth for colour, radius, spacing rhythm, elevation and
 * motion values. Components must reference these tokens (or the MUI theme built
 * from them in `./index.ts`) instead of hardcoding literals.
 */

/** Brand + neutral ramps (Tailwind-compatible blue/slate scales). */
export const COLORS = {
  blue300: '#93c5fd',
  blue400: '#60a5fa',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  slate950: '#020617',
  white: '#ffffff',
  offWhite: '#f8fafc',
} as const;

/**
 * Page background / surface colours per mode. Kept here (not only in the MUI
 * theme) because the pre-paint inline script in `index.html` needs the exact
 * same values to avoid a flash of the wrong theme.
 */
export const SURFACES = {
  light: {
    default: COLORS.offWhite,
    paper: COLORS.white,
    text: COLORS.slate900,
  },
  dark: {
    default: COLORS.slate900,
    paper: COLORS.slate800,
    text: COLORS.white,
  },
} as const;

/** Base border radius in px; MUI multiplies this by the `borderRadius` factor. */
export const RADIUS_BASE = 8;

/** Named radii used via `sx={{ borderRadius: RADIUS.md }}` (MUI spacing units). */
export const RADIUS = {
  sm: 1,
  md: 2,
  lg: 3,
} as const;

/** Vertical rhythm for page sections, in MUI spacing units (8px each). */
export const SPACING = {
  /** Gap between grid/flex items. */
  grid: 3,
  /** Gap below a page header block. */
  pageHeader: 4,
  /** Gap between major page sections. */
  section: 5,
  /** Inner padding of cards and panels. */
  panel: 3,
} as const;

/** Responsive page gutters for the main content area. */
export const PAGE_GUTTER = { xs: 2, sm: 3, md: 4 } as const;

/** Max content width so the app does not stretch unreadably on wide displays. */
export const CONTENT_MAX_WIDTH = 1440;

/** Sidebar width in px. */
export const DRAWER_WIDTH = 268;

/** Height of the mobile app bar in px (matches MUI's dense toolbar). */
export const MOBILE_APPBAR_HEIGHT = 56;

/** Motion durations in ms. Disabled globally under `prefers-reduced-motion`. */
export const MOTION = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;

/** Standard easing curve. */
export const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

/** Lift applied to interactive cards on hover, in px. */
export const HOVER_LIFT = 3;

/** Focus ring geometry, in px. */
export const FOCUS_RING = {
  width: 2,
  offset: 2,
} as const;

/** Soft layered shadows, indexed to mirror the MUI elevation scale we use. */
export const SHADOWS = {
  light: {
    sm: '0 1px 2px 0 rgb(15 23 42 / 0.06), 0 1px 3px 0 rgb(15 23 42 / 0.08)',
    md: '0 2px 4px -1px rgb(15 23 42 / 0.06), 0 4px 12px -2px rgb(15 23 42 / 0.10)',
    lg: '0 8px 24px -4px rgb(15 23 42 / 0.14), 0 2px 6px -2px rgb(15 23 42 / 0.08)',
  },
  dark: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.40), 0 1px 3px 0 rgb(0 0 0 / 0.30)',
    md: '0 2px 4px -1px rgb(0 0 0 / 0.45), 0 4px 12px -2px rgb(0 0 0 / 0.40)',
    lg: '0 8px 24px -4px rgb(0 0 0 / 0.55), 0 2px 6px -2px rgb(0 0 0 / 0.40)',
  },
} as const;

/** Font stacks. */
export const FONT_FAMILY_SANS =
  '"Inter", "Segoe UI", Roboto, Helvetica, Arial, system-ui, sans-serif';
export const FONT_FAMILY_MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
