import { Card, CardContent, Typography, Box, SxProps, Theme, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string | ReactNode;
  sx?: SxProps<Theme>;
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

export default function StatCard({ title, value, icon, subtitle, sx, color = 'primary', onClick }: StatCardProps) {
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
      transition: 'all 0.2s',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': {
        boxShadow: theme.shadows[4],
        transform: onClick ? 'translateY(-4px)' : 'none'
      },
      ...sx
    }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </Typography>
          <Box sx={{
            color: mainColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8
          }}>
            {icon}
          </Box>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: '2rem', color: 'text.primary' }}>
          {value}
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