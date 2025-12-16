import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { Bot, User } from 'lucide-react';

export default function MessageBubble({ message, isUser, isStreaming }) {
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
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
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
                
                // Horizontal Rule
                hr: () => <hr className="my-4 border-border" />,
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle" />}
          </div>
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
