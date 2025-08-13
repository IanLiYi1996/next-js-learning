'use client';

import type { Session } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bot, Settings, User, LogOut } from 'lucide-react';
import { handleSignOut } from '@/lib/actions';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface MainPageProps {
  session: Session;
  children?: React.ReactNode;
}

// Navigation items
const navItems = [
  {
    title: '首页',
    href: '/',
    icon: Home,
  },
  {
    title: 'Agent Gallery',
    href: '/agents',
    icon: Bot,
  },
  {
    title: '设置',
    href: '/settings',
    icon: Settings,
  },
  {
    title: '个人资料',
    href: '/profile',
    icon: User,
  },
];

export default function MainPage({ session, children }: MainPageProps) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar collapsible="offcanvas">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <span className="font-semibold">AI Assistant</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        asChild
                        isActive={pathname === item.href}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-3 px-2 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ''} />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0) || 
                       session.user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">
                      {session.user?.name || session.user?.email}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {session.user?.email}
                    </span>
                  </div>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <form action={handleSignOut} className="w-full">
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    退出登录
                  </Button>
                </form>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-xl font-semibold">
              {navItems.find(item => item.href === pathname)?.title || '首页'}
            </h1>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-7xl">
              {children || (
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                  <div className="aspect-video rounded-xl bg-muted/50 p-4">
                    <h3 className="text-lg font-medium mb-2">欢迎回来</h3>
                    <p className="text-sm text-muted-foreground">
                      欢迎使用 AI Assistant，您可以通过侧边栏导航到不同的功能模块。
                    </p>
                  </div>
                  <div className="aspect-video rounded-xl bg-muted/50 p-4">
                    <h3 className="text-lg font-medium mb-2">快速开始</h3>
                    <p className="text-sm text-muted-foreground">
                      点击左侧的 &ldquo;Agent Gallery&rdquo; 查看可用的 AI 代理，或访问设置页面配置您的偏好。
                    </p>
                  </div>
                  <div className="aspect-video rounded-xl bg-muted/50 p-4">
                    <h3 className="text-lg font-medium mb-2">用户信息</h3>
                    <p className="text-sm text-muted-foreground">
                      当前用户: {session.user?.name || session.user?.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}