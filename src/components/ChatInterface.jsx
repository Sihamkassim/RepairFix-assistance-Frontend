import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import ErrorToast from './ErrorToast';
import { Loader2, Wrench, Bot } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export default function ChatInterface({ conversationId: initialConversationId }) {
  const { getToken } = useAuth();
  const messagesEndRef = useRef(null);
  
  // Get state and actions from Zustand store
  const messages = useChatStore((state) => state.messages);
  const messagesLoading = useChatStore((state) => state.messagesLoading);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const streamingContent = useChatStore((state) => state.streamingContent);
  const statusMessage = useChatStore((state) => state.statusMessage);
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const error = useChatStore((state) => state.error);
  const loadConversation = useChatStore((state) => state.loadConversation);
  const startNewConversation = useChatStore((state) => state.startNewConversation);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const clearError = useChatStore((state) => state.clearError);
  const isOverLimit = useChatStore((state) => state.isOverLimit());

  // Load conversation when initialConversationId changes
  useEffect(() => {
    const loadData = async () => {
      const token = await getToken();
      if (initialConversationId) {
        await loadConversation(token, initialConversationId);
      } else if (initialConversationId === null) {
        // User clicked "New Conversation"
        startNewConversation();
      }
    };
    loadData();
  }, [initialConversationId, getToken]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Handle sending messages
  const handleSendMessage = async (content) => {
    const token = await getToken();
    if (!token) {
      return;
    }
    await sendMessage(token, content);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && !messagesLoading && !isStreaming && (
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

          {messagesLoading && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading conversation...</span>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.role === 'user'}
              onResend={message.role === 'user' ? handleSendMessage : undefined}
            />
          ))}

          {streamingContent && (
            <MessageBubble
              message={{ content: streamingContent }}
              isUser={false}
              isStreaming={true}
            />
          )}

          {isStreaming && !streamingContent && (
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
      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={isStreaming || isOverLimit} 
        placeholder={isOverLimit ? "Daily limit reached. Try again tomorrow!" : "Ask about a repair..."}
      />

      {/* Error Toast */}
      {error && (
        <ErrorToast
          message={error}
          onClose={clearError}
        />
      )}
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