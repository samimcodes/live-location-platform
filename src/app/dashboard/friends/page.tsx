'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useFriends,
  useRemoveFriend,
  useSendFriendRequest,
  usePendingRequestCount,
  useSentRequests,
} from '@/hooks/useFriends';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, UserMinus, Search, UserPlus,
  MapPin, Clock, Loader2, UserCheck,
  Eye, Radio, Sparkles, AlertTriangle,
  X, Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import type { Friend } from '@/hooks/useFriends';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { useLocationStore } from '@/store/useLocationStore';

// ── Avatar color palette (id-based, never changes per user) ──────────────
const AVATAR_BG = [
  'bg-chart-1', 'bg-chart-2', 'bg-chart-3',
  'bg-chart-4', 'bg-chart-5', 'bg-primary', 'bg-ring',
];
function avatarBg(id: number) { return AVATAR_BG[id % AVATAR_BG.length]; }

function FriendAvatar({
  id, name, avatar, size = 44, isOnline,
}: {
  id: number; name: string; avatar?: string | null;
  size?: number; isOnline?: boolean;
}) {
  const dotSize = Math.max(10, Math.round(size * 0.26));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {avatar ? (
        <Image src={avatar} alt={name} fill
          className="rounded-2xl object-cover" sizes={`${size}px`} />
      ) : (
        <div
          className={cn(
            'w-full h-full rounded-2xl flex items-center justify-center',
            'text-primary-foreground font-bold select-none',
            avatarBg(id),
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
            isOnline ? 'bg-chart-5' : 'bg-muted-foreground/30',
          )}
          style={{ width: dotSize, height: dotSize }}
        />
      )}
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────
function ConfirmDialog({
  open, title, description, confirmLabel = 'Remove',
  onConfirm, onCancel,
}: {
  open: boolean; title: string; description: string;
  confirmLabel?: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0,  opacity: 1, scale: 1    }}
            exit={{   y: 24, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={16} className="text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-snug">{title}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
              </div>
              <button onClick={onCancel}
                className="text-muted-foreground/50 hover:text-foreground transition-colors -mt-1 -mr-1 p-1">
                <X size={14} />
              </button>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" size="sm" className="flex-1 h-9" onClick={onCancel}>Cancel</Button>
              <Button variant="destructive" size="sm" className="flex-1 h-9" onClick={onConfirm}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Types / helpers ───────────────────────────────────────────────────────
interface SearchUser {
  id: number; name: string; email: string;
  avatar?: string | null; isOnline: boolean;
}

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.32, delay, ease: 'easeOut' as const },
});

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3.5 px-5 py-4">
      <div className="h-11 w-11 rounded-2xl bg-muted animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-28 rounded-md bg-muted animate-pulse" />
        <div className="h-2.5 w-20 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="flex gap-1.5 shrink-0">
        <div className="h-8 w-16 rounded-lg bg-muted animate-pulse" />
        <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
export default function FriendsPage() {
  const router = useRouter();
  const { data: friends = [], isLoading, isError } = useFriends();
  const { mutate: removeFriend }                    = useRemoveFriend();
  const { mutate: sendRequest }                     = useSendFriendRequest();
  const { data: pendingCount = 0 }                  = usePendingRequestCount();
  const { data: sentRequests = [] }                 = useSentRequests();
  const { friendsLocations }                        = useLocationStore();

  const [removingId,    setRemovingId]    = useState<number | null>(null);
  const [confirmFriend, setConfirmFriend] = useState<Friend | null>(null);
  const [sendingId,     setSendingId]     = useState<number | null>(null);
  const [filter,        setFilter]        = useState<'all' | 'online' | 'offline'>('all');
  const [searchInput,   setSearchInput]   = useState('');
  const [searchQuery,   setSearchQuery]   = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
  const sentIds   = useMemo(() => new Set(sentRequests.map((r) => r.receiverId)), [sentRequests]);
  const onlineCount = useMemo(() => friends.filter((f) => f.isOnline).length, [friends]);

  const filteredFriends = useMemo(() => friends.filter((f) => {
    if (filter === 'online')  return f.isOnline;
    if (filter === 'offline') return !f.isOnline;
    return true;
  }), [friends, filter]);

  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val.trim()), 380);
  }, []);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const { data: searchResults = [], isFetching: searching } = useQuery({
    queryKey: ['user-search', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const { data } = await api.get(`/friends/search?q=${encodeURIComponent(searchQuery)}`);
      return data.data as SearchUser[];
    },
    enabled: searchQuery.length >= 2,
  });

  const handleSendRequest = useCallback((receiverId: number) => {
    setSendingId(receiverId);
    sendRequest({ receiverId }, { onSettled: () => setSendingId(null) });
  }, [sendRequest]);

  const handleConfirmRemove = useCallback(() => {
    if (!confirmFriend) return;
    setRemovingId(confirmFriend.id);
    setConfirmFriend(null);
    removeFriend(confirmFriend.id, { onSettled: () => setRemovingId(null) });
  }, [confirmFriend, removeFriend]);

  return (
    <div className="space-y-5 max-w-4xl pb-8">

      <ConfirmDialog
        open={!!confirmFriend}
        title={`Remove ${confirmFriend?.name ?? 'friend'}?`}
        description="They'll be removed from your friends list and won't appear on your map."
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmFriend(null)}
      />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)}>
        <div className="relative rounded-2xl overflow-hidden welcome-gradient border border-border/40">
          <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/2 h-24 bg-gradient-to-r from-chart-3/5 to-transparent pointer-events-none" />
          <div className="relative px-6 py-6 sm:px-8">
            {/* Top row */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm shrink-0">
                  <Users size={20} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">Friends</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {friends.length} friend{friends.length !== 1 ? 's' : ''} · {onlineCount} online
                  </p>
                </div>
              </div>

              <Button asChild className="gap-2 shadow-sm relative">
                <Link href="/dashboard/friends/requests">
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

            {/* Stat pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { icon: Users,  label: `${friends.length} total`,           active: true,                        },
                { icon: Radio,  label: `${onlineCount} online`,             active: onlineCount > 0,             },
                { icon: MapPin, label: `${friendsLocations.size} on map`,   active: friendsLocations.size > 0,   },
              ].map(({ icon: Icon, label, active }) => (
                <div key={label} className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border',
                  active
                    ? 'bg-card/80 border-border/50 text-foreground'
                    : 'bg-muted/40 border-transparent text-muted-foreground',
                )}>
                  <Icon size={11} className={active ? 'text-primary' : 'text-muted-foreground/40'} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── FIND PEOPLE ────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.07)}>
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-3 px-5 pt-4 pb-3">
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Search size={14} className="text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Find People</p>
              <p className="text-xs text-muted-foreground mt-0.5">Search by name or email</p>
            </div>
          </div>

          <div className="px-5 pb-4 space-y-3">
            {/* Search input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
              <Input
                placeholder="Search by name or email…"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-muted/40 border-border/40 text-sm focus:bg-card transition-colors"
              />
              {searching && (
                <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin" />
              )}
              {searchInput && !searching && (
                <button
                  onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted-foreground/15 flex items-center justify-center hover:bg-muted-foreground/25 transition-colors"
                >
                  <X size={10} className="text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{   opacity: 0, y: -6  }}
                  className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/30"
                >
                  {searchResults.map((u, i) => {
                    const isFriend  = friendIds.has(u.id);
                    const isSent    = sentIds.has(u.id);
                    const isSending = sendingId === u.id;
                    return (
                      <div key={u.id}
                        className="flex items-center gap-3 px-3.5 py-3 bg-card hover:bg-muted/30 transition-colors">
                        <FriendAvatar id={u.id} name={u.name} avatar={u.avatar} size={38} isOnline={u.isOnline} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">{u.name}</p>
                          <p className="text-xs text-muted-foreground/60 truncate">{u.email}</p>
                        </div>
                        {isFriend ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-chart-5 font-semibold px-2.5 py-1 bg-chart-5/10 rounded-lg shrink-0">
                            <UserCheck size={11} /> Friends
                          </span>
                        ) : isSent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium px-2.5 py-1 bg-muted/50 rounded-lg shrink-0">
                            <Clock size={10} /> Sent
                          </span>
                        ) : (
                          <Button size="sm" disabled={isSending}
                            onClick={() => handleSendRequest(u.id)}
                            className="h-8 gap-1.5 rounded-lg shadow-sm shrink-0 text-xs px-3">
                            {isSending
                              ? <Loader2 size={12} className="animate-spin" />
                              : <UserPlus size={12} />}
                            Add
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-8 text-muted-foreground gap-1"
                >
                  <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center mb-1">
                    <Search size={16} className="opacity-30" />
                  </div>
                  <p className="text-sm font-medium">No results</p>
                  <p className="text-xs opacity-50">Try a different name or email</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── YOUR FRIENDS ───────────────────────────────────────── */}
      <motion.div {...fadeUp(0.14)}>
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">

          {/* Card header + filter */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <UserCheck size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">Your Friends</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filteredFriends.length}
                  {filter !== 'all' ? ` ${filter}` : ''} friend{filteredFriends.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-0.5 bg-muted/50 rounded-lg p-0.5">
              {([
                { key: 'all'     as const, label: 'All',     count: friends.length },
                { key: 'online'  as const, label: 'Online',  count: onlineCount },
                { key: 'offline' as const, label: 'Offline', count: friends.length - onlineCount },
              ]).map((tab) => (
                <button key={tab.key} onClick={() => setFilter(tab.key)}
                  className={cn(
                    'flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium transition-all',
                    filter === tab.key
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.label}
                  <span className={cn('tabular-nums text-[10px]',
                    filter === tab.key ? 'text-primary' : 'text-muted-foreground/40')}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border/30" />

          {/* Body */}
          {isError ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground gap-2">
              <div className="h-11 w-11 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-destructive/70" />
              </div>
              <p className="text-sm font-semibold mt-1">Failed to load friends</p>
              <p className="text-xs opacity-50">Check your connection and refresh.</p>
            </div>
          ) : isLoading ? (
            <div className="divide-y divide-border/20">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-muted-foreground gap-1">
              <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-2">
                <Users size={22} className="opacity-20" />
              </div>
              <p className="text-sm font-semibold">
                {filter === 'all' ? 'No friends yet' : `No ${filter} friends`}
              </p>
              <p className="text-xs opacity-50 text-center max-w-[18rem]">
                {filter === 'all' ? 'Search above to find people' : 'Check back later'}
              </p>
              {filter !== 'all' && (
                <Button variant="outline" size="sm" className="mt-3 h-8 text-xs"
                  onClick={() => setFilter('all')}>
                  Show all
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {filteredFriends.map((friend, i) => {
                const liveLoc     = friendsLocations.get(friend.id);
                const displayCity = liveLoc?.city ?? friend.locations?.[0]?.city;
                const isLive      = !!liveLoc;

                return (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.22 }}
                    className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted/20 transition-colors group"
                  >
                    <FriendAvatar
                      id={friend.id} name={friend.name}
                      avatar={friend.avatar} size={44}
                      isOnline={friend.isOnline}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">{friend.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {friend.isOnline ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-chart-5 font-medium">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inset-0 rounded-full bg-chart-5 opacity-50" />
                              <span className="relative rounded-full h-1.5 w-1.5 bg-chart-5" />
                            </span>
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                            <Clock size={9} />
                            {formatDistanceToNow(friend.lastSeen)}
                          </span>
                        )}

                        {displayCity && friend.sharingLocation && (
                          <>
                            <span className="text-muted-foreground/25 text-[10px]">·</span>
                            <span className={cn(
                              'inline-flex items-center gap-0.5 text-[11px]',
                              isLive ? 'text-primary font-medium' : 'text-muted-foreground/60',
                            )}>
                              <MapPin size={9} className="shrink-0" />
                              {displayCity}
                              {isLive && (
                                <span className="ml-0.5 h-1 w-1 rounded-full bg-primary animate-pulse" />
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions — always visible on mobile, hover on desktop */}
                    <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                      <Button
                        variant="ghost" size="sm"
                        title="View on map"
                        onClick={() => router.push(`/dashboard/map?focus=${friend.id}`)}
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 sm:hidden"
                      >
                        <Navigation size={14} />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        title="View on map"
                        onClick={() => router.push(`/dashboard/map?focus=${friend.id}`)}
                        className="h-8 px-2.5 gap-1.5 text-xs rounded-lg hidden sm:flex"
                      >
                        <Eye size={13} />
                        Map
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        title="Remove friend"
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        disabled={removingId === friend.id}
                        onClick={() => setConfirmFriend(friend)}
                      >
                        {removingId === friend.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <UserMinus size={13} />}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── EMPTY STATE (zero friends at all) ──────────────────── */}
      {!isLoading && !isError && friends.length === 0 && (
        <motion.div {...fadeUp(0.2)}>
          <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 px-8 py-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
              <Sparkles size={28} className="text-primary" />
            </div>
            <h3 className="text-base font-bold">Start connecting</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
              Search for people you know and send a friend request to start sharing locations.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
