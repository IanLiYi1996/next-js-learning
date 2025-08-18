'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Copy, RefreshCcw, Image as ImageIcon, FileText, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
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
  // Add reasoning and reasoningDetails fields
  reasoning?: string;
  reasoningDetails?: Record<string, any>;
  // File attachments
  attachments?: Array<{
    type: 'file' | 'image';
    data: string;
    mediaType: string;
  }>;
}

export default function Chat() {
  const [copied, setCopied] = useState<string | null>(null);
  // API credentials (read-only access - managed through environment variables)
  const apiKey = '';
  const awsAccessKeyId = '';
  const awsSecretAccessKey = '';
  const awsRegion = 'us-east-1';
  const provider = 'bedrock' as const;
  const [bedrockModel, setBedrockModel] = useState<string>('anthropic.claude-opus-4-1-20250805-v1:0');
  // Enable reasoning for compatible Claude models
  const [enableReasoning, setEnableReasoning] = useState<boolean>(false);
  // Toggle to show reasoning details
  const [showReasoning, setShowReasoning] = useState<boolean>(false);
  
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
      
      // 处理文件附件
      if (files?.length) {
        const attachments = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileReader = new FileReader();
          
          await new Promise<void>((resolve) => {
            fileReader.onloadend = () => {
              const result = fileReader.result as string;
              const base64Data = result.split(',')[1];
              
              attachments.push({
                type: file.type.startsWith('image/') ? 'image' : 'file',
                data: base64Data,
                mediaType: file.type
              });
              
              resolve();
            };
            
            fileReader.readAsDataURL(file);
          });
        }
        
        // 添加附件到用户消息
        userMessage.attachments = attachments;
      }
      
      setChatMessages(prev => [...prev, userMessage]);
      setChatInput('');
      setIsProcessing(true);
      
      // 处理文件上传，转换为适当的消息格式
      let formattedUserMessage = userMessage;
      
      // 如果有文件上传，将消息转换为多类型格式
      if (files?.length) {
        const fileAttachments: Array<{type: 'file' | 'image', data: string, mediaType: string}> = [];
        
        // 读取并处理文件
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // 读取文件内容
          const fileReader = new FileReader();
          const fileContentPromise = new Promise<string>((resolve) => {
            fileReader.onloadend = () => {
              const result = fileReader.result as string;
              // 移除 data URL 前缀
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
          });
          
          fileReader.readAsDataURL(file);
          const fileData = await fileContentPromise;
          
          // 确定文件类型
          const fileType = file.type.startsWith('image/') ? 'image' : 'file';
          
          fileAttachments.push({
            type: fileType,
            data: fileData,
            mediaType: file.type
          });
        }
        
        // 更新用户消息，添加文件附件
        formattedUserMessage = {
          ...userMessage,
          attachments: fileAttachments
        };
      }
      
      // 创建请求体
      const requestBody = {
        messages: [...chatMessages, formattedUserMessage],
        apiKey,
        awsAccessKeyId,
        awsSecretAccessKey,
        awsRegion,
        provider,
        bedrockModel,
        enableReasoning: enableReasoning && bedrockModel.includes('claude-3-7-sonnet'),
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
      
      // 检查响应类型
      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('application/json')) {
        // 处理 JSON 响应（包含推理结果）
        const responseData = await response.json();
        
        // 添加助手回复，包含推理内容
        setChatMessages(prev => [
          ...prev, 
          {
            id: `response-${userMessageId}`,
            content: responseData.text,
            role: 'assistant',
            reasoning: responseData.reasoning,
            reasoningDetails: responseData.reasoningDetails
          }
        ]);
      } else {
        // 处理普通文本响应
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
      }
      
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
        /* 工具栏 - 显示工具按钮和设置 */
        <div className="flex justify-between px-4 py-2">
          <div className="flex items-center space-x-2">
            {/* 仅对 Claude 3.7 Sonnet 模型启用推理开关 */}
            {bedrockModel.includes('claude-3-7-sonnet') && (
              <Button
                variant={enableReasoning ? "default" : "outline"}
                size="sm"
                onClick={() => setEnableReasoning(!enableReasoning)}
                className="h-8 text-xs"
                disabled={isLoading}
              >
                <BrainCircuit size={14} className="mr-1" /> 
                {enableReasoning ? '推理已启用' : '启用推理'}
              </Button>
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
                  <div>
                    {/* 如果有附件，则显示附件内容 */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.attachments.map((attachment, i) => (
                          <div key={i} className="flex flex-col">
                            {attachment.type === 'image' ? (
                              <div className="rounded-md overflow-hidden">
                                <img 
                                  src={`data:${attachment.mediaType};base64,${attachment.data}`} 
                                  alt={`图片 ${i + 1}`}
                                  className="max-w-full max-h-[300px] object-contain" 
                                />
                              </div>
                            ) : (
                              <div className="flex items-center bg-muted rounded px-2 py-1 text-xs">
                                <FileText size={12} className="mr-1" />
                                <span>文件 {i + 1}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <ChatBubbleMessage variant={variant} isLoading={isProcessing && message.id === messages[messages.length - 1].id}>
                      {/* 尝试检测图片标签并渲染图像 */}
                      {typeof message.content === 'string' && message.content.includes('![') ? (
                        <div className="prose prose-sm max-w-none text-sm">
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
                              ),
                              img: ({ src, alt, ...props }) => {
                                // 处理图像，如果是 Base64 数据 URL
                                return (
                                  <div className="my-2 max-w-full">
                                    <img 
                                      src={src} 
                                      alt={alt || '图像'} 
                                      className="max-w-full max-h-[300px] object-contain rounded-md" 
                                      {...props} 
                                    />
                                  </div>
                                );
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
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
                            ),
                            img: ({ src, alt, ...props }) => (
                              <div className="my-2 max-w-full">
                                <img 
                                  src={src} 
                                  alt={alt || '图像'} 
                                  className="max-w-full max-h-[300px] object-contain rounded-md" 
                                  {...props} 
                                />
                              </div>
                            )
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </ChatBubbleMessage>
                    
                    {/* 如果是助手消息且有推理内容，显示推理切换按钮 */}
                    {!isUser && message.reasoning && (
                      <div className="mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowReasoning(!showReasoning)}
                          className="w-full text-xs justify-between p-2 h-8 border border-dashed border-muted-foreground/30"
                        >
                          <div className="flex items-center">
                            <BrainCircuit size={14} className="mr-1 text-muted-foreground" />
                            <span className="text-muted-foreground font-medium">查看 AI 推理过程</span>
                          </div>
                          {showReasoning ? (
                            <ChevronUp size={14} className="text-muted-foreground" />
                          ) : (
                            <ChevronDown size={14} className="text-muted-foreground" />
                          )}
                        </Button>
                        
                        {/* 推理内容显示区 */}
                        {showReasoning && (
                          <div className="mt-2 p-3 bg-muted/50 rounded-md border border-border">
                            <div className="text-xs font-medium mb-2 text-muted-foreground">推理过程:</div>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              className="text-sm prose-sm max-w-none"
                            >
                              {message.reasoning}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
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
          selectedModel={bedrockModel}
          onModelSelect={setBedrockModel}
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