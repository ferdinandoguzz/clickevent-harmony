
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavItemProps } from './navItems';

const NavItem: React.FC<NavItemProps> = ({ to, label, icon: Icon }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'flex items-center py-2 px-3 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200',
        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="ml-2">{label}</span>
    </NavLink>
  );
};

export default NavItem;
