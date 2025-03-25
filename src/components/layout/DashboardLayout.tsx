
import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, 
  CalendarCheck, 
  Users, 
  QrCode, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown,
  Bell,
  UserCog
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import GlobalSearch from './GlobalSearch';

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: Array<'superadmin' | 'admin' | 'staff'>;
}

const navItems: NavItemProps[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { to: '/clubs', label: 'Clubs', icon: <Users className="h-4 w-4" />, roles: ['superadmin'] },
  { to: '/events', label: 'Events', icon: <CalendarCheck className="h-4 w-4" />, roles: ['superadmin', 'admin'] },
  { to: '/check-in', label: 'Check-in', icon: <QrCode className="h-4 w-4" />, roles: ['superadmin', 'admin', 'staff'] },
  { to: '/analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, roles: ['superadmin', 'admin'] },
  { to: '/staff-management', label: 'Staff Management', icon: <UserCog className="h-4 w-4" />, roles: ['superadmin'] },
  { to: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, roles: ['superadmin', 'admin'] },
];

const NavItem: React.FC<NavItemProps> = ({ to, label, icon }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'nav-link',
        isActive && 'active'
      )}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const MobileNav: React.FC = () => {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-sidebar border-sidebar-border">
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between bg-gradient-to-r from-purple-100 to-indigo-100">
            <Link to="/dashboard" className="font-semibold text-lg text-sidebar-foreground" onClick={() => setOpen(false)}>
              VIPList
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5 text-sidebar-foreground" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <Separator className="bg-sidebar-border" />
          <nav className="flex-1 overflow-auto p-4">
            <ul className="flex flex-col gap-1">
              {navItems.filter(item => !item.roles || (role && item.roles.includes(role))).map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => cn(
                      'flex items-center py-2 px-3 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200',
                      isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 rounded-full flex items-center gap-2 pr-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-sm max-md:hidden">
            <span className="font-medium leading-none">{user.name}</span>
            <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground max-md:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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
