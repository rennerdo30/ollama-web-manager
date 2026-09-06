import { Alert, AlertTitle, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { SPACING } from '../theme';

interface ErrorStateProps {
  /** Short summary of what failed. */
  title?: string;
  /** The actionable detail shown to the user. */
  message: string;
  /** When provided, renders a retry affordance. */
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Inline error banner with a retry action, so a failed request no longer wipes
 * out the surrounding page.
 */
export default function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      sx={{ mb: SPACING.grid }}
      action={
        onRetry && (
          <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={onRetry}>
            {retryLabel}
          </Button>
        )
      }
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
}
