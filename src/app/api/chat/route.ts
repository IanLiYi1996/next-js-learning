import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  // Extract the messages and other data from the request
  const { messages } = await req.json();

  try {
    // 检查API密钥是否配置
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('未配置OPENAI_API_KEY环境变量');
    }

    // 创建流式文本响应
    const textStream = await streamText({
      model: openai('gpt-4o'), // 使用 gpt-4o 模型
      messages,
      temperature: 0.7,
      maxTokens: 1000,
      // OpenAI特定配置
      providerOptions: {
        openai: {
          // 用户标识符
          user: 'chat-user',
        },
      },
    });
    
    // Return the text stream as a response
    return new Response(textStream);
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