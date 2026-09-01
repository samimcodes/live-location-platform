'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Clock, Search, X,
  MapPin, Gauge, Radio, ChevronRight, Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { useLocationStore } from '@/store/useLocationStore';
import { calculateDistanceKm, formatDistance, isValidLatLng } from '@/lib/mapUtils';
import type { Friend } from '@/hooks/useFriends';

export interface FriendMarkerPanelProps {
  friends:        Friend[];
  focusedUserId?: number;
  onFocusFriend:  (userId: number | undefined) => void;
  onRouteTo?:     (lat: number, lng: number, name: string) => void;
  className?:     string;
  style?:         React.CSSProperties;
  isLoading?:     boolean;
}

// ── Avatar color palette — cycles through chart tokens ────────────────────
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

type FilterTab = 'all' | 'live' | 'nearby';

export function FriendMarkerPanel({
  friends,
  focusedUserId,
  onFocusFriend,
  onRouteTo,
  className,
  style,
  isLoading = false,
}: FriendMarkerPanelProps) {
  const { friendsLocations, myLocation } = useLocationStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = friends;
    if (q) {
      list = list.filter((f) =>
        f.name.toLowerCase().includes(q) ||
        friendsLocations.get(f.id)?.city?.toLowerCase().includes(q)
      );
    }
    return list;
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

  // Sorted by distance from user if nearby tab selected
  const nearbyList = useMemo(() => {
    if (!myLocation || !isValidLatLng(myLocation.latitude, myLocation.longitude)) {
      return live;
    }
    return [...live].sort((a, b) => {
      const locA = friendsLocations.get(a.id);
      const locB = friendsLocations.get(b.id);
      if (!locA) return 1;
      if (!locB) return -1;
      const distA = calculateDistanceKm(myLocation.latitude, myLocation.longitude, locA.latitude, locA.longitude);
      const distB = calculateDistanceKm(myLocation.latitude, myLocation.longitude, locB.latitude, locB.longitude);
      return distA - distB;
    });
  }, [live, myLocation, friendsLocations]);

  return (
    <div
      className={cn(
        'flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm',
        className,
      )}
      style={style}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border/40 space-y-3">

        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
              <Users size={16} className="text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-foreground">Radar Circle</span>
            {live.length > 0 && (
              <span className="inline-flex items-center gap-1.5 h-5 rounded-full bg-chart-5/15 text-chart-5 text-[10px] font-bold px-2 border border-chart-5/20">
                <Radio size={9} className="animate-pulse shrink-0" />
                {live.length} live
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-muted-foreground/60 tabular-nums">
            {friends.length} contacts
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by friend or city…"
            className={cn(
              'w-full pl-8.5 pr-8 py-2 text-xs font-semibold rounded-xl',
              'bg-muted/40 border border-border/60',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card',
              'transition-all placeholder:text-muted-foreground/50 shadow-2xs',
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors cursor-pointer"
              >
                <X size={9} className="text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all text-center select-none cursor-pointer',
              activeTab === 'all'
                ? 'bg-card text-foreground shadow-2xs ring-1 ring-border/50'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            All ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={cn(
              'flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all text-center select-none cursor-pointer',
              activeTab === 'live'
                ? 'bg-card text-chart-5 shadow-2xs ring-1 ring-border/50'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Live ({live.length})
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={cn(
              'flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all text-center select-none cursor-pointer',
              activeTab === 'nearby'
                ? 'bg-card text-primary shadow-2xs ring-1 ring-border/50'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Nearby
          </button>
        </div>
      </div>

      {/* ── List ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="space-y-2.5 p-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-1 py-2">
                <div className="h-9 w-9 rounded-2xl bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-24 rounded-lg bg-muted animate-pulse" />
                  <div className="h-2.5 w-16 rounded bg-muted/70 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : friends.length === 0 ? (
          <EmptyState
            icon={<Users size={26} className="text-muted-foreground/30" />}
            title="No friends in network"
            subtitle="Add friends to track real-time locations and live signals"
            actionHref="/dashboard/friends"
            actionLabel="Find Friends"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={22} className="text-muted-foreground/30" />}
            title={`No results for "${query}"`}
            subtitle="Try searching with a different name or location"
          />
        ) : activeTab === 'nearby' ? (
          <div className="py-2">
            <Section label="Nearby Live Contacts" dot="bg-primary" count={nearbyList.length} pulse>
              {nearbyList.map((f) => (
                <FriendRow
                  key={f.id}
                  friend={f}
                  isFocused={focusedUserId === f.id}
                  onFocus={onFocusFriend}
                  onRouteTo={onRouteTo}
                  loc={friendsLocations.get(f.id)}
                  myLocation={myLocation}
                />
              ))}
            </Section>
          </div>
        ) : activeTab === 'live' ? (
          <div className="py-2">
            <Section label="Broadcasting Live" dot="bg-chart-5" count={live.length} pulse>
              {live.map((f) => (
                <FriendRow
                  key={f.id}
                  friend={f}
                  isFocused={focusedUserId === f.id}
                  onFocus={onFocusFriend}
                  onRouteTo={onRouteTo}
                  loc={friendsLocations.get(f.id)}
                  myLocation={myLocation}
                />
              ))}
            </Section>
          </div>
        ) : (
          <div className="py-2 space-y-1">
            {/* On the map */}
            {live.length > 0 && (
              <Section label="Broadcasting Live" dot="bg-chart-5" count={live.length} pulse>
                {live.map((f) => (
                  <FriendRow
                    key={f.id}
                    friend={f}
                    isFocused={focusedUserId === f.id}
                    onFocus={onFocusFriend}
                    onRouteTo={onRouteTo}
                    loc={friendsLocations.get(f.id)}
                    myLocation={myLocation}
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
                    myLocation={myLocation}
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
                    myLocation={myLocation}
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
      <div className="h-14 w-14 rounded-3xl bg-muted/50 flex items-center justify-center mb-3 shadow-inner">
        {icon}
      </div>
      <p className="text-sm font-extrabold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground/80 mt-1 leading-relaxed max-w-[210px]">{subtitle}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
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
            <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-70', dot)} />
          )}
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dot)} />
        </span>
        <span className={cn(
          'text-[10px] font-extrabold uppercase tracking-widest flex-1',
          dimmed ? 'text-muted-foreground/40' : 'text-muted-foreground/85',
        )}>
          {label}
        </span>
        <span className="text-[11px] font-bold text-muted-foreground/60 tabular-nums">{count}</span>
      </div>

      <div className={cn('px-2', dimmed && 'opacity-60')}>
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
  onRouteTo?: (lat: number, lng: number, name: string) => void;
  loc?:      {
    city?: string;
    latitude: number;
    longitude: number;
    speed?: number;
    timestamp?: string;
  };
  myLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

function FriendRow({ friend, isFocused, onFocus, onRouteTo, loc, myLocation }: RowProps) {
  const canFocus = !!loc && friend.sharingLocation;
  const speedKmh = loc?.speed != null && loc.speed > 0
    ? Math.round(loc.speed * 3.6)
    : null;
  const { bg, text } = avatarColor(friend.id);

  // Compute live distance if both myLocation and friend location exist
  const distanceStr = useMemo(() => {
    if (!loc || !myLocation || !isValidLatLng(myLocation.latitude, myLocation.longitude) || !isValidLatLng(loc.latitude, loc.longitude)) {
      return null;
    }
    const d = calculateDistanceKm(myLocation.latitude, myLocation.longitude, loc.latitude, loc.longitude);
    return formatDistance(d);
  }, [loc, myLocation]);

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
        'transition-all duration-200 select-none cursor-pointer',
        canFocus && 'hover:bg-muted/70 active:scale-[0.98]',
        !canFocus && 'cursor-default',
        isFocused && 'bg-primary/15 ring-1 ring-primary/40 shadow-xs',
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={cn(
          'relative h-10 w-10 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-sm shadow-xs',
          bg, text,
          isFocused && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
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
          'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card',
          isFocused     ? 'bg-primary'
          : loc          ? 'bg-chart-5 ring-1 ring-chart-5/40 animate-pulse'
          : friend.isOnline ? 'bg-chart-3'
          : 'bg-muted-foreground/30',
        )} />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p className={cn(
            'text-xs font-bold truncate transition-colors',
            isFocused ? 'text-primary font-extrabold' : 'text-foreground',
          )}>
            {friend.name}
          </p>
          {distanceStr && (
            <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-1.5 py-0.2 rounded-md shrink-0">
              {distanceStr}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-0.5 min-w-0">
          {loc && friend.sharingLocation ? (
            <>
              <MapPin size={10} className="text-primary/70 shrink-0" />
              <span className="text-[11px] text-muted-foreground/80 font-medium truncate">
                {loc.city ?? `${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)}`}
              </span>
            </>
          ) : friend.isOnline ? (
            <span className="text-[11px] text-chart-3 font-semibold truncate">
              Online
            </span>
          ) : (
            <>
              <Clock size={10} className="text-muted-foreground/40 shrink-0" />
              <span className="text-[11px] text-muted-foreground/60 truncate">
                {formatDistanceToNow(friend.lastSeen)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1 shrink-0">
        {speedKmh != null && speedKmh > 2 && (
          <span className="flex items-center gap-1 bg-chart-4/15 text-chart-4 border border-chart-4/20 rounded-lg px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums">
            <Gauge size={9} />
            {speedKmh} km/h
          </span>
        )}

        {canFocus && onRouteTo && myLocation && (
          <button
            type="button"
            title="Get Directions"
            onClick={(e) => {
              e.stopPropagation();
              onRouteTo(loc!.latitude, loc!.longitude, friend.name);
            }}
            className="h-7 w-7 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
          >
            <Compass size={13} />
          </button>
        )}

        {canFocus && !onRouteTo && (
          isFocused ? (
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md text-primary-foreground animate-in zoom-in-50 duration-150">
              <Compass size={13} className="animate-spin-slow" />
            </div>
          ) : (
            <ChevronRight
              size={15}
              className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
            />
          )
        )}
      </div>
    </motion.button>
  );
}
