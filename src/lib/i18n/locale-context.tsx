'use client';

import * as React from 'react';
import { type Locale, defaultLocale, getBrowserLocale } from './translations';

const LOCALE_STORAGE_KEY = 'next-js-learning-locale';

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

// 创建上下文
export const LocaleContext = React.createContext<LocaleContextType | undefined>(undefined);

export interface LocaleProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export function LocaleProvider({
  children,
  defaultLocale: userDefaultLocale,
}: LocaleProviderProps) {
  // 初始化区域设置，优先级：localStorage > 浏览器语言 > 默认语言
  const [locale, setLocaleState] = React.useState<Locale>(() => {
    // 在服务器端直接使用默认语言
    if (typeof window === 'undefined') {
      return userDefaultLocale || defaultLocale;
    }
    
    // 尝试从localStorage获取
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (savedLocale && (savedLocale === 'zh' || savedLocale === 'en')) {
      return savedLocale;
    }
    
    // 使用浏览器语言或默认语言
    return getBrowserLocale();
  });

  // 设置区域并保存到localStorage
  const setLocale = React.useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  }, []);

  // 监听localStorage变化（多标签页支持）
  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCALE_STORAGE_KEY && event.newValue) {
        const newLocale = event.newValue as Locale;
        if (newLocale === 'zh' || newLocale === 'en') {
          setLocaleState(newLocale);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const contextValue = React.useMemo(() => {
    return { locale, setLocale };
  }, [locale, setLocale]);

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

// 自定义Hook用于获取区域设置上下文
export function useLocale() {
  const context = React.useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}