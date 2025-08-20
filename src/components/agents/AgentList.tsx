'use client';

import { useRef } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AgentCard } from './AgentCard';
import { Badge } from '@/components/ui/badge';
import { useAgentStore } from '@/stores/agentStore';
import type { Agent } from '@/types/agent';

// Check if we have Badge component, otherwise create it
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

// Fallback Badge implementation if not available in the project
const FallbackBadge = ({ 
  variant = 'default', 
  className, 
  children, 
  ...props 
}: BadgeProps) => {
  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variant === 'default' && 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        variant === 'secondary' && 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        variant === 'outline' && 'text-foreground',
        variant === 'destructive' && 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface AgentListProps {
  onCreateAgent?: () => void;
  onSelectAgent?: (agent: Agent) => void;
  onEditAgent?: (agent: Agent) => void;
  onDeleteAgent?: (agent: Agent) => void;
  onDuplicateAgent?: (agent: Agent) => void;
  className?: string;
}

export function AgentList({
  onCreateAgent,
  onSelectAgent,
  onEditAgent,
  onDeleteAgent,
  onDuplicateAgent,
  className
}: AgentListProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Get state from agent store
  const { 
    filteredAgents, 
    searchQuery, 
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    getAllTags
  } = useAgentStore();
  
  // Get all available tags
  const allTags = getAllTags();
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="搜索代理..."
            className="pl-9 w-full"
            defaultValue={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={handleClearSearch}
            >
              <span className="sr-only">清除搜索</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 gap-1"
        >
          <Filter className="h-4 w-4" />
          筛选
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex-shrink-0 gap-1"
          onClick={onCreateAgent}
        >
          <Plus className="h-4 w-4" />
          创建代理
        </Button>
      </div>
      
      {/* Tags filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer hover:opacity-80"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs px-2 ml-1"
              onClick={() => setSelectedTags([])}
            >
              清除
            </Button>
          )}
        </div>
      )}
      
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredAgents.length === 0 ? (
          <span>未找到符合条件的代理</span>
        ) : (
          <span>共 {filteredAgents.length} 个代理</span>
        )}
      </div>
      
      {/* Agent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onChat={(agent) => onSelectAgent?.(agent)}
            onEdit={(agent) => onEditAgent?.(agent)}
            onDelete={(agent) => onDeleteAgent?.(agent)}
            onDuplicate={(agent) => onDuplicateAgent?.(agent)}
          />
        ))}
      </div>
      
      {/* Empty state */}
      {filteredAgents.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
          <div className="mb-3 p-3 rounded-full bg-primary/10">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">未找到代理</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            没有找到符合当前搜索条件或标签筛选的代理。
          </p>
          <Button
            variant="outline"
            onClick={handleClearSearch}
            className="mb-2"
          >
            清除筛选条件
          </Button>
          <Button
            onClick={onCreateAgent}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            创建新代理
          </Button>
        </div>
      )}
    </div>
  );
}