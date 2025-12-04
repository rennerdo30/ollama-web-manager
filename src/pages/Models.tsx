import { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  Alert,
  Fab,
  Snackbar,
  useTheme
} from '@mui/material';
import { Add as AddIcon, CloudDownload as DownloadIcon } from '@mui/icons-material';
import ModelCard from '../components/ModelCard';
import LoadingState from '../components/LoadingState';
import ModelPullDialog from '../components/ModelPullDialog';
import ModelDeployDialog from '../components/ModelDeployDialog';
import { ollamaService, Model, ModelConfig } from '../api/ollamaApi';

export default function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPullDialogOpen, setPullDialogOpen] = useState(false);
  const [isDeployDialogOpen, setDeployDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const theme = useTheme();

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await ollamaService.getModels();
      setModels(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError('Failed to fetch models. Please check if Ollama is running.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleOpenPullDialog = () => {
    setPullDialogOpen(true);
  };

  const handleClosePullDialog = () => {
    if (!isPulling) {
      setPullDialogOpen(false);
    }
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

  const handlePullModel = async (modelName: string) => {
    try {
      setIsPulling(true);
      setPullProgress(0);

      await ollamaService.pullModel(modelName, (progress) => {
        setPullProgress(progress);
      });

      setIsPulling(false);
      setPullDialogOpen(false);

      // Refresh models list
      await fetchModels();

      setSnackbar({
        open: true,
        message: `Successfully pulled model: ${modelName}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error pulling model:', err);
      setIsPulling(false);
      setSnackbar({
        open: true,
        message: `Failed to pull model: ${modelName}`,
        severity: 'error'
      });
    }
  };

  const handleDeployModel = async (config: ModelConfig) => {
    try {
      setIsDeploying(true);

      await ollamaService.createModelServer(config.name as string, {
        threads: config.threads as number,
        context_size: config.contextSize as number,
        gpu_layers: config.gpu_layers as number,
        temperature: config.temperature as number,
        system_prompt: config.system_prompt as string
      });

      setIsDeploying(false);
      setDeployDialogOpen(false);

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

  const handleDeleteModel = async (model: Model) => {
    try {
      await ollamaService.deleteModel(model.name);

      // Refresh models list
      await fetchModels();

      setSnackbar({
        open: true,
        message: `Successfully deleted model: ${model.name}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting model:', err);
      setSnackbar({
        open: true,
        message: `Failed to delete model: ${model.name}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && models.length === 0) {
    return <LoadingState message="Loading models..." />;
  }

  return (
    <Box sx={{ minHeight: '100%', pb: 4 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Local Models
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your downloaded LLMs
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleOpenPullDialog}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            boxShadow: theme.shadows[4]
          }}
        >
          Pull New Model
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {models.length > 0 ? (
          models.map((model, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Box sx={{ height: '100%' }}>
                <ModelCard
                  model={model}
                  onDelete={handleDeleteModel}
                  onDeploy={handleOpenDeployDialog}
                />
              </Box>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider'
            }}>
              <DownloadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No models available
              </Typography>
              <Typography color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                Your local library is empty. Pull a model from the Ollama library to get started.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenPullDialog}
                sx={{ borderRadius: 2 }}
              >
                Browse Models
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Pull Model Dialog */}
      <ModelPullDialog
        open={isPullDialogOpen}
        onClose={handleClosePullDialog}
        onPull={handlePullModel}
        isPulling={isPulling}
        progress={pullProgress}
      />

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

      {/* FAB for mobile */}
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleOpenPullDialog}
        >
          <AddIcon />
        </Fab>
      </Box>
    </Box>
  );
}