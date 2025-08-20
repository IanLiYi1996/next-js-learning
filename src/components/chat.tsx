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
  role: 'user' | 'assistant' | 'system';
  // Add reasoning and reasoningDetails fields
  reasoning?: string;
  reasoningDetails?: Record<string, any>;
  // File attachments
  attachments?: Array<{
    type: 'file' | 'image';
    data: string;
    mediaType: string;
  }>;
  // Error information
  isError?: boolean;
  errorDetails?: {
    statusCode?: number;
    message?: string;
    rawError?: string;
    responseBody?: string;
    timestamp?: string;
  };
}

export default function Chat() {
  const [copied, setCopied] = useState<string | null>(null);
  // API credentials (read-only access - managed through environment variables)
  const apiKey = '';
  const awsAccessKeyId = '';
  const awsSecretAccessKey = '';
  const awsRegion = 'us-east-1';
  const provider = 'bedrock' as const;
  const [bedrockModel, setBedrockModel] = useState<string>('us.anthropic.claude-opus-4-1-20250805-v1:0');
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
        const attachments: Array<{type: 'file' | 'image', data: string, mediaType: string}> = [];
        
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
        // 获取错误详情
        let errorMessage = 'API请求失败';
        let errorDetails: Record<string, any> = {};
        let responseBody = '';
        
        try {
          // 尝试读取响应体
          responseBody = await response.text();
          
          // 尝试解析为JSON
          try {
            errorDetails = JSON.parse(responseBody);
            errorMessage = errorDetails.message || errorDetails.error || 'API请求失败';
          } catch {
            // 如果不是JSON，使用响应文本作为错误消息
            errorMessage = responseBody || 'API请求失败';
          }
        } catch {
          errorMessage = `API请求失败 (${response.status})`;
        }
        
        // 创建一个错误消息
        const errorObject = new Error(errorMessage);
        // @ts-ignore - 添加额外属性
        errorObject.statusCode = response.status;
        // @ts-ignore - 添加额外属性
        errorObject.responseBody = responseBody;
        
        // 抛出经过增强的错误对象
        throw errorObject;
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
      
      // 同时设置全局错误状态和创建错误消息气泡
      setChatError(error instanceof Error ? error : new Error('未知错误'));
      
      // 解析错误详情
      let errorMessage = '与AI助手通信时出错';
      let statusCode = 500;
      let rawError = '';
      let responseBody = '';
      
      if (error instanceof Error) {
        errorMessage = error.message || '未知错误';
        // @ts-ignore - 获取可能的额外属性
        statusCode = error.statusCode || 500;
        // @ts-ignore - 获取可能的额外属性
        responseBody = error.responseBody || '';
        rawError = error.toString();
      }
      
      // 创建更友好的错误信息
      let friendlyErrorMessage = '';
      
      // 根据状态码和错误消息提供更友好的错误说明
      if (statusCode === 403 && responseBody.includes("don't have access to the model")) {
        friendlyErrorMessage = `访问被拒绝: 您没有使用所选模型(${bedrockModel})的权限。请尝试选择其他模型或联系管理员获取权限。`;
      } else if (statusCode === 400 && responseBody.includes("throughput isn't supported")) {
        // 处理吞吐量配置错误 - 这种情况是 Claude Opus 4.1 模型需要特殊的推理配置文件
        const modelName = bedrockModel.split('.').pop()?.split('-').slice(0, 2).join(' ') || bedrockModel;
        friendlyErrorMessage = `配置错误: 模型 ${modelName} 无法使用按需吞吐量调用。此模型需要使用推理配置文件(inference profile)。请选择其他模型或配置推理配置文件。`;
      } else if (statusCode === 400 && responseBody.includes("ValidationException")) {
        // 其他验证错误
        const shortModelId = bedrockModel.split('.').pop()?.split('-').slice(0, 2).join(' ') || bedrockModel;
        friendlyErrorMessage = `验证错误: 模型 ${shortModelId} 配置错误或不可用。${errorMessage}`;
      } else if (statusCode === 401) {
        friendlyErrorMessage = '未授权: 请检查您的认证凭据是否有效。';
      } else if (statusCode === 429) {
        friendlyErrorMessage = '请求过多: 您已超出API调用限制，请稍后再试。';
      } else if (statusCode >= 500) {
        friendlyErrorMessage = '服务器错误: 模型服务暂时不可用，请稍后再试。';
      } else {
        // 默认错误消息
        friendlyErrorMessage = `请求失败: ${errorMessage}`;
      }
      
      // 获取当前时间
      const timestamp = new Date().toLocaleTimeString();
      
      // 添加错误消息到聊天
      setChatMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content: friendlyErrorMessage,
          role: 'system',
          isError: true,
          errorDetails: {
            statusCode,
            message: errorMessage,
            rawError,
            responseBody,
            timestamp
          }
        }
      ]);
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
            
            // 处理错误消息
            if (message.isError) {
              return (
                <ChatBubble key={message.id} className="error-bubble">
                  <ChatBubbleAvatar 
                    fallback="❌" 
                    className="bg-red-500/10 text-red-500"
                  />
                  <div className="flex flex-col w-full">
                    <ChatBubbleMessage 
                      className="bg-red-500/10 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/30"
                    >
                      <div className="flex items-center mb-1">
                        <svg 
                          className="w-4 h-4 mr-1.5 text-red-500" 
                          fill="currentColor" 
                          viewBox="0 0 20 20" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium">错误信息</span>
                      </div>
                      <div className="text-sm">
                        {message.content}
                      </div>
                      {message.errorDetails && (
                        <div className="mt-2 text-xs text-red-500/80 flex items-center">
                          <span className="mr-1">
                            {message.errorDetails.timestamp}
                          </span>
                          {message.errorDetails.statusCode && (
                            <span className="ml-auto bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-1.5 py-0.5 rounded-full text-xs">
                              状态码: {message.errorDetails.statusCode}
                            </span>
                          )}
                        </div>
                      )}
                    </ChatBubbleMessage>
                    <div className="flex items-center justify-end mt-1 gap-1">
                      <button
                        onClick={() => {
                          // 根据错误类型提供不同的操作和自动修复
                          const errorResponseBody = message.errorDetails?.responseBody || '';
                          const errorCode = message.errorDetails?.statusCode;
                          
                          // 模型权限问题 - 403 错误
                          const isModelAccessError = 
                            errorCode === 403 && 
                            errorResponseBody.includes("don't have access to the model");
                          
                          // 推理配置文件问题 - 400 错误
                          const isInferenceProfileError = 
                            errorCode === 400 && 
                            errorResponseBody.includes("throughput isn't supported");
                            
                          // 根据错误类型切换到不同的默认模型
                          if (isModelAccessError || isInferenceProfileError) {
                            // 尝试自动切换到默认可访问模型 - Claude 3 Sonnet
                            setBedrockModel('anthropic.claude-3-sonnet-20240229-v1:0');
                            
                            // 提示用户正在切换模型
                            setChatMessages(prev => [
                              ...prev,
                              {
                                id: `system-${Date.now()}`,
                                content: "已自动切换到 Claude 3 Sonnet 模型，这是一个通用性能良好的默认模型。正在尝试重新连接...",
                                role: 'system',
                              }
                            ]);
                            
                            // 自动重试上一条消息
                            const lastUserMessage = [...chatMessages].reverse().find(msg => msg.role === 'user');
                            if (lastUserMessage && lastUserMessage.content) {
                              // 创建自定义表单提交事件
                              const syntheticEvent = { 
                                preventDefault: () => {}, 
                                currentTarget: document.createElement('form') 
                              } as React.FormEvent<HTMLFormElement>;
                              
                              // 设置消息内容并提交
                              setChatInput(lastUserMessage.content);
                              setTimeout(() => handleSubmit(syntheticEvent), 500);
                            }
                          }
                        }}
                        className="text-xs flex items-center px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                      >
                        <RefreshCcw size={12} className="mr-1" />
                        切换模型并重试
                      </button>
                    </div>
                  </div>
                </ChatBubble>
              );
            }
            
            // 系统消息 (非错误)
            if (message.role === 'system' && !message.isError) {
              return (
                <ChatBubble key={message.id} className="system-bubble">
                  <ChatBubbleAvatar 
                    fallback="ℹ️" 
                    className="bg-blue-500/10 text-blue-500"
                  />
                  <div className="flex flex-col w-full">
                    <ChatBubbleMessage 
                      className="bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30"
                    >
                      <div className="text-sm">
                        {message.content}
                      </div>
                      {message.errorDetails?.timestamp && (
                        <div className="mt-2 text-xs text-blue-500/80">
                          {message.errorDetails.timestamp}
                        </div>
                      )}
                    </ChatBubbleMessage>
                  </div>
                </ChatBubble>
              );
            }
            
            // 正常消息渲染
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
                            // @ts-expect-error - className property not found in type
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
                          // @ts-expect-error - className property not found in type
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