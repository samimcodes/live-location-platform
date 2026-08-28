'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  isLoading?:     boolean;
}

// ── Avatar color palette — cycles through chart tokens ────────────────────
// Each pair maps to a CSS class pair so Tailwind includes them at build time.
const AVATAR_COLORS: Array<{ bg: string; text: string }> = [
  { bg: 'bg-chart-1',  text: 'text-primary-foreground'  },
  { bg: 'bg-chart-2',  text: 'text-primary-foreground'  },
  { bg: 'bg-chart-3',  text: 'text-primary-foreground'  },
  { bg: 'bg-chart-4',  text: 'text-primary-foreground'  },
  { bg: 'bg-chart-5',  text: 'text-primary-foreground'  },
  { bg: 'bg-primary',  text: 'text-primary-foreground'  },
  { bg: 'bg-ring',     text: 'text-primary-foreground'  },
];

function avatarColor(userId: number) {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

export function FriendMarkerPanel({
  friends,
  focusedUserId,
  onFocusFriend,
  className,
  style,
  isLoading = false,
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

  return (
    <div
      className={cn(
        'flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden',
        className,
      )}
      style={style}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border/40">

        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
              <Users size={16} className="text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight">Friends on Map</span>
            {live.length > 0 && (
              <span className="inline-flex items-center gap-1 h-5 rounded-full bg-chart-5/15 text-chart-5 text-[10px] font-bold px-2">
                <Radio size={8} className="animate-pulse shrink-0" />
                {live.length} live
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground/50 tabular-nums">
            {friends.length} total
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or city…"
            className={cn(
              'w-full pl-8 pr-8 py-2 text-[13px] rounded-xl font-medium',
              'bg-muted/40 border border-border/60',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card',
              'transition-all placeholder:text-muted-foreground/50 shadow-sm',
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
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2.5 px-1 py-2">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-2 w-16 rounded bg-muted/70 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : friends.length === 0 ? (
          <EmptyState
            icon={<Users size={26} className="text-muted-foreground/20" />}
            title="No friends yet"
            subtitle="Add friends to track their location"
            actionHref="/dashboard/friends"
            actionLabel="Find friends"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={20} className="text-muted-foreground/20" />}
            title={`No results for "${query}"`}
            subtitle="Try a different name or city"
          />
        ) : (
          <div className="py-2">
            {/* On the map */}
            {live.length > 0 && (
              <Section label="On the map" dot="bg-chart-5" count={live.length} pulse>
                {live.map((f) => (
                  <FriendRow
                    key={f.id}
                    friend={f}
                    isFocused={focusedUserId === f.id}
                    onFocus={onFocusFriend}
                    loc={friendsLocations.get(f.id)}
                  />
                ))}
              </Section>
            )}

            {/* Online — no location */}
            {online.length > 0 && (
              <Section label="Online" dot="bg-chart-3" count={online.length}>
                {online.map((f) => (
                  <FriendRow
                    key={f.id}
                    friend={f}
                    isFocused={false}
                    onFocus={onFocusFriend}
                    loc={undefined}
                  />
                ))}
              </Section>
            )}

            {/* Offline */}
            {offline.length > 0 && (
              <Section label="Offline" dot="bg-border" count={offline.length} dimmed>
                {offline.map((f) => (
                  <FriendRow
                    key={f.id}
                    friend={f}
                    isFocused={false}
                    onFocus={onFocusFriend}
                    loc={undefined}
                  />
                ))}
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ icon, title, subtitle, actionHref, actionLabel }: {
  icon:     React.ReactNode;
  title:    string;
  subtitle: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="h-14 w-14 rounded-3xl bg-muted/60 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-sm font-extrabold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-[200px]">{subtitle}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/15"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────
function Section({ label, dot, count, dimmed = false, pulse = false, children }: {
  label:    string;
  dot:      string;
  count:    number;
  dimmed?:  boolean;
  pulse?:   boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      {/* Label row */}
      <div className="flex items-center gap-2 px-3.5 py-1.5">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-60', dot)} />
          )}
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dot)} />
        </span>
        <span className={cn(
          'text-xs font-bold uppercase tracking-widest flex-1',
          dimmed ? 'text-muted-foreground/40' : 'text-muted-foreground',
        )}>
          {label}
        </span>
        <span className="text-xs font-semibold text-muted-foreground/50 tabular-nums">{count}</span>
      </div>

      <div className={cn('px-2', dimmed && 'opacity-55')}>
        {children}
      </div>
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
  const { bg, text } = avatarColor(friend.id);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -3 }}
      transition={{ duration: 0.14 }}
      onClick={() => canFocus && onFocus(isFocused ? undefined : friend.id)}
      disabled={!canFocus}
      className={cn(
        'group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left',
        'transition-all duration-200 select-none',
        canFocus && 'hover:bg-muted/80 cursor-pointer active:scale-[0.98]',
        !canFocus && 'cursor-default',
        isFocused && 'bg-primary/10 ring-1 ring-primary/30 shadow-sm',
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={cn(
          'relative h-10 w-10 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-sm shadow-sm',
          bg, text,
          isFocused && 'ring-2 ring-primary/40 ring-offset-1 ring-offset-card',
        )}>
          {friend.avatar ? (
            <Image
              src={friend.avatar}
              alt={friend.name}
              fill
              sizes="40px"
              className="object-cover rounded-2xl"
            />
          ) : (
            friend.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Status dot */}
        <span className={cn(
          'absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-card',
          isFocused     ? 'bg-primary'
          : loc          ? 'bg-chart-5'
          : friend.isOnline ? 'bg-chart-3'
          : 'bg-muted-foreground/20',
        )} />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[13px] font-bold truncate leading-tight text-foreground">
          {friend.name}
        </p>

        <div className="flex items-center gap-1 mt-0.5 min-w-0">
          {loc && friend.sharingLocation ? (
            <>
              <MapPin size={8} className="text-primary/60 shrink-0" />
              <span className="text-[10px] text-muted-foreground/70 truncate">
                {loc.city ?? `${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)}`}
              </span>
            </>
          ) : friend.isOnline ? (
            <span className="text-[10px] text-chart-3/70 font-medium truncate">
              Online
            </span>
          ) : (
            <>
              <Clock size={8} className="text-muted-foreground/35 shrink-0" />
              <span className="text-[10px] text-muted-foreground/45 truncate">
                {formatDistanceToNow(friend.lastSeen)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 shrink-0">
        {speedKmh != null && speedKmh > 2 && (
          <span className="flex items-center gap-0.5 bg-chart-4/10 text-chart-4 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
            <Gauge size={8} />
            {speedKmh}
          </span>
        )}

        {canFocus && (
          isFocused ? (
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md">
              <Navigation size={12} className="text-primary-foreground" />
            </div>
          ) : (
            <ChevronRight
              size={14}
              className="text-muted-foreground/30 group-hover:text-muted-foreground/80 transition-colors"
            />
          )
        )}
      </div>
    </motion.button>
  );
}
