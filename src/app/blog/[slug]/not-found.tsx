import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BlogNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-4">文章未找到</h1>
      <p className="text-muted-foreground mb-8">
        很抱歉，您请求的博客文章不存在或已被删除。
      </p>
      <Button asChild>
        <Link href="/blog">返回博客列表</Link>
      </Button>
    </div>
  );
}