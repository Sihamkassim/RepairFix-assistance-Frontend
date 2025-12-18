import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ChatInput({ onSendMessage, disabled, placeholder }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-card p-4">
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "flex gap-3 items-end bg-secondary/50 rounded-2xl p-2 border border-border transition-all",
          !disabled && "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
          disabled && "opacity-75 bg-secondary/30"
        )}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask about fixing your device..."}
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none",
              "disabled:cursor-not-allowed",
              "max-h-32"
            )}
            style={{
              minHeight: '40px',
              height: 'auto',
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={cn(
              "p-3 rounded-xl font-medium transition-all flex items-center gap-2",
              "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700",
              "shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
              "disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
            )}
          >
            {disabled ? (
              <Sparkles className="w-5 h-5 animate-pulse" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          RepairFix uses iFixit guides to help you repair your devices
        </p>
      </div>
    </form>
  );
}
