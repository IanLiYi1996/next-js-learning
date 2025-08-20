'use client';

import { useState } from 'react';
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
import type { CreateAgentOptions } from '@/types/agent';

export interface AgentCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AgentCreateDialog({
  isOpen,
  onClose,
  onSuccess,
}: AgentCreateDialogProps) {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serverUrl, setServerUrl] = useState('https://api.example.com/v1');
  const [modelId, setModelId] = useState('anthropic.claude-3-opus-20240229-v1:0');
  const [systemPrompt, setSystemPrompt] = useState('你是一个有帮助的AI助手。');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get create agent function from store
  const { createAgent } = useAgentStore();

  // Reset form state
  const resetForm = () => {
    setName('');
    setDescription('');
    setServerUrl('https://api.example.com/v1');
    setModelId('anthropic.claude-3-opus-20240229-v1:0');
    setSystemPrompt('你是一个有帮助的AI助手。');
    setTags([]);
    setTagInput('');
    setError(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      // Create agent in store
      const agentOptions: CreateAgentOptions = {
        name,
        description,
        serverUrl,
        modelId,
        tags,
        config: {
          systemPrompt,
          temperature: 0.7,
          reasoningEnabled: modelId.includes('claude-3')
        }
      };
      
      const newAgent = createAgent(agentOptions);
      
      // Reset form and close dialog
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建代理失败');
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
        // Don't reset form here to allow animations to complete
      }
    }}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建新的AI代理</DialogTitle>
          <DialogDescription>
            设置新AI代理的基本信息和配置。创建后可以随时编辑这些设置。
          </DialogDescription>
        </DialogHeader>
        
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
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? '创建中...' : '创建代理'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}