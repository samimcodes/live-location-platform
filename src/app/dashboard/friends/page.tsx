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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, UserMinus, Search, UserPlus,
  Navigation, MapPin, Clock, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import type { Friend } from '@/hooks/useFriends';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { useLocationStore } from '@/store/useLocationStore';

// ── Avatar helper ─────────────────────────────────────────────────────────
function Avatar({
  name,
  avatar,
  size = 10,
  isOnline,
}: {
  name: string;
  avatar?: string | null;
  size?: number;
  isOnline?: boolean;
}) {
  return (
    <div className={`relative shrink-0 h-${size} w-${size}`}>
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          fill
          className="rounded-full object-cover"
          sizes="40px"
        />
      ) : (
        <div
          className={`h-${size} w-${size} rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold`}
          style={{ fontSize: size > 8 ? 16 : 13 }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card',
            isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/50'
          )}
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

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Friends</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {friends.length} friend{friends.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/friends/requests" className="relative">
            <UserPlus size={14} className="mr-2" />
            Requests
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                {pendingCount}
              </span>
            )}
          </Link>
        </Button>
      </div>

      {/* ── Find People ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Search size={15} className="text-primary" />
            Find People
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search by name or email…"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
            {searching && (
              <Loader2
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
              />
            )}
          </div>

          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-2"
              >
                {searchResults.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border"
                  >
                    <Avatar name={u.name} avatar={u.avatar} size={9} isOnline={u.isOnline} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    {friendIds.has(u.id) ? (
                      <span className="text-xs text-emerald-600 font-medium px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-full">
                        Friends
                      </span>
                    ) : sentIds.has(u.id) ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={11} /> Sent
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        disabled={sending}
                        onClick={() => handleSendRequest(u.id)}
                      >
                        <UserPlus size={13} className="mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <motion.p
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground text-center py-3"
              >
                No users found for &ldquo;{searchQuery}&rdquo;
              </motion.p>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ── Your Friends ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users size={15} className="text-primary" />
            Your Friends
            <span className="ml-auto text-xs text-muted-foreground font-normal">
              {friends.filter((f) => f.isOnline).length} online
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No friends yet</p>
              <p className="text-sm mt-1">Search above to find people you know</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend, i) => {
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
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors group"
                  >
                    <Avatar
                      name={friend.name}
                      avatar={friend.avatar}
                      size={10}
                      isOnline={friend.isOnline}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{friend.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        {friend.isOnline ? (
                          <span className="text-emerald-600 font-medium">● Online</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatDistanceToNow(friend.lastSeen)}
                          </span>
                        )}

                        {displayCity && friend.sharingLocation && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span
                              className={cn(
                                'flex items-center gap-0.5',
                                isLive && 'text-primary'
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

                    {/* Actions — shown on hover */}
                    <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                      {/* Navigate to map and focus this friend */}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View on map"
                        onClick={() => handleNavigateToMap(friend.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Navigation size={14} />
                      </Button>

                      {/* Remove friend */}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Remove friend"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <UserMinus size={14} />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
