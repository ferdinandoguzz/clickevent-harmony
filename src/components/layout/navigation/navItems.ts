
import { Home, CalendarCheck, Users, QrCode, BarChart3, Settings, UserCog } from 'lucide-react';
import { ReactNode } from 'react';

export interface NavItemProps {
  to: string;
  label: string;
  icon: ReactNode;
  roles?: Array<'superadmin' | 'admin' | 'staff'>;
}

export const navItems: NavItemProps[] = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/clubs', label: 'Clubs', icon: Users, roles: ['superadmin'] },
  { to: '/events', label: 'Events', icon: CalendarCheck, roles: ['superadmin', 'admin'] },
  { to: '/check-in', label: 'Check-in', icon: QrCode, roles: ['superadmin', 'admin', 'staff'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['superadmin', 'admin'] },
  { to: '/staff-management', label: 'Staff Management', icon: UserCog, roles: ['superadmin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['superadmin', 'admin'] },
];
