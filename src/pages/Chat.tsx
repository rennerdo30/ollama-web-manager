import { useState, useEffect, useRef, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  CircularProgress,
  Skeleton,
  alpha,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  SmartToy as BotIcon,
  Send as SendIcon,
  Chat as ChatIcon,
  DeleteSweep as ClearIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { ollamaService, Message, Model } from '../api/ollamaApi';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { MOBILE_APPBAR_HEIGHT, RADIUS, SPACING } from '../theme';

const MODEL_SELECT_MIN_WIDTH = 240;
const AVATAR_SIZE = 32;
const MESSAGE_MAX_WIDTH = '82%';
const SEND_BUTTON_SIZE = 40;
const TYPING_DOT_COUNT = 3;

/**
 * Height of the chat column. The main element adds responsive vertical gutters
 * (and a fixed app bar on mobile), so those are subtracted here — the previous
 * fixed `calc(100vh - 100px)` overflowed the viewport on small screens.
 */
const CHAT_HEIGHT = {
  xs: `calc(100dvh - ${MOBILE_APPBAR_HEIGHT}px - 32px)`,
  sm: 'calc(100dvh - 48px)',
  md: 'calc(100dvh - 64px)',
};

export default function Chat() {
  const theme = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState('');
  const [sendError, setSendError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchModels = useCallback(async () => {
    try {
      setModelsLoading(true);
      setModelsError('');
      const data = await ollamaService.getModels();
      setModels(data);

      if (data.length > 0) {
        setSelectedModel((current) => current || data[0].name);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      setModelsError('Could not load your models. Check that Ollama is running and reachable.');
    } finally {
      setModelsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchModels();
  }, [fetchModels]);

  // Keep the newest message in view, honouring the reduced-motion preference.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [messages, prefersReducedMotion]);

  const handleSend = async () => {
    if (!input.trim() || !selectedModel || isTyping) {
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    const chatMessages: Message[] = [...messages, userMessage];

    setMessages((previous) => [...previous, userMessage]);
    setInput('');
    setIsTyping(true);
    setSendError('');

    try {
      // Placeholder that the stream fills in progressively.
      setMessages((previous) => [...previous, { role: 'assistant', content: '' }]);

      await ollamaService.chat(selectedModel, chatMessages, (content) => {
        setMessages((previous) => {
          const next = [...previous];
          next[next.length - 1] = { role: 'assistant', content };
          return next;
        });
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setSendError('The model did not respond. Check that Ollama is still running and try again.');
      // Drop the empty placeholder so the transcript stays clean.
      setMessages((previous) => previous.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  const isComposerDisabled = isTyping || !selectedModel;

  if (modelsLoading) {
    return (
      <Box>
        <PageHeader title="Chat" description="Interact with the models installed on this machine." />
        <Skeleton variant="rounded" height={420} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={56} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: CHAT_HEIGHT, display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Chat"
        description="Interact with the models installed on this machine."
        actions={
          models.length > 0 ? (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setMessages([]);
                  setSendError('');
                }}
                disabled={messages.length === 0}
              >
                Clear chat
              </Button>
              <FormControl sx={{ minWidth: MODEL_SELECT_MIN_WIDTH }} size="small">
                <InputLabel id="model-select-label">Active model</InputLabel>
                <Select
                  labelId="model-select-label"
                  value={selectedModel}
                  label="Active model"
                  onChange={(event) => setSelectedModel(event.target.value)}
                >
                  {models.map((model) => (
                    <MenuItem key={model.name} value={model.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BotIcon fontSize="small" color="primary" />
                        {model.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : null
        }
      />

      {modelsError && <ErrorState message={modelsError} onRetry={() => void fetchModels()} />}
      {sendError && <ErrorState message={sendError} />}

      {models.length === 0 && !modelsError ? (
        <EmptyState
          icon={<ChatIcon />}
          title="No models to chat with"
          description="Pull a model first, then come back here to start a conversation."
          action={
            <Button component={RouterLink} to="/models" variant="contained">
              Go to Models
            </Button>
          }
        />
      ) : (
        <>
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1,
              minHeight: 0,
              mb: 2,
              p: SPACING.panel,
              overflowY: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: RADIUS.lg,
              bgcolor: 'background.default'
            }}
          >
            <Box role="log" aria-live="polite" aria-label="Conversation" aria-busy={isTyping}>
              {messages.length === 0 ? (
                <Box sx={{
                  height: '100%',
                  minHeight: 240,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: 'text.secondary'
                }}>
                  <ChatIcon aria-hidden sx={{ fontSize: 52, mb: 1.5, opacity: 0.5 }} />
                  <Typography variant="h6" component="p" color="text.primary">
                    Start a conversation
                  </Typography>
                  <Typography variant="body2">
                    Messages are sent to {selectedModel || 'the selected model'} on your machine.
                  </Typography>
                </Box>
              ) : (
                messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  const isStreamingPlaceholder =
                    !isUser && message.content === '' && isTyping && index === messages.length - 1;

                  return (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: isUser ? 'flex-end' : 'flex-start',
                        mb: 2.5
                      }}
                    >
                      <Box sx={{
                        display: 'flex',
                        flexDirection: isUser ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        maxWidth: MESSAGE_MAX_WIDTH
                      }}>
                        <Avatar
                          aria-hidden
                          sx={{
                            bgcolor: isUser ? 'primary.main' : 'secondary.main',
                            color: isUser ? 'primary.contrastText' : 'secondary.contrastText',
                            width: AVATAR_SIZE,
                            height: AVATAR_SIZE,
                            mt: 0.5,
                            flexShrink: 0
                          }}
                        >
                          {isUser ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
                        </Avatar>

                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: RADIUS.md,
                            bgcolor: isUser ? 'primary.main' : 'background.paper',
                            border: isUser ? 'none' : '1px solid',
                            borderColor: 'divider',
                            color: isUser ? 'primary.contrastText' : 'text.primary',
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            component="p"
                            sx={{
                              mb: 0.5,
                              color: isUser ? 'inherit' : 'text.secondary',
                              opacity: isUser ? 0.85 : 1,
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}
                          >
                            {isUser ? 'You' : selectedModel || 'Assistant'}
                          </Typography>

                          {isStreamingPlaceholder ? (
                            <TypingIndicator />
                          ) : (
                            <Box sx={{
                              overflowWrap: 'anywhere',
                              '& p': { m: 0, lineHeight: 1.65 },
                              '& p + p': { mt: 1 },
                              '& pre': {
                                overflowX: 'auto',
                                bgcolor: isUser
                                  ? alpha(theme.palette.common.black, 0.22)
                                  : 'action.hover',
                                p: 1.5,
                                borderRadius: 1,
                                my: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.85em'
                              },
                              '& code': {
                                bgcolor: isUser
                                  ? alpha(theme.palette.common.black, 0.22)
                                  : 'action.hover',
                                px: 0.6,
                                py: 0.2,
                                borderRadius: 0.5,
                                fontFamily: 'monospace',
                                fontSize: '0.85em'
                              },
                              '& pre code': { bgcolor: 'transparent', p: 0 },
                              '& ul, & ol': { pl: 2.5, my: 1 },
                              '& a': { color: 'inherit' },
                            }}>
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 0.5,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0.5,
              borderRadius: RADIUS.md,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              transition: 'border-color 120ms ease',
              '&:focus-within': { borderColor: 'primary.main' },
            }}
          >
            <TextField
              fullWidth
              placeholder={isComposerDisabled ? 'Select a model to start' : 'Type your message…'}
              aria-label="Message"
              variant="standard"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              disabled={isComposerDisabled}
              multiline
              maxRows={6}
              slotProps={{
                input: {
                  disableUnderline: true,
                  sx: { px: 2, py: 1.25 }
                }
              }}
            />
            <IconButton
              color="primary"
              onClick={() => void handleSend()}
              disabled={isTyping || !input.trim() || !selectedModel}
              aria-label={isTyping ? 'Waiting for the model' : 'Send message'}
              sx={{ width: SEND_BUTTON_SIZE, height: SEND_BUTTON_SIZE, mb: 0.5, mr: 0.5, flexShrink: 0 }}
            >
              {isTyping ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            </IconButton>
          </Paper>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
            Press Enter to send, Shift + Enter for a new line.
          </Typography>
        </>
      )}
    </Box>
  );
}

/** Three pulsing dots shown while the first token is still on its way. */
function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, py: 0.75 }} aria-label="The model is responding">
      {Array.from({ length: TYPING_DOT_COUNT }, (_, index) => (
        <Box
          key={index}
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: 'text.disabled',
            animation: 'chat-typing 1.2s ease-in-out infinite',
            animationDelay: `${index * 0.16}s`,
            '@keyframes chat-typing': {
              '0%, 60%, 100%': { opacity: 0.3, transform: 'translateY(0)' },
              '30%': { opacity: 1, transform: 'translateY(-2px)' },
            },
          }}
        />
      ))}
    </Box>
  );
}
