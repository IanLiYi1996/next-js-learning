import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { bedrock, createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { streamText, generateText } from 'ai';
import { auth } from '@/app/(auth)/auth';

// Use Node.js runtime for authentication compatibility
export const runtime = 'nodejs';

// Define the request body interface
interface AgentChatRequest {
  agentId: string;
  messages: Array<{
    role: string;
    content: string | Array<{
      type: 'text' | 'file' | 'image';
      text?: string;
      data?: string;
      mediaType?: string;
    }>;
    attachments?: Array<{
      type: 'image' | 'file';
      data: string;
      mediaType: string;
      name?: string;
      size?: number;
    }>;
  }>;
  enableReasoning?: boolean;
}

// Mock stream response function for development/fallback
function createMockStream(response: string) {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      // Split response into chunks with delay to simulate streaming
      const chunks = response.split(' ');
      for (const chunk of chunks) {
        // Add 50-200ms random delay
        await new Promise(r => setTimeout(r, 50 + Math.random() * 150));
        controller.enqueue(encoder.encode(chunk + ' '));
      }
      controller.close();
    }
  });
}

// Mock response generator
function generateMockResponse(messages: any[]) {
  const lastMessage = messages[messages.length - 1];
  const userMessage = typeof lastMessage.content === 'string' 
    ? lastMessage.content 
    : '用户消息';
  
  // Check if there are attachments
  const hasAttachments = lastMessage.attachments && lastMessage.attachments.length > 0;
  
  // Generate different responses based on user input and attachments
  if (hasAttachments) {
    return `我收到了您上传的文件。这是一个模拟回复，在实际环境中，AI代理会对文件内容进行分析并提供相关回复。`;
  }
  
  if (userMessage.includes('你好') || userMessage.includes('嗨') || userMessage.includes('hi') || userMessage.includes('hello')) {
    return `您好！我是一个模拟的AI代理。很高兴为您服务。请注意，这是一个模拟响应。`;
  }
  
  if (userMessage.includes('功能') || userMessage.includes('能力')) {
    return `作为一个AI代理，我可以帮助回答问题、分析数据、创建内容等。这是一个模拟响应，实际的代理会根据其配置提供更具体的功能。`;
  }
  
  return `这是一个模拟的代理响应。您的问题是："${userMessage}"。在实际环境中，代理会根据其配置和能力提供更准确的回答。如有任何疑问，请随时提问！`;
}

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await auth();
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract the request data
    const { 
      agentId, 
      messages, 
      enableReasoning = false
    } = await req.json() as AgentChatRequest;
    
    // Validate required fields
    if (!agentId || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // In a real implementation, we would fetch the agent configuration from a database
    // For now, we'll use mock data and the existing API implementation from chat/route.ts
    
    // Get API keys from environment variables
    const apiKey = process.env.OPENAI_API_KEY || '';
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
    const awsRegion = process.env.AWS_REGION || 'us-east-1';
    
    // Check for valid credentials
    const hasOpenAICredentials = !!apiKey;
    const hasAWSCredentials = !!(awsAccessKeyId && awsSecretAccessKey && awsRegion);
    
    // Determine provider based on agent model (simplified for demo)
    const isClaudeModel = agentId.toLowerCase().includes('claude');
    const provider = isClaudeModel ? 'bedrock' : 'openai';
    const bedrockModel = isClaudeModel 
      ? 'anthropic.claude-3-sonnet-20240229-v1:0' 
      : 'anthropic.claude-3-haiku-20240307-v1:0';
    
    // If we have valid credentials, try to use the real API
    if ((provider === 'openai' && hasOpenAICredentials) || (provider === 'bedrock' && hasAWSCredentials)) {
      try {
        let textStream;
        
        if (provider === 'openai' && apiKey) {
          // Use OpenAI
          process.env.OPENAI_API_KEY = apiKey;
          
          textStream = await streamText({
            model: openai('gpt-4o'),
            messages,
            temperature: 0.7,
            providerOptions: {
              openai: {
                user: 'agent-user',
              },
            },
            system: "您是一个有帮助的AI代理，可以回答问题并分析内容。",
          });
        } else {
          // Use Amazon Bedrock
          const bedrockConfig: any = {};
          
          // Set AWS credentials
          bedrockConfig.region = awsRegion;
          if (awsAccessKeyId && awsSecretAccessKey) {
            bedrockConfig.accessKeyId = awsAccessKeyId;
            bedrockConfig.secretAccessKey = awsSecretAccessKey;
          }
          
          // Create Bedrock instance
          const bedrockInstance = createAmazonBedrock(bedrockConfig);
          
          // Process messages format for Claude
          const filteredMessages = messages
            .filter((message, index) => {
              // Skip first assistant greeting message if present
              if (index === 0 && message.role === 'assistant' && 
                  (typeof message.content === 'string' && (
                    message.content.includes('您好') || 
                    message.content.includes('有什么可以帮您')
                  ))
              ) {
                return false;
              }
              return true;
            })
            .map(message => {
              // Handle string content
              if (typeof message.content === 'string') {
                return message;
              }
              
              // Handle array content (multimodal)
              if (Array.isArray(message.content)) {
                const formattedContent = message.content.map(item => {
                  if (item.type === 'text') {
                    return { type: 'text', text: item.text };
                  } else if (item.type === 'image' || item.type === 'file') {
                    return { 
                      type: 'file', 
                      data: Buffer.from(item.data || '', 'base64'),
                      mediaType: item.mediaType || (item.type === 'image' ? 'image/jpeg' : 'application/octet-stream')
                    };
                  }
                  return item;
                });
                
                return { ...message, content: formattedContent };
              }
              
              // Handle attachments
              if (message.attachments && Array.isArray(message.attachments)) {
                const textContent = typeof message.content === 'string' ? message.content : '';
                
                // Create multipart content array
                const formattedContent = [
                  { type: 'text', text: textContent },
                  ...message.attachments.map(attachment => ({
                    type: 'file',
                    data: Buffer.from(attachment.data || '', 'base64'),
                    mediaType: attachment.mediaType || 'application/octet-stream'
                  }))
                ];
                
                return { ...message, content: formattedContent };
              }
              
              return message;
            });
          
          // If reasoning is enabled and it's a compatible model
          if (enableReasoning && bedrockModel.includes('claude-3')) {
            // Use generateText to get reasoning results
            const result = await generateText({
              model: bedrockInstance(bedrockModel),
              messages: filteredMessages,
              temperature: 0.7,
              providerOptions: {
                bedrock: {
                  reasoningConfig: { type: 'enabled', budgetTokens: 1024 }
                }
              },
              system: "您是一个有帮助的AI代理，可以回答问题并分析内容。",
            });
            
            // Return complete result with reasoning
            return new Response(
              JSON.stringify({
                text: result.text,
                reasoning: result.reasoning,
                reasoningDetails: result.reasoningDetails
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          } else {
            // Normal streaming response
            textStream = await streamText({
              model: bedrockInstance(bedrockModel),
              messages: filteredMessages,
              temperature: 0.7,
              system: "您是一个有帮助的AI代理，可以回答问题并分析内容。",
            });
          }
        }
        
        return textStream.toTextStreamResponse();
      } catch (error) {
        console.error('使用AI服务时出错:', error);
        // Fall back to mock response if API call fails
        const providerName = provider === 'openai' ? 'OpenAI' : 'Amazon Bedrock';
        const mockResponse = `提供的${providerName}凭据似乎无效或发生了错误。这是一个模拟回复。错误详情: ${error instanceof Error ? error.message : String(error)}`;
        const stream = createMockStream(mockResponse);
        return new Response(stream);
      }
    }
    
    // If no valid credentials, use mock response
    const providerName = provider === 'openai' ? 'OpenAI API密钥' : 'AWS凭据';
    const mockResponse = `系统未配置有效的${providerName}。这是一个模拟回复。\n\n${generateMockResponse(messages)}`;
    const stream = createMockStream(mockResponse);
    return new Response(stream);
    
  } catch (error) {
    console.error('Agent Chat API 错误:', error);
    return new Response(
      JSON.stringify({ 
        error: '处理请求时出错', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}