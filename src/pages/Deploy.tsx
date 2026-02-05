import { useEffect, useState } from 'react';
import Grid from '@mui/material/GridLegacy';
import {
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
  Snackbar,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  RocketLaunch as DeployIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Layers as LayersIcon
} from '@mui/icons-material';
import LoadingState from '../components/LoadingState';
import ModelDeployDialog from '../components/ModelDeployDialog';
import { ollamaService, Model, ModelConfig, DeployedModel } from '../api/ollamaApi';

// Note: This is a mock interface since Ollama doesn't provide active models directly
// interface DeployedModel { ... } removed to use shared interface

export default function Deploy() {
  const [models, setModels] = useState<Model[]>([]);
  const [deployedModels, setDeployedModels] = useState<DeployedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isDeployDialogOpen, setDeployDialogOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const theme = useTheme();

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
      setError('');

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please check if Ollama is running.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDeployModel = async (config: ModelConfig) => {
    try {
      setIsDeploying(true);
      const resolvedContextSize = typeof config.contextSize === 'number'
        ? config.contextSize
        : config.context_size;

      await ollamaService.createModelServer(config.name as string, {
        threads: config.threads as number,
        context_size: resolvedContextSize as number,
        gpu_layers: config.gpu_layers as number,
        temperature: config.temperature as number,
        system_prompt: config.system_prompt as string
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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <LoadingState message="Loading deployed models..." />;
  }

  return (
    <Box sx={{ minHeight: '100%', pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Deployments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage active model instances
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          mb: 5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Active Deployments</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell sx={{ fontWeight: 600 }}>Model Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Configuration</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Started At</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deployedModels.length > 0 ? (
                deployedModels.map((model) => (
                  <TableRow
                    key={model.id}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          p: 0.8,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          display: 'flex'
                        }}>
                          <DeployIcon fontSize="small" />
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {model.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={model.status}
                        color={model.status === 'running' ? 'success' : 'default'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 1,
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {model.vram ? (
                          <Tooltip title="VRAM Usage">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                              <MemoryIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {(model.vram / (1024 * 1024 * 1024)).toFixed(2)} GB
                              </Typography>
                            </Box>
                          </Tooltip>
                        ) : null}

                        {model.threads > 0 && (
                          <Tooltip title="Threads">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                              <SpeedIcon sx={{ fontSize: 16 }} />
                              <Typography variant="caption">{model.threads}</Typography>
                            </Box>
                          </Tooltip>
                        )}

                        {model.contextSize > 0 && (
                          <Tooltip title="Context Size">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                              <MemoryIcon sx={{ fontSize: 16 }} />
                              <Typography variant="caption">{model.contextSize}</Typography>
                            </Box>
                          </Tooltip>
                        )}

                        {model.gpuLayers > 0 && (
                          <Tooltip title="GPU Layers">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                              <LayersIcon sx={{ fontSize: 16 }} />
                              <Typography variant="caption">{model.gpuLayers}</Typography>
                            </Box>
                          </Tooltip>
                        )}

                        {!model.vram && model.threads === 0 && (
                          <Typography variant="caption" color="text.secondary">
                            External Deployment
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(model.startedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {model.status === 'running' ? (
                          <Tooltip title="Stop Model">
                            <IconButton
                              color="error"
                              onClick={() => handleStopModel(model.name)}
                              size="small"
                            >
                              <StopIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Start Model">
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
                              <PlayIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Settings">
                          <IconButton
                            color="primary"
                            size="small"
                          >
                            <SettingsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <DeployIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                      <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                        No models currently deployed
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Deploy a model from the list below to get started
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Available to Deploy
      </Typography>
      <Grid container spacing={3}>
        {models.length > 0 ? (
          models.map((model) => (
            <Grid item xs={12} sm={6} md={3} key={model.name}>
              <Paper sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                transition: 'box-shadow 0.2s',
                '&:hover': {
                  boxShadow: theme.shadows[2]
                }
              }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" noWrap sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
                    {model.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={`${(model.size / (1024 * 1024 * 1024)).toFixed(2)} GB`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: 'secondary.main',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ mt: 'auto' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleOpenDeployDialog(model)}
                    startIcon={<DeployIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Deploy
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
              <Typography color="text.secondary">
                No models available to deploy. Go to the Models page to pull models.
              </Typography>
            </Paper>
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
          sx={{ borderRadius: 2, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
