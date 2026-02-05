import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,

  Divider,
  CircularProgress
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Model, ollamaService, SystemInfo, ModelConfig } from '../api/ollamaApi';

interface ModelDeployDialogProps {
  open: boolean;
  onClose: () => void;
  onDeploy: (config: ModelConfig) => Promise<void>;
  isDeploying: boolean;
  model: Model | null;
}

interface DeployFormConfig {
  threads: number;
  contextSize: number;
  gpu_layers: number;
  temperature: number;
  system_prompt: string;
  parallel_executions: number;
  selected_gpus: number[];
}

const isPlaceholderGpu = (name: string) => {
  const normalizedName = name.toLowerCase();
  return normalizedName.includes('no dedicated gpu detected') ||
    normalizedName.includes('monitoring server offline');
};

export default function ModelDeployDialog({
  open,
  onClose,
  onDeploy,
  isDeploying,
  model
}: ModelDeployDialogProps) {
  const [config, setConfig] = useState<DeployFormConfig>({
    threads: 4,
    contextSize: 4096,
    gpu_layers: 0,
    temperature: 0.7,
    system_prompt: '',
    parallel_executions: 1,
    selected_gpus: [0] // Default to first GPU
  });
  const [error, setError] = useState('');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Recommended context sizes based on model size (parameters)
  const recommendedContextSizes: { [key: string]: number } = {
    '7': 4096,
    '8': 4096,
    '13': 4096,
    '34': 8192,
    '70': 8192
  };

  // Function to fetch system information
  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const info = await ollamaService.getSystemInfo();
      setSystemInfo(info);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching system info:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSystemInfo();
    }
  }, [open]);

  useEffect(() => {
    if (model && systemInfo) {
      const availableGpus = systemInfo.gpus.filter((gpu) => !isPlaceholderGpu(gpu.name));

      // Get model size from name (e.g., llama2:7b -> 7b)
      const modelSizeMatch = model.name.match(/(\d+)\s*b/i);
      const modelSize = modelSizeMatch ? modelSizeMatch[1] : null;

      // Set recommended context size based on model size
      const recommendedContext = modelSize && recommendedContextSizes[modelSize]
        ? recommendedContextSizes[modelSize]
        : 4096;

      // Set recommended thread count based on CPU cores
      const recommendedThreads = Math.max(2, Math.min(
        Math.floor(systemInfo.cpu.threads / 2), // Half the available threads
        8 // Cap at 8 threads by default
      ));

      // Set recommended GPU layers based on available GPU memory
      // If model has quantization level, adjust recommendation
      let recommendedGpuLayers = 0;

      if (systemInfo.gpus && systemInfo.gpus.length > 0) {
        // Simple formula: If we have a GPU, use it for all layers
        recommendedGpuLayers = availableGpus.length > 0 ? 100 : 0;
      }

      // Reset config with recommended values
      setConfig({
        threads: recommendedThreads,
        contextSize: recommendedContext,
        gpu_layers: recommendedGpuLayers,
        temperature: 0.7,
        system_prompt: '',
        parallel_executions: 1,
        selected_gpus: availableGpus.length > 0
          ? [availableGpus[0].id]
          : []
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, systemInfo]);

  const handleDeploy = async () => {
    setError('');
    try {
      if (!model) {
        setError('No model selected');
        return;
      }
      await onDeploy({
        name: model.name,
        ...config
      });
    } catch {
      setError('Failed to deploy model. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isDeploying) {
      setError('');
      onClose();
    }
  };

  const handleChange = <K extends keyof DeployFormConfig>(
    field: K,
    value: DeployFormConfig[K]
  ) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const normalizeSliderValue = (value: number | number[]) => {
    return Array.isArray(value) ? value[0] : value;
  };

  if (!model) {
    return null;
  }

  const availableGpus = systemInfo?.gpus.filter((gpu) => !isPlaceholderGpu(gpu.name)) || [];
  const hasAvailableGpu = availableGpus.length > 0;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Deploy Model: {model.name}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h6" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          Resource Configuration
          {loading && <CircularProgress size={20} />}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography id="threads-slider" gutterBottom>
            CPU Threads: {config.threads}
          </Typography>
          <Slider
            value={config.threads}
            min={1}
            max={systemInfo ? Math.max(16, systemInfo.cpu.threads) : 16}
            step={1}
            marks={[
              { value: 1, label: '1' },
              { value: systemInfo?.cpu.threads ? Math.floor(systemInfo.cpu.threads / 2) : 4, label: 'Half' },
              { value: systemInfo?.cpu.threads || 8, label: 'Max' }
            ]}
            onChange={(_, value) => handleChange('threads', normalizeSliderValue(value))}
            aria-labelledby="threads-slider"
            valueLabelDisplay="auto"
            disabled={isDeploying}
          />
          <Typography component="div" variant="body2" color="text.secondary">
            Number of CPU threads to use for inference
            {systemInfo && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Your system has {systemInfo.cpu.cores} cores and {systemInfo.cpu.threads} threads available
              </Typography>
            )}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography id="context-slider" gutterBottom>
            Context Size
          </Typography>
          <Slider
            value={config.contextSize}
            min={1024}
            max={16384}
            step={1024}
            marks={[
              { value: 1024, label: '1K' },
              { value: 4096, label: '4K' },
              { value: 8192, label: '8K' },
              { value: 16384, label: '16K' }
            ]}
            onChange={(_, value) => handleChange('contextSize', normalizeSliderValue(value))}
            aria-labelledby="context-slider"
            valueLabelDisplay="auto"
            disabled={isDeploying}
          />
          <Typography variant="body2" color="text.secondary">
            Context window size for the model
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography id="gpu-layers-slider" gutterBottom>
            GPU Layers
          </Typography>
          <Slider
            value={config.gpu_layers}
            min={0}
            max={100}
            step={1}
            onChange={(_, value) => handleChange('gpu_layers', normalizeSliderValue(value))}
            aria-labelledby="gpu-layers-slider"
            valueLabelDisplay="auto"
            disabled={isDeploying || !hasAvailableGpu}
            marks={[
              { value: 0, label: 'CPU' },
              { value: 50, label: '50%' },
              { value: 100, label: 'All' }
            ]}
          />
          <Typography component="div" variant="body2" color="text.secondary">
            Number of layers to offload to GPU (0 = CPU only)
            {!hasAvailableGpu && (
              <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                No GPUs detected. Model will run on CPU only.
              </Typography>
            )}
          </Typography>
        </Box>

        {/* GPU Selection (if multiple GPUs available) */}
        {availableGpus.length > 1 && (
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              GPUs to Use
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="gpu-select-label">Select GPUs</InputLabel>
              <Select
                labelId="gpu-select-label"
                multiple
                value={config.selected_gpus}
                onChange={(e) => {
                  const selected = e.target.value as (string | number)[];
                  handleChange('selected_gpus', selected.map((gpuId) => Number(gpuId)));
                }}
                disabled={isDeploying || config.gpu_layers === 0}
                renderValue={(selected) => {
                  return selected.map(gpuId => {
                    const gpu = availableGpus.find(g => g.id === gpuId);
                    return gpu ? gpu.name : `GPU ${gpuId}`;
                  }).join(', ');
                }}
              >
                {availableGpus.map((gpu) => (
                  <MenuItem key={gpu.id} value={gpu.id}>
                    {gpu.name} ({gpu.memory.used}/{gpu.memory.total} GB used)
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Select which GPUs to use for this model (only applies if GPU Layers &gt; 0)
              </Typography>
            </FormControl>
          </Box>
        )}

        {/* Parallel Executions */}
        <Box sx={{ mb: 3 }}>
          <Typography id="parallel-slider" gutterBottom>
            Parallel Executions: {config.parallel_executions}
          </Typography>
          <Slider
            value={config.parallel_executions}
            min={1}
            max={8}
            step={1}
            marks={[
              { value: 1, label: '1' },
              { value: 4, label: '4' },
              { value: 8, label: '8' }
            ]}
            onChange={(_, value) => handleChange('parallel_executions', normalizeSliderValue(value))}
            aria-labelledby="parallel-slider"
            valueLabelDisplay="auto"
            disabled={isDeploying}
          />
          <Typography variant="body2" color="text.secondary">
            Number of concurrent requests the model can handle (higher values use more memory)
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Inference Parameters
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography id="temperature-slider" gutterBottom>
            Temperature: {config.temperature}
          </Typography>
          <Slider
            value={config.temperature}
            min={0}
            max={2}
            step={0.1}
            marks={[
              { value: 0, label: '0' },
              { value: 0.7, label: '0.7' },
              { value: 1, label: '1' },
              { value: 2, label: '2' }
            ]}
            onChange={(_, value) => handleChange('temperature', normalizeSliderValue(value))}
            aria-labelledby="temperature-slider"
            valueLabelDisplay="auto"
            disabled={isDeploying}
          />
          <Typography variant="body2" color="text.secondary">
            Controls randomness (higher = more creative, lower = more deterministic)
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="System Prompt"
            multiline
            rows={4}
            fullWidth
            value={config.system_prompt}
            onChange={(e) => handleChange('system_prompt', e.target.value)}
            placeholder="Enter a system prompt to guide the model's behavior..."
            variant="outlined"
            disabled={isDeploying}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            System prompt that defines how the model behaves
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isDeploying}>
          Cancel
        </Button>
        <Button
          onClick={handleDeploy}
          disabled={isDeploying}
          variant="contained"
        >
          {isDeploying ? 'Deploying...' : 'Deploy Model'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
