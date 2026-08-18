'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Navigation, Clock, Search, X, MapPin, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { useLocationStore } from '@/store/useLocationStore';
import type { Friend } from '@/hooks/useFriends';

export interface FriendMarkerPanelProps {
  friends:       Friend[];
  focusedUserId?: number;
  onFocusFriend: (userId: number | undefined) => void;
  className?:    string;
  style?:        React.CSSProperties;
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

  // Filter by search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) =>
      f.name.toLowerCase().includes(q) ||
      friendsLocations.get(f.id)?.city?.toLowerCase().includes(q)
    );
  }, [friends, query, friendsLocations]);

  // Split into online (with location) / online (no location) / offline
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
    <div className={cn('flex flex-col bg-card border border-border rounded-2xl overflow-hidden', className)} style={style}>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-border/50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Friends</p>
            {totalActive > 0 && (
              <span className="h-5 min-w-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center px-1.5">
                {totalActive} live
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{friends.length} total</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search friends…"
            className={cn(
              'w-full pl-8 pr-7 py-1.5 text-xs rounded-lg',
              'bg-muted/60 border border-border/50',
              'focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-background',
              'transition-colors placeholder:text-muted-foreground/60',
            )}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── List ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">

        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users size={30} className="mb-2 opacity-20" />
            <p className="text-xs font-medium">No friends yet</p>
            <p className="text-[11px] mt-0.5 opacity-60 text-center">
              Add friends to track locations
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Search size={22} className="mb-1.5 opacity-20" />
            <p className="text-xs">No results for &ldquo;{query}&rdquo;</p>
          </div>
        ) : (
          <>
            {/* Live on map */}
            {live.length > 0 && (
              <Section label="On the map" count={live.length} dot="bg-emerald-500">
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

            {/* Online but not sharing */}
            {online.length > 0 && (
              <Section label="Online" count={online.length} dot="bg-blue-400">
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
              <Section label="Offline" count={offline.length} dot="bg-muted-foreground/30" dimmed>
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
          </>
        )}
      </div>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────
function Section({
  label, count, dot, dimmed = false, children,
}: {
  label:    string;
  count:    number;
  dot:      string;
  dimmed?:  boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-1.5 mb-1">
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot)} />
        <span className={cn('text-[10px] font-semibold uppercase tracking-wider', dimmed ? 'text-muted-foreground/50' : 'text-muted-foreground')}>
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground/50 ml-auto">{count}</span>
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
  loc?:      { city?: string; latitude: number; longitude: number; speed?: number; timestamp?: string };
}

function FriendRow({ friend, isFocused, onFocus, loc }: RowProps) {
  const canFocus = !!loc && friend.sharingLocation;
  const speedKmh = loc?.speed != null && loc.speed > 0
    ? Math.round(loc.speed * 3.6)
    : null;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.18 }}
      onClick={() => canFocus && onFocus(isFocused ? undefined : friend.id)}
      disabled={!canFocus}
      className={cn(
        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all',
        canFocus && 'hover:bg-muted/60 cursor-pointer active:scale-[0.98]',
        !canFocus && 'cursor-default opacity-60',
        isFocused && 'bg-primary/10 ring-1 ring-primary/30',
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
          {friend.avatar ? (
            <Image src={friend.avatar} alt={friend.name} fill sizes="32px" className="object-cover rounded-full" />
          ) : (
            friend.name.charAt(0).toUpperCase()
          )}
        </div>
        {/* Online / focused dot */}
        <span className={cn(
          'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card',
          isFocused
            ? 'bg-primary'
            : friend.isOnline
            ? 'bg-emerald-500'
            : 'bg-muted-foreground/30',
        )} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate leading-none">{friend.name}</p>

        <div className="flex items-center gap-1.5 mt-0.5">
          {loc && friend.sharingLocation ? (
            <>
              <MapPin size={9} className="text-primary shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate">
                {loc.city ?? `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}`}
              </span>
            </>
          ) : friend.isOnline ? (
            <span className="text-[11px] text-muted-foreground/60">Online · hidden</span>
          ) : (
            <>
              <Clock size={9} className="text-muted-foreground/50 shrink-0" />
              <span className="text-[11px] text-muted-foreground/50">
                {formatDistanceToNow(friend.lastSeen)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Speed badge */}
      {speedKmh != null && speedKmh > 2 && (
        <div className="shrink-0 flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
          <Gauge size={9} />
          {speedKmh}
        </div>
      )}

      {/* Focused indicator */}
      {isFocused && (
        <div className="shrink-0">
          <Navigation size={12} className="text-primary" />
        </div>
      )}
    </motion.button>
  );
}
