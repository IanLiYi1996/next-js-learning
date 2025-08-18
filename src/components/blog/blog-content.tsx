'use client';

import React from 'react';
import PostCard from '@/components/blog/post-card';
import BlogDisplayCards from '@/components/blog/blog-display-cards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ClientTranslationProvider from '@/components/client-translation-provider';
import { Post } from '@/lib/blog-data';
import Link from 'next/link';

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
  // Check if we're on the main blog page (no filters)
  const isMainBlogPage = !category && !tag;
  
  return (
    <ClientTranslationProvider 
      render={(t) => (
        <>
          <h1 className="text-3xl font-bold mb-8">{t('blog.title')}</h1>
          
          {/* Display featured section only on the main blog page */}
          {isMainBlogPage && posts.length >= 3 && (
            <div className="mb-16">
              <BlogDisplayCards posts={posts} />
            </div>
          )}
          
          {/* 分类和标签过滤 */}
          <div className="mb-8">
            <Tabs defaultValue="categories" className="w-full">
              <TabsList>
                <TabsTrigger value="categories">{t('blog.categories')}</TabsTrigger>
                <TabsTrigger value="tags">{t('blog.tags')}</TabsTrigger>
              </TabsList>
              <TabsContent value="categories" className="mt-4">
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href="/blog"
                    className={`inline-flex items-center rounded-md px-3 py-1 text-sm 
                      ${!category ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                  >
                    {t('blog.all')}
                  </Link>
                  {categories.map((cat) => (
                    <Link 
                      key={cat} 
                      href={`/blog?category=${encodeURIComponent(cat)}`}
                      className={`inline-flex items-center rounded-md px-3 py-1 text-sm 
                        ${category === cat ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="tags" className="mt-4">
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href="/blog"
                    className={`inline-flex items-center rounded-md px-3 py-1 text-sm 
                      ${!tag ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                  >
                    {t('blog.all')}
                  </Link>
                  {tags.map((tagItem) => (
                    <Link 
                      key={tagItem} 
                      href={`/blog?tag=${encodeURIComponent(tagItem)}`}
                      className={`inline-flex items-center rounded-md px-3 py-1 text-sm 
                        ${tag === tagItem ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                    >
                      {tagItem}
                    </Link>
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
                  <Link href="/blog" className="ml-1 hover:text-primary">×</Link>
                </Badge>
              )}
              {tag && (
                <Badge variant="secondary" className="gap-1">
                  {t('blog.tag')}: {tag}
                  <Link href="/blog" className="ml-1 hover:text-primary">×</Link>
                </Badge>
              )}
            </div>
          )}
          
          {/* 文章列表 - Skip the first 3 posts on main page since they're in the featured section */}
          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(isMainBlogPage ? posts.slice(3) : posts).map((post) => (
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