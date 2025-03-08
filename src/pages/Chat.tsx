import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  CircularProgress,
  Avatar,
  SelectChangeEvent,
  Divider,
  Alert
} from '@mui/material';
import { 
  Send as SendIcon, 
  DeleteOutline as DeleteIcon,
  Person as PersonIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';
import { ollamaService, Message, Model } from '../api/ollamaApi';
import LoadingState from '../components/LoadingState';

export default function Chat() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>('You are a helpful AI assistant running on Ollama.');
  const [showSystemPrompt, setShowSystemPrompt] = useState<boolean>(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoading, setModelsLoading] = useState<boolean>(true);
  
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
        
        setModelsLoading(false);
      } catch (err) {
        console.error('Error fetching models:', err);
        setError('Failed to fetch models. Please check if Ollama is running.');
        setModelsLoading(false);
      }
    };
    
    fetchModels();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleModelChange = (event: SelectChangeEvent) => {
    setSelectedModel(event.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedModel) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input
    };
    
    // Create message history including system prompt if provided
    let chatMessages: Message[] = [];
    
    // Add system prompt if it exists
    if (systemPrompt.trim()) {
      chatMessages.push({ role: 'system', content: systemPrompt });
    }
    
    // Add existing conversation history
    chatMessages = [...chatMessages, ...messages];
    
    // Add new user message
    chatMessages.push(userMessage);
    
    // Update UI with the user message
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);
    
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
      setError('Failed to get a response. Please try again.');
      setIsTyping(false);
      
      // Remove the placeholder message if there was an error
      setMessages(prev => prev.slice(0, prev.length - 1));
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const renderMessageContent = (content: string) => {
    // Handle both literal '\n' strings and actual newlines
    const lines = content.replace(/\\n/g, '\n').split('\n');
    return lines.map((line, i) => (
      <Typography key={i} variant="body1" sx={{ my: 0.5 }}>
        {line || <br />}
      </Typography>
    ));
  };

  if (modelsLoading) {
    return <LoadingState message="Loading models..." />;
  }

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            Chat
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200, mr: 2 }}>
              <InputLabel id="model-select-label">Model</InputLabel>
              <Select
                labelId="model-select-label"
                value={selectedModel}
                label="Model"
                onChange={handleModelChange}
                disabled={isTyping}
              >
                {models.length > 0 ? (
                  models.map((model) => (
                    <MenuItem key={model.name} value={model.name}>
                      {model.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No models available
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              sx={{ mr: 2 }}
            >
              {showSystemPrompt ? "Hide System Prompt" : "Show System Prompt"}
            </Button>
            <IconButton 
              onClick={clearChat} 
              color="primary" 
              disabled={messages.length === 0 || isTyping}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {showSystemPrompt && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              System Prompt
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Instructions for the AI assistant"
              disabled={isTyping}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              The system prompt helps guide the AI's behavior. It's included with every message but not shown in the chat.
            </Typography>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Messages area */}
        <Box 
          sx={{ 
            height: 'calc(100vh - 320px)', 
            minHeight: 400,
            maxHeight: 600,
            overflowY: 'auto',
            mb: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            p: 2
          }}
        >
          {messages.length === 0 ? (
            <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'text.secondary'
              }}
            >
              <BotIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="body1">
                Start a conversation with {selectedModel || 'the AI'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Select a model and type a message to begin
              </Typography>
            </Box>
          ) : (
            messages.map((message, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex',
                  mb: 2,
                  alignItems: 'flex-start'
                }}
              >
                <Avatar 
                  sx={{ 
                    mr: 2, 
                    bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main'
                  }}
                >
                  {message.role === 'user' ? <PersonIcon /> : <BotIcon />}
                </Avatar>
                <Box 
                  sx={{ 
                    p: 2,
                    borderRadius: 2,
                    bgcolor: message.role === 'user' ? 'primary.light' : 'secondary.light',
                    maxWidth: 'calc(100% - 60px)'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1, color: message.role === 'user' ? 'primary.dark' : 'secondary.dark' }}>
                    {message.role === 'user' ? 'You' : 'AI'}
                  </Typography>
                  {renderMessageContent(message.content)}
                </Box>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Input area */}
        <Grid container spacing={2}>
          <Grid item xs>
            <TextField
              fullWidth
              variant="outlined"
              label="Type a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              rows={2}
              disabled={isTyping || !selectedModel}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              size="large"
              endIcon={isTyping ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping || !selectedModel}
              sx={{ height: '100%' }}
            >
              Send
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}