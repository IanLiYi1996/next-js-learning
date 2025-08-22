'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import MarkdownRenderer from './markdown-renderer';
import FixedTocContainer from './fixed-toc-container';
import { MobileTableOfContents } from './table-of-contents';
import ReadingProgress from './reading-progress';

interface BlogPostViewProps {
  post: {
    slug: string;
    frontmatter: {
      title: string;
      date: string;
      description?: string;
      tags?: string[];
      category?: string;
    };
    content: string;
  };
  headings: Array<{
    level: number;
    text: string;
    slug: string;
  }>;
}

export default function BlogPostView({ post, headings }: BlogPostViewProps) {
  return (
    <>
      {/* 阅读进度条 */}
      <ReadingProgress />
      
      <article className="py-6 min-h-screen">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回博客列表
        </Link>
        
        <div>
          <div>
            <header className="mb-10">
              <h1 className="text-4xl font-bold mb-4">{post.frontmatter.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <time className="text-muted-foreground">
                  {new Date(post.frontmatter.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                
                {post.frontmatter.category && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Link href={`/blog?category=${encodeURIComponent(post.frontmatter.category)}`}>
                      <Badge variant="secondary">{post.frontmatter.category}</Badge>
                    </Link>
                  </>
                )}
              </div>
              
              {post.frontmatter.description && (
                <p className="mt-4 text-lg text-muted-foreground">
                  {post.frontmatter.description}
                </p>
              )}
              
              {/* 移动端目录 */}
              <div className="mt-6">
                <MobileTableOfContents headings={headings} maxLevel={3} />
              </div>
            </header>
            
            {/* Markdown内容 */}
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={post.content} />
            </div>
            
            {/* 文章标签 */}
            {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t">
                <h3 className="text-sm font-medium mb-3">标签:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.frontmatter.tags.map(tag => (
                    <Link 
                      key={tag} 
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                    >
                      <Badge variant="outline">{tag}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* 固定目录 */}
          <FixedTocContainer headings={headings} maxLevel={3} />
        </div>
      </article>
    </>
  );
}