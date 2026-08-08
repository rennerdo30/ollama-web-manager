/** Application-wide constants: identity, defaults and localStorage keys. */

export const APP_NAME = 'Ollama Manager';
export const APP_TAGLINE = 'Local LLM control panel';

/** Default endpoints. */
export const DEFAULT_OLLAMA_URL = 'http://localhost:11434';
export const DEFAULT_MONITORING_URL = 'http://localhost:3001';

/** localStorage keys, kept in one place so pages cannot drift apart. */
export const STORAGE_KEYS = {
  serverUrl: 'serverUrl',
  monitoringServerUrl: 'monitoringServerUrl',
  autoRefresh: 'autoRefresh',
  refreshInterval: 'refreshInterval',
  deployedModels: 'deployedModels',
} as const;

/** Dashboard auto-refresh bounds, in seconds. */
export const REFRESH_INTERVAL_MIN_SECONDS = 1;
export const REFRESH_INTERVAL_MAX_SECONDS = 60;
export const REFRESH_INTERVAL_DEFAULT_SECONDS = 5;

/** Number of samples kept in the dashboard performance charts. */
export const CHART_HISTORY_LENGTH = 20;

/** How long notification snackbars stay on screen, in ms. */
export const SNACKBAR_AUTO_HIDE_MS = 6000;
