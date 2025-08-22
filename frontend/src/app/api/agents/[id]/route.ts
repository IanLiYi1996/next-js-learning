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

// GET /api/agents/[id] - Get a specific agent by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const agentId = (await params).id;
    
    // Find the agent by ID
    const agent = mockAgents.find(agent => agent.id === agentId);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error(`Error fetching agent ${(await params).id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch agent',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// PUT /api/agents/[id] - Update an existing agent
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const agentId = (await params).id;
    
    // Find the agent index by ID
    const agentIndex = mockAgents.findIndex(agent => agent.id === agentId);
    
    if (agentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // In a real implementation, this would update the agent in the database
    // For now, return a mock response with the updated agent
    const updatedAgent = {
      ...mockAgents[agentIndex],
      name: body.name || mockAgents[agentIndex].name,
      description: body.description || mockAgents[agentIndex].description,
      serverUrl: body.serverUrl || mockAgents[agentIndex].serverUrl,
      modelId: body.modelId || mockAgents[agentIndex].modelId,
      imageUrl: body.imageUrl || mockAgents[agentIndex].imageUrl,
      capabilities: body.capabilities || mockAgents[agentIndex].capabilities,
      tags: body.tags || mockAgents[agentIndex].tags,
      updatedAt: new Date().toISOString(),
      isPublic: body.isPublic !== undefined ? body.isPublic : mockAgents[agentIndex].isPublic,
      config: {
        ...mockAgents[agentIndex].config,
        temperature: body.config?.temperature !== undefined 
          ? body.config.temperature 
          : mockAgents[agentIndex].config.temperature,
        systemPrompt: body.config?.systemPrompt !== undefined
          ? body.config.systemPrompt
          : mockAgents[agentIndex].config.systemPrompt,
        reasoningEnabled: body.config?.reasoningEnabled !== undefined
          ? body.config.reasoningEnabled
          : mockAgents[agentIndex].config.reasoningEnabled
      }
    };
    
    return NextResponse.json({
      success: true,
      data: updatedAgent
    });
  } catch (error) {
    console.error(`Error updating agent ${(await params).id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update agent',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id] - Delete an agent
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const agentId = (await params).id;
    
    // Find the agent index by ID
    const agentIndex = mockAgents.findIndex(agent => agent.id === agentId);
    
    if (agentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, this would delete the agent from the database
    // For now, return a success response
    return NextResponse.json({
      success: true,
      message: `Agent ${agentId} deleted successfully`
    });
  } catch (error) {
    console.error(`Error deleting agent ${(await params).id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete agent',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}