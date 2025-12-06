import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Ticket, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Globe,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { userProfile, signOut, canAccessSection } = useAuth();
  const { t, language, setLanguage, dir } = useLanguage();

  const menuItems = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: BarChart3,
      section: 'dashboard'
    },
    {
      id: 'projects',
      label: t('nav.projects'),
      icon: FileText,
      section: 'projects'
    },
    {
      id: 'deliverables',
      label: t('nav.deliverables'),
      icon: Activity,
      section: 'deliverables'
    },
    {
      id: 'clients',
      label: t('nav.clients'),
      icon: Users,
      section: 'clients'
    },
    {
      id: 'tickets',
      label: t('nav.tickets'),
      icon: Ticket,
      section: 'tickets'
    },
    {
      id: 'reports',
      label: t('nav.reports'),
      icon: BarChart3,
      section: 'reports'
    },
    {
      id: 'users',
      label: t('nav.users'),
      icon: Users,
      section: 'users'
    },
    {
      id: 'settings',
      label: t('nav.settings'),
      icon: Settings,
      section: 'settings'
    }
  ];

  const visibleMenuItems = menuItems.filter(item => canAccessSection(item.section));

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className={`p-4 border-b border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
              <img 
                src="/images/albayan-logo.jpg" 
                alt="شعار البيان" 
                className="w-full h-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="text-sm">
                <div className="font-semibold text-[#0A1E39]">
                  {language === 'ar' ? 'شركة البيان' : 'Al-Bayan'}
                </div>
                <div className="text-xs text-gray-500">
                  {language === 'ar' ? 'سياسات وإجراءات' : 'Policies & Procedures'}
                </div>
              </div>
            )}
          </div>
          
          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex"
          >
            {dir === 'rtl' ? (
              isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
          </Button>

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className={`p-4 border-b border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              {userProfile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {userProfile?.full_name}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {t(`roles.${userProfile?.role}`)}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 truncate mt-1">
                {userProfile?.organization}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 space-y-1">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                onPageChange(item.id);
                setIsMobileOpen(false);
              }}
            >
              <Icon className={`w-4 h-4 ${!isCollapsed && (dir === 'rtl' ? 'ml-3' : 'mr-3')}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className={`p-2 border-t border-gray-200 space-y-1 ${isCollapsed ? 'px-1' : ''}`}>
        {/* Language Toggle */}
        <Button
          variant="ghost"
          className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} text-gray-700 hover:bg-gray-100`}
          onClick={toggleLanguage}
        >
          <Globe className={`w-4 h-4 ${!isCollapsed && (dir === 'rtl' ? 'ml-3' : 'mr-3')}`} />
          {!isCollapsed && (
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          )}
        </Button>

        {/* Sign Out */}
        <Button
          variant="ghost"
          className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} text-red-600 hover:bg-red-50`}
          onClick={handleSignOut}
        >
          <LogOut className={`w-4 h-4 ${!isCollapsed && (dir === 'rtl' ? 'ml-3' : 'mr-3')}`} />
          {!isCollapsed && <span>{t('nav.logout')}</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden"
      >
        <Menu className="w-4 h-4" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col h-full transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </div>
    </>
  );
}