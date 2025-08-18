"use client"
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "@/hooks/use-translations";
import {
  Home,
  DollarSign,
  Monitor,
  ShoppingCart,
  Tag,
  BarChart3,
  Users,
  ChevronDown,
  ChevronsRight,
  Moon,
  Sun,
  TrendingUp,
  Activity,
  Package,
  Bell,
  Settings,
  HelpCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Dashboard = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslations();

  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <DashboardContent />
    </div>
  );
};

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Dashboard");
  const { t } = useTranslations();

  return (
    <nav
      className={cn(
        "sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out",
        open ? 'w-64' : 'w-16',
        "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm"
      )}
    >
      <TitleSection open={open} />

      <div className="space-y-1 mb-8">
        <Option
          Icon={Home}
          title={t('dashboard.nav.dashboard')}
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={DollarSign}
          title={t('dashboard.nav.sales')}
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={3}
        />
        <Option
          Icon={Monitor}
          title={t('dashboard.nav.viewSite')}
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={ShoppingCart}
          title={t('dashboard.nav.products')}
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={Tag}
          title={t('dashboard.nav.tags')}
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={BarChart3}
          title={t('dashboard.nav.analytics')}
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={Users}
          title={t('dashboard.nav.members')}
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={12}
        />
      </div>

      {open && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('dashboard.nav.accountSection')}
          </div>
          <Option
            Icon={Settings}
            title={t('dashboard.nav.settings')}
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={HelpCircle}
            title={t('dashboard.nav.helpSupport')}
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
        </div>
      )}

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs }) => {
  const isSelected = selected === title;
  
  return (
    <button
      onClick={() => setSelected(title)}
      className={cn(
        "relative flex h-11 w-full items-center rounded-md transition-all duration-200",
        isSelected 
          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500" 
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
      )}
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>
      
      {open && (
        <span
          className={cn(
            "text-sm font-medium transition-opacity duration-200",
            open ? 'opacity-100' : 'opacity-0'
          )}
        >
          {title}
        </span>
      )}

      {notifs && open && (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-xs text-white font-medium">
          {notifs}
        </span>
      )}
    </button>
  );
};

const TitleSection = ({ open }) => {
  const { t } = useTranslations();
  
  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-center gap-3">
          <Logo />
          {open && (
            <div className={cn("transition-opacity duration-200", open ? 'opacity-100' : 'opacity-0')}>
              <div className="flex items-center gap-2">
                <div>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {t('dashboard.profile.name')}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {t('dashboard.profile.plan')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {open && (
          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
      <svg
        width="20"
        height="auto"
        viewBox="0 0 50 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-white"
      >
        <path
          d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
        />
        <path
          d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
        />
      </svg>
    </div>
  );
};

const ToggleClose = ({ open, setOpen }) => {
  const { t } = useTranslations();
  
  return (
    <button
      onClick={() => setOpen(!open)}
      className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 place-content-center">
          <ChevronsRight
            className={cn(
              "h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400",
              open ? "rotate-180" : ""
            )}
          />
        </div>
        {open && (
          <span
            className={cn(
              "text-sm font-medium text-gray-600 dark:text-gray-300 transition-opacity duration-200",
              open ? 'opacity-100' : 'opacity-0'
            )}
          >
            {t('dashboard.actions.hide')}
          </span>
        )}
      </div>
    </button>
  );
};

const DashboardContent = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslations();
  
  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.welcome')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={DollarSign} 
          title={t('dashboard.stats.sales.title')}
          value="$24,567"
          change="+12%"
          changeText={t('dashboard.stats.sales.change')}
          color="blue"
        />
        
        <StatCard 
          icon={Users} 
          title={t('dashboard.stats.users.title')}
          value="1,234"
          change="+5%"
          changeText={t('dashboard.stats.users.change')}
          color="green"
        />
        
        <StatCard 
          icon={ShoppingCart} 
          title={t('dashboard.stats.orders.title')}
          value="456"
          change="+8%"
          changeText={t('dashboard.stats.orders.change')}
          color="purple"
        />

        <StatCard 
          icon={Package} 
          title={t('dashboard.stats.products.title')}
          value="89"
          change="+3"
          changeText={t('dashboard.stats.products.change')}
          color="orange"
        />
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.activity.title')}</h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                {t('dashboard.activity.viewAll')}
              </button>
            </div>
            <div className="space-y-4">
              <ActivityItem 
                icon={DollarSign} 
                title={t('dashboard.activity.items.sale.title')} 
                description={t('dashboard.activity.items.sale.desc')} 
                time={t('dashboard.activity.items.sale.time')} 
                color="green" 
              />
              <ActivityItem 
                icon={Users} 
                title={t('dashboard.activity.items.user.title')} 
                description={t('dashboard.activity.items.user.desc')} 
                time={t('dashboard.activity.items.user.time')} 
                color="blue" 
              />
              <ActivityItem 
                icon={Package} 
                title={t('dashboard.activity.items.product.title')} 
                description={t('dashboard.activity.items.product.desc')} 
                time={t('dashboard.activity.items.product.time')} 
                color="purple" 
              />
              <ActivityItem 
                icon={Activity} 
                title={t('dashboard.activity.items.system.title')} 
                description={t('dashboard.activity.items.system.desc')} 
                time={t('dashboard.activity.items.system.time')} 
                color="orange" 
              />
              <ActivityItem 
                icon={Bell} 
                title={t('dashboard.activity.items.notification.title')} 
                description={t('dashboard.activity.items.notification.desc')} 
                time={t('dashboard.activity.items.notification.time')} 
                color="red" 
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('dashboard.quickStats.title')}</h3>
            <div className="space-y-4">
              <StatBar 
                label={t('dashboard.quickStats.conversion.label')}
                value="3.2%"
                percentage={32}
                color="bg-blue-500"
              />
              
              <StatBar 
                label={t('dashboard.quickStats.bounce.label')}
                value="45%"
                percentage={45}
                color="bg-orange-500"
              />
              
              <StatBar 
                label={t('dashboard.quickStats.pageViews.label')}
                value="8.7k"
                percentage={87}
                color="bg-green-500"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('dashboard.topProducts.title')}</h3>
            <div className="space-y-3">
              {['iPhone 15 Pro', 'MacBook Air M2', 'AirPods Pro', 'iPad Air'].map((product, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{product}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${Math.floor(Math.random() * 1000 + 500)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, change, changeText, color }) => {
  const getColorClasses = (color) => {
    const colorMap = {
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
      red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    };
    
    return colorMap[color] || colorMap.blue;
  };
  
  return (
    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-lg", getColorClasses(color))}>
          <Icon className="h-5 w-5" />
        </div>
        <TrendingUp className="h-4 w-4 text-green-500" />
      </div>
      <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-green-600 dark:text-green-400 mt-1">{change} {changeText}</p>
    </div>
  );
};

const ActivityItem = ({ icon: Icon, title, description, time, color }) => {
  const getColorClasses = (color) => {
    const colorMap = {
      green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
      red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    };
    
    return colorMap[color] || colorMap.blue;
  };
  
  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
      <div className={cn("p-2 rounded-lg", getColorClasses(color))}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {description}
        </p>
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500">
        {time}
      </div>
    </div>
  );
};

const StatBar = ({ label, value, percentage, color }) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className={color + " h-2 rounded-full"} style={{ width: `${percentage}%` }}></div>
      </div>
    </>
  );
};

export default Dashboard;