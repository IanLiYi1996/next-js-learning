import { openai } from '@ai-sdk/openai';
import { bedrock, createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { streamText, generateText } from 'ai';

export const runtime = 'edge';

// 创建一个流式响应的帮助函数
function createMockStream(response: string) {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      // 将响应按段分割并添加延迟，模拟流式输出
      const chunks = response.split(' ');
      for (const chunk of chunks) {
        // 添加50-200ms的随机延迟
        await new Promise(r => setTimeout(r, 50 + Math.random() * 150));
        controller.enqueue(encoder.encode(chunk + ' '));
      }
      controller.close();
    }
  });
}

// 模拟回复生成函数
function generateMockResponse(messages: Array<{ content: string }>) {
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage?.content || '';
  
  // 检查是否有附件
  const hasAttachments = lastMessage?.experimental_attachments && lastMessage.experimental_attachments.length > 0;
  
  // 根据用户输入和是否有附件生成不同的响应
  if (hasAttachments) {
    return `我收到了您上传的文件。这是一个模拟回复，由于没有实际的API密钥，我无法分析您的文件内容。在真实环境中，AI会对文件内容进行分析并提供相关回复。如果您提供了OpenAI API密钥，系统将使用真实的AI服务来处理您的请求。`;
  }
  
  if (userMessage.includes('你好') || userMessage.includes('嗨') || userMessage.includes('hi') || userMessage.includes('hello')) {
    return `您好！我是一个模拟的AI助手。很高兴为您服务。请注意，由于没有API密钥，我只能提供预设的回复。如果您有OpenAI API密钥，可以在聊天框中输入以获得真实AI的响应。`;
  }
  
  if (userMessage.includes('时间') || userMessage.includes('日期')) {
    const now = new Date();
    return `当前时间是 ${now.toLocaleString('zh-CN')}。这是一个模拟回复，实际AI会根据您的问题提供更准确的回答。`;
  }
  
  if (userMessage.includes('天气')) {
    return `我是一个模拟助手，无法获取实时天气信息。在真实环境中，AI可能会建议您查看天气应用或网站以获取准确的天气预报。`;
  }
  
  return `这是一个模拟的AI响应，因为系统中没有配置有效的OpenAI API密钥。您的问题是："${userMessage}"。要获得真实的AI回复，请配置有效的API密钥。我可以帮助回答问题、分析图片和文档，但目前我只能提供这个预设的回复。如有任何疑问，请随时提问！`;
}

interface ChatRequest {
  messages: Array<{ 
    content: string | Array<{
      type: 'text' | 'file' | 'image';
      text?: string;
      data?: string;
      mediaType?: string;
    }>;
    role: string; 
  }>;
  experimental_attachments?: any;
  apiKey?: string;
  // AWS credentials for Bedrock
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  // Provider selection
  provider?: 'openai' | 'bedrock';
  // Model selection for Bedrock
  bedrockModel?: string;
  // Enable reasoning for Claude models
  enableReasoning?: boolean;
}

export async function POST(req: Request) {
  // Extract the messages and other data from the request
  const { 
    messages, 
    apiKey, 
    awsAccessKeyId, 
    awsSecretAccessKey, 
    awsRegion,
    provider = 'bedrock',  // Default to Bedrock
    bedrockModel = 'anthropic.claude-3-sonnet-20240229-v1:0',
    enableReasoning = false,
    experimental_attachments
  } = await req.json() as ChatRequest;

  try {
    // 检查是否提供了有效的凭据
    const hasOpenAICredentials = !!apiKey;
    const hasAWSCredentials = !!(awsAccessKeyId && awsSecretAccessKey && awsRegion) || 
                          !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION);
    
    // 如果提供了凭据，尝试使用真实API
    if ((provider === 'openai' && hasOpenAICredentials) || (provider === 'bedrock' && hasAWSCredentials)) {
      try {
        // 创建流式文本响应
        let textStream;
        
        if (provider === 'openai' && apiKey) {
          // 使用OpenAI
          process.env.OPENAI_API_KEY = apiKey;
          
          textStream = await streamText({
            model: openai('gpt-4o'), // 使用 gpt-4o 模型
            messages,
            temperature: 0.7,
            // OpenAI特定配置
            providerOptions: {
              openai: {
                // 用户标识符
                user: 'chat-user',
              },
            },
            // 系统提示词
            system: "您是一个有帮助的助手，可以回答问题并分析图片和文档内容。",
          });
        } else {
          // 使用Amazon Bedrock
          // 设置AWS凭据
          const bedrockConfig: any = {};
          
          // 优先使用请求中的凭据
          if (awsAccessKeyId && awsSecretAccessKey && awsRegion) {
            bedrockConfig.accessKeyId = awsAccessKeyId;
            bedrockConfig.secretAccessKey = awsSecretAccessKey;
            bedrockConfig.region = awsRegion;
          } else {
            // Edge runtime无法使用某些AWS SDK凭据提供者
            // 简化凭据处理，使用环境变量
            bedrockConfig.region = process.env.AWS_REGION;
          }
          
          // 创建 Bedrock 实例
          const bedrockInstance = createAmazonBedrock(bedrockConfig);
          
          // 处理消息格式，Claude需要以用户消息开始
          // 过滤掉系统自动生成的问候消息，并处理消息格式
          const filteredMessages = messages
            .filter((message, index) => {
              // 如果是第一条助手消息且是问候消息，则跳过
              if (index === 0 && message.role === 'assistant' && 
                  (message.content.includes('您好') || message.content.includes('有什么可以帮您'))) {
                return false;
              }
              return true;
            })
            .map(message => {
              // 处理消息格式，支持多部分内容（文本、图像、文件）
              if (typeof message.content === 'string') {
                // 检查 AI 响应中是否有图片标记
                if (message.role === 'assistant' && message.content.includes('![')) {
                  // 保留原样，Markdown 图片将在前端渲染
                }
                return message;
              }
              
              // 处理数组形式的内容，包含文本和文件
              if (Array.isArray(message.content)) {
                // 转换为 AI SDK 支持的格式
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
              
              // 处理带有附件的消息
              if (message.attachments && Array.isArray(message.attachments)) {
                const textContent = typeof message.content === 'string' ? message.content : '';
                
                // 创建多部分内容数组
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
          
          // 如果启用了推理功能并且是支持推理的模型
          if (enableReasoning && bedrockModel.includes('claude-3-7-sonnet')) {
            // 使用 generateText 获取推理结果
            const result = await generateText({
              model: bedrockInstance(bedrockModel),
              messages: filteredMessages,
              temperature: 0.7,
              providerOptions: {
                bedrock: {
                  reasoningConfig: { type: 'enabled', budgetTokens: 1024 }
                }
              },
              system: "您是一个有帮助的助手，可以回答问题并分析图片和文档内容。",
            });
            
            // 返回完整的结果，包括推理过程
            return new Response(
              JSON.stringify({
                text: result.text,
                reasoning: result.reasoning,
                reasoningDetails: result.reasoningDetails
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          } else {
            // 正常流式响应
            textStream = await streamText({
              model: bedrockInstance(bedrockModel),
              messages: filteredMessages,
              temperature: 0.7,
              // 系统提示词
              system: "您是一个有帮助的助手，可以回答问题并分析图片和文档内容。",
            });
          }
        }
        
        return textStream.toTextStreamResponse();
      } catch (error) {
        console.error('使用AI服务时出错:', error);
        
        // 尝试提取更具体的错误信息
        let errorMessage = 'AI服务错误';
        let errorCode = 500;
        let errorDetails: Record<string, any> = {};
        
        if (error instanceof Error) {
          errorMessage = error.message;
          
          // 处理特定的AWS错误类型
          // @ts-expect-error - AWS错误类型
          if (error.name === 'AccessDeniedException') {
            errorCode = 403;
            errorMessage = '模型访问被拒绝';
            // @ts-expect-error - AWS错误类型
            errorDetails = error.details || {};
          } 
          // @ts-expect-error - AWS SDK v3 错误格式
          else if (error.$metadata && error.$metadata.httpStatusCode) {
            // AWS SDK v3 错误格式
            // @ts-expect-error - AWS SDK v3 错误格式
            errorCode = error.$metadata.httpStatusCode;
          }
        }
        
        // 返回结构化错误响应
        return new Response(
          JSON.stringify({
            error: errorMessage,
            code: errorCode,
            details: errorDetails,
            provider: provider,
            model: bedrockModel,
            timestamp: new Date().toISOString(),
            message: `提供的${provider}服务访问出错。${errorMessage}`
          }),
          { 
            status: errorCode,
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // 如果没有有效凭据，使用模拟响应
    const providerName = provider === 'openai' ? 'OpenAI API密钥' : 'AWS凭据';
    const mockResponse = `系统未配置有效的${providerName}。这是一个模拟回复。\n\n${generateMockResponse(messages)}`;
    const stream = createMockStream(mockResponse);
    return new Response(stream);
    
  } catch (error) {
    console.error('Chat API 错误:', error);
    
    // 提取更详细的错误信息
    let errorMessage = '处理请求时出错';
    let errorCode = 500;
    let errorDetails: Record<string, any> = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // 处理特定的AWS错误类型
      // @ts-expect-error - AWS错误类型
      if (error.name === 'AccessDeniedException' || (error.message && error.message.includes("don't have access to the model"))) {
        errorCode = 403;
        errorMessage = '模型访问被拒绝';
        // @ts-expect-error - AWS错误类型
        errorDetails = error.$response || {};
      } 
      // @ts-expect-error - AWS SDK v3 错误格式
      else if (error.$metadata && error.$metadata.httpStatusCode) {
        // AWS SDK v3 错误格式
        // @ts-expect-error - AWS SDK v3 错误格式
        errorCode = error.$metadata.httpStatusCode;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        code: errorCode,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        rawError: error instanceof Error ? error.toString() : String(error)
      }),
      { status: errorCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}