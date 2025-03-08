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

export const ollamaService = {
  // Get a list of all models
  async getModels(): Promise<Model[]> {
    try {
      const response = await ollamaApi.get('/tags');
      return response.data.models || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  },

  // Pull a model from Ollama library
  async pullModel(name: string, onProgress?: (progress: number) => void): Promise<void> {
    try {
      // Since Ollama API doesn't provide detailed download progress information,
      // we'll simulate progress for better UX
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress > 95) {
          progress = 95; // Cap at 95% until actual completion
        }
        if (onProgress) {
          onProgress(Math.min(Math.round(progress), 95));
        }
      }, 1000);
      
      const response = await ollamaApi.post('/pull', { name });
      
      // Complete progress and clear interval
      clearInterval(progressInterval);
      if (onProgress) {
        onProgress(100);
      }
      
      return response.data;
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

  // Get system information
  async getSystemInfo(): Promise<SystemInfo> {
    // This is a mock endpoint as Ollama doesn't provide system info directly
    // In a real implementation, you would need to create a server-side component
    // that collects this information and exposes it via an API
    
    try {
      // Try to detect actual number of cores
      const cores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency 
        ? navigator.hardwareConcurrency 
        : 8;

      // Simulated multi-GPU setup for demonstration
      const gpus = [
        {
          id: 0,
          name: "NVIDIA RTX 4080",
          usage: Math.random() * 100,
          memory: {
            used: Math.round(Math.random() * 12),
            total: 16
          }
        },
        {
          id: 1,
          name: "NVIDIA RTX 4070",
          usage: Math.random() * 100,
          memory: {
            used: Math.round(Math.random() * 8),
            total: 12
          }
        }
      ];

      // For now, we'll return semi-realistic data
      return {
        cpu: {
          usage: Math.random() * 100,
          cores: cores / 2,
          threads: cores
        },
        memory: {
          used: Math.round(Math.random() * 16),
          total: 32
        },
        gpus: gpus
      };
    } catch (error) {
      console.error("Error getting system info:", error);
      // Fallback values
      return {
        cpu: {
          usage: Math.random() * 100,
          cores: 8,
          threads: 16
        },
        memory: {
          used: Math.round(Math.random() * 16),
          total: 32
        },
        gpus: [{
          id: 0,
          name: "NVIDIA GPU",
          usage: Math.random() * 100,
          memory: {
            used: Math.round(Math.random() * 8),
            total: 10
          }
        }]
      };
    }
  },

  // Create a model server (Simulate deployment since direct Ollama API doesn't support this)
  async createModelServer(name: string, config: any): Promise<void> {
    try {
      // For now, we'll simulate deployment by generating a request
      // In a real implementation, this might be a call to a proxy server that
      // manages deployments or directly using Ollama's programmatic API
      
      console.log(`Deploying model ${name} with config:`, config);
      
      // Let's simulate a delay to make it feel like something's happening
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store deployment info in localStorage for persistence between page reloads
      const deployedModels = JSON.parse(localStorage.getItem('deployedModels') || '[]');
      
      // Check if model is already deployed
      const existingIndex = deployedModels.findIndex((m: any) => m.name === name);
      
      const newDeployment = {
        id: existingIndex >= 0 ? deployedModels[existingIndex].id : Date.now().toString(),
        name,
        status: 'running',
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
      const deployedModels = JSON.parse(localStorage.getItem('deployedModels') || '[]');
      const updatedModels = deployedModels.map((model: any) => {
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
  async getDeployedModels(): Promise<any[]> {
    try {
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
        prompt
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
            messages
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
            messages
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