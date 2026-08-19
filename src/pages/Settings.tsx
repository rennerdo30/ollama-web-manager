import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Save as SaveIcon,
  SettingsBrightness as SystemModeIcon
} from '@mui/icons-material';
import { useThemeContext } from '../context/ThemeContext';
import { updateApiBaseUrl } from '../api/ollamaApi';
import PageHeader from '../components/PageHeader';
import {
  APP_NAME,
  APP_TAGLINE,
  DEFAULT_MONITORING_URL,
  DEFAULT_OLLAMA_URL,
  REFRESH_INTERVAL_DEFAULT_SECONDS,
  REFRESH_INTERVAL_MAX_SECONDS,
  REFRESH_INTERVAL_MIN_SECONDS,
  SNACKBAR_AUTO_HIDE_MS,
  STORAGE_KEYS,
} from '../constants/app';
import { RADIUS, SPACING, type ThemeMode } from '../theme';

const SETTINGS_MAX_WIDTH = 760;
const INTERVAL_FIELD_WIDTH = 220;

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <LightModeIcon fontSize="small" /> },
  { value: 'dark', label: 'Dark', icon: <DarkModeIcon fontSize="small" /> },
  { value: 'system', label: 'System', icon: <SystemModeIcon fontSize="small" /> },
];

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Paper
      elevation={0}
      component="section"
      sx={{
        p: SPACING.panel,
        mb: SPACING.grid,
        borderRadius: RADIUS.lg,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      )}
      <Divider sx={{ my: 2.5 }} />
      {children}
    </Paper>
  );
}

export default function Settings() {
  const { mode, setMode } = useThemeContext();
  const [serverUrl, setServerUrl] = useState(
    () => localStorage.getItem(STORAGE_KEYS.serverUrl) || DEFAULT_OLLAMA_URL
  );
  const [monitoringServerUrl, setMonitoringServerUrl] = useState(
    () => localStorage.getItem(STORAGE_KEYS.monitoringServerUrl) || DEFAULT_MONITORING_URL
  );
  const [autoRefresh, setAutoRefresh] = useState(
    () => localStorage.getItem(STORAGE_KEYS.autoRefresh) !== 'false'
  );
  const [refreshInterval, setRefreshInterval] = useState(() => Number.parseInt(
    localStorage.getItem(STORAGE_KEYS.refreshInterval) || String(REFRESH_INTERVAL_DEFAULT_SECONDS),
    10
  ));
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSaveSettings = () => {
    const normalizedServerUrl = serverUrl.trim().replace(/\/+$/, '');
    const normalizedMonitoringServerUrl = monitoringServerUrl.trim().replace(/\/+$/, '');
    const parsedRefreshInterval = Number.isFinite(refreshInterval) && refreshInterval > 0
      ? Math.min(
          REFRESH_INTERVAL_MAX_SECONDS,
          Math.max(REFRESH_INTERVAL_MIN_SECONDS, Math.round(refreshInterval))
        )
      : REFRESH_INTERVAL_DEFAULT_SECONDS;

    setServerUrl(normalizedServerUrl);
    setMonitoringServerUrl(normalizedMonitoringServerUrl);
    setRefreshInterval(parsedRefreshInterval);

    localStorage.setItem(STORAGE_KEYS.serverUrl, normalizedServerUrl);
    localStorage.setItem(STORAGE_KEYS.monitoringServerUrl, normalizedMonitoringServerUrl);
    localStorage.setItem(STORAGE_KEYS.autoRefresh, String(autoRefresh));
    localStorage.setItem(STORAGE_KEYS.refreshInterval, String(parsedRefreshInterval));

    updateApiBaseUrl(normalizedServerUrl);

    setSnackbar({
      open: true,
      message: 'Settings saved. Reload the dashboard to pick up new refresh timings.',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  return (
    <Box sx={{ maxWidth: SETTINGS_MAX_WIDTH }}>
      <PageHeader
        title="Settings"
        description="Point the app at your Ollama and monitoring endpoints, and choose how the interface behaves."
      />

      <SettingsSection
        title="Connections"
        description="Both URLs are stored in this browser only."
      >
        <Stack spacing={2.5}>
          <TextField
            label="Ollama server URL"
            type="url"
            fullWidth
            value={serverUrl}
            onChange={(event) => setServerUrl(event.target.value)}
            helperText={`The URL of your Ollama instance. Default: ${DEFAULT_OLLAMA_URL}`}
          />

          <TextField
            label="System monitoring server URL"
            type="url"
            fullWidth
            value={monitoringServerUrl}
            onChange={(event) => setMonitoringServerUrl(event.target.value)}
            helperText={`Supplies CPU, memory and GPU metrics. Default: ${DEFAULT_MONITORING_URL}`}
          />
        </Stack>
      </SettingsSection>

      <SettingsSection title="Appearance">
        <FormLabel id="theme-mode-label" sx={{ display: 'block', mb: 1, fontSize: '0.875rem' }}>
          Theme
        </FormLabel>
        <ToggleButtonGroup
          value={mode}
          exclusive
          aria-labelledby="theme-mode-label"
          onChange={(_event, value: ThemeMode | null) => {
            if (value) {
              setMode(value);
            }
          }}
          sx={{ flexWrap: 'wrap' }}
        >
          {THEME_OPTIONS.map((option) => (
            <ToggleButton key={option.value} value={option.value} sx={{ gap: 1, px: 2.5 }}>
              {option.icon}
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          “System” follows your operating system’s light or dark setting.
        </Typography>
      </SettingsSection>

      <SettingsSection title="Dashboard">
        <FormControlLabel
          control={
            <Switch
              checked={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.checked)}
            />
          }
          label="Auto-refresh system metrics"
        />

        {autoRefresh && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Refresh interval (seconds)"
              type="number"
              value={refreshInterval}
              onChange={(event) => setRefreshInterval(Number(event.target.value))}
              slotProps={{
                htmlInput: {
                  min: REFRESH_INTERVAL_MIN_SECONDS,
                  max: REFRESH_INTERVAL_MAX_SECONDS
                }
              }}
              helperText={`Between ${REFRESH_INTERVAL_MIN_SECONDS} and ${REFRESH_INTERVAL_MAX_SECONDS} seconds.`}
              sx={{ width: INTERVAL_FIELD_WIDTH }}
            />
          </Box>
        )}
      </SettingsSection>

      <SettingsSection title={`About ${APP_NAME}`}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {APP_TAGLINE}. From here you can:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
          <Typography component="li" variant="body2">
            Monitor system performance and resource usage
          </Typography>
          <Typography component="li" variant="body2">
            Manage models: pull, inspect and delete
          </Typography>
          <Typography component="li" variant="body2">
            Create custom model variants from a Modelfile
          </Typography>
          <Typography component="li" variant="body2">
            Track deployments and chat with a running model
          </Typography>
        </Box>
      </SettingsSection>

      {/* Stays reachable while scrolling a long settings form. */}
      <Box sx={{ position: 'sticky', bottom: 0, pt: 1, pb: 2, bgcolor: 'background.default' }}>
        <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={handleSaveSettings}>
          Save settings
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          The theme applies immediately; connection and dashboard options are saved with this button.
        </Typography>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={SNACKBAR_AUTO_HIDE_MS}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
