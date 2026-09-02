'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import {
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  MapPin,
  Settings,
  LogOut,
  Monitor,
  Search,
  CheckCheck,
  Radio,
  Shield,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { clearAuth } from '@/store/slices/authSlice';
import { useMarkAllRead } from '@/hooks/useNotifications';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useLocationStore } from '@/store/useLocationStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFx } from '@/lib/soundFx';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  mobileSidebarOpen?: boolean;
  onOpenCommandPalette?: () => void;
}

export function Navbar({ onMobileMenuToggle, mobileSidebarOpen = false, onOpenCommandPalette }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const router   = useRouter();
  const user     = useAppSelector((s) => s.auth.user);
  const { isSharing } = useLocationStore();

  const { unreadCount, notifications } = useNotificationStore();
  const { mutate: markAllRead } = useMarkAllRead();

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('token');
    dispatch(clearAuth());
    router.push('/login');
  };

  // Hydration-safe client check
  const mounted = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  // Cycle theme
  const cycleTheme = () => {
    soundFx.playPop();
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const currentTheme = mounted ? (theme ?? 'system') : 'system';
  const ThemeIcon =
    !mounted                 ? Monitor :
    currentTheme === 'dark'  ? Moon :
    currentTheme === 'light' ? Sun  :
    Monitor;

  const initials = (user?.name ?? 'U').charAt(0).toUpperCase();

  return (
    <header
      role="banner"
      aria-label="Dashboard top navigation"
      className="h-16 flex items-center justify-between px-4 sm:px-6 bg-card/85 dark:bg-card/75 backdrop-blur-2xl border-b border-border/40 sticky top-0 z-40 shadow-xs"
    >
      {/* ── Left Area — Mobile trigger & Command Search ─────────────── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={onMobileMenuToggle}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileSidebarOpen}
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Brand mark on mobile view */}
        <div className="md:hidden flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Radio size={14} />
          </div>
          <span className="font-extrabold text-sm text-foreground tracking-tight">LocaLink</span>
        </div>

        {/* Spotlight Command Palette trigger */}
        <button
          onClick={onOpenCommandPalette}
          className={cn(
            'hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl',
            'bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground',
            'border border-border/50 hover:border-primary/30 transition-all shadow-xs cursor-pointer select-none max-w-sm w-full group'
          )}
        >
          <Search size={14} className="text-muted-foreground/70 group-hover:text-primary transition-colors shrink-0" />
          <span className="text-xs font-medium text-muted-foreground/90 truncate flex-1 text-left">
            Quick jump or search…
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-muted-foreground/80 bg-background/80 rounded-lg border border-border/60 shadow-2xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* ── Right Area — Live Radar Pill, Theme, Notifications, Profile ─ */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Live Location Broadcasting Pill */}
        <Link
          href="/dashboard/settings"
          title={isSharing ? 'Live Location Broadcasting Active (Click to manage)' : 'Ghost Mode Active (Click to manage)'}
          className={cn(
            'hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border shadow-2xs select-none',
            isSharing
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
              : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted/70'
          )}
        >
          <span className="relative flex h-2 w-2">
            {isSharing ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground/60" />
            )}
          </span>
          <span className="text-[11px] font-bold">
            {isSharing ? 'Live Radar Active' : 'Ghost Mode'}
          </span>
        </Link>

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          aria-label={mounted ? `Theme: ${theme ?? 'system'}. Click to cycle.` : 'Toggle theme'}
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all cursor-pointer"
        >
          <ThemeIcon size={17} className="transition-transform duration-300 hover:rotate-12" />
        </Button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setNotifOpen((v) => !v);
              soundFx.playPop();
            }}
            className={cn(
              'relative h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all cursor-pointer',
              notifOpen && 'bg-muted text-foreground'
            )}
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={notifOpen}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 top-12 w-80 sm:w-92 bg-card/95 backdrop-blur-2xl border border-border/60 rounded-3xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/5 dark:ring-white/10"
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-foreground">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          markAllRead();
                          soundFx.playChime();
                        }}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck size={12} />
                        Mark all read
                      </button>
                    )}
                    <Link
                      href="/dashboard/notifications"
                      className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                      onClick={() => setNotifOpen(false)}
                    >
                      See all
                    </Link>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-84 overflow-y-auto divide-y divide-border/20 no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground/40 mb-3">
                        <Bell size={22} />
                      </div>
                      <p className="text-xs font-bold text-foreground">All caught up!</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        No new notifications or alerts right now.
                      </p>
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          'flex items-start gap-3.5 px-5 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer',
                          !n.isRead && 'bg-primary/5'
                        )}
                      >
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5 shadow-2xs">
                          <MapPin size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                            {!n.isRead && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                            {n.body}
                          </p>
                          <p className="text-[10px] font-medium text-muted-foreground/60 mt-1">
                            {formatDistanceToNow(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Popover Footer */}
                <div className="p-2 border-t border-border/40 bg-muted/10 text-center">
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline py-1"
                  >
                    <span>View notification center</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative ml-0.5" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen((v) => !v);
              soundFx.playPop();
            }}
            className={cn(
              'flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-2xl hover:bg-muted/70 transition-all border border-transparent hover:border-border/50 cursor-pointer select-none',
              profileOpen && 'bg-muted border-border/60'
            )}
            aria-label="Open profile menu"
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            {/* Avatar */}
            <div className="h-7 w-7 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name ?? 'Avatar'}
                  width={28}
                  height={28}
                  unoptimized
                  className="object-cover h-full w-full"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <span className="hidden sm:block text-xs font-bold max-w-[110px] truncate text-foreground">
              {user?.name?.split(' ')[0] ?? 'Account'}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 top-12 w-64 bg-card/95 backdrop-blur-2xl border border-border/60 rounded-3xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/5 dark:ring-white/10"
              >
                {/* User Info Header */}
                <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name ?? 'Avatar'}
                          width={40}
                          height={40}
                          unoptimized
                          className="object-cover h-full w-full"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate text-foreground">{user?.name || 'User'}</p>
                      <p className="text-[11px] font-medium text-muted-foreground truncate mt-0.5">{user?.email}</p>
                    </div>
                  </div>

                  {/* Role Tag */}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      <Shield size={10} /> {user?.role || 'Member'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Online
                    </span>
                  </div>
                </div>

                {/* Menu Navigation Links */}
                <div className="p-2 space-y-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all select-none group"
                  >
                    <div className="flex items-center gap-3">
                      <Settings size={15} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>Account Settings</span>
                    </div>
                    <ChevronRight size={13} className="text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                  </Link>

                  <Link
                    href="/dashboard/map"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all select-none group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={15} className="text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                      <span>Live Radar Map</span>
                    </div>
                    <ChevronRight size={13} className="text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                  </Link>

                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all select-none group"
                  >
                    <div className="flex items-center gap-3">
                      <Bell size={15} className="text-muted-foreground group-hover:text-chart-3 transition-colors" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-primary text-primary-foreground">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Sign Out Action */}
                <div className="p-2 pt-1 border-t border-border/40">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-all cursor-pointer select-none"
                  >
                    <LogOut size={15} />
                    <span>Sign out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
