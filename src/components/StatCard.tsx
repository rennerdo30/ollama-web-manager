import { Card, CardContent, Typography, Box, SxProps, Theme, useTheme, alpha } from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  sx?: SxProps<Theme>;
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
}

export default function StatCard({ title, value, icon, subtitle, sx, color = 'primary' }: StatCardProps) {
  const theme = useTheme();

  const getColor = (c: string) => {
    switch (c) {
      case 'secondary': return theme.palette.secondary.main;
      case 'info': return theme.palette.info.main;
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  const mainColor = getColor(color);

  return (
    <Card sx={{
      height: '100%',
      position: 'relative',
      transition: 'box-shadow 0.2s',
      '&:hover': {
        boxShadow: theme.shadows[2],
      },
      ...sx
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{
            p: 1,
            borderRadius: 1.5,
            bgcolor: alpha(mainColor, 0.1),
            color: mainColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, fontSize: '1.75rem' }}>
          {value}
        </Typography>

        <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{
            color: 'text.secondary',
            display: 'block',
            mt: 0.5
          }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}