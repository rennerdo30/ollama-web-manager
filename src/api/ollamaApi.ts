import axios from 'axios';

// Get server URL from localStorage or use default
const getServerUrl = () => {
  return localStorage.getItem('serverUrl') || 'http://localhost:11434';
};

// Create axios instance with dynamic base URL
const ollamaApi = axios.create({
  baseURL: `${getServerUrl()}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update baseURL when serverUrl changes
export const updateApiBaseUrl = (newUrl: string) => {
  ollamaApi.defaults.baseURL = `${newUrl}/api`;
};

// Interface for model details
export interface Model {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface UserShowResponse {
  license: string;
  modelfile: string;
  parameters: string;
  template: string;
  system: string;
  details: {
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
}

// Interface for system information
export interface GpuInfo {
  id: number;
  name: string;
  usage: number;
  memory: {
    used: number;
    total: number;
  };
}

export interface SystemInfo {
  cpu: {
    usage: number;
    cores: number;
    threads: number;
  };
  memory: {
    used: number;
    total: number;
  };
  gpus: GpuInfo[];
}

// API functions
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ModelConfig {
  threads?: number;
  context_size?: number;
  gpu_layers?: number;
  [key: string]: unknown; // Allow other properties for flexibility
}

export interface DeployedModel {
  id: string;
  name: string;
  status: 'running' | 'stopped';
  threads: number;
  contextSize: number;
  gpuLayers: number;
  startedAt: string;
  vram?: number;
}

export const ollamaService = {
  // Get a list of all models
  async getModels(): Promise<Model[]> {
    try {
      const response = await ollamaApi.get<{ models: Model[] }>('/tags');
      const data = response.data;
      return data.models || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  },

  // Pull a model from Ollama library
  async pullModel(name: string, onProgress?: (progress: number) => void): Promise<void> {
    try {
      const response = await fetch(`${getServerUrl()}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.total && data.completed) {
              const progress = Math.round((data.completed / data.total) * 100);
              if (onProgress) {
                onProgress(progress);
              }
            } else if (data.status === 'success') {
              if (onProgress) {
                onProgress(100);
              }
            }
          } catch (e) {
            console.error('Error parsing pull progress:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error pulling model:', error);
      throw error;
    }
  },

  // Delete a model
  async deleteModel(name: string): Promise<void> {
    try {
      await ollamaApi.delete('/delete', { data: { name } });
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  },

  // Show model information (Modelfile, parameters, etc.)
  async showModelInfo(name: string): Promise<UserShowResponse> {
    try {
      const response = await ollamaApi.post<UserShowResponse>('/show', { name });
      return response.data;
    } catch (error) {
      console.error('Error fetching model info:', error);
      throw error;
    }
  },

  // Create a new model from a Modelfile
  async createModel(name: string, modelfile: string, onProgress?: (status: string) => void): Promise<void> {
    try {
      const response = await fetch(`${getServerUrl()}/api/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, modelfile }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create model: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.status && onProgress) {
              onProgress(data.status);
            }
          } catch (e) {
            console.error('Error parsing create progress:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error creating model:', error);
      throw error;
    }
  },

  // Get system information from the backend service
  async getSystemInfo(): Promise<SystemInfo> {
    try {
      // Get the monitoring server URL from localStorage or use default
      const monitoringServerUrl = localStorage.getItem('monitoringServerUrl') || 'http://localhost:3001';

      // Call the system-info endpoint on the monitoring server
      const response = await axios.get(`${monitoringServerUrl}/api/system-info`);

      if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response from monitoring server');
      }
    } catch (error) {
      console.error("Error getting system info from monitoring server:", error);

      // Fallback values if the server is not available
      // This allows the UI to still function even if the monitoring server is down
      return {
        cpu: {
          usage: 0,
          cores: 4,
          threads: 8
        },
        memory: {
          used: 0,
          total: 16
        },
        gpus: [{
          id: 0,
          name: "Monitoring server offline - GPU info unavailable",
          usage: 0,
          memory: {
            used: 0,
            total: 0
          }
        }]
      };
    }
  },

  // Create a model server (Simulate deployment since direct Ollama API doesn't support this)
  async createModelServer(name: string, config: ModelConfig): Promise<void> {
    try {
      // For now, we'll simulate deployment by generating a request
      // In a real implementation, this might be a call to a proxy server that
      // manages deployments or directly using Ollama's programmatic API

      console.log(`Deploying model ${name} with config:`, config);

      // Let's simulate a delay to make it feel like something's happening
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store deployment info in localStorage for persistence between page reloads
      const deployedModels: DeployedModel[] = JSON.parse(localStorage.getItem('deployedModels') || '[]');

      // Check if model is already deployed
      const existingIndex = deployedModels.findIndex((m) => m.name === name);

      const newDeployment = {
        id: existingIndex >= 0 ? deployedModels[existingIndex].id : Date.now().toString(),
        name,
        status: 'running' as const,
        threads: config.threads || 4,
        contextSize: config.context_size || 4096,
        gpuLayers: config.gpu_layers || 0,
        startedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        deployedModels[existingIndex] = newDeployment;
      } else {
        deployedModels.push(newDeployment);
      }

      localStorage.setItem('deployedModels', JSON.stringify(deployedModels));

      // In reality, you would use the real Ollama API or a proxy server here
      return;
    } catch (error) {
      console.error('Error serving model:', error);
      throw error;
    }
  },

  // Stop a model server (Simulate stopping)
  async stopModelServer(name: string): Promise<void> {
    try {
      console.log(`Stopping model ${name}`);

      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update deployment status in localStorage
      const deployedModels: DeployedModel[] = JSON.parse(localStorage.getItem('deployedModels') || '[]');
      const updatedModels = deployedModels.map((model) => {
        if (model.name === name) {
          return { ...model, status: 'stopped' };
        }
        return model;
      });

      localStorage.setItem('deployedModels', JSON.stringify(updatedModels));

      // In reality, you would use the real Ollama API or a proxy server here
      return;
    } catch (error) {
      console.error('Error stopping model server:', error);
      throw error;
    }
  },

  // Get deployed models (from localStorage)
  async getDeployedModels(): Promise<DeployedModel[]> {
    try {
      // Try to get real running models from Ollama
      try {
        const response = await ollamaApi.get<{ models: { digest: string, name: string, size_vram?: number }[] }>('/ps');
        if (response.data && response.data.models) {
          return response.data.models.map((m) => ({
            id: m.digest || Date.now().toString(),
            name: m.name,
            status: 'running',
            threads: 0, // Unknown from /ps
            contextSize: 0, // Unknown from /ps
            gpuLayers: 0, // Unknown from /ps
            startedAt: new Date().toISOString(), // Approximate
            vram: m.size_vram // Extra info
          }));
        }
      } catch (e) {
        console.warn('Failed to fetch running models from /api/ps, falling back to local storage', e);
      }

      const deployedModels = JSON.parse(localStorage.getItem('deployedModels') || '[]');
      return deployedModels;
    } catch (error) {
      console.error('Error fetching deployed models:', error);
      return [];
    }
  },

  // Alternative method using generate endpoint
  async generateFallback(model: string, prompt: string): Promise<string> {
    try {
      const response = await ollamaApi.post('/generate', {
        model,
        prompt,
        stream: false
      });

      if (response.data && response.data.response) {
        return response.data.response;
      }
      return 'No response received from Ollama generate endpoint.';
    } catch (error) {
      console.error('Error with generate fallback:', error);
      return 'Failed to connect to Ollama generate endpoint.';
    }
  },

  // Chat with a model - connect to the real Ollama API
  async chat(model: string, messages: Message[], onUpdate?: (content: string) => void): Promise<Message> {
    try {
      let finalResponse = '';

      // This will be our fallback response if all else fails
      const fallbackResponse = 'Sorry, there was an error connecting to Ollama. Please check if the Ollama server is running correctly.';

      if (onUpdate) {
        // We need to simulate streaming since Ollama API doesn't support streaming via basic REST
        // But we'll use the real API for the content

        try {
          console.log('Sending to Ollama:', { model, messages });

          // Call Ollama's /api/chat endpoint
          const response = await ollamaApi.post('/chat', {
            model,
            messages,
            stream: false
          });

          console.log('Received from Ollama:', response.data);

          // Get the response text - handle different Ollama API response formats
          if (response.data) {
            // Ollama API can return a few different formats
            if (response.data.message && response.data.message.content) {
              // Standard chat completion format
              finalResponse = response.data.message.content;
            } else if (response.data.response) {
              // Generate API format
              finalResponse = response.data.response;
            } else if (typeof response.data === 'string') {
              // Direct string response
              finalResponse = response.data;
            } else {
              // If we can't determine the format, stringify the response
              finalResponse = JSON.stringify(response.data);
            }

            // Simulate streaming by incrementally revealing the response
            const chars = finalResponse.split('');
            let partialResponse = '';

            for (const char of chars) {
              // Small random delay for natural typing effect (15-35ms)
              const delay = Math.floor(Math.random() * 20) + 15;
              await new Promise(resolve => setTimeout(resolve, delay));

              partialResponse += char;
              onUpdate(partialResponse);
            }
          } else {
            // If we got a response but it doesn't have the expected structure
            finalResponse = 'Received an unexpected response format from Ollama. Please check your server configuration.';
            onUpdate(finalResponse);
          }
        } catch (error) {
          console.error('Error calling Ollama chat API:', error);

          // Try using the generate endpoint as a fallback
          console.log('Trying generate endpoint as fallback...');
          try {
            // Convert messages to a single prompt for the generate endpoint
            const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
            finalResponse = await this.generateFallback(model, lastUserMessage);
            onUpdate(finalResponse);
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            finalResponse = fallbackResponse;
            onUpdate(finalResponse);
          }
        }
      } else {
        // Non-streaming mode - direct API call
        try {
          console.log('Sending to Ollama (non-streaming):', { model, messages });

          const response = await ollamaApi.post('/chat', {
            model,
            messages,
            stream: false
          });

          console.log('Received from Ollama (non-streaming):', response.data);

          // Get the response text - handle different Ollama API response formats
          if (response.data) {
            // Ollama API can return a few different formats
            if (response.data.message && response.data.message.content) {
              // Standard chat completion format
              finalResponse = response.data.message.content;
            } else if (response.data.response) {
              // Generate API format
              finalResponse = response.data.response;
            } else if (typeof response.data === 'string') {
              // Direct string response
              finalResponse = response.data;
            } else {
              // If we can't determine the format, stringify the response
              finalResponse = JSON.stringify(response.data);
            }
          } else {
            finalResponse = 'Received an unexpected response format from Ollama.';
          }
        } catch (error) {
          console.error('Error calling Ollama chat API (non-streaming):', error);

          // Try using the generate endpoint as a fallback
          try {
            // Convert messages to a single prompt for the generate endpoint
            const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
            finalResponse = await this.generateFallback(model, lastUserMessage);
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            finalResponse = fallbackResponse;
          }
        }
      }

      return {
        role: 'assistant',
        content: finalResponse
      };
    } catch (error) {
      console.error('Error in chat function:', error);
      return {
        role: 'assistant',
        content: 'An unexpected error occurred. Please try again.'
      };
    }
  },
};

export default ollamaService;