import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { MessageSquare, Trash2, Clock, Plus, Wrench, RefreshCw } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export default function ConversationHistory({ onSelectConversation }) {
  const { getToken } = useAuth();
  
  // Get state and actions from Zustand store
  const conversations = useChatStore((state) => state.conversations);
  const conversationsLoading = useChatStore((state) => state.conversationsLoading);
  const error = useChatStore((state) => state.error);
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const usage = useChatStore((state) => state.usage);
  const loadUsage = useChatStore((state) => state.loadUsage);

  useEffect(() => {
    const load = async () => {
      const token = await getToken();
      await Promise.all([
        loadConversations(token),
        loadUsage(token)
      ]);
    };
    load();
  }, [getToken]);

  const handleRefresh = async () => {
    const token = await getToken();
    await Promise.all([
      loadConversations(token),
      loadUsage(token)
    ]);
  };

  const handleDelete = async (conversationId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    const token = await getToken();
    await deleteConversation(token, conversationId);
    if (currentConversationId === conversationId) {
      onSelectConversation(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    
    // Parse the date - handle both ISO string and PostgreSQL timestamp formats
    let date = new Date(dateString);
    
    // Check for invalid date
    if (isNaN(date.getTime())) return 'Just now';
    
    // Get current time
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffMs = now.getTime() - date.getTime();
    
    // Handle edge cases where date is in the future (clock skew)
    if (diffMs < 0) return 'Just now';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (conversationsLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-secondary animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Conversations
        </h2>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          title="Refresh conversations"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 mb-2">
            Error: {error}
            <button onClick={handleRefresh} className="block mt-1 underline">Try again</button>
          </div>
        )}
        {conversations.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium mb-1">No conversations yet</p>
            <p className="text-muted-foreground text-sm">Start a new chat to get help</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                currentConversationId === conversation.id
                  ? 'bg-primary/10 border-2 border-primary/30'
                  : 'bg-secondary/50 border-2 border-transparent hover:bg-secondary hover:border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${
                    currentConversationId === conversation.id 
                      ? 'text-primary' 
                      : 'text-foreground'
                  }`}>
                    {conversation.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(conversation.last_updated || conversation.updated_at || conversation.started_at)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(conversation.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete conversation"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="p-3 border-t border-border">
        <button
          onClick={() => onSelectConversation(null)}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          New Conversation
        </button>
      </div>
    </div>
  );
}
