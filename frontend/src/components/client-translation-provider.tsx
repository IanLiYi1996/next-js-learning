'use client';

import React from 'react';
import { useTranslations } from '@/hooks/use-translations';

interface Props {
  render: (t: (key: string) => string) => React.ReactNode;
}

/**
 * 客户端翻译提供程序组件
 * 在服务器组件中使用 ClientTranslationProvider 可以访问翻译功能
 * 
 * 使用示例：
 * ```tsx
 * // 在服务器组件中
 * <ClientTranslationProvider
 *   render={(t) => (
 *     <h1>{t('blog.title')}</h1>
 *   )}
 * />
 * ```
 */
export default function ClientTranslationProvider({ render }: Props) {
  const { t } = useTranslations();
  return <>{render(t)}</>;
}