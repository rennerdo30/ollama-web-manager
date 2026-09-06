import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { SPACING } from '../theme';

const DESCRIPTION_MAX_WIDTH = 640;

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Buttons or controls aligned to the end of the header row. */
  actions?: ReactNode;
}

/**
 * Consistent page title block: one `h1` per page, matching vertical rhythm and
 * actions that wrap below the title on narrow screens instead of overflowing.
 */
export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        mb: SPACING.pageHeader,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" component="h1" sx={{ mb: description ? 0.5 : 0 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: DESCRIPTION_MAX_WIDTH }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}
