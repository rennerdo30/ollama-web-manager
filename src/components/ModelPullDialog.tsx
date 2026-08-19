import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  LinearProgress,
  Typography,
  Box
} from '@mui/material';
import { CloudDownload as DownloadIcon } from '@mui/icons-material';
import { useState } from 'react';
import { RADIUS } from '../theme';
import { formatPercent } from '../utils/format';

const PROGRESS_BAR_HEIGHT = 10;
const EXAMPLE_MODELS = 'llama3, mistral, gemma:7b';

interface ModelPullDialogProps {
  open: boolean;
  onClose: () => void;
  onPull: (modelName: string) => Promise<void>;
  isPulling: boolean;
  progress: number;
}

export default function ModelPullDialog({
  open,
  onClose,
  onPull,
  isPulling,
  progress
}: ModelPullDialogProps) {
  const [modelName, setModelName] = useState('');
  const [error, setError] = useState('');

  const handlePull = async () => {
    if (!modelName.trim()) {
      setError('Enter the name of the model you want to pull.');
      return;
    }

    setError('');
    try {
      await onPull(modelName.trim());
    } catch {
      setError('Pulling the model failed. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isPulling) {
      setModelName('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="pull-model-title"
      slotProps={{ paper: { sx: { borderRadius: RADIUS.lg } } }}
    >
      <DialogTitle id="pull-model-title">Pull a model from the Ollama library</DialogTitle>
      <DialogContent>
        {!isPulling ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the name of the model you want to download, for example {EXAMPLE_MODELS}.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Model name"
              fullWidth
              variant="outlined"
              value={modelName}
              onChange={(event) => setModelName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handlePull();
                }
              }}
              error={Boolean(error)}
              helperText={error}
            />
          </>
        ) : (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Pulling {modelName}…
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              aria-label={`Download progress for ${modelName}`}
              sx={{ mb: 1, height: PROGRESS_BAR_HEIGHT }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              align="right"
              aria-live="polite"
              sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatPercent(progress)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Large models can take several minutes. Keep this dialog open until it finishes.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} disabled={isPulling} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          onClick={() => void handlePull()}
          disabled={!modelName.trim()}
          loading={isPulling}
          variant="contained"
          startIcon={<DownloadIcon />}
        >
          Pull model
        </Button>
      </DialogActions>
    </Dialog>
  );
}
