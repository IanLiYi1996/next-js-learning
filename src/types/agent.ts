/**
 * Agent-related type definitions for Agent Gallery
 */
import { Session as NextAuthSession } from 'next-auth';

// Extend the NextAuth Session to include any custom properties
export interface Session extends NextAuthSession {
  accessToken?: string;
  error?: string;
}

/**
 * Agent model representing an AI agent in the system
 */
export interface Agent {
  id: string;
  name: string;
  description: string;
  serverUrl: string;
  modelId: string;
  imageUrl?: string;
  capabilities: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name?: string;
  };
  isPublic: boolean;
  isActive: boolean;
  config: AgentConfig;
}

/**
 * Agent configuration options
 */
export interface AgentConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  responseFormat?: string;
  systemPrompt?: string;
  reasoningEnabled?: boolean;
  reasoningMaxTokens?: number;
  tools?: AgentTool[];
}

/**
 * Agent tool definition
 */
export interface AgentTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  isEnabled: boolean;
}

/**
 * Message in a conversation with an agent
 */
export interface Message {
  id: string;
  content: string | AgentMessageContent[];
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  reasoning?: string;
  reasoningDetails?: Record<string, any>;
  toolCalls?: AgentToolCall[];
  toolResults?: AgentToolResult[];
  attachments?: AgentAttachment[];
}

/**
 * Content part of a message (for multimodal messages)
 */
export interface AgentMessageContent {
  type: 'text' | 'image' | 'file';
  text?: string;
  data?: string;
  mediaType?: string;
}

/**
 * Tool call made by an agent
 */
export interface AgentToolCall {
  id: string;
  toolId: string;
  name: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
}

/**
 * Result of a tool call
 */
export interface AgentToolResult {
  toolCallId: string;
  result: string | Record<string, any>;
  error?: string;
}

/**
 * Attachment to a message
 */
export interface AgentAttachment {
  id: string;
  type: 'image' | 'file';
  data: string;
  mediaType: string;
  name?: string;
  size?: number;
}

/**
 * Conversation session with an agent
 */
export interface AgentSession {
  id: string;
  agentId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'deleted';
  userId: string;
}

/**
 * Options for creating a new agent
 */
export interface CreateAgentOptions {
  name: string;
  description: string;
  serverUrl: string;
  modelId: string;
  imageUrl?: string;
  capabilities?: string[];
  tags?: string[];
  isPublic?: boolean;
  config?: Partial<AgentConfig>;
}

/**
 * Options for updating an existing agent
 */
export interface UpdateAgentOptions extends Partial<CreateAgentOptions> {
  id: string;
}

/**
 * MCP (Model Conversation Platform) server configuration
 */
export interface MCPServerConfig {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  models: MCPModel[];
  status: 'online' | 'offline' | 'unknown';
  lastChecked?: string;
}

/**
 * Model available on an MCP server
 */
export interface MCPModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  maxTokens?: number;
  supportedFeatures: {
    streaming?: boolean;
    reasoning?: boolean;
    tools?: boolean;
    vision?: boolean;
    multimodal?: boolean;
  };
}

/**
 * API response for agent operations
 */
export interface AgentApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Chat completion options for agent conversations
 */
export interface AgentChatOptions {
  stream?: boolean;
  enableReasoning?: boolean;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  tools?: AgentTool[];
}