'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Copy, RefreshCcw, Image as ImageIcon, Settings } from 'lucide-react';
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
  // API credentials
  const [apiKey, setApiKey] = useState<string>('');
  const [awsAccessKeyId, setAwsAccessKeyId] = useState<string>('');
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState<string>('');
  const [awsRegion, setAwsRegion] = useState<string>('us-east-1');
  const [provider, setProvider] = useState<'openai' | 'bedrock'>('bedrock');
  const [bedrockModel, setBedrockModel] = useState<string>('anthropic.claude-3-sonnet-20240229-v1:0');
  
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // 创建一个简单的自定义提交处理函数
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
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
  const handleCustomSubmit = async (e: React.FormEvent, options: Record<string, unknown> = {}) => {
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
            className="h-8 text-xs flex items-center"
          >
            <Settings size={14} className="mr-1" />
            {showApiKeyInput ? '隐藏API设置' : '设置API'}
          </Button>
          
          {showApiKeyInput && (
            <div className="ml-2 flex flex-col gap-2 bg-muted/20 p-2 rounded-md">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium w-20">AI提供商:</label>
                <select 
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as 'openai' | 'bedrock')}
                  className="border text-xs px-2 py-1 rounded w-32"
                >
                  <option value="bedrock">Amazon Bedrock</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>

              {provider === 'openai' ? (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium w-20">OpenAI密钥:</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
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
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium w-20">模型:</label>
                    <select
                      value={bedrockModel}
                      onChange={(e) => setBedrockModel(e.target.value)}
                      className="border text-xs px-2 py-1 rounded w-full"
                    >
                      <option value="anthropic.claude-3-sonnet-20240229-v1:0">Claude 3 Sonnet</option>
                      <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku</option>
                      <option value="anthropic.claude-3-opus-20240229-v1:0">Claude 3 Opus</option>
                      <option value="meta.llama3-70b-instruct-v1:0">Meta Llama 3 70B</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium w-20">Access Key ID:</label>
                    <input
                      type="password"
                      value={awsAccessKeyId}
                      onChange={(e) => setAwsAccessKeyId(e.target.value)}
                      placeholder="AKIA..."
                      className="border text-xs px-2 py-1 rounded w-48"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium w-20">Secret Access Key:</label>
                    <input
                      type="password"
                      value={awsSecretAccessKey}
                      onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                      placeholder="AWS密钥..."
                      className="border text-xs px-2 py-1 rounded w-48"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium w-20">区域:</label>
                    <select
                      value={awsRegion}
                      onChange={(e) => setAwsRegion(e.target.value)}
                      className="border text-xs px-2 py-1 rounded w-48"
                    >
                      <option value="us-east-1">us-east-1</option>
                      <option value="us-west-2">us-west-2</option>
                      <option value="ap-northeast-1">ap-northeast-1 (东京)</option>
                      <option value="eu-west-1">eu-west-1 (爱尔兰)</option>
                    </select>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs px-2" 
                      onClick={() => {
                        setAwsAccessKeyId('');
                        setAwsSecretAccessKey('');
                        setAwsRegion('us-east-1');
                      }}
                    >
                      清除
                    </Button>
                  </div>
                </>
              )}
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
      
      {/* Messages display area - Updated with ChatBubble components */}
      <div 
        className="flex-1 overflow-y-auto p-3 space-y-6"
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
                        code: ({ inline, className, children, ...props }) => (
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
      </div>
      
      {/* Input area with PromptBox */}
      <div className="border-t p-3">
        <PromptBox 
          value={input} 
          onChange={handleInputChange} 
          placeholder="输入您的问题..."
          disabled={isLoading}
          name="message"
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
          onSubmitMessage={(submittedMessage) => {
            // 创建自定义表单提交事件
            const syntheticEvent = { 
              preventDefault: () => {}, 
              currentTarget: document.createElement('form') 
            } as React.FormEvent<HTMLFormElement>;
            
            const customOptions: Record<string, unknown> = files ? { experimental_attachments: files } : {};
            
            // 添加API密钥
            if (provider === 'openai' && apiKey) {
              customOptions.apiKey = apiKey;
            } else if (provider === 'bedrock') {
              customOptions.provider = 'bedrock';
              customOptions.bedrockModel = bedrockModel;
              
              if (awsAccessKeyId && awsSecretAccessKey) {
                customOptions.awsAccessKeyId = awsAccessKeyId;
                customOptions.awsSecretAccessKey = awsSecretAccessKey;
                customOptions.awsRegion = awsRegion;
              }
            }
            
            handleSubmit(syntheticEvent, customOptions);
            setFiles(null);
          }}
        />
      </div>
    </div>
  );
}