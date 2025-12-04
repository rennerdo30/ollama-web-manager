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
  DialogActions,
  useTheme,
  alpha,
  IconButton,
  Divider
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Storage as StorageIcon,
  AccessTime as TimeIcon,
  Code as CodeIcon,
  RocketLaunch as DeployIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { Model } from '../api/ollamaApi';

interface ModelCardProps {
  model: Model;
  onDelete: (model: Model) => void;
  onDeploy: (model: Model) => void;
  onInfo: (model: Model) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (model: Model) => void;
}

export default function ModelCard({
  model,
  onDelete,
  onDeploy,
  onInfo,
  selectable = false,
  selected = false,
  onSelect
}: ModelCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const open = Boolean(anchorEl);
  const theme = useTheme();

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
    return date.toLocaleDateString();
  };

  return (
    <>
      <Card sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        borderRadius: 3,
        overflow: 'visible',
        border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
        cursor: selectable ? 'pointer' : 'default'
      }}
        onClick={() => {
          if (selectable && onSelect) {
            onSelect(model);
          }
        }}
      >
        {selectable && (
          <Box sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            bgcolor: selected ? 'primary.main' : 'background.paper',
            borderRadius: '50%',
            width: 24,
            height: 24,
            border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme.shadows[2]
          }}>
            {selected && (
              <Box sx={{
                width: 10,
                height: 10,
                bgcolor: 'white',
                borderRadius: '50%'
              }} />
            )}
          </Box>
        )}
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex'
              }}>
                <CodeIcon fontSize="small" />
              </Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {model.name}
              </Typography>
            </Box>
            <IconButton
              id="model-menu-button"
              aria-controls={open ? 'model-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              size="small"
              sx={{ mt: -0.5, mr: -0.5 }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {model.details && (
              <>
                <Chip
                  label={`${model.details.parameter_size}`}
                  size="small"
                  sx={{
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: 'secondary.main',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
                {model.details.quantization_level && (
                  <Chip
                    label={`Q${model.details.quantization_level}`}
                    size="small"
                    sx={{
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: 'info.main',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                )}
                <Chip
                  label={model.details.format || 'GGUF'}
                  size="small"
                  sx={{
                    borderRadius: 1,
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <StorageIcon sx={{ fontSize: 16, opacity: 0.7 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatSize(model.size)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <TimeIcon sx={{ fontSize: 16, opacity: 0.7 }} />
              <Typography variant="body2">
                Updated {formatDate(model.modified_at)}
              </Typography>
            </Box>
          </Box>
        </CardContent>

        <Divider sx={{ opacity: 0.5 }} />

        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => onDeploy(model)}
            startIcon={<DeployIcon />}
            sx={{
              borderRadius: 2,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }
            }}
          >
            Deploy Model
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
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2, minWidth: 150, mt: 1 }
        }}
      >
        <MenuItem onClick={() => {
          handleClose();
          onDeploy(model);
        }} sx={{ gap: 1.5 }}>
          <DeployIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={500}>Deploy</Typography>
        </MenuItem>
        <MenuItem onClick={() => {
          handleClose();
          onInfo(model);
        }} sx={{ gap: 1.5 }}>
          <CodeIcon fontSize="small" color="info" />
          <Typography variant="body2" fontWeight={500}>Details</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleDeleteClick} sx={{ gap: 1.5, color: 'error.main' }}>
          <Box component="span" sx={{ display: 'flex', fontSize: 20 }}>×</Box>
          <Typography variant="body2" fontWeight={500}>Delete</Typography>
        </MenuItem>
      </Menu>

      <Dialog
        open={confirmDelete}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>
          {"Delete Model?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete <strong>{model.name}</strong>? This action cannot be undone and you will need to download the model again.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCancelDelete} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disableElevation
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Delete Model
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}