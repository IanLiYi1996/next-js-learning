import React from 'react';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import { getAllPosts, getAllCategories, getAllTags } from '@/lib/blog';
import PostCard from '@/components/blog/post-card';
import MainPage from '@/components/main-page';
import BlogContent from '@/components/blog/blog-content';

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
        <BlogContent 
          posts={posts}
          categories={categories}
          tags={tags}
          category={category}
          tag={tag}
        />
      </div>
    </MainPage>
  );
}