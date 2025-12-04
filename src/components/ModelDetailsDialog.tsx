import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    Divider,
    Paper,
    CircularProgress
} from '@mui/material';
import { useState, useEffect } from 'react';
import { ollamaService } from '../api/ollamaApi';

interface ModelDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    modelName: string;
}

interface ModelInfo {
    license?: string;
    modelfile?: string;
    parameters?: string;
    template?: string;
    system?: string;
    details?: {
        parent_model: string;
        format: string;
        family: string;
        families: string[];
        parameter_size: string;
        quantization_level: string;
    };
}

export default function ModelDetailsDialog({ open, onClose, modelName }: ModelDetailsDialogProps) {
    const [info, setInfo] = useState<ModelInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open && modelName) {
            fetchModelInfo();
        }
    }, [open, modelName]);

    const fetchModelInfo = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await ollamaService.showModelInfo(modelName);
            setInfo(data);
        } catch (err) {
            console.error('Failed to fetch model info:', err);
            setError('Failed to load model details');
        } finally {
            setLoading(false);
        }
    };

    const CodeBlock = ({ content, label }: { content: string; label: string }) => (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                {label}
            </Typography>
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    maxHeight: 200,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    whiteSpace: 'pre-wrap'
                }}
            >
                {content}
            </Paper>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                            {modelName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Model Details & Configuration
                        </Typography>
                    </Box>
                    {info?.details && (
                        <Chip
                            label={info.details.parameter_size}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                        />
                    )}
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" align="center" sx={{ py: 4 }}>
                        {error}
                    </Typography>
                ) : info ? (
                    <Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
                            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }} elevation={0}>
                                <Typography variant="caption" color="text.secondary">Format</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>{info.details?.format || 'N/A'}</Typography>
                            </Paper>
                            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }} elevation={0}>
                                <Typography variant="caption" color="text.secondary">Family</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>{info.details?.family || 'N/A'}</Typography>
                            </Paper>
                            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }} elevation={0}>
                                <Typography variant="caption" color="text.secondary">Quantization</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>{info.details?.quantization_level || 'N/A'}</Typography>
                            </Paper>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {info.system && <CodeBlock label="System Prompt" content={info.system} />}
                        {info.template && <CodeBlock label="Template" content={info.template} />}
                        {info.parameters && <CodeBlock label="Parameters" content={info.parameters} />}
                        {info.modelfile && <CodeBlock label="Full Modelfile" content={info.modelfile} />}
                    </Box>
                ) : null}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose} sx={{ fontWeight: 600 }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
