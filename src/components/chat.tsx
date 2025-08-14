'use client';

import { useChat } from '@ai-sdk/react';
import type { ChatMessage } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Trash, Copy, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export default function Chat() {
  const [copied, setCopied] = useState<string | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: '/api/chat',
    // 可以添加一些配置项
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '您好！我是AI助手，有什么可以帮您的吗？'
      }
    ],
    onError: (error) => {
      console.error('聊天错误:', error);
    }
  });
  
  // 复制消息内容
  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-9rem)]">
      {/* 错误显示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mx-4 mt-4">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-4 w-4 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">发生错误</p>
              <p className="text-sm">{error.message || '与AI助手通信时出错'}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 工具栏 */}
      <div className="flex justify-end px-4 py-1 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMessages([])}
          className="h-8 text-xs"
          disabled={messages.length <= 1 || isLoading}
        >
          <Trash size={14} className="mr-1" /> 清除对话
        </Button>
      </div>
      
      {/* Messages display area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>开始与AI助手对话吧！</p>
          </div>
        ) : (
          messages.map((message: ChatMessage) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  isUser ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 max-w-[85%] break-words relative group',
                    isUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/80'
                  )}
                >
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copied === message.id ? (
                        <span className="text-xs text-green-600">已复制!</span>
                      ) : (
                        <Copy size={14} className={isUser ? "text-primary-foreground/70" : "text-foreground/70"} />
                      )}
                    </button>
                  )}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      div: ({ node, className, children, ...props }) => (
                        <div className={cn('prose prose-sm max-w-none text-sm', isUser ? 'prose-invert' : '', className)} {...props}>
                          {children}
                        </div>
                      ),
                      code: ({ node, inline, className, children, ...props }) => (
                        <code className={cn(
                          className,
                          inline ? 'px-1 py-0.5 rounded-sm bg-muted font-mono text-sm' : 'p-2 overflow-x-auto block'
                        )} {...props}>
                          {children}
                        </code>
                      )
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form 
        onSubmit={handleSubmit} 
        className="border-t p-3 flex flex-col gap-2"
      >
        <div className="flex w-full items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              className="resize-none w-full border rounded-md p-2 pr-10 focus:outline-none focus:ring-1 focus:ring-primary h-[60px] text-sm"
              value={input}
              onChange={handleInputChange}
              placeholder="输入您的问题..."
              rows={2}
              disabled={isLoading}
            />
          </div>
          
          <input
            type="file"
            id="file-upload"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          
          <Button 
            type="button" 
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="h-[60px] w-[60px] rounded-md flex-shrink-0"
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Button 
            type="submit" 
            disabled={isLoading || !input || input.trim() === ''}
            className="h-[60px] w-[60px] rounded-md flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {file && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
            <Paperclip className="h-4 w-4" />
            <span className="truncate">{file.name}</span>
            <Button 
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-auto"
              onClick={() => setFile(null)}
            >
              ×
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}