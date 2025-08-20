import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';

// Mock sessions data - in a real app, this would come from a database
const mockSessions = [
  {
    id: 'session-1',
    agentId: 'agent-1',
    title: '与通用助手的对话',
    messages: [
      {
        id: 'msg-1',
        content: '你好，我需要帮助完成一个项目计划。',
        role: 'user',
        timestamp: '2024-08-20T10:30:00.000Z'
      },
      {
        id: 'msg-2',
        content: '您好！我很乐意帮您完成项目计划。请告诉我更多关于这个项目的信息，例如项目的目标、时间线、可用资源以及您希望在计划中包含哪些具体内容？',
        role: 'assistant',
        timestamp: '2024-08-20T10:30:05.000Z'
      }
    ],
    createdAt: '2024-08-20T10:30:00.000Z',
    updatedAt: '2024-08-20T10:30:05.000Z',
    status: 'active',
    userId: 'user-1'
  },
  {
    id: 'session-2',
    agentId: 'agent-2',
    title: '代码优化讨论',
    messages: [
      {
        id: 'msg-3',
        content: '我需要优化这段React代码，它有性能问题。',
        role: 'user',
        timestamp: '2024-08-19T15:45:00.000Z'
      },
      {
        id: 'msg-4',
        content: '我很乐意帮您优化React代码。请分享您当前的代码片段，以便我可以分析性能问题并提出具体的改进建议。',
        role: 'assistant',
        timestamp: '2024-08-19T15:45:10.000Z'
      }
    ],
    createdAt: '2024-08-19T15:45:00.000Z',
    updatedAt: '2024-08-19T15:45:10.000Z',
    status: 'active',
    userId: 'user-1'
  }
];

// GET /api/agents/sessions - List all sessions for the current user
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    
    // Filter sessions based on query parameters
    let filteredSessions = [...mockSessions];
    
    // In a real implementation, we would filter by the current user's ID
    // const userId = session.user.id;
    // filteredSessions = filteredSessions.filter(s => s.userId === userId);
    
    if (agentId) {
      filteredSessions = filteredSessions.filter(s => s.agentId === agentId);
    }
    
    if (status) {
      filteredSessions = filteredSessions.filter(s => s.status === status);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredSessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch sessions',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// POST /api/agents/sessions - Create a new session
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
    if (!body.agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would create a new session in the database
    // For now, return a mock response
    const now = new Date().toISOString();
    const newSession = {
      id: `session-${Date.now()}`,
      agentId: body.agentId,
      title: body.title || `与代理的新对话`,
      messages: [],
      createdAt: now,
      updatedAt: now,
      status: 'active',
      userId: session.user?.id || 'unknown-user'
    };
    
    return NextResponse.json({
      success: true,
      data: newSession
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create session',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}