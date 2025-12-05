import express from 'express';
import cors from 'cors';
import si from 'systeminformation';
import { SystemInfo, GpuInfo } from './types.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins during development
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Main system info endpoint
app.get('/api/system-info', async (req, res) => {
  try {
    // Collect system information in parallel for better performance
    const [cpuData, memData, gpuData] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.graphics()
    ]);

    // Get current CPU load
    const currentLoad = await si.currentLoad();

    // Format GPU data
    const gpus: GpuInfo[] = gpuData.controllers.map((controller, index) => {
      // Get GPU memory in GB (with fallback if not available)
      const totalMemoryGB = controller.memoryTotal
        ? parseFloat((controller.memoryTotal / 1024).toFixed(1))
        : 0;

      // Estimate used memory (not directly available in all systems)
      // On macOS, this is often hard to get without native bindings
      const usedMemoryGB = controller.memoryUsed
        ? parseFloat((controller.memoryUsed / 1024).toFixed(1))
        : 0;

      return {
        id: index,
        name: controller.name || 'Unknown GPU',
        usage: controller.utilizationGpu || 0,
        memory: {
          used: usedMemoryGB,
          total: totalMemoryGB
        }
      };
    });

    // If no GPUs were detected, add a placeholder
    if (gpus.length === 0) {
      gpus.push({
        id: 0,
        name: 'No dedicated GPU detected',
        usage: 0,
        memory: {
          used: 0,
          total: 0
        }
      });
    }

    // Build the system info response
    const systemInfo: SystemInfo = {
      cpu: {
        usage: parseFloat(currentLoad.currentLoad.toFixed(1)),
        cores: cpuData.physicalCores || 4,
        threads: cpuData.cores || 8
      },
      memory: {
        used: parseFloat((memData.used / (1024 * 1024 * 1024)).toFixed(2)), // Convert to GB with 2 decimals
        total: parseFloat((memData.total / (1024 * 1024 * 1024)).toFixed(2)) // Convert to GB with 2 decimals
      },
      gpus: gpus
    };

    res.json(systemInfo);
  } catch (error) {
    console.error('Error getting system information:', error);
    res.status(500).json({ error: 'Failed to get system information' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});