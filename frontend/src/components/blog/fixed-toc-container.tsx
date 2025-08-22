'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import TableOfContents from './table-of-contents';

interface FixedTocContainerProps {
  headings: Array<{
    level: number;
    text: string;
    slug: string;
  }>;
  maxLevel?: number;
}

const FixedTocContainer: React.FC<FixedTocContainerProps> = ({ 
  headings, 
  maxLevel = 3 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 创建一个容器来放置目录
    const tocContainer = document.createElement('div');
    tocContainer.id = 'fixed-toc-container';
    tocContainer.style.cssText = `
      position: fixed;
      top: 6rem;
      right: 2rem;
      width: 250px;
      height: calc(100vh - 8rem);
      z-index: 40;
      pointer-events: none;
    `;
    document.body.appendChild(tocContainer);

    return () => {
      // 清理
      document.body.removeChild(tocContainer);
    };
  }, []);

  // 只在客户端渲染
  if (!mounted) return null;

  // 使用createPortal将目录组件渲染到固定容器中
  return createPortal(
    <div className="pointer-events-auto">
      <TableOfContents headings={headings} maxLevel={maxLevel} />
    </div>,
    document.getElementById('fixed-toc-container') as HTMLElement
  );
};

export default FixedTocContainer;