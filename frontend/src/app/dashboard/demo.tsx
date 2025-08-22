"use client";

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from '@/hooks/use-translations';
import Dashboard from '@/components/ui/dashboard-with-collapsible-sidebar';

export default function DashboardDemo() {
  const { setTheme } = useTheme();
  const { setLocale } = useTranslations();
  
  // This demo component allows quick testing of the dashboard
  // with different themes and languages
  
  useEffect(() => {
    // The dashboard will automatically use whatever theme
    // and locale are currently set in the app
    console.log('Dashboard demo loaded');
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="p-4 bg-gray-100 dark:bg-gray-900 border-b flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard Demo</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setTheme('light')}
            className="px-3 py-1 bg-white border rounded text-sm"
          >
            Light Theme
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className="px-3 py-1 bg-gray-800 text-white border rounded text-sm"
          >
            Dark Theme
          </button>
          <button 
            onClick={() => setLocale('en')}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            English
          </button>
          <button 
            onClick={() => setLocale('zh')}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            中文
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Dashboard />
      </div>
    </div>
  );
}