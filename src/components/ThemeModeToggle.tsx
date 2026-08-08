import { IconButton, Tooltip } from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../context/ThemeContext';
import { MOTION, EASING } from '../theme';

interface ThemeModeToggleProps {
  size?: 'small' | 'medium';
}

/** Single-click light/dark switch, available from every page via the app shell. */
export default function ThemeModeToggle({ size = 'medium' }: ThemeModeToggleProps) {
  const { darkMode, toggleDarkMode } = useThemeContext();
  const label = darkMode ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <Tooltip title={label}>
      <IconButton
        onClick={toggleDarkMode}
        size={size}
        aria-label={label}
        aria-pressed={darkMode}
        sx={{
          color: 'text.secondary',
          transition: `color ${MOTION.fast}ms ${EASING}, background-color ${MOTION.fast}ms ${EASING}`,
          '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
        }}
      >
        {darkMode ? <LightModeIcon fontSize={size} /> : <DarkModeIcon fontSize={size} />}
      </IconButton>
    </Tooltip>
  );
}
