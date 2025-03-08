import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Divider,
  Button,
  TextField,
  Alert
} from '@mui/material';
import { useState } from 'react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  description: string;
  example?: string;
}

export default function ApiEndpoints() {
  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem('serverUrl') || 'http://localhost:11434';
  });
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const apiEndpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/api/generate',
      description: 'Generate a response from a model',
      example: '{ "model": "llama2", "prompt": "Why is the sky blue?" }'
    },
    {
      method: 'POST',
      path: '/api/chat',
      description: 'Generate the next message in a chat conversation',
      example: '{ "model": "llama2", "messages": [{ "role": "user", "content": "Hello" }] }'
    },
    {
      method: 'POST',
      path: '/api/embeddings',
      description: 'Generate embeddings from a model',
      example: '{ "model": "llama2", "prompt": "The sky is blue." }'
    },
    {
      method: 'GET',
      path: '/api/tags',
      description: 'List models that are available locally'
    },
    {
      method: 'POST',
      path: '/api/pull',
      description: 'Download a model from the Ollama library',
      example: '{ "name": "llama2" }'
    },
    {
      method: 'POST',
      path: '/api/push',
      description: 'Upload a model to a model library',
      example: '{ "name": "llama2" }'
    },
    {
      method: 'POST',
      path: '/api/create',
      description: 'Create a model from a Modelfile',
      example: '{ "name": "my-model", "modelfile": "FROM llama2\\n\\nPARAMETER temperature 1" }'
    },
    {
      method: 'DELETE',
      path: '/api/delete',
      description: 'Delete a model',
      example: '{ "name": "llama2" }'
    },
    {
      method: 'POST',
      path: '/api/copy',
      description: 'Copy a model',
      example: '{ "source": "llama2", "destination": "my-llama2" }'
    },
    {
      method: 'POST',
      path: '/api/show',
      description: 'Show information about a model',
      example: '{ "name": "llama2" }'
    }
  ];

  const testEndpoint = async () => {
    try {
      setTestResult(null);
      setTestError(null);
      
      const response = await fetch(`${serverUrl}/api/tags`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      if (error instanceof Error) {
        setTestError(`Error: ${error.message}`);
      } else {
        setTestError('An unknown error occurred');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        API Endpoints
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Test API Connection
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField 
            label="Ollama Server URL" 
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            sx={{ flexGrow: 1, mr: 2 }}
          />
          <Button 
            variant="contained" 
            onClick={testEndpoint}
          >
            Test Connection
          </Button>
        </Box>
        
        {testError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {testError}
          </Alert>
        )}
        
        {testResult && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: 'background.default',
              maxHeight: 200,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            <pre>{testResult}</pre>
          </Paper>
        )}
      </Paper>
      
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Available Endpoints
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          The following endpoints are available on your Ollama instance at <strong>{serverUrl}</strong>
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Method</TableCell>
                <TableCell>Endpoint</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Example Payload</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apiEndpoints.map((endpoint) => (
                <TableRow key={`${endpoint.method}-${endpoint.path}`}>
                  <TableCell>
                    <Chip 
                      label={endpoint.method} 
                      color={
                        endpoint.method === 'GET' ? 'success' : 
                        endpoint.method === 'POST' ? 'primary' : 
                        'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {endpoint.path}
                    </Typography>
                  </TableCell>
                  <TableCell>{endpoint.description}</TableCell>
                  <TableCell>
                    {endpoint.example && (
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {endpoint.example}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}