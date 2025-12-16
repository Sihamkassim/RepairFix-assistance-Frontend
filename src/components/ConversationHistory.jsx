import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../services/api';
import { MessageSquare, Trash2, Clock, Plus, Wrench, RefreshCw } from 'lucide-react';

const ConversationHistory = forwardRef(function ConversationHistory({ onSelectConversation, currentConversationId }, ref) {
  const { getToken } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Expose refresh function to parent
  useImperativeHandle(ref, () => ({
    refresh: loadConversations
  }));

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setRefreshing(true);
      const token = await getToken();
      const data = await api.getConversations(token);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (conversationId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const token = await getToken();
      await api.deleteConversation(token, conversationId);
      setConversations(conversations.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        onSelectConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    
    // Check for invalid date
    if (isNaN(date.getTime())) return 'Just now';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
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
          onClick={loadConversations}
          disabled={refreshing}
          className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
          title="Refresh conversations"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {conversations.length === 0 ? (
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
});

export default ConversationHistory;
