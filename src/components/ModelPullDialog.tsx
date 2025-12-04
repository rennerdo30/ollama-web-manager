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
import { useState } from 'react';

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
      setError('Model name is required');
      return;
    }

    setError('');
    try {
      await onPull(modelName);
    } catch {
      setError('Failed to pull model. Please try again.');
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
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Pull Model from Ollama Library</DialogTitle>
      <DialogContent>
        {!isPulling ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the name of the model you want to pull (e.g., llama3, mistral, gemma:7b)
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Model Name"
              fullWidth
              variant="outlined"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              error={!!error}
              helperText={error}
              disabled={isPulling}
            />
          </>
        ) : (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Pulling model: {modelName}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mb: 1, height: 10, borderRadius: 1 }}
            />
            <Typography variant="body2" color="text.secondary" align="right">
              {progress}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPulling}>
          Cancel
        </Button>
        <Button onClick={handlePull} disabled={isPulling || !modelName.trim()}>
          Pull
        </Button>
      </DialogActions>
    </Dialog>
  );
}