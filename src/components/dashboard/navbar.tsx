"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { Bell, Sun, Moon, Menu, MapPin, Settings, LogOut, Monitor, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/store";
import { clearAuth } from "@/store/slices/authSlice";
import { useMarkAllRead } from "@/hooks/useNotifications";
import { useNotificationStore } from "@/store/useNotificationStore";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/lib/dateUtils";
import api from "@/lib/axios";

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

  const { unreadCount, notifications } = useNotificationStore();
  const { mutate: markAllRead } = useMarkAllRead();

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setNotifOpen(false); setProfileOpen(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    localStorage.removeItem("token");
    dispatch(clearAuth());
    router.push("/login");
  };

  // Clean hydration-safe client check via useSyncExternalStore
  const mounted = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  // Cycle: light → dark → system
  const cycleTheme = () => {
    if (theme === "light")  setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const currentTheme = mounted ? (theme ?? "system") : "system";
  const ThemeIcon =
    !mounted                 ? Monitor :
    currentTheme === "dark"  ? Moon :
    currentTheme === "light" ? Sun  :
    Monitor;

  const initials = (user?.name ?? "U").charAt(0).toUpperCase();

  return (
    <header
      role="banner"
      aria-label="Dashboard top navigation"
      className="h-16 flex items-center justify-between px-4 sm:px-6 bg-background/60 backdrop-blur-2xl border-b border-border/50 sticky top-0 z-40 shadow-sm"
    >
      {/* Left — mobile menu trigger & search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          onClick={onMobileMenuToggle}
          aria-label="Toggle sidebar"
          aria-expanded={mobileSidebarOpen}
        >
          <Menu size={20} />
        </button>

        {/* Brand mark on mobile */}
        <span className="md:hidden font-bold text-sm text-primary">LocaLink</span>

        {/* Spotlight Command Palette trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground text-xs font-semibold border border-border/50 transition-all shadow-xs cursor-pointer select-none"
        >
          <Search size={13} className="text-muted-foreground/70" />
          <span>Quick jump or search…</span>
          <kbd className="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground/80 bg-background/80 rounded border border-border/60">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1">

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          aria-label={mounted ? `Theme: ${theme ?? "system"}. Click to cycle.` : "Toggle theme"}
          className="text-muted-foreground hover:text-foreground"
        >
          <ThemeIcon size={18} />
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={notifOpen}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-muted/20">
                <span className="font-extrabold text-[15px]">Notifications</span>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <Link
                    href="/dashboard/notifications"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setNotifOpen(false)}
                  >
                    See all
                  </Link>
                </div>
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
                        "flex items-start gap-3 px-5 py-4 hover:bg-muted/60 transition-colors border-b border-border/30 last:border-0",
                        !n.isRead && "bg-primary/5"
                      )}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin size={14} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{n.title}</p>
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

        {/* Profile dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 h-9 px-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Open profile menu"
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            {/* Avatar */}
            <div className="h-7 w-7 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name ?? "Avatar"}
                  width={28}
                  height={28}
                  className="object-cover"
                />
              ) : (
                <span className="text-white text-xs font-bold">{initials}</span>
              )}
            </div>
            <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
              {user?.name?.split(" ")[0] ?? "Account"}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/5 dark:ring-white/10">
              {/* User info */}
              <div className="px-5 py-4 border-b border-border/50 bg-muted/20">
                <p className="text-sm font-bold truncate text-foreground">{user?.name}</p>
                <p className="text-xs font-medium text-muted-foreground truncate mt-0.5">{user?.email}</p>
              </div>
              {/* Actions */}
              <div className="p-2 space-y-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
