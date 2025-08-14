// 这是一个服务器端文件，不需要'use client'指令

// 博客文章的类型定义
export interface PostFrontmatter {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  category?: string;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
}

// 示例博客数据
// 在实际项目中，这些数据可以从API获取或使用getStaticProps在构建时获取
export const BLOG_POSTS: Record<string, { content: string }> = {
  'getting-started': {
    content: `---
title: "Next.js博客入门指南"
date: "2024-08-14"
description: "学习如何使用Next.js创建一个现代化的博客平台"
tags: ["Next.js", "React", "博客"]
category: "教程"
---

# Next.js博客入门指南

在这篇文章中，我们将学习如何使用Next.js构建一个现代化的博客平台。

## 为什么选择Next.js？

Next.js是一个基于React的框架，为开发者提供了许多强大的功能：

- **服务端渲染(SSR)** - 提升页面加载速度和SEO表现
- **静态站点生成(SSG)** - 预渲染页面，进一步提升性能
- **文件系统路由** - 简化路由配置
- **API路由** - 轻松创建API端点
- **内置CSS支持** - 多种样式解决方案

## 项目设置

首先，我们需要创建一个新的Next.js项目：

\`\`\`bash
npx create-next-app@latest my-blog
cd my-blog
\`\`\`

### 安装必要依赖

对于一个Markdown博客，我们需要以下包：

\`\`\`bash
npm install react-markdown gray-matter rehype-highlight remark-gfm
\`\`\`

## 创建博客数据结构

一个典型的博客数据结构如下：

\`\`\`
/content
  /blog
    post-1.md
    post-2.md
    ...
\`\`\`

### Markdown前置元数据

每个Markdown文件应该包含前置元数据：

\`\`\`markdown
---
title: "文章标题"
date: "2024-01-01"
description: "文章描述"
tags: ["标签1", "标签2"]
---

文章内容...
\`\`\`

## 博客功能实现

### 1. 读取博客文章

我们需要创建一个服务来读取和解析Markdown文件：

\`\`\`typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, \`\${realSlug}.md\`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  const { data, content } = matter(fileContents);
  
  return { 
    slug: realSlug, 
    frontmatter: data, 
    content 
  };
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .sort((post1, post2) => 
      (new Date(post1.frontmatter.date) > new Date(post2.frontmatter.date) ? -1 : 1)
    );
  
  return posts;
}
\`\`\`

### 2. 创建博客列表页

\`\`\`typescript
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export default function BlogPage() {
  const posts = getAllPosts();
  
  return (
    <div>
      <h1>博客</h1>
      <div className="grid gap-4">
        {posts.map((post) => (
          <Link href={{\`/blog/\${post.slug}\`}} key={post.slug}>
            <div className="border p-4 rounded hover:bg-gray-50">
              <h2>{post.frontmatter.title}</h2>
              <p>{post.frontmatter.description}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.frontmatter.date).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
\`\`\`

### 3. 创建博客详情页

\`\`\`typescript
import { getPostBySlug, getPostSlugs } from '@/lib/blog';
import MarkdownRenderer from '@/components/blog/markdown-renderer';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  
  return (
    <article>
      <h1>{post.frontmatter.title}</h1>
      <p className="text-gray-500">
        {new Date(post.frontmatter.date).toLocaleDateString()}
      </p>
      <div className="prose">
        <MarkdownRenderer content={post.content} />
      </div>
    </article>
  );
}

export function generateStaticParams() {
  const posts = getPostSlugs();
  return posts.map((slug) => ({
    slug: slug.replace(/\.md$/, ''),
  }));
}
\`\`\`

## 添加目录功能

为了创建一个自动生成的目录，我们可以使用以下方法：

1. 解析Markdown中的标题
2. 生成锚点链接
3. 创建目录组件

\`\`\`typescript
function extractHeadings(content: string) {
  const headingRegex = /^(#{2,4})\\s+(.+)$/gm;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const slug = text.toLowerCase().replace(/\\s+/g, '-');
    
    headings.push({ level, text, slug });
  }
  
  return headings;
}
\`\`\`

## 样式优化

通过定制Tailwind CSS，我们可以创建优美的博客样式：

\`\`\`js
// tailwind.config.js
module.exports = {
  // ...
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            code: {
              backgroundColor: 'var(--tw-prose-pre-bg)',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
\`\`\`

## 结论

通过以上步骤，我们已经成功创建了一个使用Next.js的现代博客平台。这个平台具有以下特性：

- Markdown内容支持
- 自动生成目录
- 代码高亮
- 响应式设计
- 优化的SEO表现

接下来，你可以添加更多功能，如评论系统、搜索功能或分类页面。`
  },
  'advanced-markdown-features': {
    content: `---
title: "Markdown高级特性指南"
date: "2024-08-13"
description: "学习如何在博客中使用Markdown的高级特性"
tags: ["Markdown", "教程", "排版"]
category: "技巧"
---

# Markdown高级特性指南

Markdown是一种轻量级标记语言，让我们能够使用易读易写的纯文本格式编写文档，然后转换成结构化的HTML。在这篇文章中，我们将探索Markdown的一些高级特性。

## 基础语法回顾

在深入高级特性之前，让我们快速回顾一下基础语法：

\`\`\`markdown
# 一级标题
## 二级标题
### 三级标题

**粗体文本**
*斜体文本*
~~删除线~~

- 无序列表项
- 另一个列表项

1. 有序列表项
2. 第二个项目

[链接文本](https://example.com)
![图片描述](图片路径.jpg)

> 这是一段引用
\`\`\`

## 代码块与语法高亮

Markdown支持代码块和语法高亮，特别适合技术博客：

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
  return true;
}
\`\`\`

\`\`\`css
.blog-post {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  max-width: 65ch;
}
\`\`\`

\`\`\`python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b
\`\`\`

## 表格

Markdown允许创建表格：

| 名称 | 类型 | 描述 |
|------|------|------|
| id | string | 唯一标识符 |
| title | string | 文章标题 |
| content | string | 文章内容 |
| created_at | date | 创建时间 |

## 任务列表

你可以创建任务列表：

- [x] 项目设计
- [x] 基础功能实现
- [ ] 高级特性开发
- [ ] 测试与部署

## 脚注

Markdown支持脚注[^1]，可以用来添加引用或额外解释。

[^1]: 这是一个脚注示例。

## 数学公式

使用LaTeX语法，我们可以在Markdown中渲染数学公式：

内联公式: $E = mc^2$

块级公式:

$$
\\frac{n!}{k!(n-k)!} = \\binom{n}{k}
$$

## 图表（使用Mermaid）

一些Markdown渲染器支持Mermaid图表：

\`\`\`mermaid
flowchart LR
    A[开始] --> B{是否登录?}
    B -->|是| C[进入首页]
    B -->|否| D[显示登录页]
    D --> E[用户登录]
    E --> C
\`\`\`

## 目录

许多Markdown处理器支持自动生成目录（TOC）：

[TOC]

## 自定义容器

某些Markdown扩展支持自定义容器：

::: tip
这是一个提示容器
:::

::: warning
这是一个警告容器
:::

::: danger
这是一个危险警告容器
:::

## 使用HTML

Markdown允许直接使用HTML，这在某些情况下非常有用：

<div style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #4CAF50;">
  这是一个使用HTML创建的自定义样式块。
</div>

## 折叠块

<details>
<summary>点击展开更多内容</summary>

这里是被折叠的内容，可以包含任何Markdown元素。

- 列表项1
- 列表项2
- 列表项3

</details>

## 视频嵌入

使用HTML，你可以在Markdown中嵌入视频：

<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

## 结论

通过本文介绍的这些高级特性，你可以大大提升你的Markdown文档的表现力和交互性。在博客平台中充分利用这些特性，可以为读者提供更加丰富和吸引人的阅读体验。

## 参考资料

- [CommonMark](https://commonmark.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [Markdown Guide](https://www.markdownguide.org/)`
  }
};