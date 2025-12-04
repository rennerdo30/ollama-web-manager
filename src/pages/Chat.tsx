import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  SmartToy as BotIcon,
  Send as SendIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { ollamaService, Message, Model } from '../api/ollamaApi';
import LoadingState from '../components/LoadingState';
import ReactMarkdown from 'react-markdown';

export default function Chat() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true);
        const data = await ollamaService.getModels();
        setModels(data);

        // Select the first model by default if available
        if (data.length > 0 && !selectedModel) {
          setSelectedModel(data[0].name);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  const handleSend = async () => {
    if (!input.trim() || !selectedModel) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input
    };

    // Create message history including system prompt if provided
    // Add existing conversation history and new user message
    const chatMessages: Message[] = [...messages, userMessage];

    // Update UI with the user message
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Create temporary placeholder for assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      // Stream the response
      await ollamaService.chat(selectedModel, chatMessages, (content) => {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content
          };
          return newMessages;
        });
      });

      setIsTyping(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setIsTyping(false);

      // Remove the placeholder message if there was an error
      setMessages(prev => prev.slice(0, prev.length - 1));
    }
  };





  if (modelsLoading) {
    return <LoadingState message="Loading models..." />;
  }


  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Chat</Typography>
          <Typography variant="body2" color="text.secondary">
            Interact with your local LLMs
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Select Model</InputLabel>
          <Select
            value={selectedModel}
            label="Select Model"
            onChange={(e) => setSelectedModel(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            {models.map((model) => (
              <MenuItem key={model.name} value={model.name}>
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          mb: 2,
          p: 3,
          overflowY: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.default'
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.6
          }}>
            <ChatIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
            <Typography variant="h6" color="text.secondary">
              Select a model and start chatting
            </Typography>
          </Box>
        ) : (
          messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 3
              }}
            >
              <Box sx={{
                display: 'flex',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                maxWidth: '80%'
              }}>
                <Avatar
                  sx={{
                    bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                    width: 32,
                    height: 32,
                    mx: 1.5,
                    mt: 0.5
                  }}
                >
                  {message.role === 'user' ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
                </Avatar>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: message.role === 'user' ? 'primary.main' : 'action.hover',
                    color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    maxWidth: '100%'
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 0.5,
                      fontWeight: 600,
                      color: message.role === 'user' ? 'inherit' : 'primary.main',
                      opacity: 0.9,
                      fontSize: '0.8rem'
                    }}
                  >
                    {message.role === 'user' ? 'You' : 'AI'}
                  </Typography>
                  <Box sx={{
                    '& p': { m: 0, lineHeight: 1.6 },
                    '& pre': {
                      overflowX: 'auto',
                      bgcolor: 'rgba(0,0,0,0.1)',
                      p: 1.5,
                      borderRadius: 1,
                      my: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.9em'
                    },
                    '& code': {
                      bgcolor: 'rgba(0,0,0,0.1)',
                      px: 0.6,
                      py: 0.2,
                      borderRadius: 0.5,
                      fontFamily: 'monospace',
                      fontSize: '0.9em'
                    },
                    '& ul, & ol': { pl: 2.5, my: 1 }
                  }}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </Box>
                </Paper>
              </Box>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <TextField
          fullWidth
          placeholder="Type your message..."
          variant="standard"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={isTyping || !selectedModel}
          multiline
          maxRows={4}
          InputProps={{
            disableUnderline: true,
            sx: { px: 2, py: 1 }
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={isTyping || !input.trim() || !selectedModel}
          sx={{
            width: 40,
            height: 40,
            mr: 0.5
          }}
        >
          {isTyping ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Paper>
    </Box>
  );
}