import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useState, useMemo } from 'react';
import { ThemeContext } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Models from './pages/Models';
import Deploy from './pages/Deploy';
import Chat from './pages/Chat';
import ApiEndpoints from './pages/ApiEndpoints';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || false
  );

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  // Memoize theme to prevent unnecessary re-renders
  const theme = useMemo(() =>
    createTheme({
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 500 },
      },
      shape: {
        borderRadius: 8,
      },
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: '#3b82f6', // Blue
          light: '#60a5fa',
          dark: '#2563eb',
        },
        secondary: {
          main: '#64748b', // Slate
          light: '#94a3b8',
          dark: '#475569',
        },
        background: {
          default: darkMode ? '#0f172a' : '#f8fafc',
          paper: darkMode ? '#1e293b' : '#ffffff',
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
              },
            },
            contained: {
              '&:hover': {
                boxShadow: 'none',
                backgroundColor: '#2563eb',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
            elevation1: {
              boxShadow: darkMode
                ? '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              boxShadow: 'none',
              borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              color: darkMode ? '#ffffff' : '#0f172a',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRight: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              boxShadow: darkMode
                ? '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
            },
          },
        },
      },
    }),
    [darkMode]
  );

  const themeContextValue = {
    darkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/models" element={<Models />} />
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
