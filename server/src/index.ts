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
        ? Math.round(controller.memoryTotal / 1024) 
        : 4; // Fallback value
      
      // Estimate used memory (not directly available in all systems)
      const usedMemoryGB = controller.memoryUsed 
        ? Math.round(controller.memoryUsed / 1024)
        : Math.round(totalMemoryGB * 0.3); // Fallback estimate
      
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
        usage: currentLoad.currentLoad || 0,
        cores: cpuData.physicalCores || 4,
        threads: cpuData.cores || 8
      },
      memory: {
        used: Math.round(memData.used / (1024 * 1024 * 1024)), // Convert to GB
        total: Math.round(memData.total / (1024 * 1024 * 1024)) // Convert to GB
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