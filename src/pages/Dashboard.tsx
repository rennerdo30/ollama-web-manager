import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import {
  Typography,
  Paper,
  Box,
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
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import { ollamaService, SystemInfo, Model } from '../api/ollamaApi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const defaultRefreshIntervalSeconds = 5;

  // Data for CPU usage chart
  const [cpuData, setCpuData] = useState({
    labels: Array.from({ length: 20 }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'CPU Usage %',
        data: Array(20).fill(0),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        fill: true,
        tension: 0.3
      }
    ]
  });

  // Data for memory usage chart
  const [memoryData, setMemoryData] = useState({
    labels: Array.from({ length: 20 }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'Memory Usage (GB)',
        data: Array(20).fill(0),
        borderColor: theme.palette.secondary.main,
        backgroundColor: theme.palette.secondary.light,
        fill: true,
        tension: 0.3
      }
    ]
  });

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  useEffect(() => {
    setCpuData((prev) => ({
      ...prev,
      datasets: [
        {
          ...prev.datasets[0],
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light
        }
      ]
    }));

    setMemoryData((prev) => ({
      ...prev,
      datasets: [
        {
          ...prev.datasets[0],
          borderColor: theme.palette.secondary.main,
          backgroundColor: theme.palette.secondary.light
        }
      ]
    }));
  }, [theme.palette.primary.light, theme.palette.primary.main, theme.palette.secondary.light, theme.palette.secondary.main]);

  useEffect(() => {
    const fetchData = async (showLoading = false) => {
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

        // Update charts
        updateCharts(systemInfoData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please check if Ollama is running.');
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    };

    fetchData(true);

    const autoRefreshEnabled = localStorage.getItem('autoRefresh') !== 'false';
    const rawInterval = Number.parseInt(
      localStorage.getItem('refreshInterval') || String(defaultRefreshIntervalSeconds),
      10
    );
    const normalizedInterval = Number.isFinite(rawInterval) && rawInterval > 0
      ? rawInterval
      : defaultRefreshIntervalSeconds;

    if (!autoRefreshEnabled) {
      return;
    }

    // Set up interval to refresh data
    const intervalId = setInterval(() => {
      fetchData();
    }, normalizedInterval * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const updateCharts = (data: SystemInfo) => {
    // Update CPU chart
    setCpuData(prev => {
      const newData = {
        ...prev,
        datasets: [
          {
            ...prev.datasets[0],
            data: [...prev.datasets[0].data.slice(1), data.cpu.usage]
          }
        ]
      };
      return newData;
    });

    // Update memory chart
    setMemoryData(prev => {
      const newData = {
        ...prev,
        datasets: [
          {
            ...prev.datasets[0],
            data: [...prev.datasets[0].data.slice(1), data.memory.used]
          }
        ]
      };
      return newData;
    });
  };

  if (loading) {
    return <LoadingState message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          Real-time overview of your local Ollama instance performance and model library.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* System Stats Row */}
        <Grid size={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
            System Health
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="CPU Usage"
            value={`${systemInfo?.cpu.usage}%`}
            subtitle={`${systemInfo?.cpu.cores} cores / ${systemInfo?.cpu.threads} threads`}
            icon={<SpeedIcon fontSize="medium" />}
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Memory Usage"
            value={`${systemInfo?.memory.used} GB`}
            subtitle={`of ${systemInfo?.memory.total} GB Total`}
            icon={<MemoryIcon fontSize="medium" />}
            color="secondary"
          />
        </Grid>

        {systemInfo?.gpus && systemInfo.gpus.length > 0 && systemInfo.gpus.map((gpu, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`gpu-${index}`}>
            <StatCard
              title={`GPU ${index + 1}`}
              value={`${gpu.usage}%`}
              subtitle={
                <Box component="span">
                  {gpu.name}
                  {gpu.memory.total > 0 && (
                    <>
                      <br />
                      {gpu.memory.used}/{gpu.memory.total} GB VRAM
                    </>
                  )}
                </Box>
              }
              icon={<ViewModuleIcon fontSize="medium" />}
              color="success"
            />
          </Grid>
        ))}

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Models"
            value={models.length}
            subtitle="Ready to deploy"
            icon={<StorageIcon fontSize="medium" />}
            color="info"
            onClick={() => navigate('/models')}
          />
        </Grid>

        {/* Charts Row */}
        <Grid size={12} sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
            Performance History
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{
            p: 3,
            height: 350,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                CPU Usage
              </Typography>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
            </Box>
            <Box sx={{ height: 270 }}>
              <Line options={chartOptions} data={cpuData} />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{
            p: 3,
            height: 350,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Memory Usage
              </Typography>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main' }} />
            </Box>
            <Box sx={{ height: 270 }}>
              <Line options={chartOptions} data={memoryData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
