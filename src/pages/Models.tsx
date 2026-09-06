import { useCallback, useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  Skeleton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  CloudDownload as DownloadIcon,
  DeleteOutlined as DeleteIcon,
  CheckBoxOutlined as SelectIcon
} from '@mui/icons-material';
import ModelCard from '../components/ModelCard';
import ModelPullDialog from '../components/ModelPullDialog';
import ModelDeployDialog from '../components/ModelDeployDialog';
import ModelDetailsDialog from '../components/ModelDetailsDialog';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { ollamaService, Model, ModelConfig } from '../api/ollamaApi';
import { NEVER_CANCELLED, SNACKBAR_AUTO_HIDE_MS } from '../constants/app';
import { RADIUS, SPACING } from '../theme';

const MODEL_SKELETON_COUNT = 6;
const MODEL_SKELETON_BUTTON_HEIGHT = 36;
const FAB_OFFSET = 16;

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const INITIAL_SNACKBAR: SnackbarState = { open: false, message: '', severity: 'success' };

/**
 * Full sentences per count, so plurals stay correct instead of being stitched
 * together from fragments (the old label read "Delete Selected (1)").
 */
const deleteSelectedLabel = (count: number) =>
  count === 1 ? 'Delete 1 selected model' : `Delete ${count} selected models`;

const deleteConfirmQuestion = (count: number) =>
  count === 1
    ? 'Delete the selected model? This cannot be undone.'
    : `Delete the ${count} selected models? This cannot be undone.`;

const deleteSuccessMessage = (count: number) =>
  count === 1 ? 'Deleted 1 model.' : `Deleted ${count} models.`;

export default function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPullDialogOpen, setPullDialogOpen] = useState(false);
  const [isDeployDialogOpen, setDeployDialogOpen] = useState(false);
  const [isInfoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [snackbar, setSnackbar] = useState<SnackbarState>(INITIAL_SNACKBAR);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isBulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // `isCancelled` lets the mount effect discard a response that arrives after
  // unmount while still sharing one code path with the retry button.
  const fetchModels = useCallback(async (isCancelled: () => boolean = NEVER_CANCELLED) => {
    try {
      const data = await ollamaService.getModels();
      if (isCancelled()) return;
      setModels(data);
      setError('');
    } catch (err) {
      console.error('Error fetching models:', err);
      if (isCancelled()) return;
      setError('Could not load your model library. Check that Ollama is running and reachable.');
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Deferred to a microtask so the effect body performs no state update
    // itself (react-hooks/set-state-in-effect).
    void Promise.resolve().then(() => fetchModels(() => cancelled));
    return () => {
      cancelled = true;
    };
  }, [fetchModels]);

  const handleRetry = () => {
    setLoading(true);
    void fetchModels();
  };

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

  const handleOpenInfoDialog = (model: Model) => {
    setSelectedModel(model);
    setInfoDialogOpen(true);
  };

  const handleCloseInfoDialog = () => {
    setInfoDialogOpen(false);
    setSelectedModel(null);
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

  const handleToggleSelectionMode = () => {
    setIsSelectionMode((current) => !current);
    setSelectedModels([]);
  };

  const handleSelectModel = (model: Model) => {
    setSelectedModels((current) =>
      current.includes(model.name)
        ? current.filter((name) => name !== model.name)
        : [...current, model.name]
    );
  };

  const handleBulkDelete = async () => {
    const count = selectedModels.length;
    if (count === 0) {
      return;
    }

    try {
      setIsBulkDeleting(true);
      for (const name of selectedModels) {
        await ollamaService.deleteModel(name);
      }

      await fetchModels();
      setSelectedModels([]);
      setIsSelectionMode(false);
      setBulkDeleteOpen(false);

      setSnackbar({ open: true, message: deleteSuccessMessage(count), severity: 'success' });
    } catch (err) {
      console.error('Error deleting models:', err);
      setBulkDeleteOpen(false);
      setSnackbar({
        open: true,
        message: 'Some models could not be deleted. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const headerActions = loading ? null : (
    <>
      {isSelectionMode ? (
        <>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setBulkDeleteOpen(true)}
            disabled={selectedModels.length === 0}
          >
            {deleteSelectedLabel(selectedModels.length)}
          </Button>
          <Button variant="text" onClick={handleToggleSelectionMode}>
            Cancel
          </Button>
        </>
      ) : (
        <Button
          variant="outlined"
          startIcon={<SelectIcon />}
          onClick={handleToggleSelectionMode}
          disabled={models.length === 0}
        >
          Select models
        </Button>
      )}
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={handleOpenPullDialog}
        sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
      >
        Pull new model
      </Button>
    </>
  );

  return (
    <Box sx={{ minHeight: '100%', pb: SPACING.pageHeader }}>
      <PageHeader
        title="Local Models"
        description="Browse the models on this machine, inspect their details, deploy them or free up disk space."
        actions={headerActions}
      />

      {error && !loading && <ErrorState title="Ollama unreachable" message={error} onRetry={handleRetry} />}

      {loading ? (
        <Grid container spacing={SPACING.grid} aria-busy="true" aria-label="Loading models">
          {Array.from({ length: MODEL_SKELETON_COUNT }, (_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`model-skeleton-${index}`}>
              <Card sx={{ borderRadius: RADIUS.lg }}>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="text" width="70%" height={28} />
                  <Skeleton variant="rounded" width="45%" height={22} sx={{ my: 1.5 }} />
                  <Skeleton variant="text" width="55%" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="rounded" height={MODEL_SKELETON_BUTTON_HEIGHT} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : models.length > 0 ? (
        <>
          {isSelectionMode && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} aria-live="polite">
              {selectedModels.length === 0
                ? 'Pick the models you want to remove.'
                : deleteSelectedLabel(selectedModels.length)}
            </Typography>
          )}
          <Grid container spacing={SPACING.grid}>
            {models.map((model) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={model.name}>
                <ModelCard
                  model={model}
                  onDelete={handleDeleteModel}
                  onDeploy={handleOpenDeployDialog}
                  onInfo={handleOpenInfoDialog}
                  selectable={isSelectionMode}
                  selected={selectedModels.includes(model.name)}
                  onSelect={handleSelectModel}
                />
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        !error && (
          <EmptyState
            icon={<DownloadIcon />}
            title="No models yet"
            description="Your local library is empty. Pull a model from the Ollama library to get started."
            action={
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenPullDialog}>
                Pull your first model
              </Button>
            }
          />
        )
      )}

      <ModelPullDialog
        open={isPullDialogOpen}
        onClose={handleClosePullDialog}
        onPull={handlePullModel}
        isPulling={isPulling}
        progress={pullProgress}
      />

      <ModelDeployDialog
        open={isDeployDialogOpen}
        onClose={handleCloseDeployDialog}
        onDeploy={handleDeployModel}
        isDeploying={isDeploying}
        model={selectedModel}
      />

      <ModelDetailsDialog
        open={isInfoDialogOpen}
        onClose={handleCloseInfoDialog}
        modelName={selectedModel?.name || ''}
      />

      <Dialog
        open={isBulkDeleteOpen}
        onClose={() => !isBulkDeleting && setBulkDeleteOpen(false)}
        aria-labelledby="bulk-delete-title"
        slotProps={{ paper: { sx: { borderRadius: RADIUS.lg } } }}
      >
        <DialogTitle id="bulk-delete-title">Delete selected models?</DialogTitle>
        <DialogContent>
          <DialogContentText>{deleteConfirmQuestion(selectedModels.length)}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setBulkDeleteOpen(false)} disabled={isBulkDeleting} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleBulkDelete()}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            loading={isBulkDeleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Compact primary action for small screens, where the header button is hidden. */}
      <Fab
        color="primary"
        aria-label="Pull new model"
        sx={{
          display: { xs: 'inline-flex', sm: 'none' },
          position: 'fixed',
          bottom: FAB_OFFSET,
          right: FAB_OFFSET
        }}
        onClick={handleOpenPullDialog}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
