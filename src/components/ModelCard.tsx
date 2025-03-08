import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Menu, 
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useState } from 'react';
import { Model } from '../api/ollamaApi';

interface ModelCardProps {
  model: Model;
  onDelete: (model: Model) => void;
  onDeploy: (model: Model) => void;
}

export default function ModelCard({ model, onDelete, onDeploy }: ModelCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleClose();
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    setConfirmDelete(false);
    onDelete(model);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  const formatSize = (size: number) => {
    const gb = size / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    
    const mb = size / (1024 * 1024);
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    
    const kb = size / 1024;
    return `${kb.toFixed(2)} KB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" component="div">
              {model.name}
            </Typography>
            <Button
              id="model-menu-button"
              aria-controls={open ? 'model-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <MoreVertIcon />
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            {model.details && (
              <>
                <Chip 
                  label={`${model.details.parameter_size}`} 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                {model.details.quantization_level && (
                  <Chip 
                    label={`Q${model.details.quantization_level}`} 
                    size="small" 
                    sx={{ mr: 1, mb: 1 }} 
                  />
                )}
                <Chip 
                  label={model.details.format || 'GGUF'} 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }} 
                />
              </>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Size: {formatSize(model.size)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Modified: {formatDate(model.modified_at)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            ID: {model.digest.substring(0, 10)}...
          </Typography>
        </CardContent>
        <Box sx={{ p: 2, pt: 0 }}>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={() => onDeploy(model)}
          >
            Deploy
          </Button>
        </Box>
      </Card>

      <Menu
        id="model-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'model-menu-button',
        }}
      >
        <MenuItem onClick={() => { 
          handleClose(); 
          onDeploy(model); 
        }}>
          Deploy
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
      </Menu>

      <Dialog
        open={confirmDelete}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Model Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the model "{model.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} autoFocus color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}