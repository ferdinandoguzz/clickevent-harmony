
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { navItems } from './navItems';

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
              {navItems.filter(item => !item.roles || (role && item.roles.includes(role))).map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => cn(
                        'flex items-center py-2 px-3 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200',
                        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="ml-2">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
