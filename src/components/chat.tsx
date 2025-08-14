'use client';

import { useChat } from '@ai-sdk/react';
import type { Message } from 'ai';
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Trash, Copy, Paperclip, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export default function Chat() {
  const [copied, setCopied] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 创建一个简单的自定义提交处理函数
  const [chatMessages, setChatMessages] = useState<Array<{id: string, content: string, role: 'user' | 'assistant'}>>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是AI助手，有什么可以帮您的吗？'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatError, setChatError] = useState<Error | null>(null);
  
  // 模拟API调用
  const handleCustomSubmit = async (e: React.FormEvent, options: any = {}) => {
    e.preventDefault();
    
    if (!chatInput.trim() && !files?.length) return;
    
    try {
      // 添加用户消息到聊天
      const userMessageId = Date.now().toString();
      const userMessage = {
        id: userMessageId,
        content: chatInput,
        role: 'user' as const
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      setChatInput('');
      setIsProcessing(true);
      
      // 创建请求体
      const requestBody = {
        messages: [...chatMessages, userMessage],
        apiKey,
        experimental_attachments: files || undefined
      };
      
      // 发送请求到API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error('API请求失败');
      }
      
      // 读取响应
      const responseText = await response.text();
      
      // 添加助手回复
      setChatMessages(prev => [
        ...prev, 
        {
          id: `response-${userMessageId}`,
          content: responseText,
          role: 'assistant'
        }
      ]);
      
    } catch (error) {
      console.error('聊天错误:', error);
      setChatError(error instanceof Error ? error : new Error('未知错误'));
    } finally {
      setIsProcessing(false);
      setFiles(null);
    }
  };
  
  // 这些变量映射到useChat返回的变量，方便我们重用原有代码
  const messages = chatMessages;
  const input = chatInput;
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setChatInput(e.target.value);
  const isLoading = isProcessing;
  const error = chatError;
  const setMessages = setChatMessages;
  const handleSubmit = handleCustomSubmit;
  
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
      <div className="flex justify-between px-4 py-1 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="h-8 text-xs"
          >
            {showApiKeyInput ? '隐藏API密钥' : '设置API密钥'}
          </Button>
          
          {showApiKeyInput && (
            <div className="ml-2 flex items-center gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入OpenAI API密钥"
                className="border text-xs px-2 py-1 rounded w-48"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs px-2" 
                onClick={() => setApiKey('')}
              >
                清除
              </Button>
            </div>
          )}
        </div>
        
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
      
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center bg-muted/50 p-6 rounded-lg border-2 border-dashed border-primary">
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <div className="text-lg font-medium">拖放文件到这里上传</div>
                <div className="text-sm text-muted-foreground">(仅支持图片和文本文件)</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Messages display area */}
      <div 
        className="flex-1 overflow-y-auto p-3 space-y-3"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const droppedFiles = e.dataTransfer.files;
          
          if (droppedFiles.length > 0) {
            const validFiles = Array.from(droppedFiles).filter(
              (file) => file.type.startsWith("image/") || file.type.startsWith("text/")
            );
            
            if (validFiles.length === droppedFiles.length) {
              setFiles(droppedFiles);
            } else {
              // 可以添加一个错误提示
              console.error("只支持图片和文本文件");
            }
          }
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>开始与AI助手对话吧！</p>
          </div>
        ) : (
          messages.map((message: any) => {
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
        onSubmit={(e) => {
          e.preventDefault(); // 阻止表单默认提交行为
          const options: any = files ? { experimental_attachments: files } : {};
          
          // 如果用户输入了API密钥，添加到请求选项中
          if (apiKey) {
            options.apiKey = apiKey;
          }
          
          handleSubmit(e, options);
          setFiles(null);
        }} 
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
              onPaste={(e) => {
                const items = e.clipboardData?.items;
                if (items) {
                  const clipboardFiles = Array.from(items)
                    .filter(item => item.kind === 'file')
                    .map(item => item.getAsFile())
                    .filter((file): file is File => file !== null);
                    
                  if (clipboardFiles.length > 0) {
                    const dataTransfer = new DataTransfer();
                    clipboardFiles.forEach(file => dataTransfer.items.add(file));
                    setFiles(dataTransfer.files);
                  }
                }
              }}
            />
          </div>
          
          <input
            type="file"
            id="file-upload"
            onChange={(e) => setFiles(e.target.files)}
            className="hidden"
            multiple
            accept="image/*,text/*"
            ref={fileInputRef}
          />
          
          <Button 
            type="button" 
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-[60px] w-[60px] rounded-md flex-shrink-0"
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-[60px] w-[60px] rounded-md flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <AnimatePresence>
          {files && files.length > 0 && (
            <motion.div 
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {Array.from(files).map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  className="relative group"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  {file.type.startsWith('image/') ? (
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border border-border">
                      <img 
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0 h-4 w-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const dt = new DataTransfer();
                          Array.from(files).forEach((f, i) => {
                            if (i !== index) dt.items.add(f);
                          });
                          setFiles(dt.files.length > 0 ? dt.files : null);
                        }}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative h-16 w-24 p-1 text-[10px] leading-tight overflow-hidden rounded-md border border-border bg-muted/50">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0 h-4 w-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const dt = new DataTransfer();
                          Array.from(files).forEach((f, i) => {
                            if (i !== index) dt.items.add(f);
                          });
                          setFiles(dt.files.length > 0 ? dt.files : null);
                        }}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}