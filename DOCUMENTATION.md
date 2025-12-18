# RepairFix Assistant - Frontend Documentation

## 01. Project Overview

RepairFix Assistant Frontend is a modern React application that provides an intuitive chat interface for users to get electronics repair help. Built with Vite, Tailwind CSS, and Zustand for state management.

---

## 02. Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI library |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| Zustand | 5.0.9 | State management |
| Clerk | - | Authentication |
| React Markdown | - | Markdown rendering |
| Lucide React | - | Icon library |
| clsx/tailwind-merge | - | Class name utilities |

---

## 03. Project Structure

```
RepairFix-assistance-Frontend/
├── index.html              # HTML entry point
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── eslint.config.js        # ESLint configuration
│
├── public/                 # Static assets
│
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Main application component
    ├── App.css             # App-specific styles
    ├── index.css           # Global styles & CSS variables
    │
    ├── assets/             # Images, fonts, etc.
    │
    ├── components/         # React components
    │   ├── Header.jsx      # Navigation header
    │   ├── ChatInterface.jsx   # Main chat UI
    │   ├── ChatInput.jsx   # Message input component
    │   ├── MessageBubble.jsx   # Chat message display
    │   ├── ConversationHistory.jsx  # Sidebar conversations
    │   └── ErrorToast.jsx  # Error notifications
    │
    ├── context/            # React contexts
    │   └── ThemeContext.jsx    # Dark/light theme
    │
    ├── store/              # Zustand stores
    │   └── chatStore.js    # Chat state management
    │
    ├── services/           # API services
    │   └── api.js          # Backend API calls
    │
    └── lib/                # Utilities
        └── utils.js        # Helper functions (cn)
```

---

## 04. Environment Variables

Create a `.env` file:

```env
# Backend API
VITE_API_URL=http://localhost:5000/api

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 05. Zustand State Management

### Why Zustand?

Zustand provides simple, scalable state management without boilerplate:
- No providers needed
- Direct store access with hooks
- Built-in devtools support
- Automatic re-renders on state changes

### Chat Store Implementation

```javascript
// src/store/chatStore.js
import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════
  
  // Conversations list (sidebar)
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

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════
  
  // Load all conversations
  loadConversations: async (token) => { ... },
  
  // Load a specific conversation
  loadConversation: async (token, conversationId) => { ... },
  
  // Start new conversation
  startNewConversation: () => { ... },
  
  // Add messages
  addUserMessage: (content) => { ... },
  addAssistantMessage: (content) => { ... },
  
  // Streaming
  setStreamingContent: (content) => { ... },
  appendStreamingContent: (chunk) => { ... },
  setStatusMessage: (message) => { ... },
  
  // Send message (handles entire flow)
  sendMessage: async (token, content) => { ... },
  
  // Delete conversation
  deleteConversation: async (token, conversationId) => { ... },
}));
```

### Using the Store in Components

```jsx
// Selecting specific state (optimized re-renders)
const messages = useChatStore((state) => state.messages);
const isStreaming = useChatStore((state) => state.isStreaming);
const sendMessage = useChatStore((state) => state.sendMessage);

// Using in component
const handleSend = async (content) => {
  const token = await getToken();
  await sendMessage(token, content);
};
```

### State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  conversations[]  ◄──────── loadConversations()                 │
│        │                                                         │
│        └──────► ConversationHistory component                   │
│                                                                  │
│  currentConversationId ◄──── selectConversation()               │
│        │                      startNewConversation()            │
│        │                                                         │
│        └──────► ChatInterface component                         │
│                                                                  │
│  messages[] ◄─────────────── loadConversation()                 │
│        │                      addUserMessage()                  │
│        │                      addAssistantMessage()             │
│        │                                                         │
│        └──────► MessageBubble components                        │
│                                                                  │
│  isStreaming ◄────────────── sendMessage()                      │
│  streamingContent             (SSE streaming)                   │
│  statusMessage                                                   │
│        │                                                         │
│        └──────► Loading indicators & streaming display          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 06. Component Architecture

### Component Hierarchy

```
App.jsx
├── Header.jsx
│   ├── Logo
│   ├── Theme Toggle (Sun/Moon)
│   └── User Button (Clerk)
│
├── [SignedOut] Landing Page
│   ├── Hero Section
│   ├── Feature Cards
│   ├── Device Badges
│   └── How It Works
│
└── [SignedIn] Chat Layout
    ├── ConversationHistory.jsx (Sidebar)
    │   ├── Conversation List
    │   ├── Delete Button
    │   └── New Conversation Button
    │
    └── ChatInterface.jsx (Main)
        ├── Empty State (Quick Prompts)
        ├── Message List
        │   └── MessageBubble.jsx
        │       ├── User Message
        │       │   ├── Content
        │       │   ├── Copy Button
        │       │   └── Resend Button
        │       └── Assistant Message
        │           ├── Markdown Content
        │           ├── Streaming Cursor
        │           └── Copy Button
        ├── Loading Indicator
        └── ChatInput.jsx
```

### Component Details

#### App.jsx
- Main application shell
- Handles routing between landing page and chat
- Manages sidebar visibility (mobile responsive)

#### Header.jsx
- Navigation bar with logo
- Theme toggle (dark/light mode)
- Clerk UserButton for auth

#### ChatInterface.jsx
- Main chat area
- Connects to Zustand store
- Handles message sending
- Shows loading states and streaming content

#### MessageBubble.jsx
- Renders individual messages
- Different styles for user/assistant
- Markdown rendering for assistant
- Copy and resend buttons

#### ConversationHistory.jsx
- Sidebar listing conversations
- Delete functionality
- New conversation button
- Refresh button

#### ChatInput.jsx
- Text input with send button
- Disabled during streaming

---

## 07. Theme System

### Theme Context

```jsx
// src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' : 'light';
  });

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### CSS Variables

```css
/* src/index.css */
:root {
  /* Light theme */
  --background: 250 250 250;
  --foreground: 10 10 10;
  --card: 255 255 255;
  --card-foreground: 10 10 10;
  --primary: 59 130 246;
  --primary-foreground: 255 255 255;
  --secondary: 241 245 249;
  --secondary-foreground: 30 41 59;
  --muted: 241 245 249;
  --muted-foreground: 100 116 139;
  --border: 226 232 240;
}

.dark {
  /* Dark theme */
  --background: 10 10 10;
  --foreground: 250 250 250;
  --card: 23 23 23;
  --card-foreground: 250 250 250;
  --primary: 59 130 246;
  --primary-foreground: 255 255 255;
  --secondary: 38 38 38;
  --secondary-foreground: 250 250 250;
  --muted: 38 38 38;
  --muted-foreground: 163 163 163;
  --border: 38 38 38;
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-foreground': 'rgb(var(--primary-foreground) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        'secondary-foreground': 'rgb(var(--secondary-foreground) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
      },
    },
  },
};
```

---

## 08. API Service Layer

### API Configuration

```javascript
// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // User endpoints
  async getUserProfile(token) { ... },
  async getConversations(token) { ... },
  async getUsage(token) { ... },
  
  // Chat endpoints
  async sendMessage(token, message, conversationId) { ... },
  async getConversation(token, conversationId) { ... },
  async deleteConversation(token, conversationId) { ... },
};
```

### SSE Streaming

```javascript
// Sending message with SSE
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

  // Return stream reader for processing
  return response.body.getReader();
}
```

### Processing SSE Stream

```javascript
// In chatStore.js sendMessage action
const reader = await api.sendMessage(token, content, currentConversationId);
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    
    const data = JSON.parse(line.slice(6));
    
    switch (data.type) {
      case 'status':
        setStatusMessage(data.message);
        break;
      case 'token':
        appendStreamingContent(data.content);
        break;
      case 'done':
        addAssistantMessage(fullResponse);
        loadConversations(token);
        break;
      case 'error':
        throw new Error(data.message);
    }
  }
}
```

---

## 09. Authentication with Clerk

### Setup

```jsx
// src/main.jsx
import { ClerkProvider } from '@clerk/clerk-react';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={CLERK_KEY}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ClerkProvider>
);
```

### Using Auth in Components

```jsx
import { useAuth, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

function MyComponent() {
  const { getToken, isSignedIn } = useAuth();
  
  const fetchData = async () => {
    const token = await getToken();
    // Use token for API calls
  };
  
  return (
    <>
      <SignedOut>
        <p>Please sign in</p>
      </SignedOut>
      
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
```

---

## 10. Markdown Rendering

### React Markdown Configuration

```jsx
// src/components/MessageBubble.jsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

<ReactMarkdown 
  remarkPlugins={[remarkGfm]}
  components={{
    // Custom paragraph
    p: ({children}) => (
      <p className="my-2 leading-relaxed text-foreground">
        {children}
      </p>
    ),
    
    // Headings
    h1: ({children}) => (
      <h1 className="text-xl font-bold mt-4 mb-3 pb-2 border-b">
        {children}
      </h1>
    ),
    
    // Lists
    ul: ({children}) => (
      <ul className="my-2 pl-4 list-disc marker:text-blue-500">
        {children}
      </ul>
    ),
    
    // Code blocks
    code: ({inline, children}) => {
      if (inline) {
        return (
          <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-secondary/50 p-3 rounded-lg overflow-x-auto">
          <code className="text-xs font-mono">{children}</code>
        </pre>
      );
    },
    
    // Links
    a: ({href, children}) => (
      <a 
        href={href} 
        className="text-blue-600 hover:underline"
        target="_blank"
      >
        {children}
      </a>
    ),
  }}
>
  {message.content}
</ReactMarkdown>
```

---

## 11. Responsive Design

### Mobile-First Approach

```jsx
// Sidebar toggle for mobile
<button
  onClick={() => setShowSidebar(!showSidebar)}
  className="md:hidden fixed bottom-4 right-4 z-50 p-3 bg-primary rounded-full"
>
  {showSidebar ? <X /> : <Menu />}
</button>

// Sidebar with responsive classes
<aside className={`
  ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
  md:translate-x-0 
  fixed md:relative 
  z-40 w-80 
  transition-transform duration-300
`}>
  <ConversationHistory />
</aside>
```

### Breakpoints Used

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Default | < 768px | Mobile layout |
| md | ≥ 768px | Tablet/Desktop |
| lg | ≥ 1024px | Large screens |

---

## 12. UI Features

### Copy Button

```jsx
const [copied, setCopied] = useState(false);

const handleCopy = async () => {
  await navigator.clipboard.writeText(message.content);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

<button onClick={handleCopy} title="Copy to clipboard">
  {copied ? <Check className="text-green-500" /> : <Copy />}
</button>
```

### Resend Button

```jsx
const handleResend = () => {
  if (onResend && isUser) {
    onResend(message.content);
  }
};

{onResend && (
  <button onClick={handleResend} title="Resend message">
    <RefreshCw />
  </button>
)}
```

### Quick Prompts

```jsx
<QuickPrompt 
  onClick={() => handleSendMessage('How do I fix a cracked iPhone screen?')}
  title="Fix cracked iPhone screen"
  description="Step-by-step repair guide"
  icon="📱"
/>
```

### Loading States

```jsx
// Typing indicator
{isStreaming && !streamingContent && (
  <div className="flex items-center gap-2">
    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
    <span>{statusMessage || 'Thinking...'}</span>
  </div>
)}

// Streaming cursor
{isStreaming && (
  <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
)}
```

---

## 13. Styling Utilities

### cn() Helper

```javascript
// src/lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'primary' && "primary-classes"
)}>
```

### Animation Classes

```css
/* src/index.css */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

---

## 14. Running the Application

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 15. Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start dev server |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview build |
| `lint` | `eslint .` | Run linter |

---

## 16. Future Improvements

- [ ] Add message reactions
- [ ] Implement conversation search
- [ ] Add keyboard shortcuts
- [ ] Implement voice input
- [ ] Add export conversation as PDF
- [ ] Progressive Web App (PWA) support
- [ ] Add conversation sharing
- [ ] Implement message editing
