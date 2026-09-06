import { Card, CardActionArea, CardContent, Typography, Box, SxProps, Theme, alpha, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { EASING, HOVER_LIFT, MOTION, RADIUS, SHADOWS } from '../theme';

type StatColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

const ICON_BOX_SIZE = 40;

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string | ReactNode;
  sx?: SxProps<Theme>;
  color?: StatColor;
  onClick?: () => void;
}

export default function StatCard({ title, value, icon, subtitle, sx, color = 'primary', onClick }: StatCardProps) {
  const theme = useTheme();
  const mainColor = theme.palette[color].main;
  const shadows = theme.palette.mode === 'dark' ? SHADOWS.dark : SHADOWS.light;

  const content = (
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
        <Typography
          component="h3"
          color="text.secondary"
          variant="subtitle2"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.75rem' }}
        >
          {title}
        </Typography>
        {icon && (
          <Box
            aria-hidden
            sx={{
              flexShrink: 0,
              width: ICON_BOX_SIZE,
              height: ICON_BOX_SIZE,
              borderRadius: RADIUS.md,
              bgcolor: alpha(mainColor, theme.palette.mode === 'dark' ? 0.16 : 0.1),
              color: mainColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      <Typography
        variant="h4"
        component="p"
        sx={{ fontWeight: 700, mb: 0.5, fontVariantNumeric: 'tabular-nums', color: 'text.primary' }}
      >
        {value}
      </Typography>

      {subtitle && (
        <Typography variant="caption" component="p" sx={{ color: 'text.secondary', display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  );

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        transition: `box-shadow ${MOTION.base}ms ${EASING}, transform ${MOTION.base}ms ${EASING}, border-color ${MOTION.base}ms ${EASING}`,
        ...(onClick
          ? {
              '&:hover': {
                boxShadow: shadows.md,
                borderColor: alpha(mainColor, 0.4),
                transform: `translateY(-${HOVER_LIFT}px)`,
              },
              '&:has(:focus-visible)': {
                borderColor: alpha(mainColor, 0.4),
              },
            }
          : {}),
        ...sx,
      }}
    >
      {onClick ? (
        // CardActionArea keeps the whole tile clickable while staying a real
        // button: reachable by Tab, activated by Enter/Space.
        <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}
