import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import ErrorToast from './ErrorToast';
import { Loader2, Wrench, Bot } from 'lucide-react';
import { api } from '../services/api';

export default function ChatInterface({ conversationId: initialConversationId, onConversationCreated, onRefreshHistory }) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [errorToasts, setErrorToasts] = useState([]);
  const messagesEndRef = useRef(null);

  const showError = (message, details) => {
    const id = Date.now();
    setErrorToasts(prev => [...prev, { id, message, details }]);
  };

  const removeError = (id) => {
    setErrorToasts(prev => prev.filter(e => e.id !== id));
  };

  // Load conversation history when conversationId changes
  useEffect(() => {
    if (initialConversationId) {
      loadConversation(initialConversationId);
    } else {
      // New conversation
      setMessages([]);
      setConversationId(null);
    }
  }, [initialConversationId]);

  const loadConversation = async (convId) => {
    try {
      const token = await getToken();
      const data = await api.getConversation(token, convId);
      if (data.messages) {
        setMessages(data.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
        })));
      }
      setConversationId(convId);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = async (content) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingMessage('');

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Please sign in to continue');
      }

      const reader = await api.sendMessage(token, content, conversationId);
      
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';
      let newConversationId = conversationId;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Ensure final message is saved
          if (fullResponse && fullResponse.trim()) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now(),
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date().toISOString(),
              },
            ]);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;
              
              const data = JSON.parse(jsonStr);
              console.log('SSE Event:', data.type, data);
              
              if (data.type === 'status') {
                setStatusMessage(data.message);
              } else if (data.type === 'token') {
                setStatusMessage(''); // Clear status when tokens start
                fullResponse += data.content;
                setStreamingMessage(fullResponse);
              } else if (data.type === 'done') {
                console.log('Stream completed:', { fullResponse, conversationId: data.conversationId });
                setStatusMessage('');
                // Save conversationId for next message
                if (data.conversationId) {
                  newConversationId = data.conversationId;
                  setConversationId(data.conversationId);
                  if (onConversationCreated && !conversationId) {
                    onConversationCreated(data.conversationId);
                  }
                  // Refresh conversation history sidebar
                  if (onRefreshHistory) {
                    onRefreshHistory();
                  }
                }
                // Final message will be added after stream ends
              } else if (data.type === 'error') {
                console.error('SSE Error:', data.message);
                showError(data.message, data.details);
                throw new Error(data.message);
              }
            } catch (e) {
              if (e.message && e.message !== 'Unexpected end of JSON input') {
                console.error('Parse error:', e, 'Line:', line);
              }
            }
          }
        }
      }
      
      // Clear streaming message after completion
      setStreamingMessage('');
      
    } catch (error) {
      console.error('Error sending message:', {
        message: error.message,
        type: error.name,
        stack: error.stack
      });

      // Show error toast
      showError(
        error.message || 'Failed to send message',
        error.stack ? error.stack.split('\n')[0] : undefined
      );

      // Add error message to chat
      const errorMessage = error.message?.includes('Authentication') 
        ? 'Please sign in to continue chatting.'
        : error.message?.includes('timeout')
        ? 'The request took too long. Please try a simpler question.'
        : error.message?.includes('network') || error.message?.includes('fetch')
        ? 'Network error. Please check your connection and try again.'
        : `Sorry, something went wrong. ${error.message || 'Please try again.'}`;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
      setStreamingMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/25">
                <Wrench className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                How can I help you today?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ask me anything about fixing your electronics. I'll guide you through repair steps with official iFixit guides!
              </p>
              
              {/* Quick Prompts */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <QuickPrompt 
                  onClick={() => handleSendMessage('How do I fix a cracked iPhone screen?')}
                  title="Fix cracked iPhone screen"
                  description="Step-by-step repair guide"
                  icon="📱"
                />
                <QuickPrompt 
                  onClick={() => handleSendMessage("My laptop won't turn on")}
                  title="Laptop won't turn on"
                  description="Troubleshooting help"
                  icon="💻"
                />
                <QuickPrompt 
                  onClick={() => handleSendMessage('How to clean PS5 fan?')}
                  title="Clean PS5 fan"
                  description="Maintenance guide"
                  icon="🎮"
                />
                <QuickPrompt 
                  onClick={() => handleSendMessage('Replace MacBook battery')}
                  title="Replace MacBook battery"
                  description="Battery replacement"
                  icon="🔋"
                />
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.role === 'user'}
            />
          ))}

          {streamingMessage && (
            <MessageBubble
              message={{ content: streamingMessage }}
              isUser={false}
              isStreaming={true}
            />
          )}

          {isLoading && !streamingMessage && (
            <div className="flex gap-3 mb-4 animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-blue-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full typing-dot"></span>
                    <span className="w-2 h-2 bg-primary rounded-full typing-dot"></span>
                    <span className="w-2 h-2 bg-primary rounded-full typing-dot"></span>
                  </div>
                  <span className="text-muted-foreground text-sm ml-2">
                    {statusMessage || 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />

      {/* Error Toasts */}
      {errorToasts.map((error) => (
        <ErrorToast
          key={error.id}
          message={error.message}
          details={error.details}
          onClose={() => removeError(error.id)}
        />
      ))}
    </div>
  );
}

// Quick Prompt Component
function QuickPrompt({ onClick, title, description, icon }) {
  return (
    <button
      onClick={onClick}
      className="p-4 text-left bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </button>
  );
}
