import { useCallback, useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Tune as TuneIcon,
  Refresh as RefreshIcon,
  RocketLaunch as DeployIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Layers as LayersIcon
} from '@mui/icons-material';
import ModelDeployDialog from '../components/ModelDeployDialog';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { ollamaService, Model, ModelConfig, DeployedModel } from '../api/ollamaApi';
import { NEVER_CANCELLED, SNACKBAR_AUTO_HIDE_MS } from '../constants/app';
import { EASING, MOTION, RADIUS, SHADOWS, SPACING } from '../theme';
import { formatBytes, formatCount, formatDateTime, formatGigabytesFromBytes } from '../utils/format';

const DEPLOY_TABLE_COLUMN_COUNT = 5;
const SKELETON_ROW_COUNT = 3;
const AVAILABLE_SKELETON_COUNT = 4;
const META_ICON_SIZE = 16;
const AVAILABLE_CARD_MIN_HEIGHT = 148;

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const INITIAL_SNACKBAR: SnackbarState = { open: false, message: '', severity: 'success' };

/**
 * Builds a minimal `Model` for deployments that are no longer in the local
 * library (e.g. started outside this app), so they can still be reconfigured.
 */
const toPlaceholderModel = (name: string): Model => ({
  name,
  modified_at: '',
  size: 0,
  digest: '',
  details: {
    format: '',
    family: '',
    families: [],
    parameter_size: '',
    quantization_level: '',
  },
});

export default function Deploy() {
  const [models, setModels] = useState<Model[]>([]);
  const [deployedModels, setDeployedModels] = useState<DeployedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isDeployDialogOpen, setDeployDialogOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>(INITIAL_SNACKBAR);
  const theme = useTheme();
  const shadows = theme.palette.mode === 'dark' ? SHADOWS.dark : SHADOWS.light;

  // `isCancelled` keeps a late response from writing state after unmount; the
  // mount effect passes it, the refresh button does not need it.
  const fetchData = useCallback(async ({ showSpinner = false, isCancelled = NEVER_CANCELLED } = {}) => {
    if (showSpinner) {
      setRefreshing(true);
    }

    try {
      const [modelsData, deployedData] = await Promise.all([
        ollamaService.getModels(),
        ollamaService.getDeployedModels(),
      ]);

      if (isCancelled()) return;
      setModels(modelsData);
      setDeployedModels(deployedData);
      setError('');
    } catch (err) {
      console.error('Error fetching deployment data:', err);
      if (isCancelled()) return;
      setError('Could not load deployments. Check that Ollama is running and reachable.');
    } finally {
      if (!isCancelled()) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Deferred to a microtask so the effect body performs no state update
    // itself (react-hooks/set-state-in-effect).
    void Promise.resolve().then(() => fetchData({ isCancelled: () => cancelled }));
    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  const handleRefresh = () => {
    // Setting state in an event handler is fine; doing it synchronously inside
    // the mount effect is what react-hooks/set-state-in-effect forbids.
    void fetchData({ showSpinner: true });
  };

  const handleOpenDeployDialog = (model: Model) => {
    setSelectedModel(model);
    setDeployDialogOpen(true);
  };

  /** Reopens the deploy dialog for an existing deployment so it can be retuned. */
  const handleReconfigure = (deployed: DeployedModel) => {
    const match = models.find((model) => model.name === deployed.name);
    handleOpenDeployDialog(match ?? toPlaceholderModel(deployed.name));
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

      await fetchData();

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
      await fetchData();

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
    setSnackbar((current) => ({ ...current, open: false }));
  };

  return (
    <Box sx={{ minHeight: '100%', pb: SPACING.pageHeader }}>
      <PageHeader
        title="Deployments"
        description="Track which models are currently serving requests and start new instances with tuned parameters."
        actions={
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            variant="outlined"
            loading={refreshing}
          >
            Refresh
          </Button>
        }
      />

      {error && !loading && (
        <ErrorState title="Ollama unreachable" message={error} onRetry={() => void fetchData({ showSpinner: true })} />
      )}

      <Paper
        elevation={0}
        component="section"
        aria-labelledby="active-deployments-heading"
        sx={{
          mb: SPACING.section,
          borderRadius: RADIUS.md,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography id="active-deployments-heading" variant="h6" component="h2">
            Active Deployments
          </Typography>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Model Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Configuration</TableCell>
                <TableCell>Started At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
                  <TableRow key={`deploy-skeleton-${index}`}>
                    {Array.from({ length: DEPLOY_TABLE_COLUMN_COUNT }, (_, cellIndex) => (
                      <TableCell key={`deploy-skeleton-cell-${cellIndex}`}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : deployedModels.length > 0 ? (
                deployedModels.map((model) => (
                  <TableRow
                    key={model.id}
                    sx={{
                      transition: `background-color ${MOTION.fast}ms ${EASING}`,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          aria-hidden
                          sx={{
                            p: 0.8,
                            borderRadius: RADIUS.sm,
                            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.1),
                            color: 'primary.main',
                            display: 'flex'
                          }}
                        >
                          <DeployIcon fontSize="small" />
                        </Box>
                        <Typography variant="subtitle2" component="span">
                          {model.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={model.status === 'running' ? 'Running' : 'Stopped'}
                        color={model.status === 'running' ? 'success' : 'default'}
                        size="small"
                        variant={model.status === 'running' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {model.vram ? (
                          <Tooltip title="VRAM usage">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
                              <MemoryIcon aria-hidden sx={{ fontSize: META_ICON_SIZE }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {formatGigabytesFromBytes(model.vram)}
                              </Typography>
                            </Box>
                          </Tooltip>
                        ) : null}

                        {model.threads > 0 && (
                          <Tooltip title="Threads">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                              <SpeedIcon aria-hidden sx={{ fontSize: META_ICON_SIZE }} />
                              <Typography variant="caption">{formatCount(model.threads)}</Typography>
                            </Box>
                          </Tooltip>
                        )}

                        {model.contextSize > 0 && (
                          <Tooltip title="Context size (tokens)">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                              <MemoryIcon aria-hidden sx={{ fontSize: META_ICON_SIZE }} />
                              <Typography variant="caption">{formatCount(model.contextSize)}</Typography>
                            </Box>
                          </Tooltip>
                        )}

                        {model.gpuLayers > 0 && (
                          <Tooltip title="GPU layers">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                              <LayersIcon aria-hidden sx={{ fontSize: META_ICON_SIZE }} />
                              <Typography variant="caption">{formatCount(model.gpuLayers)}</Typography>
                            </Box>
                          </Tooltip>
                        )}

                        {!model.vram && model.threads === 0 && (
                          <Typography variant="caption" color="text.secondary">
                            External deployment
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(model.startedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        {model.status === 'running' ? (
                          <Tooltip title={`Stop ${model.name}`}>
                            <IconButton
                              color="error"
                              aria-label={`Stop ${model.name}`}
                              onClick={() => void handleStopModel(model.name)}
                              size="small"
                            >
                              <StopIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title={`Start ${model.name}`}>
                            <IconButton
                              color="success"
                              size="small"
                              aria-label={`Start ${model.name}`}
                              onClick={() => void handleDeployModel({
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
                        <Tooltip title={`Reconfigure ${model.name}`}>
                          <IconButton
                            color="primary"
                            size="small"
                            aria-label={`Reconfigure ${model.name}`}
                            onClick={() => handleReconfigure(model)}
                          >
                            <TuneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={DEPLOY_TABLE_COLUMN_COUNT} sx={{ borderBottom: 'none' }}>
                    <EmptyState
                      plain
                      icon={<DeployIcon />}
                      title="No models are deployed"
                      description="Pick a model below to start an instance with your preferred thread, context and GPU settings."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box component="section" aria-labelledby="available-heading">
        <Typography id="available-heading" variant="h6" component="h2" sx={{ mb: 2 }}>
          Available to Deploy
        </Typography>

        <Grid container spacing={SPACING.grid}>
          {loading ? (
            Array.from({ length: AVAILABLE_SKELETON_COUNT }, (_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`available-skeleton-${index}`}>
                <Skeleton variant="rounded" height={AVAILABLE_CARD_MIN_HEIGHT} />
              </Grid>
            ))
          ) : models.length > 0 ? (
            models.map((model) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={model.name}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    minHeight: AVAILABLE_CARD_MIN_HEIGHT,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: RADIUS.md,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: `box-shadow ${MOTION.base}ms ${EASING}, border-color ${MOTION.base}ms ${EASING}`,
                    '&:hover': {
                      boxShadow: shadows.md,
                      borderColor: alpha(theme.palette.primary.main, 0.35),
                    }
                  }}
                >
                  <Box sx={{ mb: 2, minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      component="h3"
                      title={model.name}
                      sx={{ mb: 0.75, wordBreak: 'break-word' }}
                    >
                      {model.name}
                    </Typography>
                    <Chip
                      // formatBytes picks MB for small models; a fixed GB unit
                      // rendered embedding models as an unhelpful "0.26 GB".
                      label={formatBytes(model.size)}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.secondary.main, 0.12),
                        color: 'secondary.main',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                  <Box sx={{ mt: 'auto' }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleOpenDeployDialog(model)}
                      startIcon={<DeployIcon />}
                    >
                      Deploy
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))
          ) : (
            !error && (
              <Grid size={12}>
                <EmptyState
                  icon={<DeployIcon />}
                  title="Nothing available to deploy"
                  description="Pull a model on the Models page first, then come back to start an instance."
                />
              </Grid>
            )
          )}
        </Grid>
      </Box>

      <ModelDeployDialog
        open={isDeployDialogOpen}
        onClose={handleCloseDeployDialog}
        onDeploy={handleDeployModel}
        isDeploying={isDeploying}
        model={selectedModel}
      />

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
    </Box>
  );
}
