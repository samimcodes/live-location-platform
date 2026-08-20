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
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={13} className="text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight">Friends</span>
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
              'w-full pl-7 pr-7 py-1.5 text-xs rounded-lg',
              'bg-muted/50 border border-border/40',
              'focus:outline-none focus:ring-1 focus:ring-primary/30 focus:bg-background/80',
              'transition-all placeholder:text-muted-foreground/35',
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
        {friends.length === 0 ? (
          <EmptyState
            icon={<Users size={26} className="text-muted-foreground/20" />}
            title="No friends yet"
            subtitle="Add friends to track their location"
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
function EmptyState({ icon, title, subtitle }: {
  icon:     React.ReactNode;
  title:    string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      <p className="text-[11px] text-muted-foreground/45 mt-1 leading-relaxed">{subtitle}</p>
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
          'text-[10px] font-bold uppercase tracking-widest flex-1',
          dimmed ? 'text-muted-foreground/35' : 'text-muted-foreground/60',
        )}>
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground/35 tabular-nums">{count}</span>
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
        'group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left',
        'transition-all duration-150 select-none',
        canFocus && 'hover:bg-muted/50 cursor-pointer active:scale-[0.98]',
        !canFocus && 'cursor-default',
        isFocused && 'bg-primary/[0.07] ring-1 ring-primary/25',
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {/* Avatar circle */}
        <div className={cn(
          'h-8 w-8 rounded-full overflow-hidden flex items-center justify-center font-semibold text-xs',
          bg, text,
          isFocused && 'ring-2 ring-primary/40 ring-offset-1 ring-offset-card',
        )}>
          {friend.avatar ? (
            <Image
              src={friend.avatar}
              alt={friend.name}
              fill
              sizes="32px"
              className="object-cover rounded-full"
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate leading-tight text-foreground/90">
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
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <Navigation size={10} className="text-primary-foreground" />
            </div>
          ) : (
            <ChevronRight
              size={12}
              className="text-muted-foreground/25 group-hover:text-muted-foreground/60 transition-colors"
            />
          )
        )}
      </div>
    </motion.button>
  );
}
