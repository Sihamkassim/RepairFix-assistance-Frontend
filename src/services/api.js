const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from Clerk
const getAuthToken = async () => {
  // This will be provided by Clerk's useAuth hook
  return null;
};

export const api = {
  // Get user profile
  async getUserProfile(token) {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Get conversations
  async getConversations(token) {
    const response = await fetch(`${API_URL}/user/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Get usage stats
  async getUsage(token) {
    const response = await fetch(`${API_URL}/user/usage`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Send message via SSE stream
  async sendMessage(token, message, conversationId = null) {
    const params = new URLSearchParams({ message });
    if (conversationId) {
      params.append('conversationId', conversationId);
    }

    const response = await fetch(`${API_URL}/chat/stream?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to connect to chat stream');
    }

    return response.body.getReader();
  },

  // Create new conversation
  async createConversation(token, title) {
    const response = await fetch(`${API_URL}/chat/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    return response.json();
  },

  // Get conversation history
  async getConversation(token, conversationId) {
    const response = await fetch(`${API_URL}/chat/conversations/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Delete conversation
  async deleteConversation(token, conversationId) {
    const response = await fetch(`${API_URL}/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
