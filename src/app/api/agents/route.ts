import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';

// This would connect to your database in a real implementation
// For now, we'll use some mock data
const mockAgents = [
  {
    id: 'agent-1',
    name: '通用助手',
    description: '可以回答各种问题的智能助手',
    serverUrl: 'https://api.example.com/v1',
    modelId: 'anthropic.claude-3-opus-20240229-v1:0',
    imageUrl: '/agents/assistant.png',
    capabilities: ['文本对话', '问答', '创意写作'],
    tags: ['通用', '对话'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    isActive: true,
    config: {
      temperature: 0.7,
      systemPrompt: '你是一个有帮助的AI助手。',
      reasoningEnabled: true
    }
  },
  {
    id: 'agent-2',
    name: '代码专家',
    description: '专门帮助编写和优化代码的助手',
    serverUrl: 'https://api.example.com/v1',
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    imageUrl: '/agents/code.png',
    capabilities: ['代码编写', '代码优化', '调试'],
    tags: ['编程', '开发'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    isActive: true,
    config: {
      temperature: 0.3,
      systemPrompt: '你是一个专业的编程助手，善于编写清晰、高效的代码。',
      reasoningEnabled: true
    }
  },
  {
    id: 'agent-3',
    name: '数据分析师',
    description: '帮助分析数据，生成见解和图表',
    serverUrl: 'https://api.example.com/v1',
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    imageUrl: '/agents/data.png',
    capabilities: ['数据分析', '可视化', '报表生成'],
    tags: ['数据', '分析'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: false,
    isActive: true,
    config: {
      temperature: 0.2,
      systemPrompt: '你是一个专业的数据分析助手，擅长从数据中提取见解。',
      reasoningEnabled: false
    }
  }
];

// GET /api/agents - List all agents
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase() || '';
    const tags = searchParams.getAll('tag');
    
    // Filter agents based on query and tags
    let filteredAgents = [...mockAgents];
    
    if (query) {
      filteredAgents = filteredAgents.filter(agent => 
        agent.name.toLowerCase().includes(query) || 
        agent.description.toLowerCase().includes(query)
      );
    }
    
    if (tags.length > 0) {
      filteredAgents = filteredAgents.filter(agent => 
        tags.some(tag => agent.tags.includes(tag))
      );
    }
    
    return NextResponse.json({
      success: true,
      data: filteredAgents
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch agents',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// POST /api/agents - Create a new agent
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.serverUrl || !body.modelId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would create a new agent in the database
    // For now, return a mock response
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: body.name,
      description: body.description,
      serverUrl: body.serverUrl,
      modelId: body.modelId,
      imageUrl: body.imageUrl || '/agents/default.png',
      capabilities: body.capabilities || [],
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: body.isPublic || false,
      isActive: true,
      config: {
        temperature: body.config?.temperature || 0.7,
        systemPrompt: body.config?.systemPrompt || '',
        reasoningEnabled: body.config?.reasoningEnabled || false
      },
      creator: {
        id: session.user?.id || 'unknown',
        name: session.user?.name
      }
    };
    
    return NextResponse.json({
      success: true,
      data: newAgent
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create agent',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}