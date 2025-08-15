/**
 * 多语言翻译文件
 * 包含应用中所有UI元素的翻译
 */

export type Locale = 'zh' | 'en';

export type TranslationKeys = {
  nav: {
    home: string;
    blog: string;
    agents: string;
    settings: string;
    profile: string;
    aiAssistant: string;
  };
  actions: {
    logout: string;
    toggleSidebar: string;
    collapseSidebar: string;
  };
  blog: {
    title: string;
    categories: string;
    tags: string;
    all: string;
    filterBy: string;
    category: string;
    tag: string;
    noResults: string;
    readMore: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
  };
};

export const translations: Record<Locale, TranslationKeys> = {
  zh: {
    nav: {
      home: "首页",
      blog: "博客",
      agents: "Agent Gallery",
      settings: "设置",
      profile: "个人资料",
      aiAssistant: "AI Assistant"
    },
    actions: {
      logout: "退出登录",
      toggleSidebar: "切换侧边栏 (⌘B / Ctrl+B)",
      collapseSidebar: "收起侧边栏 (⌘B / Ctrl+B)"
    },
    blog: {
      title: "博客",
      categories: "分类",
      tags: "标签",
      all: "全部",
      filterBy: "筛选条件",
      category: "分类",
      tag: "标签",
      noResults: "没有找到符合条件的文章",
      readMore: "阅读更多"
    },
    common: {
      loading: "加载中...",
      error: "发生错误",
      success: "操作成功"
    }
  },
  en: {
    nav: {
      home: "Home",
      blog: "Blog",
      agents: "Agent Gallery",
      settings: "Settings",
      profile: "Profile",
      aiAssistant: "AI Assistant"
    },
    actions: {
      logout: "Log Out",
      toggleSidebar: "Toggle Sidebar (⌘B / Ctrl+B)",
      collapseSidebar: "Collapse Sidebar (⌘B / Ctrl+B)"
    },
    blog: {
      title: "Blog",
      categories: "Categories",
      tags: "Tags",
      all: "All",
      filterBy: "Filtered by",
      category: "Category",
      tag: "Tag",
      noResults: "No posts found matching your criteria",
      readMore: "Read More"
    },
    common: {
      loading: "Loading...",
      error: "An error occurred",
      success: "Operation successful"
    }
  }
};

// 默认语言
export const defaultLocale: Locale = 'zh';

// 获取浏览器语言，仅在客户端使用
export const getBrowserLocale = (): Locale => {
  if (typeof window === 'undefined') return defaultLocale;
  
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('zh') ? 'zh' : 'en';
};