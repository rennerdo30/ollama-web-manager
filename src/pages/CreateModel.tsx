import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    MenuItem,
    Grid,
    Alert,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    useTheme
} from '@mui/material';
import {
    Save as SaveIcon,
    AutoFixHigh as MagicIcon,
    Code as CodeIcon
} from '@mui/icons-material';
import { ollamaService, Model } from '../api/ollamaApi';
import { useNavigate } from 'react-router-dom';

export default function CreateModel() {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [creationLog, setCreationLog] = useState<string[]>([]);

    // Form state
    const [name, setName] = useState('');
    const [baseModel, setBaseModel] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [temperature, setTemperature] = useState(0.7);
    const [contextSize, setContextSize] = useState(4096);

    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const data = await ollamaService.getModels();
            setModels(data);
        } catch (err) {
            console.error('Error fetching models:', err);
            setError('Failed to load base models');
        }
    };

    const generateModelfile = () => {
        let content = `FROM ${baseModel}\n`;

        if (systemPrompt) {
            content += `SYSTEM """${systemPrompt}"""\n`;
        }

        content += `PARAMETER temperature ${temperature}\n`;
        content += `PARAMETER num_ctx ${contextSize}\n`;

        return content;
    };

    const handleCreate = async () => {
        if (!name || !baseModel) {
            setError('Name and Base Model are required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setCreationLog([]);
        setActiveStep(1);

        try {
            const modelfile = generateModelfile();

            await ollamaService.createModel(name, modelfile, (status) => {
                setCreationLog(prev => [...prev, status]);
            });

            setSuccess(`Successfully created model: ${name}`);
            setActiveStep(2);

            // Reset form after delay
            setTimeout(() => {
                navigate('/models');
            }, 2000);

        } catch (err) {
            console.error('Error creating model:', err);
            setError('Failed to create model. Check console for details.');
            setActiveStep(0);
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Configure', 'Creating', 'Done'];

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', pb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Create Custom Model
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Design a new model variant by customizing parameters and system prompts
                </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MagicIcon color="primary" />
                            Model Configuration
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="New Model Name"
                                    placeholder="e.g., coding-assistant-v1"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    helperText="Unique name for your custom model"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Base Model"
                                    value={baseModel}
                                    onChange={(e) => setBaseModel(e.target.value)}
                                    disabled={loading}
                                    helperText="Select a model to build upon"
                                >
                                    {models.map((model) => (
                                        <MenuItem key={model.name} value={model.name}>
                                            {model.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="System Prompt"
                                    placeholder="You are an expert coding assistant..."
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    disabled={loading}
                                    helperText="Define the model's persona and behavior"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Temperature"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                    disabled={loading}
                                    inputProps={{ step: 0.1, min: 0, max: 2 }}
                                    helperText="Creativity (0.0 - 2.0)"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Context Size"
                                    value={contextSize}
                                    onChange={(e) => setContextSize(parseInt(e.target.value))}
                                    disabled={loading}
                                    helperText="Context window size (tokens)"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={handleCreate}
                                    disabled={loading || !name || !baseModel}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        boxShadow: theme.shadows[4]
                                    }}
                                >
                                    {loading ? 'Creating Model...' : 'Create Model'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%', bgcolor: 'action.hover' }} elevation={0}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CodeIcon color="secondary" />
                            Preview Modelfile
                        </Typography>

                        <Box
                            component="pre"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                overflowX: 'auto',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                                minHeight: 200
                            }}
                        >
                            {generateModelfile()}
                        </Box>

                        {creationLog.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Build Log
                                </Typography>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        maxHeight: 200,
                                        overflowY: 'auto',
                                        fontFamily: 'monospace',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    {creationLog.map((log, i) => (
                                        <div key={i}>{log}</div>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
