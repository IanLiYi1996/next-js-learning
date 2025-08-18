'use client';

import React from 'react';
import PostCard from '@/components/blog/post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ClientTranslationProvider from '@/components/client-translation-provider';
import { Post } from '@/lib/blog-data';

interface BlogContentProps {
  posts: Post[];
  categories: string[];
  tags: string[];
  category?: string;
  tag?: string;
}

export default function BlogContent({ 
  posts, 
  categories, 
  tags, 
  category, 
  tag 
}: BlogContentProps) {
  return (
    <ClientTranslationProvider 
      render={(t) => (
        <>
          <h1 className="text-3xl font-bold mb-8">{t('blog.title')}</h1>
          
          {/* 分类和标签过滤 */}
          <div className="mb-8">
            <Tabs defaultValue="categories" className="w-full">
              <TabsList>
                <TabsTrigger value="categories">{t('blog.categories')}</TabsTrigger>
                <TabsTrigger value="tags">{t('blog.tags')}</TabsTrigger>
              </TabsList>
              <TabsContent value="categories" className="mt-4">
                <div className="flex flex-wrap gap-2">
                  <a 
                    href="/blog"
                    className={`inline-flex items-center rounded-md px-3 py-1 text-sm 
                      ${!category ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                  >
                    {t('blog.all')}
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
                    {t('blog.all')}
                  </a>
                  {tags.map((tagItem) => (
                    <a 
                      key={tagItem} 
                      href={`/blog?tag=${encodeURIComponent(tagItem)}`}
                      className={`inline-flex items-center rounded-md px-3 py-1 text-sm 
                        ${tag === tagItem ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                    >
                      {tagItem}
                    </a>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* 筛选信息 */}
          {(category || tag) && (
            <div className="mb-8 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('blog.filterBy')}:</span>
              {category && (
                <Badge variant="secondary" className="gap-1">
                  {t('blog.category')}: {category}
                  <a href="/blog" className="ml-1 hover:text-primary">×</a>
                </Badge>
              )}
              {tag && (
                <Badge variant="secondary" className="gap-1">
                  {t('blog.tag')}: {tag}
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
              <p className="text-muted-foreground">{t('blog.noResults')}</p>
            </div>
          )}
        </>
      )}
    />
  );
}