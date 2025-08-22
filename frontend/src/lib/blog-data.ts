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
          <Link href={\`/blog/\${post.slug}\`} key={post.slug}>
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
  },
  'next-js-authentication': {
    content: `---
title: "Next.js认证系统实现"
date: "2024-08-15"
description: "详解如何在Next.js 15中实现现代化的用户认证系统"
tags: ["Next.js", "认证", "Auth.js", "安全"]
category: "新闻"
---

# Next.js认证系统实现指南

在现代Web应用中，认证是一个核心功能。本文将详细介绍如何在Next.js 15中实现一个完整的认证系统，使用Auth.js（原NextAuth.js）。

## 为什么选择Auth.js?

Auth.js是Next.js生态系统中最受欢迎的认证解决方案，提供了以下优势：

- 简单的API，易于集成
- 支持多种认证提供商（OAuth, 邮箱, 凭证等）
- 基于JWT或数据库的会话管理
- 内置CSRF保护
- 自动刷新令牌

## 安装必要依赖

首先，让我们安装必要的依赖：

\`\`\`bash
npm install next-auth@beta
\`\`\`

## 基础配置

在Next.js 15中，Auth.js的配置方式有所变化。首先创建一个配置文件：

\`\`\`typescript
// app/auth.config.ts
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    }),
    Credentials({
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        // 实现您的认证逻辑
        const user = await validateUserCredentials(
          credentials.email, 
          credentials.password
        )
        return user
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // 初次登录时，将用户信息添加到token
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // 将token中的信息传递到session
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  }
} satisfies NextAuthConfig

// 示例用户验证函数
async function validateUserCredentials(email: string, password: string) {
  // 实际应用中，这里应该查询数据库并验证密码
  if (email === "admin@example.com" && password === "adminpassword") {
    return {
      id: "1",
      name: "管理员",
      email,
      role: "admin"
    }
  }
  return null
}
\`\`\`

## 创建Auth.js处理程序

接下来，创建Auth.js的API处理程序：

\`\`\`typescript
// app/auth.ts
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { 
  handlers: { GET, POST },
  auth, 
  signIn, 
  signOut 
} = NextAuth(authConfig)
\`\`\`

## 添加认证路由

创建认证API路由：

\`\`\`typescript
// app/api/auth/[...nextauth]/route.ts
export { GET, POST } from "@/app/auth"
\`\`\`

## 创建登录页面

为了提供自定义的登录体验，创建登录页面：

\`\`\`tsx
// app/auth/signin/page.tsx
import { getProviders } from "next-auth/react"
import SignInForm from "@/components/auth/sign-in-form"

export default async function SignInPage() {
  const providers = await getProviders()
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div>
          <h1 className="text-center text-3xl font-extrabold">登录您的账号</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            或{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              注册新账号
            </a>
          </p>
        </div>
        
        <SignInForm providers={providers} />
      </div>
    </div>
  )
}
\`\`\`

## 创建登录表单组件

\`\`\`tsx
// components/auth/sign-in-form.tsx
"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function SignInForm({ providers }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      if (result.error) {
        setError("登录失败，请检查您的凭据")
      }
    } catch (error) {
      setError("发生错误，请稍后再试")
    }
    
    setIsLoading(false)
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            电子邮箱
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            密码
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          {isLoading ? "登录中..." : "登录"}
        </button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">或通过社交账号登录</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.values(providers || {})
          .filter((provider) => provider.id !== "credentials")
          .map((provider) => (
            <button
              key={provider.id}
              onClick={() => signIn(provider.id)}
              className="flex items-center justify-center rounded border border-gray-300 bg-white px-4 py-2 text-sm"
            >
              {provider.name}
            </button>
          ))}
      </div>
    </div>
  )
}
\`\`\`

## 使用中间件保护路由

创建一个中间件来保护需要认证的路由：

\`\`\`typescript
// middleware.ts
import { auth } from "@/app/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth()
  
  // 检查用户是否已认证
  if (!session) {
    const url = new URL("/auth/signin", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  
  // 检查用户角色（可选）
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    session.user.role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }
  
  return NextResponse.next()
}

// 指定哪些路由应该被中间件处理
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"],
}
\`\`\`

## 客户端访问认证状态

在客户端组件中，您可以使用useSession钩子访问认证状态：

\`\`\`tsx
"use client"

import { useSession } from "next-auth/react"

export default function ProfileButton() {
  const { data: session, status } = useSession()
  
  if (status === "loading") {
    return <div>加载中...</div>
  }
  
  if (status === "unauthenticated") {
    return <div>请先登录</div>
  }
  
  return (
    <div>
      <p>欢迎, {session.user.name}</p>
      <button onClick={() => signOut()}>退出登录</button>
    </div>
  )
}
\`\`\`

## 服务器端访问认证状态

在服务器组件中，您可以直接使用auth函数：

\`\`\`tsx
import { auth } from "@/app/auth"

export default async function Dashboard() {
  const session = await auth()
  
  if (!session) {
    // 这不应该发生，因为中间件已经处理了认证
    // 但作为额外的安全措施
    redirect("/auth/signin")
  }
  
  return (
    <div>
      <h1>控制面板</h1>
      <p>欢迎回来, {session.user.name}</p>
      {/* 控制面板内容 */}
    </div>
  )
}
\`\`\`

## 集成数据库

对于生产环境，您通常需要将Auth.js与数据库集成。这里是使用Prisma的例子：

\`\`\`typescript
// 首先，安装Prisma
// npm install prisma @prisma/client
// npx prisma init

// 然后，在schema.prisma中定义模型
// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
// }
// 
// model User {
//   id        String    @id @default(cuid())
//   name      String?
//   email     String?   @unique
//   password  String?
//   image     String?
//   role      String    @default("user")
//   accounts  Account[]
//   sessions  Session[]
// }
// 
// model Account {
//   id                 String  @id @default(cuid())
//   userId             String
//   type               String
//   provider           String
//   providerAccountId  String
//   refresh_token      String?  @db.Text
//   access_token       String?  @db.Text
//   expires_at         Int?
//   token_type         String?
//   scope              String?
//   id_token           String?  @db.Text
//   session_state      String?
//   user User @relation(fields: [userId], references: [id], onDelete: Cascade)
//   @@unique([provider, providerAccountId])
// }
// 
// model Session {
//   id           String   @id @default(cuid())
//   sessionToken String   @unique
//   userId       String
//   expires      DateTime
//   user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
// }

// 接下来，更新auth.config.ts以使用Prisma适配器
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  // ... 其他配置
} satisfies NextAuthConfig
\`\`\`

## 多因素认证（MFA）

对于更高级别的安全性，您可以实现多因素认证：

\`\`\`typescript
// 添加额外的验证逻辑
async function authorize(credentials, req) {
  // 首先验证用户名和密码
  const user = await validateUserCredentials(
    credentials.email,
    credentials.password
  )
  
  if (!user) return null
  
  // 检查是否启用了MFA
  if (user.mfaEnabled) {
    // 验证MFA令牌
    const isValidToken = await validateMFAToken(
      user.id, 
      credentials.mfaToken
    )
    
    if (!isValidToken) {
      // 返回需要MFA的错误
      throw new Error("MFA_REQUIRED")
    }
  }
  
  return user
}
\`\`\`

## 总结

通过以上步骤，我们实现了一个功能完整的认证系统，包括：

- 多种认证方式支持（社交登录和凭证）
- 自定义登录页面
- 路由保护
- 基于角色的访问控制
- 数据库集成
- 服务端和客户端认证状态访问

这个认证系统符合现代Web应用的安全需求，同时提供了良好的用户体验。在实际应用中，您可能还需要添加邮件验证、密码重置等功能。`
  }
};
