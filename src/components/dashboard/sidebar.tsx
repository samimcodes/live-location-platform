'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MapPin, LogOut } from 'lucide-react';
import { navItems } from '@/data/navdata';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-in-out z-20',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 border-b border-border shrink-0', isCollapsed ? 'justify-center px-2' : 'px-4 gap-2')}>
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
          <MapPin size={16} className="text-white" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
            LocaLink
          </span>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 h-6 w-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/80 transition-colors z-30"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'flex items-center rounded-xl transition-all duration-150 group',
                isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2.5 gap-3',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon
                size={18}
                className={cn('shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}
              />
              {!isCollapsed && (
                <span className="text-sm font-medium truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className={cn('border-t border-border p-3 shrink-0', isCollapsed ? 'flex flex-col items-center gap-2' : '')}>
        {/* Logout button */}
        <button
          onClick={logout}
          title="Logout"
          className={cn(
            'flex items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors',
            isCollapsed ? 'h-10 w-10 justify-center' : 'w-full px-3 py-2 gap-3 mb-2'
          )}
        >
          <LogOut size={16} className="shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>

        {/* Avatar + name */}
        <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
            {user?.avatar ? (
              <Image src={user.avatar} alt={user.name} width={32} height={32} className="object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() ?? 'U'
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name ?? 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? ''}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
