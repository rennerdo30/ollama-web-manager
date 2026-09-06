import { Box, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { RADIUS } from '../theme';

const ICON_SIZE = 44;
const DESCRIPTION_MAX_WIDTH = 460;

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  /** Renders without the dashed panel, e.g. inside an existing card or table. */
  plain?: boolean;
}

/** Consistent "nothing here yet" panel with an optional next step. */
export default function EmptyState({ title, description, icon, action, plain = false }: EmptyStateProps) {
  const body = (
    <Box sx={{ textAlign: 'center', py: plain ? 5 : 7, px: 3 }}>
      {icon && (
        <Box
          aria-hidden
          sx={{
            color: 'text.disabled',
            mb: 1.5,
            display: 'flex',
            justifyContent: 'center',
            '& > svg': { fontSize: ICON_SIZE },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" component="p" color="text.primary" sx={{ mb: description ? 0.5 : 0 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: DESCRIPTION_MAX_WIDTH, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 3 }}>{action}</Box>}
    </Box>
  );

  if (plain) {
    return body;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: RADIUS.md,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {body}
    </Paper>
  );
}
