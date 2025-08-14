'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ReadingProgressProps {
  className?: string;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({ className }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      // 获取文档高度和滚动位置
      const contentElement = document.documentElement;
      const scrollTop = contentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = contentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = contentElement.clientHeight;
      
      // 计算阅读进度百分比
      const windowHeight = scrollHeight - clientHeight;
      const currentProgress = windowHeight > 0 ? (scrollTop / windowHeight) * 100 : 0;
      
      setProgress(currentProgress);
    };

    // 监听滚动事件
    window.addEventListener('scroll', updateProgress);
    
    // 初始化进度条
    updateProgress();
    
    return () => {
      window.removeEventListener('scroll', updateProgress);
    };
  }, []);

  return (
    <div className={cn("fixed top-0 left-0 w-full h-1 z-50", className)}>
      <div
        className="h-full bg-primary"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgress;