import { create } from 'zustand';
import { api } from '../services/api';

export const useChatStore = create((set, get) => ({
  // Conversations list
  conversations: [],
  conversationsLoading: true,
  
  // Current conversation
  currentConversationId: null,
  messages: [],
  messagesLoading: false,
  
  // Streaming state
  isStreaming: false,
  streamingContent: '',
  statusMessage: '',
  
  // Error state
  error: null,

  // Load all conversations
  loadConversations: async (token) => {
    set({ conversationsLoading: true });
    try {
      const data = await api.getConversations(token);
      set({ conversations: data.conversations || [], conversationsLoading: false });
    } catch (error) {
      console.error('Error loading conversations:', error);
      set({ conversationsLoading: false, error: error.message });
    }
  },

  // Load a specific conversation's messages
  loadConversation: async (token, conversationId) => {
    if (!conversationId) {
      set({ currentConversationId: null, messages: [] });
      return;
    }
    
    set({ messagesLoading: true, currentConversationId: conversationId });
    try {
      const data = await api.getConversation(token, conversationId);
      const messages = (data.messages || []).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
      }));
      set({ messages, messagesLoading: false });
    } catch (error) {
      console.error('Error loading conversation:', error);
      set({ messagesLoading: false, error: error.message });
    }
  },

  // Select a conversation (switch to it)
  selectConversation: (conversationId) => {
    set({ currentConversationId: conversationId, messages: [], streamingContent: '', statusMessage: '' });
  },

  // Start a new conversation
  startNewConversation: () => {
    set({ currentConversationId: null, messages: [], streamingContent: '', statusMessage: '' });
  },

  // Add a user message locally
  addUserMessage: (content) => {
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, userMessage] }));
  },

  // Add an assistant message locally
  addAssistantMessage: (content) => {
    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ 
      messages: [...state.messages, assistantMessage],
      streamingContent: '',
      statusMessage: '',
      isStreaming: false 
    }));
  },

  // Update streaming content
  setStreamingContent: (content) => {
    set({ streamingContent: content });
  },

  // Append to streaming content
  appendStreamingContent: (chunk) => {
    set((state) => ({ streamingContent: state.streamingContent + chunk }));
  },

  // Set status message
  setStatusMessage: (message) => {
    set({ statusMessage: message });
  },

  // Set streaming state
  setIsStreaming: (isStreaming) => {
    set({ isStreaming });
  },

  // Set current conversation ID
  setCurrentConversationId: (id) => {
    set({ currentConversationId: id });
  },

  // Clear streaming state
  clearStreaming: () => {
    set({ streamingContent: '', statusMessage: '', isStreaming: false });
  },

  // Set error
  setError: (error) => {
    set({ error });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Delete a conversation
  deleteConversation: async (token, conversationId) => {
    try {
      await api.deleteConversation(token, conversationId);
      set((state) => ({
        conversations: state.conversations.filter(c => c.id !== conversationId),
        currentConversationId: state.currentConversationId === conversationId ? null : state.currentConversationId,
        messages: state.currentConversationId === conversationId ? [] : state.messages,
      }));
    } catch (error) {
      console.error('Error deleting conversation:', error);
      set({ error: error.message });
    }
  },

  // Send a message and handle the stream
  sendMessage: async (token, content) => {
    const { currentConversationId, addUserMessage, addAssistantMessage, setStreamingContent, setStatusMessage, setIsStreaming, setCurrentConversationId, loadConversations } = get();
    
    // Add user message immediately
    addUserMessage(content);
    setIsStreaming(true);
    setStreamingContent('');
    setStatusMessage('');

    try {
      const reader = await api.sendMessage(token, content, currentConversationId);
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';
      let newConversationId = currentConversationId;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Stream ended - finalize the message if not already done
          if (fullResponse && fullResponse.trim()) {
            addAssistantMessage(fullResponse);
          } else {
            set({ isStreaming: false, streamingContent: '', statusMessage: '' });
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          try {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            
            const data = JSON.parse(jsonStr);
            
            switch (data.type) {
              case 'status':
                setStatusMessage(data.message);
                break;
                
              case 'token':
                setStatusMessage(''); // Clear status when content starts
                fullResponse += data.content;
                setStreamingContent(fullResponse);
                break;
                
              case 'done':
                console.log('Stream done event:', { fullResponse: fullResponse.length, conversationId: data.conversationId });
                
                // Save the conversation ID
                if (data.conversationId) {
                  newConversationId = data.conversationId;
                  setCurrentConversationId(data.conversationId);
                }
                
                // Add the final message to state
                if (fullResponse && fullResponse.trim()) {
                  addAssistantMessage(fullResponse);
                  fullResponse = ''; // Mark as handled
                }
                
                // Refresh conversations list
                loadConversations(token);
                break;
                
              case 'error':
                console.error('SSE Error:', data.message);
                throw new Error(data.message);
            }
          } catch (e) {
            if (e.message !== 'Unexpected end of JSON input') {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message as assistant response
      const errorMessage = error.message?.includes('Authentication') 
        ? 'Please sign in to continue chatting.'
        : error.message?.includes('timeout')
        ? 'The request took too long. Please try a simpler question.'
        : `Sorry, something went wrong. ${error.message || 'Please try again.'}`;
      
      addAssistantMessage(errorMessage);
      set({ error: error.message });
    }
  },
}));
