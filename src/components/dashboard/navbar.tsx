"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Bell, Sun, Moon, Menu, MapPin, Settings, LogOut, Monitor } from "lucide-react";
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
}

export function Navbar({ onMobileMenuToggle, mobileSidebarOpen = false }: NavbarProps) {
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

  // Cycle: light → dark → system
  const cycleTheme = () => {
    if (theme === "light")  setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const ThemeIcon =
    theme === "dark"   ? Moon :
    theme === "light"  ? Sun  :
    Monitor;

  const initials = (user?.name ?? "U").charAt(0).toUpperCase();

  return (
    <header
      role="banner"
      aria-label="Dashboard top navigation"
      className="h-16 flex items-center justify-between px-4 sm:px-6 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-10"
    >
      {/* Left — mobile menu trigger */}
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
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1">

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          aria-label={`Theme: ${theme ?? "system"}. Click to cycle.`}
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
            <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-sm">Notifications</span>
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
                        "flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
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
            <div className="absolute right-0 top-11 w-52 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              {/* Actions */}
              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  <Settings size={14} className="text-muted-foreground" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={14} />
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
