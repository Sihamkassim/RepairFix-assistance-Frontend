import React from 'react';
import { X, Zap, MessageSquare, History, BarChart3 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export default function UsageModal({ isOpen, onClose }) {
  const usage = useChatStore((state) => state.usage);
  const loading = useChatStore((state) => state.usageLoading);

  if (!isOpen) return null;

  const stats = [
    {
      label: 'Daily Tokens',
      value: usage?.daily_tokens?.toLocaleString() || 0,
      icon: Zap,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      description: 'Tokens used today (Resets daily)'
    },
    {
      label: 'Total Tokens',
      value: usage?.total_tokens?.toLocaleString() || 0,
      icon: BarChart3,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      description: 'Lifetime AI processing units used'
    },
    {
      label: 'Conversations',
      value: usage?.total_conversations?.toLocaleString() || 0,
      icon: History,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      description: 'Total repair sessions started'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Usage Statistics</h2>
              <p className="text-xs text-muted-foreground">Your AI repair activity</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-muted-foreground">Loading your stats...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-secondary/50 border border-border/50 flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                        <span className="text-xl font-bold text-foreground">{stat.value}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{stat.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Token Progress */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Daily Limit Usage</h4>
                    <p className="text-xs text-muted-foreground">Resets at midnight UTC</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary">
                    {Math.round(Math.min(((usage?.daily_tokens || 0) / 90000) * 100, 100))}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(((usage?.daily_tokens || 0) / 90000) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-center text-muted-foreground">
                  {usage?.daily_tokens?.toLocaleString() || 0} / 90,000 tokens used today
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-secondary/30 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2 shadow-lg "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
