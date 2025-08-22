'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAgentStore } from '@/stores/agentStore';
import type { Agent } from '@/types/agent';
import { useState } from 'react';

export interface AgentDeleteDialogProps {
  isOpen: boolean;
  agent: Agent | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AgentDeleteDialog({
  isOpen,
  agent,
  onClose,
  onSuccess,
}: AgentDeleteDialogProps) {
  const { deleteAgent } = useAgentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!agent) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const success = deleteAgent(agent.id);
      
      if (!success) {
        throw new Error('删除代理失败');
      }
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除代理失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>删除代理</DialogTitle>
          <DialogDescription>
            您确定要删除此代理吗？此操作无法撤销，相关的对话历史也将被删除。
          </DialogDescription>
        </DialogHeader>
        
        {agent && (
          <div className="py-4">
            <div className="bg-muted p-4 rounded-md mb-4">
              <h4 className="font-medium mb-1">{agent.name}</h4>
              <p className="text-sm text-muted-foreground">{agent.description}</p>
            </div>
            
            {/* Error display */}
            {error && (
              <div className="text-sm text-destructive mb-4">
                {error}
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? '删除中...' : '确认删除'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}