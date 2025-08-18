import { openai } from '@ai-sdk/openai';
import { bedrock, createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { streamText } from 'ai';

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
  messages: Array<{ content: string }>;
  experimental_attachments?: FileList;
  apiKey?: string;
  // AWS credentials for Bedrock
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  // Provider selection
  provider?: 'openai' | 'bedrock';
  // Model selection for Bedrock
  bedrockModel?: string;
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
    bedrockModel = 'anthropic.claude-3-sonnet-20240229-v1:0'
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
          // 过滤掉系统自动生成的问候消息
          const filteredMessages = messages.filter((message, index) => {
            // 如果是第一条助手消息且是问候消息，则跳过
            if (index === 0 && message.role === 'assistant' && 
                (message.content.includes('您好') || message.content.includes('有什么可以帮您'))) {
              return false;
            }
            return true;
          });
          
          textStream = await streamText({
            model: bedrockInstance(bedrockModel),
            messages: filteredMessages,
            temperature: 0.7,
            // 系统提示词
            system: "您是一个有帮助的助手，可以回答问题并分析图片和文档内容。",
          });
        }
        
        return textStream.toTextStreamResponse();
      } catch (error) {
        console.error('使用AI服务时出错:', error);
        // 凭据无效或其他错误，回退到模拟响应
        const providerName = provider === 'openai' ? 'OpenAI' : 'Amazon Bedrock';
        const mockResponse = `提供的${providerName}凭据似乎无效或发生了错误。这是一个模拟回复。错误详情: ${error instanceof Error ? error.message : String(error)}`;
        const stream = createMockStream(mockResponse);
        return new Response(stream);
      }
    }
    
    // 如果没有有效凭据，使用模拟响应
    const providerName = provider === 'openai' ? 'OpenAI API密钥' : 'AWS凭据';
    const mockResponse = `系统未配置有效的${providerName}。这是一个模拟回复。\n\n${generateMockResponse(messages)}`;
    const stream = createMockStream(mockResponse);
    return new Response(stream);
    
  } catch (error) {
    console.error('Chat API 错误:', error);
    return new Response(
      JSON.stringify({ 
        error: '处理请求时出错', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}