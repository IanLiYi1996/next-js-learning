'use client';

import type { Session } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bot, Settings, User, LogOut, BookOpen } from 'lucide-react';
import { handleSignOut } from '@/lib/actions';
import Chat from '@/components/chat';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    title: '博客',
    href: '/blog',
    icon: BookOpen,
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
      <TooltipProvider>
        <div className="min-h-screen flex w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarTrigger className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors group-data-[collapsible=icon]:p-0">
                      <Bot className="h-4 w-4" />
                    </SidebarTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>切换侧边栏 (⌘B / Ctrl+B)</p>
                  </TooltipContent>
                </Tooltip>
                <span className="font-semibold group-data-[collapsible=icon]:hidden">AI Assistant</span>
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>收起侧边栏 (⌘B / Ctrl+B)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
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
                        tooltip={item.title}
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
                <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ''} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0) || 
                           session.user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="group-data-[collapsible=icon]:block hidden">
                      <p>{session.user?.name || session.user?.email}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium truncate">
                      {session.user?.name || session.user?.email}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {session.user?.email}
                    </span>
                  </div>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
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

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background relative z-40">
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="-ml-1 hover:bg-accent hover:text-accent-foreground transition-colors relative z-50" />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>切换侧边栏 (⌘B / Ctrl+B)</p>
              </TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-xl font-semibold">
              {navItems.find(item => pathname.startsWith(item.href) && item.href !== '/' || pathname === item.href)?.title || '首页'}  
            </h1>
            {/* <div className="ml-auto">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                快捷键: ⌘B / Ctrl+B
              </span>
            </div> */}
          </header>
          
          <div className="flex-1 overflow-auto">
            <div className="mx-auto h-full max-w-4xl">
              {children || (
                <div className="h-full">
                  <Chat />
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}