import { useCallback, useEffect, useState } from 'react';
import {
    Grid,
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    MenuItem,
    Alert,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import {
    Save as SaveIcon,
    AutoFixHigh as MagicIcon,
    Code as CodeIcon
} from '@mui/icons-material';
import { ollamaService, Model } from '../api/ollamaApi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { FONT_FAMILY_MONO, RADIUS, SPACING } from '../theme';

const TEMPERATURE_MIN = 0;
const TEMPERATURE_MAX = 2;
const TEMPERATURE_STEP = 0.1;
const TEMPERATURE_DEFAULT = 0.7;
const CONTEXT_SIZE_MIN = 512;
const CONTEXT_SIZE_DEFAULT = 4096;
const CONTEXT_SIZE_STEP = 512;
const FORM_MAX_WIDTH = 1080;
const CODE_BLOCK_MIN_HEIGHT = 190;
const LOG_MAX_HEIGHT = 200;
const REDIRECT_DELAY_MS = 2000;
const STEPS = ['Configure', 'Creating', 'Done'] as const;

/**
 * Keeps numeric inputs usable while typing: an empty or partial value yields
 * `null` instead of `NaN`, which previously leaked into the Modelfile preview
 * as `PARAMETER temperature NaN`.
 */
const parseOptionalNumber = (raw: string): number | null => {
    if (raw.trim() === '') {
        return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
};

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
    const [temperature, setTemperature] = useState<number | null>(TEMPERATURE_DEFAULT);
    const [contextSize, setContextSize] = useState<number | null>(CONTEXT_SIZE_DEFAULT);

    const navigate = useNavigate();

    const fetchModels = useCallback(async () => {
        try {
            const data = await ollamaService.getModels();
            setModels(data);
        } catch (err) {
            console.error('Error fetching models:', err);
            setError('Could not load base models. Check that Ollama is running and reachable.');
        }
    }, []);

    useEffect(() => {
        void fetchModels();
    }, [fetchModels]);

    const generateModelfile = () => {
        const lines = [`FROM ${baseModel || '<base model>'}`];

        if (systemPrompt) {
            lines.push(`SYSTEM """${systemPrompt}"""`);
        }

        lines.push(`PARAMETER temperature ${temperature ?? TEMPERATURE_DEFAULT}`);
        lines.push(`PARAMETER num_ctx ${contextSize ?? CONTEXT_SIZE_DEFAULT}`);

        return `${lines.join('\n')}\n`;
    };

    const handleCreate = async () => {
        if (!name.trim() || !baseModel) {
            setError('A model name and a base model are both required.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setCreationLog([]);
        setActiveStep(1);

        try {
            await ollamaService.createModel(name.trim(), generateModelfile(), (status) => {
                setCreationLog((previous) => [...previous, status]);
            });

            setSuccess(`Created model “${name.trim()}”. Taking you to the model library…`);
            setActiveStep(2);

            setTimeout(() => {
                navigate('/models');
            }, REDIRECT_DELAY_MS);
        } catch (err) {
            console.error('Error creating model:', err);
            setError('Creating the model failed. See the browser console for the full response.');
            setActiveStep(0);
        } finally {
            setLoading(false);
        }
    };

    const isSubmitDisabled = loading || !name.trim() || !baseModel;

    return (
        <Box sx={{ maxWidth: FORM_MAX_WIDTH, pb: SPACING.pageHeader }}>
            <PageHeader
                title="Create Custom Model"
                description="Derive a new model from one you already have by pinning a system prompt and generation parameters."
            />

            <Stepper activeStep={activeStep} sx={{ mb: SPACING.section }}>
                {STEPS.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {error && (
                <Alert severity="error" sx={{ mb: SPACING.grid }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: SPACING.grid }}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={SPACING.grid}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper
                        elevation={0}
                        component="section"
                        aria-labelledby="model-config-heading"
                        sx={{ p: SPACING.panel, borderRadius: RADIUS.lg, border: '1px solid', borderColor: 'divider' }}
                    >
                        <Typography
                            id="model-config-heading"
                            variant="h6"
                            component="h2"
                            sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                            <MagicIcon color="primary" aria-hidden />
                            Model configuration
                        </Typography>

                        <Grid container spacing={2.5}>
                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    required
                                    label="New model name"
                                    placeholder="coding-assistant-v1"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    disabled={loading}
                                    helperText="Unique name for your custom model"
                                />
                            </Grid>

                            <Grid size={12}>
                                <TextField
                                    select
                                    fullWidth
                                    required
                                    label="Base model"
                                    value={baseModel}
                                    onChange={(event) => setBaseModel(event.target.value)}
                                    disabled={loading || models.length === 0}
                                    helperText={
                                        models.length === 0
                                            ? 'No local models found — pull one on the Models page first.'
                                            : 'Select a model to build upon'
                                    }
                                >
                                    {models.map((model) => (
                                        <MenuItem key={model.name} value={model.name}>
                                            {model.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="System prompt"
                                    placeholder="You are an expert coding assistant…"
                                    value={systemPrompt}
                                    onChange={(event) => setSystemPrompt(event.target.value)}
                                    disabled={loading}
                                    helperText="Defines the model's persona and behaviour"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Temperature"
                                    value={temperature ?? ''}
                                    onChange={(event) => setTemperature(parseOptionalNumber(event.target.value))}
                                    disabled={loading}
                                    slotProps={{
                                        htmlInput: {
                                            step: TEMPERATURE_STEP,
                                            min: TEMPERATURE_MIN,
                                            max: TEMPERATURE_MAX
                                        }
                                    }}
                                    helperText={`Creativity, ${TEMPERATURE_MIN} to ${TEMPERATURE_MAX}`}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Context size"
                                    value={contextSize ?? ''}
                                    onChange={(event) => setContextSize(parseOptionalNumber(event.target.value))}
                                    disabled={loading}
                                    slotProps={{
                                        htmlInput: {
                                            min: CONTEXT_SIZE_MIN,
                                            step: CONTEXT_SIZE_STEP
                                        }
                                    }}
                                    helperText="Context window size in tokens"
                                />
                            </Grid>

                            <Grid size={12}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={() => void handleCreate()}
                                    disabled={isSubmitDisabled}
                                    loading={loading}
                                    startIcon={<SaveIcon />}
                                    sx={{ mt: 1 }}
                                >
                                    {loading ? 'Creating model…' : 'Create model'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper
                        elevation={0}
                        component="section"
                        aria-labelledby="preview-heading"
                        sx={{
                            p: SPACING.panel,
                            borderRadius: RADIUS.lg,
                            height: '100%',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'action.hover'
                        }}
                    >
                        <Typography
                            id="preview-heading"
                            variant="h6"
                            component="h2"
                            sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                            <CodeIcon color="secondary" aria-hidden />
                            Modelfile preview
                        </Typography>

                        <Box
                            component="pre"
                            aria-live="polite"
                            sx={{
                                m: 0,
                                p: 2,
                                borderRadius: RADIUS.md,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                overflowX: 'auto',
                                fontFamily: FONT_FAMILY_MONO,
                                fontSize: '0.8125rem',
                                minHeight: CODE_BLOCK_MIN_HEIGHT
                            }}
                        >
                            {generateModelfile()}
                        </Box>

                        {creationLog.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" component="h3" sx={{ mb: 1 }}>
                                    Build log
                                </Typography>
                                <Box
                                    role="log"
                                    aria-live="polite"
                                    sx={{
                                        p: 2,
                                        borderRadius: RADIUS.md,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        maxHeight: LOG_MAX_HEIGHT,
                                        overflowY: 'auto',
                                        fontFamily: FONT_FAMILY_MONO,
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {creationLog.map((log, index) => (
                                        <div key={`${index}-${log}`}>{log}</div>
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
