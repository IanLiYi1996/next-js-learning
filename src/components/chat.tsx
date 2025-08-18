'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Copy, RefreshCcw, Image as ImageIcon } from 'lucide-react';
import { PromptBox } from '@/components/ui/chatgpt-prompt-input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ChatBubble, ChatBubbleMessage, ChatBubbleAvatar, ChatBubbleActionWrapper } from '@/components/ui/chat-bubble';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

export default function Chat() {
  const [copied, setCopied] = useState<string | null>(null);
  // API credentials (read-only access - managed through environment variables)
  const apiKey = '';
  const awsAccessKeyId = '';
  const awsSecretAccessKey = '';
  const awsRegion = 'us-east-1';
  const provider = 'bedrock' as const;
  const bedrockModel = 'anthropic.claude-3-sonnet-20240229-v1:0';
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // 创建一个简单的自定义提交处理函数
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // 初始为空数组，没有欢迎消息
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatError, setChatError] = useState<Error | null>(null);
  
  // 模拟API调用
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatInput.trim() && !files?.length) return;
    
    try {
      // 添加用户消息到聊天
      const userMessageId = Date.now().toString();
      const userMessage: ChatMessage = {
        id: userMessageId,
        content: chatInput,
        role: 'user'
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      setChatInput('');
      setIsProcessing(true);
      
      // 创建请求体
      const requestBody = {
        messages: [...chatMessages, userMessage],
        apiKey,
        awsAccessKeyId,
        awsSecretAccessKey,
        awsRegion,
        provider,
        bedrockModel,
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
  
  // 判断对话是否已经开始
  const hasStartedConversation = messages.length > 0;
  
  // 复制消息内容
  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  // 重新生成消息
  const regenerateMessage = () => {
    // 实际应用中，这里应该实现重新生成逻辑
    alert('重新生成消息功能将在未来实现');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 判断是否在初始形态（无消息）
  const isInitialState = !hasStartedConversation;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-9rem)] relative">  {/* 添加relative以便于居中定位 */}
      {/* 错误显示 - 始终展示 */}
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
      
      {!isInitialState && (
        /* 工具栏 - 只显示清除对话按钮 */
        <div className="flex justify-end px-4 py-2">
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
      )}
      
      {/* Drag overlay - 在两种模式下都生效 */}
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
      
      {/* 使用AnimatePresence进行布局切换动画 */}
      <AnimatePresence mode="wait">
        {isInitialState ? (
          // 初始界面 - 居中显示欢迎信息
          <motion.div 
            key="initial-state"
            className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10" // 绝对定位到容器中央
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-2xl sm:text-3xl font-bold text-center mb-2 sm:mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              智能助手
            </motion.h1>
            <motion.p 
              className="text-center text-muted-foreground mb-6 sm:mb-8 max-w-md px-4 text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              有任何问题都可以向我提问，开始聊天吧！
            </motion.p>
          </motion.div>
        ) : (
          // 对话界面 - 显示消息历史
          <motion.div 
            key="chat-state"
            className="flex-1 overflow-y-auto p-3 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
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
          messages.map((message) => {
            const isUser = message.role === 'user';
            const variant = isUser ? "sent" : "received";
            
            return (
              <ChatBubble key={message.id} variant={variant}>
                <ChatBubbleAvatar 
                  fallback={isUser ? "U" : "AI"} 
                />
                <div className="flex flex-col">
                  <ChatBubbleMessage variant={variant} isLoading={isProcessing && message.id === messages[messages.length - 1].id}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        div: ({ className, children, ...props }) => (
                          <div className={cn('prose prose-sm max-w-none text-sm', isUser ? 'prose-invert' : '', className)} {...props}>
                            {children}
                          </div>
                        ),
                        code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => (
                          <code className={cn(
                            className,
                            // 使用明确定义的类型来解决inline属性的类型错误
                            props.inline ? 'px-1 py-0.5 rounded-sm bg-muted font-mono text-sm' : 'p-2 overflow-x-auto block'
                          )} {...props}>
                            {children}
                          </code>
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </ChatBubbleMessage>
                  
                  {!isUser && !isProcessing && (
                    <ChatBubbleActionWrapper>
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="p-1 hover:bg-muted rounded-md transition-colors"
                      >
                        {copied === message.id ? (
                          <span className="text-xs text-green-600 px-1">已复制!</span>
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <button
                        onClick={regenerateMessage}
                        className="p-1 hover:bg-muted rounded-md transition-colors"
                      >
                        <RefreshCcw size={14} />
                      </button>
                    </ChatBubbleActionWrapper>
                  )}
                </div>
              </ChatBubble>
            );
          })
        )}
          <div ref={messagesEndRef} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 输入区域 - 根据状态调整样式 */}
      <motion.div 
        className={cn(
          "p-3", 
          isInitialState ? "absolute left-1/2 top-1/2 transform -translate-x-1/2 translate-y-0 w-full max-w-2xl px-4 sm:px-6 z-20" : "border-t relative"
        )}
        initial={false}
        animate={{
          width: "100%",
          maxWidth: isInitialState ? "42rem" : "100%",
          y: isInitialState ? "15vh" : 0,  // 在初始状态下向下偏移，移动设备上偏移少一点
        }}
        transition={{ duration: 0.3 }}
      >
        <PromptBox 
          value={input} 
          onChange={handleInputChange} 
          placeholder={isInitialState ? "输入问题开始聊天..." : "输入您的问题..."}
          disabled={isLoading}
          name="message"
          className={isInitialState ? "shadow-lg transition-shadow duration-300 hover:shadow-xl" : ""}
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
          onFileSelect={(file) => {
            if (file) {
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              setFiles(dataTransfer.files);
            } else {
              setFiles(null);
            }
          }}
          onSubmitMessage={() => {
            // 创建自定义表单提交事件
            const syntheticEvent = { 
              preventDefault: () => {}, 
              currentTarget: document.createElement('form') 
            } as React.FormEvent<HTMLFormElement>;
            
            const customOptions: Record<string, unknown> = files ? { experimental_attachments: files } : {};
            
            // 添加 Bedrock 配置
            customOptions.provider = provider;
            customOptions.bedrockModel = bedrockModel;
            
            // 如果有 AWS 凭据，则添加到请求中
            if (awsAccessKeyId && awsSecretAccessKey) {
              customOptions.awsAccessKeyId = awsAccessKeyId;
              customOptions.awsSecretAccessKey = awsSecretAccessKey;
              customOptions.awsRegion = awsRegion;
            }
            
            // The custom options are handled within the function now
            handleSubmit(syntheticEvent);
            setFiles(null);
          }}
        />
      </motion.div>
    </div>
  );
}