'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Trash, 
  Copy, 
  RefreshCcw, 
  Image as ImageIcon, 
  FileText, 
  BrainCircuit, 
  ChevronDown, 
  ChevronUp,
  X
} from 'lucide-react';
import { PromptBox } from '@/components/ui/chatgpt-prompt-input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ChatBubble, ChatBubbleMessage, ChatBubbleAvatar, ChatBubbleActionWrapper } from '@/components/ui/chat-bubble';
import { useAgentStore } from '@/stores/agentStore';
import { createParser } from 'eventsource-parser';
import type { Agent, AgentSession, Message } from '@/types/agent';

export interface AgentChatProps {
  agent: Agent;
  session?: AgentSession;
  onClose?: () => void;
}

export function AgentChat({ 
  agent, 
  session: initialSession, 
  onClose 
}: AgentChatProps) {
  // Get store actions
  const { 
    createSession, 
    getSessionById,
    addMessage,
    setActiveSessionId
  } = useAgentStore();
  
  // State
  const [session, setSession] = useState<AgentSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize or create session
  useEffect(() => {
    if (initialSession) {
      setSession(initialSession);
      setMessages(initialSession.messages);
      setActiveSessionId(initialSession.id);
    } else {
      const newSession = createSession(agent.id);
      setSession(newSession);
      setMessages(newSession.messages);
      setActiveSessionId(newSession.id);
    }
  }, [agent.id, initialSession, createSession, setActiveSessionId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle sending a message to the agent
  const sendMessage = useCallback(async (content: string, attachments?: FileList) => {
    if (!session) return;
    if (!content.trim() && !attachments?.length) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to the session
      const userMessage: Omit<Message, 'id' | 'timestamp'> = {
        content: content,
        role: 'user',
      };
      
      // Handle file attachments
      if (attachments?.length) {
        const processedAttachments = [];
        
        for (let i = 0; i < attachments.length; i++) {
          const file = attachments[i];
          const fileReader = new FileReader();
          
          const fileData = await new Promise<string>((resolve) => {
            fileReader.onloadend = () => {
              const result = fileReader.result as string;
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
            fileReader.readAsDataURL(file);
          });
          
          processedAttachments.push({
            id: `attach-${Date.now()}-${i}`,
            type: file.type.startsWith('image/') ? 'image' : 'file',
            data: fileData,
            mediaType: file.type,
            name: file.name,
            size: file.size
          });
        }
        
        userMessage.attachments = processedAttachments;
      }
      
      // Add the user message to the chat
      const sentMessage = addMessage(session.id, userMessage);
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      
      // Clear input and files
      setInput('');
      setFiles(null);
      
      // Prepare the request to the agent
      const messages = getSessionById(session.id)?.messages || [];
      
      // Create request body
      const requestBody = {
        agentId: agent.id,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          attachments: msg.attachments
        })),
        enableReasoning: agent.config.reasoningEnabled,
      };
      
      // Send request to the API
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '与代理通信失败');
      }
      
      // Check if response is a stream
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        // Create empty assistant message
        const assistantMessage: Omit<Message, 'id' | 'timestamp'> = {
          content: '',
          role: 'assistant'
        };
        
        // Add initial empty message
        const newMessage = addMessage(session.id, assistantMessage);
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // Set up streaming
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        let accumulatedContent = '';
        
        // Process the stream
        while (true) {
          const { done, value } = await reader!.read();
          
          if (done) {
            break;
          }
          
          // Decode chunk and accumulate
          const chunk = decoder.decode(value);
          
          // Parse SSE events
          const parser = createParser((event) => {
            if (event.type === 'event' && event.data) {
              try {
                if (event.data === '[DONE]') {
                  return;
                }
                
                const data = JSON.parse(event.data);
                
                if (data.text) {
                  accumulatedContent += data.text;
                  
                  // Update the message content
                  const updatedMessage = {
                    ...newMessage,
                    content: accumulatedContent
                  };
                  
                  // Also check for reasoning data
                  if (data.reasoning) {
                    updatedMessage.reasoning = data.reasoning;
                  }
                  
                  // Update the message in the session
                  setMessages(prevMessages => 
                    prevMessages.map(msg => 
                      msg.id === newMessage.id ? updatedMessage : msg
                    )
                  );
                }
              } catch (e) {
                console.error('Error parsing SSE event', e);
              }
            }
          });
          
          // Feed the chunk to the parser
          parser.feed(chunk);
        }
      } else {
        // Handle non-streaming response
        const responseData = await response.json();
        
        // Add assistant response
        const assistantMessage: Omit<Message, 'id' | 'timestamp'> = {
          content: responseData.text || responseData.content || '无响应',
          role: 'assistant',
          reasoning: responseData.reasoning,
          reasoningDetails: responseData.reasoningDetails
        };
        
        const newMessage = addMessage(session.id, assistantMessage);
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    } catch (error) {
      console.error('与代理通信错误:', error);
      setError(error instanceof Error ? error : new Error('未知错误'));
    } finally {
      setIsLoading(false);
    }
  }, [session, addMessage, agent, getSessionById]);
  
  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input, files);
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  
  // Copy message content
  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };
  
  // Regenerate last message
  const regenerateMessage = () => {
    // TODO: Implement message regeneration
    alert('重新生成消息功能将在未来实现');
  };
  
  // Check if conversation has started
  const hasStartedConversation = messages.length > 0;
  const isInitialState = !hasStartedConversation;
  
  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-9rem)] relative">
      {/* Chat header */}
      <div className="border-b p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <span className="font-medium text-sm">{agent.name.substring(0, 2)}</span>
          </div>
          <div>
            <h2 className="font-medium">{agent.name}</h2>
            <p className="text-xs text-muted-foreground">{agent.modelId.split('.')[1]}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMessages([])}
            className="h-8 w-8"
            disabled={messages.length === 0}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">清空对话</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">关闭</span>
          </Button>
        </div>
      </div>
      
      {/* Error display */}
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
              <p className="text-sm">{error.message || '与AI代理通信时出错'}</p>
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* Chat messages */}
      <AnimatePresence mode="wait">
        {isInitialState ? (
          // Initial welcome screen
          <motion.div 
            key="initial-state"
            className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10"
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
              {agent.name}
            </motion.h1>
            <motion.p 
              className="text-center text-muted-foreground mb-6 sm:mb-8 max-w-md px-4 text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {agent.description}
            </motion.p>
          </motion.div>
        ) : (
          // Chat messages
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
                  // Error handling
                  console.error("只支持图片和文本文件");
                }
              }
            }}
          >
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const variant = isUser ? "sent" : "received";
              
              return (
                <ChatBubble key={message.id} variant={variant}>
                  <ChatBubbleAvatar 
                    fallback={isUser ? "U" : "AI"} 
                  />
                  <div className="flex flex-col">
                    <div>
                      {/* Display attachments if any */}
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
                                  <span>{attachment.name || `文件 ${i + 1}`}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Message content */}
                      <ChatBubbleMessage variant={variant} isLoading={isLoading && message.id === messages[messages.length - 1].id}>
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
                          {typeof message.content === 'string' ? message.content : ''}
                        </ReactMarkdown>
                      </ChatBubbleMessage>
                      
                      {/* Show reasoning button if available */}
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
                          
                          {/* Show reasoning content if expanded */}
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
                    
                    {/* Message actions */}
                    {!isUser && !isLoading && (
                      <ChatBubbleActionWrapper>
                        <button
                          onClick={() => copyToClipboard(typeof message.content === 'string' ? message.content : '', message.id)}
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
            })}
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input area */}
      <motion.div 
        className={cn(
          "p-3", 
          isInitialState ? "absolute left-1/2 top-1/2 transform -translate-x-1/2 translate-y-0 w-full max-w-2xl px-4 sm:px-6 z-20" : "border-t relative"
        )}
        initial={false}
        animate={{
          width: "100%",
          maxWidth: isInitialState ? "42rem" : "100%",
          y: isInitialState ? "15vh" : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <PromptBox 
          value={input} 
          onChange={handleInputChange} 
          placeholder={isInitialState ? "输入问题开始对话..." : "输入您的问题..."}
          disabled={isLoading}
          name="message"
          className={isInitialState ? "shadow-lg transition-shadow duration-300 hover:shadow-xl" : ""}
          selectedModel={agent.modelId}
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
            // Create custom form submit event
            const syntheticEvent = { 
              preventDefault: () => {}, 
              currentTarget: document.createElement('form') 
            } as React.FormEvent<HTMLFormElement>;
            
            handleSubmit(syntheticEvent);
          }}
        />
      </motion.div>
    </div>
  );
}