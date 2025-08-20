'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  MessageCircle, 
  Settings, 
  Trash2, 
  Copy, 
  Star, 
  StarOff,
  MoreVertical,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Agent } from '@/types/agent';

// Define tag colors for consistent color by tag name
const TAG_COLORS: Record<string, string> = {
  '通用': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  '对话': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  '编程': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  '开发': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  '数据': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  '分析': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  // Add more tags as needed
};

// Get tag color or use default
const getTagColor = (tag: string) => {
  return TAG_COLORS[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

export interface AgentCardProps {
  agent: Agent;
  onChat?: (agent: Agent) => void;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  onDuplicate?: (agent: Agent) => void;
  onToggleFavorite?: (agent: Agent, isFavorite: boolean) => void;
}

export function AgentCard({
  agent,
  onChat,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite
}: AgentCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Toggle favorite status
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    onToggleFavorite?.(agent, newStatus);
  };
  
  // Model name display logic
  const getModelDisplayName = (modelId: string) => {
    if (modelId.includes('claude-3-opus')) return 'Claude 3 Opus';
    if (modelId.includes('claude-3-sonnet')) return 'Claude 3 Sonnet';
    if (modelId.includes('claude-3-haiku')) return 'Claude 3 Haiku';
    return modelId.split(':')[0].split('.').pop() || modelId;
  };
  
  return (
    <div className="bg-card rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Card header with image */}
      <div className="relative h-32 bg-muted">
        {agent.imageUrl ? (
          <div className="w-full h-full overflow-hidden">
            <Image
              src={agent.imageUrl}
              alt={agent.name}
              className="object-cover"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={agent.imageUrl.endsWith('.svg') || agent.imageUrl.endsWith('.png')}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="text-2xl font-bold text-primary/50">{agent.name.substring(0, 2).toUpperCase()}</span>
          </div>
        )}
        
        {/* Favorite button overlay */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/50 backdrop-blur-sm hover:bg-background/70 rounded-full p-1.5"
          onClick={handleToggleFavorite}
        >
          {isFavorite ? (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          ) : (
            <StarOff className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      
      {/* Card content */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-medium mb-1 line-clamp-1">{agent.name}</h3>
        
        {/* Model info */}
        <div className="text-xs text-muted-foreground mb-2">
          {getModelDisplayName(agent.modelId)}
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {agent.description}
        </p>
        
        {/* Tags */}
        {agent.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {agent.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  getTagColor(tag)
                )}
              >
                {tag}
              </span>
            ))}
            {agent.tags.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                +{agent.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Card actions */}
      <div className="border-t px-4 py-3 flex justify-between">
        <Button
          variant="default"
          size="sm"
          className="h-8 px-3"
          onClick={() => onChat?.(agent)}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          开始对话
        </Button>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute bottom-full right-0 mb-1 w-40 rounded-md shadow-lg bg-popover z-10 border overflow-hidden">
              <div className="py-1" onClick={() => setShowDropdown(false)}>
                <button
                  className="w-full text-left px-4 py-2 text-sm flex items-center hover:bg-muted"
                  onClick={() => onEdit?.(agent)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm flex items-center hover:bg-muted"
                  onClick={() => onDuplicate?.(agent)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm flex items-center text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete?.(agent)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}