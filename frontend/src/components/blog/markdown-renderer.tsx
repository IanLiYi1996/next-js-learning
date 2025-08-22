'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

// 定义代码块组件
const CodeBlock = ({ node, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  
  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="px-2 py-1 text-xs bg-primary/20 hover:bg-primary/30 rounded text-primary-foreground transition-colors"
          onClick={() => {
            navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
          }}
        >
          复制
        </button>
      </div>
      {language && (
        <div className="absolute top-3 left-3 text-xs text-muted-foreground bg-muted/80 px-2 py-1 rounded shadow-sm">
          {language}
        </div>
      )}
      <pre className={cn("pt-10 px-4 pb-4 overflow-x-auto rounded-lg mt-6 bg-muted text-muted-foreground", className)} {...props}>
        <code className={cn("text-sm", className)} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

// 组件props类型定义
interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Markdown渲染器组件
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: true }]]}
      components={{
        // 根元素添加类名
        root: ({ node, ...props }) => <div className={cn("prose prose-lg dark:prose-invert max-w-none", className)} {...props} />,
        // 自定义标题渲染，添加锚点ID
        h2: ({ node, children, ...props }) => {
          const id = children
            ? String(children)
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\u4e00-\u9fa5-]/g, '')
            : '';
          return (
            <h2 id={id} className="scroll-m-20 group flex items-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0" {...props}>
              <a 
                href={`#${id}`} 
                className="absolute -ml-6 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              >
                #
              </a>
              {children}
            </h2>
          );
        },
        h3: ({ node, children, ...props }) => {
          const id = children
            ? String(children)
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\u4e00-\u9fa5-]/g, '')
            : '';
          return (
            <h3 id={id} className="scroll-m-20 group flex items-center text-2xl font-semibold tracking-tight" {...props}>
              <a 
                href={`#${id}`} 
                className="absolute -ml-5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              >
                #
              </a>
              {children}
            </h3>
          );
        },
        h4: ({ node, children, ...props }) => {
          const id = children
            ? String(children)
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\u4e00-\u9fa5-]/g, '')
            : '';
          return (
            <h4 id={id} className="scroll-m-20 group flex items-center" {...props}>
              <a 
                href={`#${id}`} 
                className="absolute -ml-5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              >
                #
              </a>
              {children}
            </h4>
          );
        },
        // 自定义代码块渲染
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return !match ? (
            <code className={cn("bg-muted rounded px-1.5 py-0.5", className)} {...props}>
              {children}
            </code>
          ) : (
            <CodeBlock node={node} className={className} {...props}>
              {children}
            </CodeBlock>
          );
        },
        // 自定义图片渲染
        img: ({ node, alt, src, ...props }) => (
          <div className="flex flex-col items-center my-8">
            <img
              src={src}
              alt={alt || ''}
              className="rounded-lg max-h-[500px] object-contain"
              {...props}
            />
            {alt && <p className="text-sm text-muted-foreground mt-2">{alt}</p>}
          </div>
        ),
        // 自定义表格样式
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">{children}</table>
          </div>
        ),
        // 自定义链接样式
        a: ({ node, href, children, ...props }) => {
          const isExternal = href?.startsWith('http');
          return (
            <a
              href={href}
              className="text-primary underline-offset-4 hover:underline"
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              {...props}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;