import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext, type ThemeContextValue } from './context/ThemeContext';
import {
  createAppTheme,
  readStoredThemeMode,
  storeThemeMode,
  SURFACES,
  type ThemeMode,
} from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Models from './pages/Models';
import CreateModel from './pages/CreateModel';
import Deploy from './pages/Deploy';
import Chat from './pages/Chat';
import ApiEndpoints from './pages/ApiEndpoints';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredThemeMode());
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const darkMode = mode === 'system' ? prefersDark : mode === 'dark';

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setModeState((current) => {
      const resolvedDark = current === 'system' ? prefersDark : current === 'dark';
      return resolvedDark ? 'light' : 'dark';
    });
  }, [prefersDark]);

  // Persist the preference and keep the document in sync so the browser paints
  // native surfaces (scrollbars, form controls, overscroll) in the right mode.
  useEffect(() => {
    storeThemeMode(mode, darkMode);
    const root = document.documentElement;
    root.style.colorScheme = darkMode ? 'dark' : 'light';
    root.dataset.theme = darkMode ? 'dark' : 'light';
    root.style.backgroundColor = darkMode ? SURFACES.dark.default : SURFACES.light.default;
  }, [mode, darkMode]);

  const theme = useMemo(() => createAppTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  const themeContextValue = useMemo<ThemeContextValue>(
    () => ({ mode, darkMode, setMode, toggleDarkMode }),
    [mode, darkMode, setMode, toggleDarkMode]
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/models" element={<Models />} />
              <Route path="/create-model" element={<CreateModel />} />
              <Route path="/deploy" element={<Deploy />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/api-endpoints" element={<ApiEndpoints />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
