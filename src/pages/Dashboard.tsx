import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Skeleton,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import ErrorState from '../components/ErrorState';
import { ollamaService, SystemInfo, Model } from '../api/ollamaApi';
import {
  CHART_HISTORY_LENGTH,
  REFRESH_INTERVAL_DEFAULT_SECONDS,
  STORAGE_KEYS,
} from '../constants/app';
import { formatCount, formatGigabytes, formatPercent } from '../utils/format';
import { RADIUS, SPACING } from '../theme';

// Register ChartJS components (Filler is required by `fill: true`).
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const CHART_PANEL_HEIGHT = 320;
const CHART_TENSION = 0.35;
const CHART_LINE_WIDTH = 2;
const CHART_FILL_OPACITY = 0.16;
const STAT_SKELETON_COUNT = 4;
const MS_PER_SECOND = 1000;

/** Marker the API layer returns when the monitoring server cannot be reached. */
const MONITORING_OFFLINE_MARKER = 'monitoring server offline';

const EMPTY_SERIES = Array<number>(CHART_HISTORY_LENGTH).fill(0);
const SERIES_LABELS = Array.from({ length: CHART_HISTORY_LENGTH }, (_, index) => index.toString());

const isMonitoringOffline = (info: SystemInfo | null): boolean =>
  Boolean(info?.gpus?.some((gpu) => gpu.name.toLowerCase().includes(MONITORING_OFFLINE_MARKER)));

const readRefreshSettings = () => {
  const autoRefresh = localStorage.getItem(STORAGE_KEYS.autoRefresh) !== 'false';
  const rawInterval = Number.parseInt(
    localStorage.getItem(STORAGE_KEYS.refreshInterval) || String(REFRESH_INTERVAL_DEFAULT_SECONDS),
    10
  );
  const intervalSeconds = Number.isFinite(rawInterval) && rawInterval > 0
    ? rawInterval
    : REFRESH_INTERVAL_DEFAULT_SECONDS;

  return { autoRefresh, intervalSeconds };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cpuSeries, setCpuSeries] = useState<number[]>(EMPTY_SERIES);
  const [memorySeries, setMemorySeries] = useState<number[]>(EMPTY_SERIES);

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const [modelsData, systemInfoData] = await Promise.all([
        ollamaService.getModels(),
        ollamaService.getSystemInfo()
      ]);

      setSystemInfo(systemInfoData);
      setModels(modelsData);
      setError('');

      setCpuSeries((previous) => [...previous.slice(1), systemInfoData.cpu.usage]);
      setMemorySeries((previous) => [...previous.slice(1), systemInfoData.memory.used]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not reach Ollama. Check that it is running and that the server URL in Settings is correct.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Deferred to a microtask so the effect body itself performs no state
    // update: react-hooks/set-state-in-effect forbids that, and `fetchData`
    // flips `loading` straight away when asked to show the spinner.
    void Promise.resolve().then(() => fetchData(true));

    const { autoRefresh, intervalSeconds } = readRefreshSettings();
    if (!autoRefresh) {
      return;
    }

    // `fetchData` is a useCallback with no dependencies, so the timer is
    // installed once and always sees the current implementation.
    const intervalId = setInterval(() => {
      void fetchData();
    }, intervalSeconds * MS_PER_SECOND);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  const chartOptions = useMemo<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: { intersect: false, mode: 'index' },
    scales: {
      x: {
        display: false,
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: theme.palette.divider },
        ticks: { color: theme.palette.text.secondary, maxTicksLimit: 5 },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        displayColors: false,
        padding: 10,
      },
    },
  }), [theme]);

  const buildChartData = useCallback((label: string, data: number[], color: string) => ({
    labels: SERIES_LABELS,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: alpha(color, CHART_FILL_OPACITY),
        borderWidth: CHART_LINE_WIDTH,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        tension: CHART_TENSION,
      },
    ],
  }), []);

  const monitoringOffline = isMonitoringOffline(systemInfo);

  if (loading) {
    return (
      <Box>
        <PageHeader
          title="Dashboard"
          description="Real-time overview of your local Ollama instance performance and model library."
        />
        <Grid container spacing={SPACING.grid} aria-busy="true" aria-label="Loading dashboard">
          {Array.from({ length: STAT_SKELETON_COUNT }, (_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`stat-skeleton-${index}`}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="text" width="55%" />
                  <Skeleton variant="text" width="40%" height={44} />
                  <Skeleton variant="text" width="70%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
          {[0, 1].map((index) => (
            <Grid size={{ xs: 12, md: 6 }} key={`chart-skeleton-${index}`}>
              <Skeleton variant="rounded" height={CHART_PANEL_HEIGHT} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your local Ollama instance performance and model library."
      />

      {error && (
        <ErrorState title="Connection problem" message={error} onRetry={() => void fetchData(true)} />
      )}

      {!error && monitoringOffline && (
        <Alert severity="info" sx={{ mb: SPACING.grid }}>
          The monitoring server is offline, so hardware metrics are unavailable. Start it with{' '}
          <Box component="code" sx={{ fontFamily: 'monospace' }}>npm run server</Box>.
        </Alert>
      )}

      <Box component="section" aria-labelledby="system-health-heading" sx={{ mb: SPACING.section }}>
        <Typography id="system-health-heading" variant="h6" component="h2" sx={{ mb: 2 }}>
          System Health
        </Typography>

        <Grid container spacing={SPACING.grid}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="CPU Usage"
              value={formatPercent(systemInfo?.cpu.usage)}
              subtitle={
                systemInfo
                  ? `${formatCount(systemInfo.cpu.cores)} cores / ${formatCount(systemInfo.cpu.threads)} threads`
                  : 'Awaiting monitoring data'
              }
              icon={<SpeedIcon />}
              color="primary"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Memory Usage"
              value={formatGigabytes(systemInfo?.memory.used)}
              subtitle={
                systemInfo
                  ? `of ${formatGigabytes(systemInfo.memory.total)} total`
                  : 'Awaiting monitoring data'
              }
              icon={<MemoryIcon />}
              color="secondary"
            />
          </Grid>

          {systemInfo?.gpus?.map((gpu, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`gpu-${gpu.id}-${index}`}>
              <StatCard
                title={`GPU ${index + 1}`}
                value={formatPercent(gpu.usage)}
                subtitle={
                  <Box component="span">
                    {gpu.name}
                    {gpu.memory.total > 0 && (
                      <>
                        <br />
                        {`${formatGigabytes(gpu.memory.used)} of ${formatGigabytes(gpu.memory.total)} VRAM`}
                      </>
                    )}
                  </Box>
                }
                icon={<ViewModuleIcon />}
                color="success"
              />
            </Grid>
          ))}

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Models"
              value={formatCount(models.length)}
              subtitle="Ready to deploy — open the library"
              icon={<StorageIcon />}
              color="info"
              onClick={() => navigate('/models')}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="section" aria-labelledby="performance-heading">
        <Typography id="performance-heading" variant="h6" component="h2" sx={{ mb: 2 }}>
          Performance History
        </Typography>

        <Grid container spacing={SPACING.grid}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartPanel
              title="CPU Usage"
              caption={formatPercent(systemInfo?.cpu.usage)}
              dotColor={theme.palette.primary.main}
            >
              <Line
                options={chartOptions}
                data={buildChartData('CPU usage (%)', cpuSeries, theme.palette.primary.main)}
                aria-label="Line chart of recent CPU usage percentage"
                role="img"
              />
            </ChartPanel>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ChartPanel
              title="Memory Usage"
              caption={formatGigabytes(systemInfo?.memory.used)}
              dotColor={theme.palette.secondary.main}
            >
              <Line
                options={chartOptions}
                data={buildChartData('Memory usage (GB)', memorySeries, theme.palette.secondary.main)}
                aria-label="Line chart of recent memory usage in gigabytes"
                role="img"
              />
            </ChartPanel>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

interface ChartPanelProps {
  title: string;
  caption: string;
  dotColor: string;
  children: ReactNode;
}

function ChartPanel({ title, caption, dotColor, children }: ChartPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: SPACING.panel,
        height: CHART_PANEL_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: RADIUS.lg,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor }} />
          <Typography variant="subtitle1" component="h3">
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {caption}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>{children}</Box>
    </Paper>
  );
}
