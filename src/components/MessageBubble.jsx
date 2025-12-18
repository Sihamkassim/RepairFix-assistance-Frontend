import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { Bot, User, Copy, Check, RefreshCw, X, ZoomIn } from 'lucide-react';

// Image Lightbox Component for full-screen viewing
function ImageLightbox({ src, alt, onClose }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>
      <img 
        src={src} 
        alt={alt} 
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// Enhanced Image Component with zoom capability
function RepairImage({ src, alt }) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (imageError) {
    return null; // Don't render broken images
  }

  return (
    <>
      <div className="relative group my-3 inline-block">
        {isLoading && (
          <div className="absolute inset-0 bg-secondary/50 rounded-lg animate-pulse flex items-center justify-center">
            <span className="text-muted-foreground text-xs">Loading...</span>
          </div>
        )}
        <img 
          src={src} 
          alt={alt || 'Repair guide image'}
          className={cn(
            "rounded-lg border border-border shadow-sm max-w-full h-auto cursor-zoom-in transition-all duration-200",
            "hover:shadow-lg hover:border-blue-500/50",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          loading="lazy"
          onClick={() => setShowLightbox(true)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
          style={{ maxHeight: '300px' }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
      </div>
      {showLightbox && (
        <ImageLightbox 
          src={src} 
          alt={alt} 
          onClose={() => setShowLightbox(false)} 
        />
      )}
    </>
  );
}

export default function MessageBubble({ message, isUser, isStreaming, onResend }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleResend = () => {
    if (onResend && isUser) {
      onResend(message.content);
    }
  };
  return (
    <div className={cn(
      "flex gap-3 mb-4 animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-blue-500/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[85%] rounded-2xl px-5 py-4 shadow-sm",
        isUser 
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
          : "bg-card border border-border text-card-foreground"
      )}>
        {isUser ? (
          <>
            <p className="text-sm leading-relaxed">{message.content}</p>
            {/* Action buttons for user messages */}
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/20">
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
              </button>
              {onResend && (
                <button
                  onClick={handleResend}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title="Resend message"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Paragraphs
                  p: ({children}) => <p className="my-2 leading-relaxed text-foreground">{children}</p>,
                  
                  // Headings
                  h1: ({children}) => <h1 className="text-xl font-bold text-foreground mt-4 mb-3 pb-2 border-b border-border">{children}</h1>,
                  h2: ({children}) => <h2 className="text-lg font-semibold text-foreground mt-4 mb-2">{children}</h2>,
                  h3: ({children}) => <h3 className="text-base font-semibold text-foreground mt-3 mb-1">{children}</h3>,
                  h4: ({children}) => <h4 className="text-sm font-semibold text-foreground mt-2 mb-1">{children}</h4>,
                  
                  // Lists - use CSS for bullets instead of custom rendering
                  ul: ({children}) => <ul className="my-2 space-y-1 pl-4 list-disc marker:text-blue-500">{children}</ul>,
                  ol: ({children}) => <ol className="my-2 space-y-1 pl-5 list-decimal marker:text-blue-500 marker:font-medium">{children}</ol>,
                  li: ({children}) => <li className="text-foreground pl-1">{children}</li>,

                  // Emphasis
                  strong: ({children}) => <strong className="font-semibold text-primary">{children}</strong>,
                  em: ({children}) => <em className="italic text-muted-foreground">{children}</em>,
                  
                  // Blockquotes (often used for notes/warnings)
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 pl-4 py-2 my-3 rounded-r-lg text-muted-foreground">{children}</blockquote>
                  ),

                  // Code
                  code: ({inline, className, children}) => {
                    if (inline) {
                      return (
                        <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono text-primary">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="bg-secondary/50 p-3 rounded-lg overflow-x-auto my-3 border border-border">
                        <code className="text-xs font-mono text-foreground">{children}</code>
                      </pre>
                    );
                  },
                  
                  // Links
                  a: ({href, children}) => <a href={href} className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
                  
                  // Images - use enhanced RepairImage component
                  img: ({src, alt}) => <RepairImage src={src} alt={alt} />,

                  // Horizontal Rule
                  hr: () => <hr className="my-4 border-border" />,
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle" />}
            </div>
            
            {/* Action buttons for assistant messages */}
            {!isStreaming && (
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {isUser && (
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-5 h-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}
