'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Menu, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setTheme } from '@/store/slices/appSlice';
import { useNotifications, useMarkAllRead } from '@/hooks/useNotifications';
import { useNotificationStore } from '@/store/useNotificationStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.app.theme);
  const { unreadCount, notifications } = useNotificationStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { mutate: markAllRead } = useMarkAllRead();

  // Load notifications count
  useNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
      {/* Left — mobile menu + search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          onClick={onMobileMenuToggle}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="relative hidden sm:block w-64 lg:w-80">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search friends, groups…"
            className="pl-8 h-8 bg-muted/50 border-transparent focus-visible:border-ring text-sm"
          />
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Bell size={32} className="mb-2 opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer',
                        !n.isRead && 'bg-primary/5'
                      )}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin size={14} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {formatDistanceToNow(n.createdAt)}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
