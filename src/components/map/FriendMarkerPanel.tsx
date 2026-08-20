'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Navigation, Clock, Search, X,
  MapPin, Gauge, Radio, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { useLocationStore } from '@/store/useLocationStore';
import type { Friend } from '@/hooks/useFriends';

export interface FriendMarkerPanelProps {
  friends:        Friend[];
  focusedUserId?: number;
  onFocusFriend:  (userId: number | undefined) => void;
  className?:     string;
  style?:         React.CSSProperties;
}

export function FriendMarkerPanel({
  friends,
  focusedUserId,
  onFocusFriend,
  className,
  style,
}: FriendMarkerPanelProps) {
  const { friendsLocations } = useLocationStore();
  const [query, setQuery]    = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) =>
      f.name.toLowerCase().includes(q) ||
      friendsLocations.get(f.id)?.city?.toLowerCase().includes(q)
    );
  }, [friends, query, friendsLocations]);

  const { live, online, offline } = useMemo(() => {
    const live:    Friend[] = [];
    const online:  Friend[] = [];
    const offline: Friend[] = [];
    for (const f of filtered) {
      const hasLoc = friendsLocations.has(f.id) && f.sharingLocation;
      if (hasLoc)          live.push(f);
      else if (f.isOnline) online.push(f);
      else                 offline.push(f);
    }
    return { live, online, offline };
  }, [filtered, friendsLocations]);

  const totalActive = live.length;

  return (
    <div
      className={cn(
        'flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden',
        className,
      )}
      style={style}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-4 pb-3.5 border-b border-border/40">

        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {/* Icon */}
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={13} className="text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight">Friends</span>
            {totalActive > 0 && (
              <span className="inline-flex items-center gap-1 h-5 rounded-full bg-chart-5/15 text-chart-5 text-[10px] font-bold px-2">
                <Radio size={8} className="animate-pulse shrink-0" />
                {totalActive} live
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground/60 tabular-nums">
            {friends.length} total
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or city…"
            className={cn(
              'w-full pl-7 pr-7 py-1.5 text-xs rounded-lg',
              'bg-muted/50 border border-border/40',
              'focus:outline-none focus:ring-1 focus:ring-primary/30 focus:bg-background/80',
              'transition-all placeholder:text-muted-foreground/40',
            )}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors"
              >
                <X size={9} className="text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── List ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {friends.length === 0 ? (
          <EmptyState
            icon={<Users size={28} className="text-muted-foreground/20" />}
            title="No friends yet"
            subtitle="Add friends to track their location"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={22} className="text-muted-foreground/20" />}
            title={`No results for "${query}"`}
            subtitle="Try a different name or city"
          />
        ) : (
          <div className="space-y-4 px-2">
            {live.length > 0 && (
              <Group
                label="On the map"
                dot="bg-chart-5"
                count={live.length}
                pulse
              >
                {live.map((f) => (
                  <FriendRow
                    key={f.id}
                    friend={f}
                    isFocused={focusedUserId === f.id}
                    onFocus={onFocusFriend}
                    loc={friendsLocations.get(f.id)}
                  />
                ))}
              </Group>
            )}

            {online.length > 0 && (
              <Group label="Online" dot="bg-chart-3" count={online.length}>
                {online.map((f) => (
                  <FriendRow
                    key={f.id}
                    friend={f}
                    isFocused={false}
                    onFocus={onFocusFriend}
                    loc={undefined}
                  />
                ))}
              </Group>
            )}

            {offline.length > 0 && (
              <Group label="Offline" dot="bg-muted-foreground/25" count={offline.length} dimmed>
                {offline.map((f) => (
                  <FriendRow
                    key={f.id}
                    friend={f}
                    isFocused={false}
                    onFocus={onFocusFriend}
                    loc={undefined}
                  />
                ))}
              </Group>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState({
  icon, title, subtitle,
}: {
  icon:     React.ReactNode;
  title:    string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center gap-2">
      <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-1">
        {icon}
      </div>
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      <p className="text-[11px] text-muted-foreground/50 leading-relaxed">{subtitle}</p>
    </div>
  );
}

// ── Section group ──────────────────────────────────────────────────────────
function Group({
  label, dot, count, dimmed = false, pulse = false, children,
}: {
  label:    string;
  dot:      string;
  count:    number;
  dimmed?:  boolean;
  pulse?:   boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Section label */}
      <div className="flex items-center gap-2 px-1.5 mb-1.5">
        <span className="relative flex h-2 w-2 shrink-0">
          {pulse && (
            <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-50', dot)} />
          )}
          <span className={cn('relative inline-flex h-2 w-2 rounded-full', dot)} />
        </span>
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-widest',
          dimmed ? 'text-muted-foreground/40' : 'text-muted-foreground/70',
        )}>
          {label}
        </span>
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-[10px] text-muted-foreground/40 tabular-nums">{count}</span>
      </div>

      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// ── Friend row ─────────────────────────────────────────────────────────────
interface RowProps {
  friend:    Friend;
  isFocused: boolean;
  onFocus:   (id: number | undefined) => void;
  loc?:      {
    city?: string;
    latitude: number;
    longitude: number;
    speed?: number;
    timestamp?: string;
  };
}

function FriendRow({ friend, isFocused, onFocus, loc }: RowProps) {
  const canFocus = !!loc && friend.sharingLocation;
  const speedKmh = loc?.speed != null && loc.speed > 0
    ? Math.round(loc.speed * 3.6)
    : null;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      onClick={() => canFocus && onFocus(isFocused ? undefined : friend.id)}
      disabled={!canFocus}
      className={cn(
        'group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
        'transition-all duration-150',
        canFocus
          ? 'hover:bg-muted/50 cursor-pointer active:scale-[0.98]'
          : 'cursor-default',
        isFocused
          ? 'bg-primary/8 ring-1 ring-primary/20 shadow-sm'
          : 'opacity-100',
        !canFocus && !isFocused && 'opacity-50',
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={cn(
          'h-9 w-9 rounded-full overflow-hidden flex items-center justify-center',
          'text-primary-foreground font-bold text-xs shadow-sm',
          'bg-gradient-to-br from-primary/80 to-ring/90',
          isFocused && 'ring-2 ring-primary ring-offset-1 ring-offset-card',
        )}>
          {friend.avatar ? (
            <Image
              src={friend.avatar}
              alt={friend.name}
              fill
              sizes="36px"
              className="object-cover rounded-full"
            />
          ) : (
            <span>{friend.name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        {/* Status dot */}
        <span className={cn(
          'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card shadow-sm',
          isFocused
            ? 'bg-primary'
            : friend.isOnline && loc
            ? 'bg-chart-5'
            : friend.isOnline
            ? 'bg-chart-3'
            : 'bg-muted-foreground/20',
        )} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] font-semibold truncate leading-tight',
          isFocused ? 'text-foreground' : 'text-foreground/90',
        )}>
          {friend.name}
        </p>

        <div className="flex items-center gap-1 mt-0.5">
          {loc && friend.sharingLocation ? (
            <>
              <MapPin size={9} className="text-primary/70 shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate">
                {loc.city ?? `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}`}
              </span>
            </>
          ) : friend.isOnline ? (
            <span className="text-[11px] text-chart-3/80 font-medium">
              Online · location hidden
            </span>
          ) : (
            <>
              <Clock size={9} className="text-muted-foreground/40 shrink-0" />
              <span className="text-[11px] text-muted-foreground/50">
                {formatDistanceToNow(friend.lastSeen)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Speed badge */}
        {speedKmh != null && speedKmh > 2 && (
          <div className="flex items-center gap-0.5 bg-chart-4/10 text-chart-4 rounded-lg px-1.5 py-0.5 text-[10px] font-bold">
            <Gauge size={9} />
            {speedKmh}
          </div>
        )}

        {/* Focus / chevron indicator */}
        {canFocus && (
          isFocused ? (
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <Navigation size={11} className="text-primary-foreground" />
            </div>
          ) : (
            <ChevronRight
              size={13}
              className="text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors"
            />
          )
        )}
      </div>
    </motion.button>
  );
}
