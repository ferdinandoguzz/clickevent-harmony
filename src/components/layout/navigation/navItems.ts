
import { Home, CalendarCheck, Users, QrCode, BarChart3, Settings, UserCog } from 'lucide-react';
import { ReactNode } from 'react';

export interface NavItemProps {
  to: string;
  label: string;
  icon: ReactNode;
  roles?: Array<'superadmin' | 'admin' | 'staff'>;
}

export const navItems: NavItemProps[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { to: '/clubs', label: 'Clubs', icon: <Users className="h-4 w-4" />, roles: ['superadmin'] },
  { to: '/events', label: 'Events', icon: <CalendarCheck className="h-4 w-4" />, roles: ['superadmin', 'admin'] },
  { to: '/check-in', label: 'Check-in', icon: <QrCode className="h-4 w-4" />, roles: ['superadmin', 'admin', 'staff'] },
  { to: '/analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, roles: ['superadmin', 'admin'] },
  { to: '/staff-management', label: 'Staff Management', icon: <UserCog className="h-4 w-4" />, roles: ['superadmin'] },
  { to: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, roles: ['superadmin', 'admin'] },
];
