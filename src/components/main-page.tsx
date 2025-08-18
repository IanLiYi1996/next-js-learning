'use client';

import type { Session } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bot, Settings, User, LogOut, BookOpen, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { useTranslations } from '@/hooks/use-translations';
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
const getNavItems = (t: (key: string) => string) => [
  {
    title: t('nav.home'),
    href: '/',
    icon: Home,
  },
  {
    title: t('nav.dashboard'),
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: t('nav.blog'),
    href: '/blog',
    icon: BookOpen,
  },
  {
    title: t('nav.agents'),
    href: '/agents',
    icon: Bot,
  },
  {
    title: t('nav.settings'),
    href: '/settings',
    icon: Settings,
  },
  {
    title: t('nav.profile'),
    href: '/profile',
    icon: User,
  },
];

export default function MainPage({ session, children }: MainPageProps) {
  const pathname = usePathname();
  const { t } = useTranslations();
  const navItems = getNavItems(t);

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
                    <p>{t('actions.toggleSidebar')}</p>
                  </TooltipContent>
                </Tooltip>
                <span className="font-semibold group-data-[collapsible=icon]:hidden">{t('nav.aiAssistant')}</span>
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
                        className="pl-4 group-data-[collapsible=icon]:!pl-4"
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
              {/* Theme toggle control */}
              <SidebarMenuItem>
                <div className="flex items-center justify-start gap-3 pl-4 pr-2 py-1.5 group-data-[collapsible=icon]:!pl-3">
                  <div className="flex-shrink-0">
                    <ThemeToggle />
                  </div>
                  <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                    {t('actions.changeTheme')}
                  </span>
                </div>
              </SidebarMenuItem>
              
              {/* Language switcher control */}
              <SidebarMenuItem>
                <div className="flex items-center justify-start gap-3 pl-4 pr-2 py-1.5 group-data-[collapsible=icon]:!pl-3">
                  <div className="flex-shrink-0">
                    <LocaleSwitcher />
                  </div>
                  <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                    {t('actions.changeLanguage')}
                  </span>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                <Separator className="my-2" />
              </SidebarMenuItem>
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
                    {t('actions.logout')}
                  </Button>
                </form>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <div className="flex-1 overflow-auto pt-4 px-4">
            <div className="mx-auto h-full max-w-4xl pt-2">
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