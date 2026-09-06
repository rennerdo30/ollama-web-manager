import { useMediaQuery } from '@mui/material';

/** True when the visitor has asked the OS to reduce animation. */
export const usePrefersReducedMotion = (): boolean =>
  useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true });
