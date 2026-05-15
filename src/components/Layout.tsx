import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  FileText, 
  LogOut,
  Moon,
  Sun,
  Maximize,
  Clock,
  Wifi,
  WifiOff,
  User,
  Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { fr, arDZ } from 'date-fns/locale';

import { useTheme } from '../contexts/ThemeContext';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed: boolean;
  key?: string;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full p-2.5 rounded-lg transition-all duration-200",
      "hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800",
      active ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "text-slate-600 dark:text-slate-400"
    )}
  >
    <Icon size={22} className={cn("shrink-0", !collapsed && "mr-3")} />
    {!collapsed && <span className="font-medium text-sm whitespace-nowrap">{label}</span>}
  </button>
);

export const Layout = ({ children, activeTab, setActiveTab }: { children: React.ReactNode, activeTab: string, setActiveTab: (tab: string) => void }) => {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: t('dashboard') },
    { id: 'sales', icon: ShoppingCart, label: t('sales_today') },
    { id: 'inventory', icon: Package, label: t('inventory') },
    { id: 'credits', icon: Users, label: t('credits') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-10",
          collapsed ? "w-16" : "w-48"
        )}
      >
        <div className="px-3 flex items-center justify-between border-b dark:border-slate-800 h-14">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">DZ</div>
              <span className="font-bold text-lg text-blue-900 dark:text-blue-400 uppercase tracking-wider italic">ProPOS</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
            <Monitor size={18} className="text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              collapsed={collapsed}
              key={item.id}
            />
          ))}
        </nav>

        <div className="p-2 border-t dark:border-slate-800 mt-auto">
          <SidebarItem
            icon={LogOut}
            label={t('exit')}
            onClick={() => {}}
            collapsed={collapsed}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#f3f4f6] dark:bg-slate-950 transition-colors duration-300">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-14 flex items-center justify-between px-4 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 uppercase transition-colors duration-300">
              {activeTab === 'sales' ? t('store_name') : t(activeTab)}
            </h1>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2" />
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">
              <User size={16} />
              <span>Noureddine (Admin)</span>
              <span className="flex items-center gap-1 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full uppercase">Poste 01</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium text-sm transition-colors duration-300">
              <Clock size={16} />
              <span>{format(time, 'Pp', { locale: i18n.language === 'fr' ? fr : arDZ })}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleLanguage}
                className="px-3 py-1 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-700 uppercase transition-colors duration-300"
              >
                {i18n.language === 'fr' ? 'العربية' : 'FR'}
              </button>
              
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Wifi size={16} />
                    <span className="text-xs font-bold uppercase">{t('online')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <WifiOff size={16} />
                    <span className="text-xs font-bold uppercase">{t('offline')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-1">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-400">
                  <Maximize size={18} />
                </button>
                <button 
                  onClick={toggleTheme}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-400"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <section className="flex-1 overflow-hidden relative">
          {children}
        </section>
      </main>
    </div>
  );
};
