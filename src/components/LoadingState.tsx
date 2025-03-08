import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        p: 4,
        minHeight: 200
      }}
    >
      <CircularProgress sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}