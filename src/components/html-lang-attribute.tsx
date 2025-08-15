'use client';

import { useEffect } from 'react';
import { useLocale } from '@/lib/i18n/locale-context';

/**
 * 动态更新HTML的lang属性以匹配当前语言
 * 必须放在客户端组件中，因为需要使用useLocale hook
 */
export default function HtmlLangAttribute() {
  const { locale } = useLocale();
  
  useEffect(() => {
    // 更新HTML元素的lang属性
    document.documentElement.lang = locale;
  }, [locale]);
  
  // 这个组件不渲染任何内容
  return null;
}