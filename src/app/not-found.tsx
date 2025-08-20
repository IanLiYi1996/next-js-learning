'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';

export default function NotFound() {
  const { locale } = useTranslations();
  
  return (
    <div className="container flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-4">
        {locale === 'zh' ? '页面未找到' : 'Page Not Found'}
      </h1>
      <p className="text-muted-foreground mb-8">
        {locale === 'zh' 
          ? '很抱歉，您请求的页面不存在或已被移动。' 
          : 'Sorry, the page you are looking for does not exist or has been moved.'}
      </p>
      <Button asChild>
        <Link href="/">
          {locale === 'zh' ? '返回首页' : 'Return to Home'}
        </Link>
      </Button>
    </div>
  );
}