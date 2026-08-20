'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useFriends,
  useRemoveFriend,
  useSendFriendRequest,
  usePendingRequestCount,
} from '@/hooks/useFriends';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, UserMinus, Search, UserPlus,
  Navigation, MapPin, Clock, Loader2,
  UserCheck, Eye, MoreHorizontal, Radio,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import type { Friend } from '@/hooks/useFriends';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { useLocationStore } from '@/store/useLocationStore';

// ── Reusable avatar ───────────────────────────────────────────────────────
const GRADIENTS = [
  'from-indigo-400 to-purple-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-rose-500',
  'from-sky-400 to-blue-500',
  'from-violet-400 to-fuchsia-500',
];

function FriendAvatar({
  name,
  avatar,
  size = 44,
  isOnline,
  index = 0,
}: {
  name: string;
  avatar?: string | null;
  size?: number;
  isOnline?: boolean;
  index?: number;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          fill
          className="rounded-2xl object-cover"
          sizes={`${size}px`}
        />
      ) : (
        <div
          className={cn(
            'w-full h-full rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold',
            GRADIENTS[index % GRADIENTS.length],
          )}
          style={{ fontSize: Math.round(size * 0.38) }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-[2.5px] border-card',
            isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40',
          )}
          style={{ width: Math.max(10, size * 0.25), height: Math.max(10, size * 0.25) }}
        />
      )}
    </div>
  );
}

// ── Search result type ────────────────────────────────────────────────────
interface SearchUser {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  isOnline: boolean;
}

// ── Animation helpers ─────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: 'easeOut' as const },
});

export default function FriendsPage() {
  const router = useRouter();
  const { data: friends = [], isLoading } = useFriends();
  const { mutate: removeFriend }          = useRemoveFriend();
  const { mutate: sendRequest, isPending: sending } = useSendFriendRequest();
  const { data: pendingCount = 0 }        = usePendingRequestCount();

  // Live location data from Zustand (fed by socket)
  const { friendsLocations } = useLocationStore();

  // Tracking which friend's remove/nav button was clicked
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Filter tabs
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');

  // ── Debounced search ──────────────────────────────────────────────────
  const [searchInput,  setSearchInput]  = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [sentIds,      setSentIds]      = useState<Set<number>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val.trim()), 400);
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const { data: searchResults = [], isFetching: searching } = useQuery({
    queryKey: ['user-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const { data } = await api.get(
        `/friends/search?q=${encodeURIComponent(searchQuery)}`
      );
      return data.data as SearchUser[];
    },
    enabled: searchQuery.length >= 2,
  });

  const friendIds = new Set(friends.map((f) => f.id));

  const handleSendRequest = useCallback(
    (receiverId: number) => {
      setSentIds((prev) => new Set(prev).add(receiverId));
      sendRequest(
        { receiverId },
        { onError: () => setSentIds((prev) => { const s = new Set(prev); s.delete(receiverId); return s; }) }
      );
    },
    [sendRequest]
  );

  // Navigate to map and pass focusUserId via query param
  const handleNavigateToMap = (friendId: number) => {
    router.push(`/dashboard/map?focus=${friendId}`);
  };

  // Filtered friends
  const filteredFriends = friends.filter((f) => {
    if (filter === 'online') return f.isOnline;
    if (filter === 'offline') return !f.isOnline;
    return true;
  });

  const onlineCount = friends.filter((f) => f.isOnline).length;

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ═══════════════════════════════════════════════════════════════
          HEADER — rich banner style
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}>
        <div className="relative rounded-2xl overflow-hidden welcome-gradient border border-border/40">
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Friends</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {friends.length} friend{friends.length !== 1 ? 's' : ''} · {onlineCount} online now
                  </p>
                </div>
              </div>

              <Button asChild className="gap-2 shadow-sm">
                <Link href="/dashboard/friends/requests" className="relative">
                  <UserPlus size={15} />
                  Requests
                  {pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </Button>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              {[
                { icon: Users, label: `${friends.length} total`, active: true },
                { icon: Radio, label: `${onlineCount} online`, active: onlineCount > 0 },
                { icon: MapPin, label: `${friendsLocations.size} sharing`, active: friendsLocations.size > 0 },
              ].map(({ icon: PillIcon, label, active }) => (
                <div
                  key={label}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors',
                    active
                      ? 'bg-card/80 border-border/50 text-foreground'
                      : 'bg-muted/40 border-transparent text-muted-foreground',
                  )}
                >
                  <PillIcon size={12} className={active ? 'text-primary' : 'text-muted-foreground/50'} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          FIND PEOPLE — search card
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0.08)}>
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
              <Search size={16} className="text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-bold">Find People</p>
              <p className="text-xs text-muted-foreground">Search by name or email</p>
            </div>
          </div>

          <div className="border-t border-border/30 px-5 py-4 space-y-4">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50"
              />
              <Input
                placeholder="Search by name or email…"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-muted/30 border-border/40 focus:bg-card transition-colors"
              />
              {searching && (
                <Loader2
                  size={15}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin"
                />
              )}
            </div>

            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-2"
                >
                  {searchResults.map((u, i) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors group"
                    >
                      <FriendAvatar name={u.name} avatar={u.avatar} size={40} isOnline={u.isOnline} index={i} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      {friendIds.has(u.id) ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                          <UserCheck size={12} />
                          Friends
                        </span>
                      ) : sentIds.has(u.id) ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium px-2.5 py-1 bg-muted/50 rounded-lg">
                          <Clock size={11} /> Sent
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          disabled={sending}
                          onClick={() => handleSendRequest(u.id)}
                          className="gap-1.5 h-8 rounded-lg shadow-sm"
                        >
                          <UserPlus size={13} />
                          Add
                        </Button>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-2">
                    <Search size={18} className="text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No users found for &ldquo;{searchQuery}&rdquo;
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          YOUR FRIENDS — list with filter tabs
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0.16)}>
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {/* Header + filter tabs */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                  <UserCheck size={16} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">Your Friends</p>
                  <p className="text-xs text-muted-foreground">
                    {filteredFriends.length} {filter !== 'all' ? filter : ''} friend{filteredFriends.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
                {([
                  { key: 'all' as const,     label: 'All',     count: friends.length },
                  { key: 'online' as const,  label: 'Online',  count: onlineCount },
                  { key: 'offline' as const, label: 'Offline', count: friends.length - onlineCount },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={cn(
                      'flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all',
                      filter === tab.key
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {tab.label}
                    <span className={cn(
                      'text-[10px] tabular-nums',
                      filter === tab.key ? 'text-primary' : 'text-muted-foreground/50',
                    )}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border/30" />

          {/* Content */}
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="h-11 w-11 rounded-2xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded-lg bg-muted animate-pulse" />
                    <div className="h-3 w-20 rounded-lg bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                <Users size={24} className="opacity-25" />
              </div>
              <p className="text-sm font-semibold">
                {filter === 'all' ? 'No friends yet' : `No ${filter} friends`}
              </p>
              <p className="text-xs mt-1 opacity-60">
                {filter === 'all' ? 'Search above to find people you know' : 'Check back later'}
              </p>
              {filter !== 'all' && (
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setFilter('all')}>
                  Show all friends
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {filteredFriends.map((friend, i) => {
                // Prefer live socket location, fall back to REST snapshot
                const liveLoc    = friendsLocations.get(friend.id);
                const restCity   = friend.locations?.[0]?.city;
                const displayCity = liveLoc?.city ?? restCity;
                const isLive     = !!liveLoc;

                return (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted/20 transition-colors group"
                  >
                    <FriendAvatar
                      name={friend.name}
                      avatar={friend.avatar}
                      size={44}
                      isOnline={friend.isOnline}
                      index={i}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{friend.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        {friend.isOnline ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-50" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            Online
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatDistanceToNow(friend.lastSeen)}
                          </span>
                        )}

                        {displayCity && friend.sharingLocation && (
                          <>
                            <span className="text-muted-foreground/30">·</span>
                            <span
                              className={cn(
                                'flex items-center gap-0.5',
                                isLive && 'text-primary font-medium'
                              )}
                            >
                              <MapPin size={9} className="shrink-0" />
                              {displayCity}
                              {isLive && (
                                <span className="h-1 w-1 rounded-full bg-primary ml-0.5 animate-pulse" />
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      {/* View on map */}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View on map"
                        onClick={() => handleNavigateToMap(friend.id)}
                        className="h-8 px-2.5 gap-1.5 text-xs rounded-lg"
                      >
                        <Eye size={13} />
                        <span className="hidden sm:inline">Map</span>
                      </Button>

                      {/* Remove friend */}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Remove friend"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        disabled={removingId === friend.id}
                        onClick={() => {
                          if (!confirm(`Remove ${friend.name} from friends?`)) return;
                          setRemovingId(friend.id);
                          removeFriend(friend.id, {
                            onSettled: () => setRemovingId(null),
                          });
                        }}
                      >
                        {removingId === friend.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <UserMinus size={13} />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          EMPTY STATE — when no friends at all
         ═══════════════════════════════════════════════════════════════ */}
      {!isLoading && friends.length === 0 && (
        <motion.div {...fadeUp(0.24)}>
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 px-8 py-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center mb-5">
              <Sparkles size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold">Get started</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Search for people you know and send them a friend request to start sharing locations.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
