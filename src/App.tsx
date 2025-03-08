import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useState, useMemo, createContext, useContext } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Models from './pages/Models';
import Deploy from './pages/Deploy';
import Chat from './pages/Chat';
import ApiEndpoints from './pages/ApiEndpoints';
import Settings from './pages/Settings';
import './App.css';

// Create theme context
export const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

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
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: '#3861fb',
        },
        secondary: {
          main: '#6c757d',
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
