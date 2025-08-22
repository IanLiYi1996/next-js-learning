'use client';

import { useState, useEffect } from 'react';
import type { Session } from 'next-auth';
import { AgentList } from './agents/AgentList';
import { AgentCreateDialog } from './agents/AgentCreateDialog';
import { AgentEditDialog } from './agents/AgentEditDialog';
import { AgentDeleteDialog } from './agents/AgentDeleteDialog';
import { AgentChat } from './agents/AgentChat';
import { useAgentStore } from '@/stores/agentStore';
import type { Agent } from '@/types/agent';

interface AgentGalleryPageProps {
  session: Session;
}

export default function AgentGalleryPage({ session }: AgentGalleryPageProps) {
  // Get agents from store
  const { 
    agents,
    filteredAgents,
    setSearchQuery,
    createAgent,
    getAgentById
  } = useAgentStore();
  
  // UI state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize store with agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real implementation, we would fetch agents from the API
        // For now, we're using the mock data in the store
        // const response = await fetch('/api/agents');
        // const data = await response.json();
        // if (data.success && data.data) {
        //   addAgents(data.data);
        // }
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError('加载代理列表失败');
        setIsLoading(false);
      }
    };
    
    fetchAgents();
  }, []);
  
  // Handle actions
  const handleCreateAgent = () => {
    setIsCreateDialogOpen(true);
  };
  
  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsChatOpen(true);
  };
  
  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDeleteDialogOpen(true);
  };
  
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedAgent(null);
  };
  
  const handleDuplicateAgent = (agent: Agent) => {
    if (!agent) return;
    
    try {
      const newAgent = createAgent({
        name: `${agent.name} 副本`,
        description: agent.description,
        serverUrl: agent.serverUrl,
        modelId: agent.modelId,
        imageUrl: agent.imageUrl,
        capabilities: [...agent.capabilities],
        tags: [...agent.tags],
        isPublic: agent.isPublic,
        config: { ...agent.config }
      });
      
      // Show success message or notification
    } catch (err) {
      console.error('Error duplicating agent:', err);
      // Show error message
    }
  };
  
  // Determine what to render based on current state
  const renderContent = () => {
    // Show chat if an agent is selected
    if (isChatOpen && selectedAgent) {
      return (
        <AgentChat 
          agent={selectedAgent}
          onClose={handleCloseChat}
        />
      );
    }
    
    // Show loading state
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">加载代理列表...</p>
        </div>
      );
    }
    
    // Show error state
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-destructive text-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 mx-auto mb-2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3 className="text-lg font-medium">出错了</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      );
    }
    
    // Show empty state if no agents
    if (agents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-12 w-12 text-muted-foreground mb-4"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="12" y1="8" x2="12" y2="16" />
          </svg>
          <h3 className="text-lg font-medium mb-2">没有代理</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            创建您的第一个AI代理来开始对话。您可以配置不同类型的代理来完成不同任务。
          </p>
          <button
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
            onClick={handleCreateAgent}
          >
            创建代理
          </button>
        </div>
      );
    }
    
    // Show agent list
    return (
      <AgentList
        onCreateAgent={handleCreateAgent}
        onSelectAgent={handleSelectAgent}
        onEditAgent={handleEditAgent}
        onDeleteAgent={handleDeleteAgent}
        onDuplicateAgent={handleDuplicateAgent}
      />
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agent Gallery</h1>
      
      {/* Main content */}
      {renderContent()}
      
      {/* Dialogs */}
      <AgentCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => setIsCreateDialogOpen(false)}
      />
      
      <AgentEditDialog
        isOpen={isEditDialogOpen}
        agent={selectedAgent}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => setIsEditDialogOpen(false)}
      />
      
      <AgentDeleteDialog
        isOpen={isDeleteDialogOpen}
        agent={selectedAgent}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}