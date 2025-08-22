'use client';

import { useCallback } from 'react';
import { useLocale } from '@/lib/i18n/locale-context';
import { translations, TranslationKeys, defaultLocale } from '@/lib/i18n/translations';

// 获取嵌套对象中的值，支持点表示法（例如：'blog.title'）
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  return keys.reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, obj) as string;
}

// 翻译功能接口
export interface TranslationUtils {
  // 获取翻译文本
  t: (key: string) => string;
  // 当前激活的语言
  locale: string;
  // 切换语言
  setLocale: (locale: 'zh' | 'en') => void;
  // 格式化日期
  formatDate: (dateString: string) => string;
}

/**
 * 使用翻译的自定义Hook
 * 
 * 使用示例：
 * ```tsx
 * const { t, locale } = useTranslations();
 * return <h1>{t('blog.title')}</h1>;
 * ```
 */
export function useTranslations(): TranslationUtils {
  const { locale, setLocale } = useLocale();
  const currentTranslations = translations[locale] || translations[defaultLocale];
  
  // 获取翻译文本
  const t = useCallback((key: string): string => {
    // 对于非点表示法的简单键，直接尝试访问
    if (!key.includes('.')) {
      return (currentTranslations as any)[key] || key;
    }
    
    // 对于点表示法的复杂键，使用辅助函数获取嵌套值
    const value = getNestedValue(currentTranslations, key);
    
    // 如果找不到翻译，返回键名本身
    return value !== undefined ? value : key;
  }, [currentTranslations]);
  
  // 格式化日期为本地化格式
  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // 根据当前语言选择不同的日期格式
      if (locale === 'zh') {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }, [locale]);
  
  return {
    t,
    locale,
    setLocale,
    formatDate
  };
}