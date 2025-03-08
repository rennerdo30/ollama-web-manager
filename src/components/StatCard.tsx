import { Card, CardContent, Typography, Box, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  sx?: SxProps<Theme>;
}

export default function StatCard({ title, value, icon, subtitle, sx }: StatCardProps) {
  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box sx={{ color: 'primary.main' }}>
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}