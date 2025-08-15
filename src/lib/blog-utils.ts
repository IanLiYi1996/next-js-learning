'use client';

import { format, parseISO } from 'date-fns';
import { Post } from './blog-data';
import { useTranslations } from '@/hooks/use-translations';

/**
 * 格式化日期（客户端版本）
 * 根据当前语言环境格式化日期
 * 中文: yyyy年MM月dd日
 * 英文: MMMM d, yyyy
 */
export function formatDate(date: string): string {
  const { locale } = useTranslations();
  const parsedDate = parseISO(date);
  
  if (locale === 'zh') {
    return format(parsedDate, 'yyyy年MM月dd日');
  } else {
    return format(parsedDate, 'MMMM d, yyyy');
  }
}

/**
 * 从markdown内容中提取标题，用于生成目录（客户端版本）
 */
export function extractHeadings(content: string): Array<{
  level: number;
  text: string;
  slug: string;
}> {
  // 匹配 ## 标题、### 标题 等格式
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length; // # 的数量，表示标题级别
    const text = match[2];         // 标题文本
    
    // 创建用于锚点的slug（将标题转为短横线分隔的小写形式）
    // 例如 "## 我的标题" -> "我的标题"
    const slug = text
      .toLowerCase()
      .replace(/\s+/g, '-')      // 空格替换为短横线
      .replace(/[^\w\u4e00-\u9fa5-]/g, '') // 移除非单词、非中文字符
      .replace(/--+/g, '-');     // 多个短横线替换为单个
    
    headings.push({ level, text, slug });
  }
  
  return headings;
}