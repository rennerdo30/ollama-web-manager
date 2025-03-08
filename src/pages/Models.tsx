import { useEffect, useState } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Button, 
  Alert,
  Fab,
  Snackbar
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ModelCard from '../components/ModelCard';
import LoadingState from '../components/LoadingState';
import ModelPullDialog from '../components/ModelPullDialog';
import ModelDeployDialog from '../components/ModelDeployDialog';
import { ollamaService, Model } from '../api/ollamaApi';

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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Models
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenPullDialog}
        >
          Pull Model
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {models.length > 0 ? (
          models.map((model, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ModelCard 
                model={model} 
                onDelete={handleDeleteModel}
                onDeploy={handleOpenDeployDialog}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No models available
              </Typography>
              <Typography color="text.secondary" paragraph>
                Pull a model from the Ollama library to get started.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenPullDialog}
              >
                Pull Model
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