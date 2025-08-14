import React from 'react';
import { auth } from '../../(auth)/auth';
import { redirect, notFound } from 'next/navigation';
import { getPostBySlug, getPostSlugs, extractHeadings } from '@/lib/blog';
import MainPage from '@/components/main-page';
import BlogPostView from '@/components/blog/blog-post-view';

// 生成静态路径参数
export function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: { slug: string } | Promise<{ slug: string }>
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
  
  try {
    // 获取文章内容
    const resolvedParams = await params;
    const post = getPostBySlug(resolvedParams.slug);
    
    // 从markdown内容提取标题
    const headings = extractHeadings(post.content);
    
    return (
      <MainPage session={session}>
        <BlogPostView post={post} headings={headings} />
      </MainPage>
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    return notFound();
  }
}