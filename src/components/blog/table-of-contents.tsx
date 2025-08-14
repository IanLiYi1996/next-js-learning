'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';

// 标题项类型
interface Heading {
  level: number;
  text: string;
  slug: string;
}

interface TableOfContentsProps {
  headings: Heading[];
  className?: string;
  maxLevel?: number; // 最大标题级别 (2 = h2, 3 = h2-h3, 4 = h2-h3-h4)
}

// 主目录组件
const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  headings, 
  className,
  maxLevel = 3
}) => {
  const [activeId, setActiveId] = useState<string>('');
  
  // 监听滚动，更新当前可见的标题
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 找到第一个可见的标题
        const visibleHeadings = entries.filter(entry => entry.isIntersecting);
        
        if (visibleHeadings.length > 0) {
          // 如果有多个可见的标题，选择第一个
          setActiveId(visibleHeadings[0].target.id);
        }
      },
      {
        // 调整根边距，使观察区域更靠近顶部
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0.1,
      }
    );

    // 监听所有标题元素
    const headingElements = headings
      .map(({ slug }) => document.getElementById(slug))
      .filter(Boolean);
      
    headingElements.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => {
      headingElements.forEach((element) => {
        if (element) observer.unobserve(element);
      });
    };
  }, [headings]);
  
  // 只显示指定级别的标题
  const filteredHeadings = headings.filter(
    heading => heading.level <= maxLevel
  );
  
  if (filteredHeadings.length === 0) {
    return null;
  }

  return (
    <div className={cn("hidden lg:block", className)}>
      <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-auto pr-4 pb-4">
        <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">
          目录
        </h4>
        <nav className="toc-nav pb-10">
          {filteredHeadings.map((heading) => (
            <a
              key={heading.slug}
              href={`#${heading.slug}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.slug)?.scrollIntoView({
                  behavior: 'smooth',
                });
                setActiveId(heading.slug);
              }}
              className={cn(
                "block border-l-2 pl-3 py-1 text-sm transition-colors hover:text-foreground",
                heading.level === 3 && "pl-6",
                heading.level === 4 && "pl-9",
                activeId === heading.slug
                  ? "border-primary text-primary font-medium bg-primary/5"
                  : "border-muted text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

// 移动设备使用的目录抽屉
export const MobileTableOfContents: React.FC<TableOfContentsProps> = (props) => {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="mb-4">
            <List className="h-4 w-4 mr-2" />
            目录
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px]">
          <TableOfContentsInner {...props} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

// 目录抽屉内部组件
const TableOfContentsInner: React.FC<TableOfContentsProps> = ({ 
  headings, 
  maxLevel = 3 
}) => {
  const [activeId, setActiveId] = useState<string>('');
  
  // 只显示指定级别的标题
  const filteredHeadings = headings.filter(
    heading => heading.level <= maxLevel
  );
  
  if (filteredHeadings.length === 0) {
    return null;
  }

  return (
    <div className="py-6">
      <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">
        目录
      </h4>
      <nav className="toc-nav">
        {filteredHeadings.map((heading) => (
          <a
            key={heading.slug}
            href={`#${heading.slug}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(heading.slug)?.scrollIntoView({
                behavior: 'smooth',
              });
              setActiveId(heading.slug);
            }}
            className={cn(
              "block border-l-2 pl-3 py-1 text-sm transition-colors hover:text-foreground",
              heading.level === 3 && "pl-6",
              heading.level === 4 && "pl-9",
              activeId === heading.slug
                ? "border-primary text-primary font-medium"
                : "border-muted text-muted-foreground hover:border-primary/50"
            )}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default TableOfContents;