
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import GlobalSearch from './GlobalSearch';
import NavItem from './navigation/NavItem';
import MobileNav from './navigation/MobileNav';
import UserMenu from './navigation/UserMenu';
import { navItems } from './navigation/navItems';

const DashboardLayout: React.FC = () => {
  const { role } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex h-14 items-center px-4 gap-4">
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Link to="/dashboard" className="font-semibold text-lg">
                VIPList
              </Link>
            )}
            <MobileNav />
          </div>
          
          <div className="flex-1 flex justify-end items-center gap-2">
            <GlobalSearch />
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive"></span>
              <span className="sr-only">Notifications</span>
            </Button>
            
            <UserMenu />
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex">
        <aside className="w-64 border-r border-sidebar-border bg-sidebar h-[calc(100vh-3.5rem)] sticky top-14 max-md:hidden">
          <div className="h-14 flex items-center px-4 bg-gradient-to-r from-purple-100 to-indigo-100 border-b border-sidebar-border">
            <span className="font-medium text-sidebar-foreground">Navigation</span>
          </div>
          <nav className="h-[calc(100%-3.5rem)] p-4 pt-6 overflow-y-auto">
            <ul className="flex flex-col gap-1">
              {navItems.filter(item => !item.roles || (role && item.roles.includes(role))).map((item) => (
                <li key={item.to}>
                  <NavItem {...item} />
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
