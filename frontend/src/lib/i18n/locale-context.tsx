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
  // 初始化区域设置
  // 始终使用传入的默认语言或全局默认语言作为初始状态
  // 这确保了服务器端和客户端初始渲染一致
  const [locale, setLocaleState] = React.useState<Locale>(
    userDefaultLocale || defaultLocale
  );
  
  // 在客户端挂载后，再根据用户偏好更新语言设置
  // 只在组件挂载时运行一次，初始化客户端区域设置
  // 我们使用 ref 来防止多次执行客户端初始化逻辑
  const initializedRef = React.useRef(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !initializedRef.current) {
      initializedRef.current = true;
      
      // 尝试从localStorage获取
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (savedLocale && (savedLocale === 'zh' || savedLocale === 'en')) {
        setLocaleState(savedLocale);
        return;
      }
      
      // 如果localStorage中没有，则使用浏览器语言
      const browserLocale = getBrowserLocale();
      if (browserLocale !== locale) {
        setLocaleState(browserLocale);
      }
    }
  }, [locale]);

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