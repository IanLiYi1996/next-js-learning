/**
 * Agent store for managing agents and sessions using Zustand
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Agent, 
  AgentSession, 
  Message, 
  CreateAgentOptions, 
  UpdateAgentOptions, 
  MCPServerConfig
} from '@/types/agent';

/**
 * Demo agent data for initial state
 */
const demoAgents: Agent[] = [
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

/**
 * Agent store state interface
 */
interface AgentState {
  // Agents
  agents: Agent[];
  filteredAgents: Agent[];
  selectedAgentId: string | null;
  searchQuery: string;
  selectedTags: string[];
  
  // Sessions
  sessions: AgentSession[];
  activeSessionId: string | null;
  
  // MCP Servers
  mcpServers: MCPServerConfig[];
  
  // UI State
  isCreatingAgent: boolean;
  isEditingAgent: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSelectedAgentId: (id: string | null) => void;
  setActiveSessionId: (id: string | null) => void;
  
  // Agent CRUD
  getAgentById: (id: string) => Agent | undefined;
  createAgent: (options: CreateAgentOptions) => Agent;
  updateAgent: (options: UpdateAgentOptions) => Agent | null;
  deleteAgent: (id: string) => boolean;
  
  // Session management
  createSession: (agentId: string, title?: string) => AgentSession;
  getSessionById: (id: string) => AgentSession | undefined;
  updateSessionTitle: (id: string, title: string) => boolean;
  archiveSession: (id: string) => boolean;
  deleteSession: (id: string) => boolean;
  
  // Message handling
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => Message;
  getSessionMessages: (sessionId: string) => Message[];
  
  // Server management
  addMCPServer: (config: Omit<MCPServerConfig, 'id'>) => MCPServerConfig;
  updateMCPServer: (id: string, config: Partial<Omit<MCPServerConfig, 'id'>>) => MCPServerConfig | null;
  deleteMCPServer: (id: string) => boolean;
  
  // Filters and selectors
  getAllTags: () => string[];
}

/**
 * Create agent store with persistence
 */
export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      // Initial state
      agents: [...demoAgents],
      filteredAgents: [...demoAgents],
      selectedAgentId: null,
      searchQuery: '',
      selectedTags: [],
      sessions: [],
      activeSessionId: null,
      mcpServers: [],
      isCreatingAgent: false,
      isEditingAgent: false,
      isLoading: false,
      error: null,
      
      // Actions
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
        const { agents, selectedTags } = get();
        
        // Apply filtering
        const filtered = agents.filter(agent => {
          const matchesQuery = query === '' || 
            agent.name.toLowerCase().includes(query.toLowerCase()) ||
            agent.description.toLowerCase().includes(query.toLowerCase());
          
          const matchesTags = selectedTags.length === 0 || 
            agent.tags.some(tag => selectedTags.includes(tag));
          
          return matchesQuery && matchesTags;
        });
        
        set({ filteredAgents: filtered });
      },
      
      setSelectedTags: (tags: string[]) => {
        set({ selectedTags: tags });
        const { agents, searchQuery } = get();
        
        // Apply filtering
        const filtered = agents.filter(agent => {
          const matchesQuery = searchQuery === '' || 
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesTags = tags.length === 0 || 
            agent.tags.some(tag => tags.includes(tag));
          
          return matchesQuery && matchesTags;
        });
        
        set({ filteredAgents: filtered });
      },
      
      setSelectedAgentId: (id: string | null) => set({ selectedAgentId: id }),
      
      setActiveSessionId: (id: string | null) => set({ activeSessionId: id }),
      
      // Agent CRUD
      getAgentById: (id: string) => {
        const { agents } = get();
        return agents.find(agent => agent.id === id);
      },
      
      createAgent: (options: CreateAgentOptions) => {
        const newAgent: Agent = {
          id: `agent-${uuidv4()}`,
          name: options.name,
          description: options.description,
          serverUrl: options.serverUrl,
          modelId: options.modelId,
          imageUrl: options.imageUrl || '/agents/default.png',
          capabilities: options.capabilities || [],
          tags: options.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublic: options.isPublic ?? false,
          isActive: true,
          config: {
            temperature: options.config?.temperature ?? 0.7,
            maxTokens: options.config?.maxTokens,
            systemPrompt: options.config?.systemPrompt ?? '',
            reasoningEnabled: options.config?.reasoningEnabled ?? false,
            tools: options.config?.tools || []
          }
        };
        
        set(state => ({
          agents: [...state.agents, newAgent],
          filteredAgents: [...state.agents, newAgent],
        }));
        
        return newAgent;
      },
      
      updateAgent: (options: UpdateAgentOptions) => {
        const { agents } = get();
        const agentIndex = agents.findIndex(a => a.id === options.id);
        
        if (agentIndex === -1) return null;
        
        const existingAgent = agents[agentIndex];
        const updatedAgent: Agent = {
          ...existingAgent,
          name: options.name ?? existingAgent.name,
          description: options.description ?? existingAgent.description,
          serverUrl: options.serverUrl ?? existingAgent.serverUrl,
          modelId: options.modelId ?? existingAgent.modelId,
          imageUrl: options.imageUrl ?? existingAgent.imageUrl,
          capabilities: options.capabilities ?? existingAgent.capabilities,
          tags: options.tags ?? existingAgent.tags,
          updatedAt: new Date().toISOString(),
          isPublic: options.isPublic ?? existingAgent.isPublic,
          config: {
            ...existingAgent.config,
            ...options.config
          }
        };
        
        const updatedAgents = [...agents];
        updatedAgents[agentIndex] = updatedAgent;
        
        set({ agents: updatedAgents });
        
        // Also update filtered agents
        get().setSearchQuery(get().searchQuery);
        
        return updatedAgent;
      },
      
      deleteAgent: (id: string) => {
        const { agents, sessions } = get();
        const agentIndex = agents.findIndex(a => a.id === id);
        
        if (agentIndex === -1) return false;
        
        const updatedAgents = agents.filter(a => a.id !== id);
        
        // Also remove related sessions
        const updatedSessions = sessions.filter(s => s.agentId !== id);
        
        set({ 
          agents: updatedAgents,
          sessions: updatedSessions
        });
        
        // Update filtered agents
        get().setSearchQuery(get().searchQuery);
        
        return true;
      },
      
      // Session management
      createSession: (agentId: string, title) => {
        const agent = get().getAgentById(agentId);
        const defaultTitle = agent ? `与 ${agent.name} 的对话` : "新的对话";
        
        const newSession: AgentSession = {
          id: `session-${uuidv4()}`,
          agentId,
          title: title || defaultTitle,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          userId: 'current-user' // This would normally come from auth
        };
        
        set(state => ({
          sessions: [...state.sessions, newSession],
          activeSessionId: newSession.id
        }));
        
        return newSession;
      },
      
      getSessionById: (id: string) => {
        const { sessions } = get();
        return sessions.find(session => session.id === id);
      },
      
      updateSessionTitle: (id: string, title: string) => {
        const { sessions } = get();
        const sessionIndex = sessions.findIndex(s => s.id === id);
        
        if (sessionIndex === -1) return false;
        
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          title,
          updatedAt: new Date().toISOString()
        };
        
        set({ sessions: updatedSessions });
        
        return true;
      },
      
      archiveSession: (id: string) => {
        const { sessions } = get();
        const sessionIndex = sessions.findIndex(s => s.id === id);
        
        if (sessionIndex === -1) return false;
        
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          status: 'archived',
          updatedAt: new Date().toISOString()
        };
        
        set({ sessions: updatedSessions });
        
        return true;
      },
      
      deleteSession: (id: string) => {
        const { sessions, activeSessionId } = get();
        const sessionIndex = sessions.findIndex(s => s.id === id);
        
        if (sessionIndex === -1) return false;
        
        const updatedSessions = sessions.filter(s => s.id !== id);
        
        // If we're deleting the active session, clear it
        const newActiveId = id === activeSessionId ? null : activeSessionId;
        
        set({ 
          sessions: updatedSessions,
          activeSessionId: newActiveId
        });
        
        return true;
      },
      
      // Message handling
      addMessage: (sessionId: string, message) => {
        const { sessions } = get();
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        
        if (sessionIndex === -1) {
          throw new Error(`Session with ID ${sessionId} not found`);
        }
        
        const newMessage: Message = {
          id: `msg-${uuidv4()}`,
          ...message,
          timestamp: new Date().toISOString()
        };
        
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          messages: [...updatedSessions[sessionIndex].messages, newMessage],
          updatedAt: new Date().toISOString()
        };
        
        set({ sessions: updatedSessions });
        
        return newMessage;
      },
      
      getSessionMessages: (sessionId: string) => {
        const session = get().getSessionById(sessionId);
        return session?.messages || [];
      },
      
      // Server management
      addMCPServer: (config) => {
        const newServer: MCPServerConfig = {
          id: `server-${uuidv4()}`,
          ...config
        };
        
        set(state => ({
          mcpServers: [...state.mcpServers, newServer]
        }));
        
        return newServer;
      },
      
      updateMCPServer: (id, config) => {
        const { mcpServers } = get();
        const serverIndex = mcpServers.findIndex(s => s.id === id);
        
        if (serverIndex === -1) return null;
        
        const updatedServers = [...mcpServers];
        updatedServers[serverIndex] = {
          ...updatedServers[serverIndex],
          ...config,
          lastChecked: new Date().toISOString()
        };
        
        set({ mcpServers: updatedServers });
        
        return updatedServers[serverIndex];
      },
      
      deleteMCPServer: (id: string) => {
        const { mcpServers } = get();
        
        if (!mcpServers.some(s => s.id === id)) {
          return false;
        }
        
        set({
          mcpServers: mcpServers.filter(s => s.id !== id)
        });
        
        return true;
      },
      
      // Filters and selectors
      getAllTags: () => {
        const { agents } = get();
        const allTags = new Set<string>();
        
        agents.forEach(agent => {
          agent.tags.forEach(tag => allTags.add(tag));
        });
        
        return Array.from(allTags);
      }
    }),
    {
      name: 'agent-store', // localStorage key
      // Optional serialization options
      partialize: (state) => ({
        // Only persist these fields
        agents: state.agents,
        sessions: state.sessions,
        mcpServers: state.mcpServers
      }),
    }
  )
);