import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Checkbox,
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
  DeleteOutlined as DeleteIcon,
  RocketLaunch as DeployIcon
} from '@mui/icons-material';
import { useId, useState } from 'react';
import { Model } from '../api/ollamaApi';
import { EASING, HOVER_LIFT, MOTION, RADIUS, SHADOWS } from '../theme';
import { formatBytes, formatDate } from '../utils/format';

const MENU_ITEM_FONT_WEIGHT = 500;
const SELECTED_OUTLINE_WIDTH = 2;
const ICON_BADGE_PADDING = 1;
const META_ICON_SIZE = 16;
const MENU_MIN_WIDTH = 168;

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
  const shadows = theme.palette.mode === 'dark' ? SHADOWS.dark : SHADOWS.light;

  // Unique per card: the previous hardcoded ids were duplicated across every
  // rendered model, breaking the menu/dialog ARIA associations.
  const reactId = useId();
  const menuButtonId = `model-menu-button-${reactId}`;
  const menuId = `model-menu-${reactId}`;
  const deleteTitleId = `delete-title-${reactId}`;
  const deleteDescriptionId = `delete-description-${reactId}`;

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

  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(model);
    }
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: `transform ${MOTION.base}ms ${EASING}, box-shadow ${MOTION.base}ms ${EASING}, border-color ${MOTION.base}ms ${EASING}`,
          '&:hover': {
            transform: `translateY(-${HOVER_LIFT}px)`,
            boxShadow: shadows.lg,
            borderColor: alpha(theme.palette.primary.main, 0.35),
          },
          borderRadius: RADIUS.lg,
          // `outline` rather than a border so selecting a card does not shift
          // its contents by the border width.
          outline: selected ? `${SELECTED_OUTLINE_WIDTH}px solid ${theme.palette.primary.main}` : 'none',
          outlineOffset: -SELECTED_OUTLINE_WIDTH,
          cursor: selectable ? 'pointer' : 'default'
        }}
        onClick={handleCardClick}
      >
        {selectable && (
          <Checkbox
            checked={selected}
            onChange={() => onSelect?.(model)}
            onClick={(event) => event.stopPropagation()}
            slotProps={{ input: { 'aria-label': `Select ${model.name}` } }}
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              zIndex: 2,
            }}
          />
        )}
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
              <Box
                aria-hidden
                sx={{
                  p: ICON_BADGE_PADDING,
                  borderRadius: RADIUS.md,
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                <CodeIcon fontSize="small" />
              </Box>
              <Typography
                variant="h6"
                component="h3"
                title={model.name}
                sx={{ lineHeight: 1.25, wordBreak: 'break-word' }}
              >
                {model.name}
              </Typography>
            </Box>
            {!selectable && (
              <IconButton
                id={menuButtonId}
                aria-label={`More actions for ${model.name}`}
                aria-controls={open ? menuId : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                size="small"
                sx={{ mt: -0.5, mr: -0.5, flexShrink: 0 }}
              >
                <MoreVertIcon />
              </IconButton>
            )}
          </Box>

          {model.details && (
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {model.details.parameter_size && (
                <Chip
                  label={model.details.parameter_size}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.12),
                    color: 'secondary.main',
                    fontSize: '0.75rem'
                  }}
                />
              )}
              {model.details.quantization_level && (
                <Chip
                  // Ollama already returns a prefixed level such as "Q4_K_M";
                  // adding another "Q" produced labels like "QQ4_K_M".
                  label={model.details.quantization_level}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.12),
                    color: 'info.main',
                    fontSize: '0.75rem'
                  }}
                />
              )}
              {model.details.format && (
                <Chip
                  label={model.details.format.toUpperCase()}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <StorageIcon aria-hidden sx={{ fontSize: META_ICON_SIZE }} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                {formatBytes(model.size)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <TimeIcon aria-hidden sx={{ fontSize: META_ICON_SIZE }} />
              <Typography variant="body2">
                Updated {formatDate(model.modified_at)}
              </Typography>
            </Box>
          </Box>
        </CardContent>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            // Without stopPropagation, deploying while in selection mode also
            // toggled the card's selected state.
            onClick={(event) => {
              event.stopPropagation();
              onDeploy(model);
            }}
            startIcon={<DeployIcon />}
            sx={{ py: 1 }}
          >
            Deploy Model
          </Button>
        </Box>
      </Card>

      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': menuButtonId,
          },
          paper: {
            elevation: 3,
            sx: { borderRadius: RADIUS.md, minWidth: MENU_MIN_WIDTH, mt: 1 }
          }
        }}
      >
        <MenuItem onClick={() => {
          handleClose();
          onDeploy(model);
        }} sx={{ gap: 1.5 }}>
          <DeployIcon fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ fontWeight: MENU_ITEM_FONT_WEIGHT }}>Deploy</Typography>
        </MenuItem>
        <MenuItem onClick={() => {
          handleClose();
          onInfo(model);
        }} sx={{ gap: 1.5 }}>
          <CodeIcon fontSize="small" color="info" />
          <Typography variant="body2" sx={{ fontWeight: MENU_ITEM_FONT_WEIGHT }}>Details</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleDeleteClick} sx={{ gap: 1.5, color: 'error.main' }}>
          <DeleteIcon fontSize="small" color="error" />
          <Typography variant="body2" sx={{ fontWeight: MENU_ITEM_FONT_WEIGHT }}>Delete</Typography>
        </MenuItem>
      </Menu>

      <Dialog
        open={confirmDelete}
        onClose={handleCancelDelete}
        aria-labelledby={deleteTitleId}
        aria-describedby={deleteDescriptionId}
        slotProps={{
          paper: {
            sx: { borderRadius: RADIUS.lg }
          }
        }}
      >
        <DialogTitle id={deleteTitleId}>Delete model?</DialogTitle>
        <DialogContent>
          <DialogContentText id={deleteDescriptionId}>
            Are you sure you want to delete <strong>{model.name}</strong>? This action cannot be undone and you will need to download the model again.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCancelDelete} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete model
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
