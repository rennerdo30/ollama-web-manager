import { useEffect, useState } from 'react';
import {
  Grid,
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
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

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
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch models
        const modelsData = await ollamaService.getModels();
        setModels(modelsData);

        // Fetch system info
        const systemInfoData = await ollamaService.getSystemInfo();
        setSystemInfo(systemInfoData);

        // Update charts
        updateCharts(systemInfoData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please check if Ollama is running.');
        setLoading(false);
      }
    };

    fetchData();

    // Set up interval to refresh data
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

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
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
            System Health
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="CPU Usage"
            value={`${systemInfo?.cpu.usage.toFixed(1)}%`}
            subtitle={`${systemInfo?.cpu.cores} cores / ${systemInfo?.cpu.threads} threads`}
            icon={<SpeedIcon fontSize="medium" />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Memory Usage"
            value={`${systemInfo?.memory.used} GB`}
            subtitle={`of ${systemInfo?.memory.total} GB Total`}
            icon={<MemoryIcon fontSize="medium" />}
            color="secondary"
          />
        </Grid>

        {systemInfo?.gpus && systemInfo.gpus.length > 0 && systemInfo.gpus.map((gpu, index) => (
          <Grid item xs={12} sm={6} md={3} key={`gpu-${index}`}>
            <StatCard
              title={`GPU ${index + 1}`}
              value={`${gpu.usage.toFixed(1)}%`}
              subtitle={`${gpu.name}`}
              icon={<ViewModuleIcon fontSize="medium" />}
              color="success"
            />
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Models"
            value={models.length}
            subtitle="Ready to deploy"
            icon={<StorageIcon fontSize="medium" />}
            color="info"
          />
        </Grid>

        {/* Charts Row */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
            Performance History
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
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

        <Grid item xs={12} md={6}>
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