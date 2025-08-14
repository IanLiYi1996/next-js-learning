import React from 'react';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import { getAllPosts, getAllCategories, getAllTags } from '@/lib/blog';
import PostCard from '@/components/blog/post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MainPage from '@/components/main-page';

// 该页面需要服务端渲染，因为我们需要获取认证信息
export default async function BlogListPage({
  searchParams,
}: {
  searchParams: { category?: string; tag?: string } | Promise<{ category?: string; tag?: string }>;
}) {
  // 验证用户是否已登录
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error('Auth error:', error);
    redirect('/api/auth/signin');
  }

  if (!session) {
    redirect('/api/auth/signin');
  }

  // 获取查询参数
  const params = await searchParams;
  const { category, tag } = params;
  
  // 获取所有文章
  const posts = getAllPosts({ category, tag });
  
  // 获取所有分类和标签
  const categories = getAllCategories();
  const tags = getAllTags();
  
  return (
    <MainPage session={session}>
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-8">博客</h1>
        
        {/* 分类和标签过滤 */}
        <div className="mb-8">
          <Tabs defaultValue="categories" className="w-full">
            <TabsList>
              <TabsTrigger value="categories">分类</TabsTrigger>
              <TabsTrigger value="tags">标签</TabsTrigger>
            </TabsList>
            <TabsContent value="categories" className="mt-4">
              <div className="flex flex-wrap gap-2">
                <a 
                  href="/blog"
                  className={`inline-flex items-center rounded-md px-3 py-1 text-sm 
                    ${!category ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                >
                  全部
                </a>
                {categories.map((cat) => (
                  <a 
                    key={cat} 
                    href={`/blog?category=${encodeURIComponent(cat)}`}
                    className={`inline-flex items-center rounded-md px-3 py-1 text-sm 
                      ${category === cat ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                  >
                    {cat}
                  </a>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="tags" className="mt-4">
              <div className="flex flex-wrap gap-2">
                <a 
                  href="/blog"
                  className={`inline-flex items-center rounded-md px-3 py-1 text-sm 
                    ${!tag ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                >
                  全部
                </a>
                {tags.map((t) => (
                  <a 
                    key={t} 
                    href={`/blog?tag=${encodeURIComponent(t)}`}
                    className={`inline-flex items-center rounded-md px-3 py-1 text-sm 
                      ${tag === t ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                  >
                    {t}
                  </a>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* 筛选信息 */}
        {(category || tag) && (
          <div className="mb-8 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">筛选条件:</span>
            {category && (
              <Badge variant="secondary" className="gap-1">
                分类: {category}
                <a href="/blog" className="ml-1 hover:text-primary">×</a>
              </Badge>
            )}
            {tag && (
              <Badge variant="secondary" className="gap-1">
                标签: {tag}
                <a href="/blog" className="ml-1 hover:text-primary">×</a>
              </Badge>
            )}
          </div>
        )}
        
        {/* 文章列表 */}
        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.slug}
                slug={post.slug}
                title={post.frontmatter.title}
                date={post.frontmatter.date}
                description={post.frontmatter.description}
                tags={post.frontmatter.tags}
                category={post.frontmatter.category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">没有找到符合条件的文章</p>
          </div>
        )}
      </div>
    </MainPage>
  );
}