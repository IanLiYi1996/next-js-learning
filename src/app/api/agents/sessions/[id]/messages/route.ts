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

// GET /api/agents/sessions/[id]/messages - Get messages for a specific session
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const sessionId = params.id;
    
    // Find the session by ID
    const chatSession = mockSessions.find(s => s.id === sessionId);
    
    if (!chatSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, verify the session belongs to the current user
    // if (chatSession.userId !== session.user.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }
    
    // Parse query parameters for pagination
    const searchParams = req.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit')) || undefined;
    const before = searchParams.get('before') || undefined;
    const after = searchParams.get('after') || undefined;
    
    // Get messages, applying pagination if specified
    let messages = [...chatSession.messages];
    
    if (before) {
      const beforeIndex = messages.findIndex(m => m.id === before);
      if (beforeIndex !== -1) {
        messages = messages.slice(0, beforeIndex);
      }
    }
    
    if (after) {
      const afterIndex = messages.findIndex(m => m.id === after);
      if (afterIndex !== -1) {
        messages = messages.slice(afterIndex + 1);
      }
    }
    
    if (limit && limit > 0) {
      messages = messages.slice(0, limit);
    }
    
    return NextResponse.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error(`Error fetching messages for session ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch messages',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// POST /api/agents/sessions/[id]/messages - Add a new message to a session
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const sessionId = params.id;
    
    // Find the session by ID
    const chatSession = mockSessions.find(s => s.id === sessionId);
    
    if (!chatSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, verify the session belongs to the current user
    // if (chatSession.userId !== session.user.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }
    
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.content || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Content and role are required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would add a message to the session in the database
    // For now, return a mock response
    const newMessage = {
      id: `msg-${Date.now()}`,
      content: body.content,
      role: body.role,
      timestamp: new Date().toISOString(),
      ...(body.attachments && { attachments: body.attachments }),
      ...(body.reasoning && { reasoning: body.reasoning }),
      ...(body.reasoningDetails && { reasoningDetails: body.reasoningDetails })
    };
    
    return NextResponse.json({
      success: true,
      data: newMessage
    }, { status: 201 });
  } catch (error) {
    console.error(`Error adding message to session ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add message',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}