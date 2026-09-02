'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  LogOut,
  Shield,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { navSections, NavItem } from '@/data/navdata';
import { useAuth } from '@/hooks/useAuth';
import { usePendingRequestCount } from '@/hooks/useFriends';
import { useNotificationStore } from '@/store/useNotificationStore';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: pendingRequestsCount = 0 } = usePendingRequestCount();
  const { unreadCount = 0 } = useNotificationStore();

  const initials = (user?.name ?? 'U').charAt(0).toUpperCase();

  const renderBadge = (item: NavItem) => {
    if (item.badgeType === 'live') {
      return (
        <span className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase',
          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs'
        )}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          {!isCollapsed && 'Live'}
        </span>
      );
    }

    if (item.badgeType === 'requests' && pendingRequestsCount > 0) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary text-primary-foreground shadow-xs animate-pulse">
          {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
        </span>
      );
    }

    if (item.badgeType === 'notifications' && unreadCount > 0) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-destructive text-destructive-foreground shadow-xs">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      );
    }

    return null;
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-card/90 dark:bg-card/75 backdrop-blur-2xl border-r border-border/50 transition-all duration-300 ease-in-out z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]',
        isCollapsed ? 'w-[76px]' : 'w-64'
      )}
    >
      {/* ── Brand Logo Header ────────────────────────────────────────── */}
      <div className={cn(
        'flex items-center h-16 border-b border-border/40 shrink-0 select-none px-4',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 group focus-visible:outline-none',
            isCollapsed && 'justify-center'
          )}
        >
          {/* Logo icon with ambient gradient glow */}
          <div className="relative">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-chart-3 flex items-center justify-center shrink-0 shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
              <Compass size={18} className="text-white transform group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                  LocaLink
                </span>
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground/70 truncate">
                Live Radar Platform
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Collapse / Expand Floating Toggle ───────────────────────── */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-3 top-20 h-6 w-6 flex items-center justify-center rounded-full bg-background border border-border shadow-md text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        )}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* ── Nav Sections ────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5 scrollbar-thin no-scrollbar">
        {navSections.map((section, idx) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3.5 pb-1 flex items-center justify-between">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-muted-foreground/50">
                  {section.title}
                </span>
                {idx === 0 && (
                  <Sparkles size={10} className="text-muted-foreground/40" />
                )}
              </div>
            ) : (
              <div className="h-px bg-border/40 mx-2 my-2" />
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      'flex items-center rounded-2xl transition-all duration-200 group relative select-none',
                      isCollapsed
                        ? 'justify-center h-11 w-11 mx-auto'
                        : 'px-3.5 py-2.5 gap-3 mx-1.5',
                      isActive
                        ? 'bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/20'
                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground font-medium'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )}>
                      <Icon size={18} />
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="text-xs tracking-tight truncate font-semibold">
                          {item.name}
                        </span>
                        {renderBadge(item)}
                      </div>
                    )}

                    {/* Badge when collapsed */}
                    {isCollapsed && item.badgeType === 'live' && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
                    )}
                    {isCollapsed && item.badgeType === 'requests' && pendingRequestsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
                    )}
                    {isCollapsed && item.badgeType === 'notifications' && unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User Footer Card ────────────────────────────────────────── */}
      <div className={cn(
        'border-t border-border/40 p-3 pb-4 shrink-0 bg-muted/15',
        isCollapsed ? 'flex flex-col items-center gap-2 px-1 py-3 pb-4' : ''
      )}>
        {!isCollapsed ? (
          <div className="rounded-2xl border border-border/50 bg-card/90 p-2.5 space-y-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              {/* User Avatar */}
              <div className="relative shrink-0">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-xs overflow-hidden">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name ?? 'Avatar'}
                      width={36}
                      height={36}
                      unoptimized
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>

              {/* User details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-foreground truncate">
                    {user?.name || 'User'}
                  </p>
                  <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                </div>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email || 'Verified Account'}
                </p>
              </div>
            </div>

            {/* Quick action bar inside user card */}
            <div className="pt-2 border-t border-border/30 flex items-center justify-between">
              <Link
                href="/dashboard/settings"
                className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Shield size={11} />
                <span>Preferences</span>
              </Link>

              <button
                onClick={logout}
                className="text-[10px] font-bold text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer"
                title="Sign out"
              >
                <LogOut size={11} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/dashboard/settings"
              title={user?.name ? `${user.name} (Settings)` : 'Account Settings'}
              className="relative group p-1"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-xs overflow-hidden group-hover:scale-105 transition-transform">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name ?? 'Avatar'}
                    width={36}
                    height={36}
                    unoptimized
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </Link>

            <button
              onClick={logout}
              title="Sign Out"
              className="h-8 w-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
