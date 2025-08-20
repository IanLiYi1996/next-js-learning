'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAgentStore } from '@/stores/agentStore';
import type { Agent, UpdateAgentOptions } from '@/types/agent';

export interface AgentEditDialogProps {
  isOpen: boolean;
  agent: Agent | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AgentEditDialog({
  isOpen,
  agent,
  onClose,
  onSuccess,
}: AgentEditDialogProps) {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [modelId, setModelId] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get update agent function from store
  const { updateAgent } = useAgentStore();

  // Initialize form with agent data
  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setDescription(agent.description);
      setServerUrl(agent.serverUrl);
      setModelId(agent.modelId);
      setSystemPrompt(agent.config.systemPrompt || '');
      setTags([...agent.tags]);
    }
  }, [agent]);

  // Reset form state
  const resetForm = () => {
    setName('');
    setDescription('');
    setServerUrl('');
    setModelId('');
    setSystemPrompt('');
    setTags([]);
    setTagInput('');
    setError(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agent) return;
    
    // Validate form
    if (!name.trim()) {
      setError('请输入代理名称');
      return;
    }
    
    if (!description.trim()) {
      setError('请输入代理描述');
      return;
    }
    
    if (!serverUrl.trim()) {
      setError('请输入服务器URL');
      return;
    }
    
    if (!modelId.trim()) {
      setError('请输入模型ID');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Update agent in store
      const agentOptions: UpdateAgentOptions = {
        id: agent.id,
        name,
        description,
        serverUrl,
        modelId,
        tags,
        config: {
          systemPrompt,
          temperature: agent.config.temperature,
          reasoningEnabled: agent.config.reasoningEnabled
        }
      };
      
      const updatedAgent = updateAgent(agentOptions);
      
      if (!updatedAgent) {
        throw new Error('更新代理失败');
      }
      
      // Reset form and close dialog
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新代理失败');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      
      // Don't add duplicate tags
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑代理</DialogTitle>
          <DialogDescription>
            更新代理的信息和配置。
          </DialogDescription>
        </DialogHeader>
        
        {agent && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                代理名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入代理名称"
                className="w-full"
                required
              />
            </div>
            
            {/* Description field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                代理描述 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="输入代理的简短描述"
                className="w-full resize-none"
                rows={3}
                required
              />
            </div>
            
            {/* Server URL field */}
            <div className="space-y-2">
              <Label htmlFor="serverUrl" className="text-sm font-medium">
                服务器URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="serverUrl"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="输入MCP服务器URL"
                className="w-full"
                required
              />
            </div>
            
            {/* Model ID field */}
            <div className="space-y-2">
              <Label htmlFor="modelId" className="text-sm font-medium">
                模型ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="modelId"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                placeholder="输入模型ID"
                className="w-full"
                required
              />
              <p className="text-xs text-muted-foreground">
                例如: anthropic.claude-3-opus-20240229-v1:0
              </p>
            </div>
            
            {/* System prompt field */}
            <div className="space-y-2">
              <Label htmlFor="systemPrompt" className="text-sm font-medium">
                系统提示词
              </Label>
              <Textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="输入系统提示词"
                className="w-full resize-none"
                rows={3}
              />
            </div>
            
            {/* Tags field */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm font-medium">
                标签
              </Label>
              <div className="flex flex-wrap gap-1 p-2 border rounded-md mb-2">
                {tags.map(tag => (
                  <div 
                    key={tag}
                    className="bg-secondary text-secondary-foreground rounded-full px-2 py-1 text-xs flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1 hover:text-destructive"
                      onClick={() => removeTag(tag)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                      >
                        <line x1="18" x2="6" y1="6" y2="18" />
                        <line x1="6" x2="18" y1="6" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
                {tags.length === 0 && (
                  <div className="text-sm text-muted-foreground px-1">
                    输入标签并按回车添加
                  </div>
                )}
              </div>
              <Input
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="输入标签并按回车添加"
                className="w-full"
              />
            </div>
            
            {/* Error display */}
            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}
            
            {/* Submit buttons */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? '保存中...' : '保存更改'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}