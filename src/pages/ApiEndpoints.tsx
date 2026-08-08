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
  Alert,
  Stack
} from '@mui/material';
import { PlayArrow as TestIcon } from '@mui/icons-material';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { DEFAULT_OLLAMA_URL, STORAGE_KEYS } from '../constants/app';
import { FONT_FAMILY_MONO, RADIUS, SPACING } from '../theme';

const RESULT_MAX_HEIGHT = 240;
const TABLE_MIN_WIDTH = 760;

type HttpMethod = 'GET' | 'POST' | 'DELETE';

interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  description: string;
  example?: string;
}

/** Chip colour per HTTP verb. */
const METHOD_COLORS: Record<HttpMethod, 'success' | 'primary' | 'error'> = {
  GET: 'success',
  POST: 'primary',
  DELETE: 'error',
};

const API_ENDPOINTS: ApiEndpoint[] = [
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

export default function ApiEndpoints() {
  const [serverUrl, setServerUrl] = useState(
    () => localStorage.getItem(STORAGE_KEYS.serverUrl) || DEFAULT_OLLAMA_URL
  );
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const testEndpoint = async () => {
    setTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const response = await fetch(`${serverUrl.replace(/\/+$/, '')}/api/tags`);

      if (!response.ok) {
        throw new Error(`The server replied with HTTP ${response.status}.`);
      }

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestError(
        error instanceof Error
          ? error.message
          : 'The request failed for an unknown reason.'
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="API Endpoints"
        description="Reference for the Ollama HTTP API, plus a quick connectivity check against your configured server."
      />

      <Paper
        elevation={0}
        component="section"
        aria-labelledby="test-connection-heading"
        sx={{
          p: SPACING.panel,
          mb: SPACING.grid,
          borderRadius: RADIUS.lg,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography id="test-connection-heading" variant="h6" component="h2">
          Test API connection
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Calls <Box component="code" sx={{ fontFamily: FONT_FAMILY_MONO }}>/api/tags</Box> and shows the raw
          response. Changing the URL here does not save it — use Settings for that.
        </Typography>
        <Divider sx={{ my: 2.5 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: testError || testResult ? 2.5 : 0, alignItems: { sm: 'flex-start' } }}
        >
          <TextField
            label="Ollama server URL"
            type="url"
            value={serverUrl}
            onChange={(event) => setServerUrl(event.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            onClick={() => void testEndpoint()}
            loading={testing}
            startIcon={<TestIcon />}
            sx={{ height: 56, whiteSpace: 'nowrap' }}
          >
            Test connection
          </Button>
        </Stack>

        {testError && (
          <Alert severity="error">
            {testError} Check that Ollama is running and allows requests from this origin.
          </Alert>
        )}

        {testResult && (
          <Box>
            <Alert severity="success" sx={{ mb: 1.5 }}>
              Connection succeeded.
            </Alert>
            <Box
              component="pre"
              tabIndex={0}
              aria-label="API response"
              sx={{
                m: 0,
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: RADIUS.md,
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: RESULT_MAX_HEIGHT,
                overflow: 'auto',
                fontFamily: FONT_FAMILY_MONO,
                fontSize: '0.8125rem',
              }}
            >
              {testResult}
            </Box>
          </Box>
        )}
      </Paper>

      <Paper
        elevation={0}
        component="section"
        aria-labelledby="available-endpoints-heading"
        sx={{
          borderRadius: RADIUS.lg,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: SPACING.panel, pb: 2 }}>
          <Typography id="available-endpoints-heading" variant="h6" component="h2">
            Available endpoints
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Served by your Ollama instance at{' '}
            <Box component="code" sx={{ fontFamily: FONT_FAMILY_MONO }}>{serverUrl}</Box>.
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: TABLE_MIN_WIDTH }} aria-label="Ollama API endpoints">
            <TableHead>
              <TableRow>
                <TableCell>Method</TableCell>
                <TableCell>Endpoint</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Example payload</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {API_ENDPOINTS.map((endpoint) => (
                <TableRow
                  key={`${endpoint.method}-${endpoint.path}`}
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>
                    <Chip label={endpoint.method} color={METHOD_COLORS[endpoint.method]} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" component="code" sx={{ fontFamily: FONT_FAMILY_MONO }}>
                      {endpoint.path}
                    </Typography>
                  </TableCell>
                  <TableCell>{endpoint.description}</TableCell>
                  <TableCell>
                    {endpoint.example && (
                      <Typography
                        variant="body2"
                        component="code"
                        color="text.secondary"
                        sx={{ fontFamily: FONT_FAMILY_MONO, whiteSpace: 'pre-wrap' }}
                      >
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
