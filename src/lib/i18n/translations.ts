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
    dashboard: string;
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
  dashboard: {
    title: string;
    welcome: string;
    actions: {
      hide: string;
    };
    profile: {
      name: string;
      plan: string;
    };
    nav: {
      dashboard: string;
      sales: string;
      viewSite: string;
      products: string;
      tags: string;
      analytics: string;
      members: string;
      accountSection: string;
      settings: string;
      helpSupport: string;
    };
    stats: {
      sales: {
        title: string;
        change: string;
      };
      users: {
        title: string;
        change: string;
      };
      orders: {
        title: string;
        change: string;
      };
      products: {
        title: string;
        change: string;
      };
    };
    activity: {
      title: string;
      viewAll: string;
      items: {
        sale: {
          title: string;
          desc: string;
          time: string;
        };
        user: {
          title: string;
          desc: string;
          time: string;
        };
        product: {
          title: string;
          desc: string;
          time: string;
        };
        system: {
          title: string;
          desc: string;
          time: string;
        };
        notification: {
          title: string;
          desc: string;
          time: string;
        };
      };
    };
    quickStats: {
      title: string;
      conversion: {
        label: string;
      };
      bounce: {
        label: string;
      };
      pageViews: {
        label: string;
      };
    };
    topProducts: {
      title: string;
    }
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
      aiAssistant: "AI Assistant",
      dashboard: "仪表盘"
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
    },
    dashboard: {
      title: "仪表盘",
      welcome: "欢迎回到您的仪表盘",
      actions: {
        hide: "隐藏"
      },
      profile: {
        name: "用户名称",
        plan: "专业版"
      },
      nav: {
        dashboard: "仪表盘",
        sales: "销售",
        viewSite: "查看站点",
        products: "产品",
        tags: "标签",
        analytics: "分析",
        members: "成员",
        accountSection: "账户",
        settings: "设置",
        helpSupport: "帮助与支持"
      },
      stats: {
        sales: {
          title: "总销售额",
          change: "较上月"
        },
        users: {
          title: "活跃用户",
          change: "较上周"
        },
        orders: {
          title: "订单",
          change: "较昨日"
        },
        products: {
          title: "产品",
          change: "本周新增"
        }
      },
      activity: {
        title: "近期活动",
        viewAll: "查看全部",
        items: {
          sale: {
            title: "新销售记录",
            desc: "订单 #1234 已完成",
            time: "2分钟前"
          },
          user: {
            title: "新用户注册",
            desc: "john.doe@example.com 已加入",
            time: "5分钟前"
          },
          product: {
            title: "产品更新",
            desc: "iPhone 15 Pro 库存已更新",
            time: "10分钟前"
          },
          system: {
            title: "系统维护",
            desc: "计划备份已完成",
            time: "1小时前"
          },
          notification: {
            title: "新通知",
            desc: "市场活动结果",
            time: "2小时前"
          }
        }
      },
      quickStats: {
        title: "快速统计",
        conversion: {
          label: "转化率"
        },
        bounce: {
          label: "跳出率"
        },
        pageViews: {
          label: "页面浏览量"
        }
      },
      topProducts: {
        title: "热门产品"
      }
    }
  },
  en: {
    nav: {
      home: "Home",
      blog: "Blog",
      agents: "Agent Gallery",
      settings: "Settings",
      profile: "Profile",
      aiAssistant: "AI Assistant",
      dashboard: "Dashboard"
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
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome back to your dashboard",
      actions: {
        hide: "Hide"
      },
      profile: {
        name: "User Name",
        plan: "Pro Plan"
      },
      nav: {
        dashboard: "Dashboard",
        sales: "Sales",
        viewSite: "View Site",
        products: "Products",
        tags: "Tags",
        analytics: "Analytics",
        members: "Members",
        accountSection: "Account",
        settings: "Settings",
        helpSupport: "Help & Support"
      },
      stats: {
        sales: {
          title: "Total Sales",
          change: "from last month"
        },
        users: {
          title: "Active Users",
          change: "from last week"
        },
        orders: {
          title: "Orders",
          change: "from yesterday"
        },
        products: {
          title: "Products",
          change: "new this week"
        }
      },
      activity: {
        title: "Recent Activity",
        viewAll: "View all",
        items: {
          sale: {
            title: "New sale recorded",
            desc: "Order #1234 completed",
            time: "2 min ago"
          },
          user: {
            title: "New user registered",
            desc: "john.doe@example.com joined",
            time: "5 min ago"
          },
          product: {
            title: "Product updated",
            desc: "iPhone 15 Pro stock updated",
            time: "10 min ago"
          },
          system: {
            title: "System maintenance",
            desc: "Scheduled backup completed",
            time: "1 hour ago"
          },
          notification: {
            title: "New notification",
            desc: "Marketing campaign results",
            time: "2 hours ago"
          }
        }
      },
      quickStats: {
        title: "Quick Stats",
        conversion: {
          label: "Conversion Rate"
        },
        bounce: {
          label: "Bounce Rate"
        },
        pageViews: {
          label: "Page Views"
        }
      },
      topProducts: {
        title: "Top Products"
      }
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