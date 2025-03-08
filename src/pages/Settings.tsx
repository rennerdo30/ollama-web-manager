import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Switch, 
  FormGroup, 
  FormControlLabel,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { useThemeContext } from '../App';
import { updateApiBaseUrl } from '../api/ollamaApi';

export default function Settings() {
  const { darkMode, toggleDarkMode } = useThemeContext();
  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem('serverUrl') || 'http://localhost:11434';
  });
  const [autoRefresh, setAutoRefresh] = useState(() => {
    return localStorage.getItem('autoRefresh') !== 'false';
  });
  const [refreshInterval, setRefreshInterval] = useState(() => {
    return parseInt(localStorage.getItem('refreshInterval') || '5', 10);
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Update API URL when serverUrl changes
  useEffect(() => {
    // This could be expanded to actually update the API client
    localStorage.setItem('serverUrl', serverUrl);
  }, [serverUrl]);

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('serverUrl', serverUrl);
    localStorage.setItem('autoRefresh', String(autoRefresh));
    localStorage.setItem('refreshInterval', String(refreshInterval));
    
    // Update API base URL
    updateApiBaseUrl(serverUrl);
    
    setSnackbar({
      open: true,
      message: 'Settings saved successfully',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Server Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Ollama Server URL"
            fullWidth
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            helperText="The URL of your Ollama server instance"
            sx={{ mb: 2 }}
          />
          
          <Button 
            variant="contained" 
            onClick={handleSaveSettings}
          >
            Save Server Settings
          </Button>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          UI Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <FormGroup>
          <FormControlLabel 
            control={
              <Switch 
                checked={darkMode} 
                onChange={toggleDarkMode} 
              />
            } 
            label="Dark Mode" 
          />
          
          <FormControlLabel 
            control={
              <Switch 
                checked={autoRefresh} 
                onChange={(e) => setAutoRefresh(e.target.checked)} 
              />
            } 
            label="Auto-refresh Dashboard" 
          />
          
          {autoRefresh && (
            <Box sx={{ ml: 3, mt: 2 }}>
              <TextField
                label="Refresh Interval (seconds)"
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                inputProps={{ min: 1, max: 60 }}
                sx={{ width: 200 }}
              />
            </Box>
          )}
        </FormGroup>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleSaveSettings}
          >
            Save UI Settings
          </Button>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          About
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="body1" paragraph>
          Ollama Web Manager v0.1.0
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A web interface to manage your Ollama instance. This tool allows you to:
        </Typography>
        <ul>
          <Typography component="li" variant="body2" color="text.secondary">
            Monitor system performance and resource usage
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Manage models (pull, delete, deploy)
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Configure model parameters
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Track deployed models
          </Typography>
        </ul>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}