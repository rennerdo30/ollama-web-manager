import { useEffect, useState } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  PlayArrow as PlayIcon,
  Stop as StopIcon, 
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import LoadingState from '../components/LoadingState';
import ModelDeployDialog from '../components/ModelDeployDialog';
import { ollamaService, Model } from '../api/ollamaApi';

// Note: This is a mock interface since Ollama doesn't provide active models directly
interface DeployedModel {
  id: string;
  name: string;
  status: 'running' | 'stopped';
  threads: number;
  contextSize: number;
  gpuLayers: number;
  startedAt: string;
}

export default function Deploy() {
  const [models, setModels] = useState<Model[]>([]);
  const [deployedModels, setDeployedModels] = useState<DeployedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isDeployDialogOpen, setDeployDialogOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Get deployed models from our service
  const fetchDeployedModels = async () => {
    return await ollamaService.getDeployedModels();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch models
      const modelsData = await ollamaService.getModels();
      setModels(modelsData);
      
      // Fetch deployed models (mock)
      const deployedData = await fetchDeployedModels();
      setDeployedModels(deployedData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please check if Ollama is running.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleOpenDeployDialog = (model: Model) => {
    setSelectedModel(model);
    setDeployDialogOpen(true);
  };

  const handleCloseDeployDialog = () => {
    if (!isDeploying) {
      setDeployDialogOpen(false);
      setSelectedModel(null);
    }
  };

  const handleDeployModel = async (config: any) => {
    try {
      setIsDeploying(true);
      
      await ollamaService.createModelServer(config.name, {
        threads: config.threads,
        context_size: config.contextSize,
        gpu_layers: config.gpu_layers,
        temperature: config.temperature,
        system_prompt: config.system_prompt
      });
      
      setIsDeploying(false);
      setDeployDialogOpen(false);
      
      // Refresh deployed models list
      fetchData();
      
      setSnackbar({
        open: true,
        message: `Successfully deployed model: ${config.name}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deploying model:', err);
      setIsDeploying(false);
      setSnackbar({
        open: true,
        message: `Failed to deploy model: ${config.name}`,
        severity: 'error'
      });
    }
  };

  const handleStopModel = async (modelName: string) => {
    try {
      await ollamaService.stopModelServer(modelName);
      
      // Refresh deployed models list
      fetchData();
      
      setSnackbar({
        open: true,
        message: `Successfully stopped model: ${modelName}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error stopping model:', err);
      setSnackbar({
        open: true,
        message: `Failed to stop model: ${modelName}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return <LoadingState message="Loading deployed models..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Deployed Models
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={1} sx={{ mb: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Model</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Configuration</TableCell>
                <TableCell>Started At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deployedModels.length > 0 ? (
                deployedModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <Typography variant="subtitle1">{model.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={model.status} 
                        color={model.status === 'running' ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">Threads: {model.threads}</Typography>
                      <Typography variant="body2">Context: {model.contextSize}</Typography>
                      <Typography variant="body2">GPU Layers: {model.gpuLayers}</Typography>
                    </TableCell>
                    <TableCell>{formatDate(model.startedAt)}</TableCell>
                    <TableCell>
                      {model.status === 'running' ? (
                        <IconButton 
                          color="error" 
                          onClick={() => handleStopModel(model.name)}
                          size="small"
                        >
                          <StopIcon />
                        </IconButton>
                      ) : (
                        <IconButton 
                          color="success"
                          size="small"
                          onClick={() => handleDeployModel({
                            name: model.name,
                            threads: model.threads,
                            context_size: model.contextSize,
                            gpu_layers: model.gpuLayers
                          })}
                        >
                          <PlayIcon />
                        </IconButton>
                      )}
                      <IconButton 
                        color="primary"
                        size="small"
                      >
                        <SettingsIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No models currently deployed
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Available Models
      </Typography>
      <Grid container spacing={3}>
        {models.length > 0 ? (
          models.map((model) => (
            <Grid item xs={12} sm={6} md={3} key={model.name}>
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" noWrap>
                    {model.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(model.size / (1024 * 1024 * 1024)).toFixed(2)} GB
                  </Typography>
                </Box>
                <Box sx={{ mt: 'auto' }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => handleOpenDeployDialog(model)}
                  >
                    Deploy
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography color="text.secondary" sx={{ py: 3 }}>
              No models available to deploy. Go to the Models page to pull models.
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Deploy Model Dialog */}
      <ModelDeployDialog 
        open={isDeployDialogOpen}
        onClose={handleCloseDeployDialog}
        onDeploy={handleDeployModel}
        isDeploying={isDeploying}
        model={selectedModel}
      />

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