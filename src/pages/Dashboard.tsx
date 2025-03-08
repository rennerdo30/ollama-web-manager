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
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* CPU Usage */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="CPU Usage" 
            value={`${systemInfo?.cpu.usage.toFixed(1)}%`}
            subtitle={`${systemInfo?.cpu.cores} cores / ${systemInfo?.cpu.threads} threads`}
            icon={<SpeedIcon fontSize="large" />}
          />
        </Grid>

        {/* Memory Usage */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Memory Usage" 
            value={`${systemInfo?.memory.used} / ${systemInfo?.memory.total} GB`}
            subtitle={`${((systemInfo?.memory.used || 0) / (systemInfo?.memory.total || 1) * 100).toFixed(1)}%`}
            icon={<MemoryIcon fontSize="large" />}
          />
        </Grid>

        {/* GPU Usage (if available) */}
        {systemInfo?.gpus && systemInfo.gpus.length > 0 && systemInfo.gpus.map((gpu, index) => (
          <Grid item xs={12} sm={6} md={3} key={`gpu-${index}`}>
            <StatCard 
              title={`GPU ${index + 1} Usage`} 
              value={`${gpu.usage.toFixed(1)}%`}
              subtitle={`${gpu.name} - ${gpu.memory.used}/${gpu.memory.total} GB`}
              icon={<ViewModuleIcon fontSize="large" />}
            />
          </Grid>
        ))}

        {/* Models */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Models Available" 
            value={models.length}
            icon={<StorageIcon fontSize="large" />}
          />
        </Grid>

        {/* CPU Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              CPU Usage
            </Typography>
            <Box sx={{ height: 240 }}>
              <Line options={chartOptions} data={cpuData} />
            </Box>
          </Paper>
        </Grid>

        {/* Memory Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Memory Usage
            </Typography>
            <Box sx={{ height: 240 }}>
              <Line options={chartOptions} data={memoryData} />
            </Box>
          </Paper>
        </Grid>

        {/* Model List */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Models
            </Typography>
            <Grid container spacing={2}>
              {models.length > 0 ? (
                models.map((model, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography>{model.name}</Typography>
                      <Typography color="text.secondary">
                        {(model.size / (1024 * 1024 * 1024)).toFixed(2)} GB
                      </Typography>
                    </Box>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography color="text.secondary">
                    No models available. Go to the Models page to pull models.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}