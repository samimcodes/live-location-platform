'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Map, Users, Users2, Bookmark, History,
  Settings, Bell, Radio, LayoutDashboard,
  UserCheck, CornerDownLeft, Sparkles,
} from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useGroups } from '@/hooks/useGroups';
import { useGetSavedPlaces } from '@/hooks/useSavedPlaces';
import { useLocationStore } from '@/store/useLocationStore';
import { soundFx } from '@/lib/soundFx';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { toast } from '@/lib/toast';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Friends' | 'Circles' | 'Saved Places' | 'Actions';
  icon: React.ElementType;
  iconBg?: string;
  badge?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: friends = [] } = useFriends();
  const { data: groups = [] } = useGroups();
  const { data: places = [] } = useGetSavedPlaces();
  const { isSharing, setSharing } = useLocationStore();

  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    onOpenChange(false);
  }, [onOpenChange]);

  // Toggle location broadcasting action
  const handleToggleSharing = useCallback(async () => {
    handleClose();
    const nextState = !isSharing;
    setSharing(nextState);
    soundFx.playPop();
    try {
      await api.patch('/location/sharing', { sharing: nextState });
      toast.success(nextState ? 'Live location broadcasting enabled' : 'Ghost Mode active');
    } catch {
      setSharing(!nextState);
      toast.error('Failed to update sharing preference');
    }
  }, [handleClose, isSharing, setSharing]);

  // Build items list
  const allItems = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: 'nav-dashboard',
        title: 'Overview Dashboard',
        subtitle: 'Main hub, live radar & activity metrics',
        category: 'Navigation',
        icon: LayoutDashboard,
        iconBg: 'bg-primary/10 text-primary',
        onSelect: () => { router.push('/dashboard'); handleClose(); },
      },
      {
        id: 'nav-map',
        title: 'Live GPS Radar Map',
        subtitle: 'Full-screen WebGL interactive live tracking map',
        category: 'Navigation',
        icon: Map,
        badge: 'Live',
        iconBg: 'bg-chart-5/10 text-chart-5',
        onSelect: () => { router.push('/dashboard/map'); handleClose(); },
      },
      {
        id: 'nav-friends',
        title: 'Friends Directory',
        subtitle: 'View contacts, telemetry & live distances',
        category: 'Navigation',
        icon: Users,
        iconBg: 'bg-indigo-500/10 text-indigo-500',
        onSelect: () => { router.push('/dashboard/friends'); handleClose(); },
      },
      {
        id: 'nav-requests',
        title: 'Friend Requests',
        subtitle: 'Manage pending invitations & search users',
        category: 'Navigation',
        icon: UserCheck,
        iconBg: 'bg-blue-500/10 text-blue-500',
        onSelect: () => { router.push('/dashboard/friends/requests'); handleClose(); },
      },
      {
        id: 'nav-groups',
        title: 'Circles & Groups',
        subtitle: 'Manage tracking circles & group hubs',
        category: 'Navigation',
        icon: Users2,
        iconBg: 'bg-violet-500/10 text-violet-500',
        onSelect: () => { router.push('/dashboard/groups'); handleClose(); },
      },
      {
        id: 'nav-history',
        title: 'Location History',
        subtitle: 'Review logged paths, distance & speed timeline',
        category: 'Navigation',
        icon: History,
        iconBg: 'bg-amber-500/10 text-amber-500',
        onSelect: () => { router.push('/dashboard/history'); handleClose(); },
      },
      {
        id: 'nav-places',
        title: 'Saved Places',
        subtitle: 'Home, work, gym and bookmarked pins',
        category: 'Navigation',
        icon: Bookmark,
        iconBg: 'bg-emerald-500/10 text-emerald-500',
        onSelect: () => { router.push('/dashboard/saved-places'); handleClose(); },
      },
      {
        id: 'nav-notifications',
        title: 'Notifications Hub',
        subtitle: 'Alerts, requests and circle announcements',
        category: 'Navigation',
        icon: Bell,
        iconBg: 'bg-pink-500/10 text-pink-500',
        onSelect: () => { router.push('/dashboard/notifications'); handleClose(); },
      },
      {
        id: 'nav-settings',
        title: 'Account Settings',
        subtitle: 'Profile, security credentials, themes & backup',
        category: 'Navigation',
        icon: Settings,
        iconBg: 'bg-muted text-muted-foreground',
        onSelect: () => { router.push('/dashboard/settings'); handleClose(); },
      },

      // Quick Actions
      {
        id: 'action-toggle-sharing',
        title: isSharing ? 'Disable Live Radar (Ghost Mode)' : 'Enable Live Radar Broadcasting',
        subtitle: isSharing ? 'Hide your pin from all friends' : 'Broadcast GPS to connected contacts',
        category: 'Actions',
        icon: Radio,
        badge: isSharing ? 'Broadcasting' : 'Ghost',
        iconBg: isSharing ? 'bg-chart-5/10 text-chart-5' : 'bg-muted text-muted-foreground',
        onSelect: handleToggleSharing,
      },
    ];

    // Friends items
    friends.forEach((f) => {
      list.push({
        id: `friend-${f.id}`,
        title: f.name,
        subtitle: f.isOnline ? 'Online now · Focus on map' : 'Offline · View friend profile',
        category: 'Friends',
        icon: Users,
        badge: f.isOnline ? 'Online' : undefined,
        iconBg: f.isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground',
        onSelect: () => {
          router.push(`/dashboard/map?focus=${f.id}`);
          handleClose();
        },
      });
    });

    // Groups items
    groups.forEach((g) => {
      list.push({
        id: `group-${g.id}`,
        title: g.name,
        subtitle: `${g._count?.members ?? g.members.length} members · Open group hub`,
        category: 'Circles',
        icon: Users2,
        iconBg: 'bg-violet-500/10 text-violet-500',
        onSelect: () => {
          router.push(`/dashboard/groups/${g.id}`);
          handleClose();
        },
      });
    });

    // Saved Places
    places.forEach((p) => {
      list.push({
        id: `place-${p.id}`,
        title: p.name,
        subtitle: p.address ?? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`,
        category: 'Saved Places',
        icon: Bookmark,
        badge: p.type,
        iconBg: 'bg-emerald-500/10 text-emerald-500',
        onSelect: () => {
          router.push(`/dashboard/map?lat=${p.latitude}&lng=${p.longitude}&zoom=16`);
          handleClose();
        },
      });
    });

    return list;
  }, [friends, groups, places, isSharing, router, handleClose, handleToggleSharing]);

  // Filtered by query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
  };

  // Focus input when opened
  useEffect(() => {
    if (open) {
      soundFx.playPop();
      const timer = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        soundFx.playPop();
        filtered[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 pb-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Spotlight Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="relative w-full max-w-2xl bg-card/95 backdrop-blur-2xl border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]"
          >
            {/* Top Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-muted/20">
              <Search size={18} className="text-muted-foreground/60 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search friends, groups, places…"
                className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/50 text-base font-medium"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold text-muted-foreground/70 bg-muted/60 rounded-md border border-border/60">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results List */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-2 divide-y divide-border/20 scrollbar-thin">
              {filtered.length === 0 ? (
                <div className="py-14 text-center text-muted-foreground">
                  <Sparkles size={28} className="mx-auto opacity-30 mb-2" />
                  <p className="text-sm font-bold text-foreground">No matching results found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try searching with a different name or action keyword</p>
                </div>
              ) : (
                filtered.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      data-selected={isSelected}
                      onClick={() => {
                        soundFx.playPop();
                        item.onSelect();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-150',
                        isSelected
                          ? 'bg-primary/10 text-primary shadow-xs'
                          : 'hover:bg-muted/40 text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={cn(
                            'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-border/30 transition-transform',
                            item.iconBg ?? 'bg-muted text-muted-foreground',
                            isSelected && 'scale-105'
                          )}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn('text-sm font-bold truncate leading-tight', isSelected ? 'text-primary' : 'text-foreground')}>
                              {item.title}
                            </p>
                            {item.badge && (
                              <span className="px-2 py-0.2 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-muted text-muted-foreground border border-border/40">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{item.subtitle}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest hidden sm:inline">
                          {item.category}
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-lg">
                            <span>Open</span>
                            <CornerDownLeft size={10} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer Tip */}
            <div className="px-5 py-2.5 border-t border-border/40 bg-muted/10 flex items-center justify-between text-[11px] text-muted-foreground/80 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.2 rounded bg-muted/60 border border-border/60 text-[10px] font-mono">↑</kbd>
                  <kbd className="px-1.5 py-0.2 rounded bg-muted/60 border border-border/60 text-[10px] font-mono">↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.2 rounded bg-muted/60 border border-border/60 text-[10px] font-mono">↵</kbd>
                  <span>Select</span>
                </span>
              </div>
              <span className="flex items-center gap-1 text-primary font-semibold">
                <Sparkles size={11} /> LocaLink Spotlight
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
