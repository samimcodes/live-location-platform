'use client';

import React, { useState } from 'react';
import { useFriends, useRemoveFriend, useSendFriendRequest } from '@/hooks/useFriends';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, UserMinus, Search, UserPlus, Navigation, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import type { Friend } from '@/hooks/useFriends';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/dateUtils';

export default function FriendsPage() {
  const { data: friends = [], isLoading } = useFriends();
  const { mutate: removeFriend, isPending: removing } = useRemoveFriend();
  const { mutate: sendRequest, isPending: sending } = useSendFriendRequest();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);

  const { data: searchResults = [], isFetching: searching } = useQuery({
    queryKey: ['user-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const { data } = await api.get(`/friends/search?q=${encodeURIComponent(searchQuery)}`);
      return data.data as Array<{ id: number; name: string; email: string; avatar?: string; isOnline: boolean }>;
    },
    enabled: searchQuery.length >= 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const friendIds = new Set(friends.map((f) => f.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Friends</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{friends.length} friend{friends.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/friends/requests">
            <UserPlus size={14} className="mr-2" />
            Requests
          </Link>
        </Button>
      </div>

      {/* Search to add friends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Search size={15} className="text-primary" />
            Find People
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by name or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={searchInput.length < 2}>
              Search
            </Button>
          </form>

          {searching && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Searching…
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  {friendIds.has(u.id) ? (
                    <span className="text-xs text-emerald-600 font-medium">Friends</span>
                  ) : (
                    <Button
                      size="sm"
                      disabled={sending}
                      onClick={() => sendRequest({ receiverId: u.id })}
                    >
                      <UserPlus size={13} className="mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-3">No users found for &ldquo;{searchQuery}&rdquo;</p>
          )}
        </CardContent>
      </Card>

      {/* Friends list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users size={15} className="text-primary" />
            Your Friends
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
              {friends.map((friend, i) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {friend.name.charAt(0)}
                    </div>
                    <span className={cn(
                      'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card',
                      friend.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{friend.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {friend.isOnline ? (
                        <span className="text-emerald-600">● Online</span>
                      ) : (
                        <span>Last seen {formatDistanceToNow(friend.lastSeen)}</span>
                      )}
                      {friend.locations?.[0]?.city && (
                        <>
                          <span>·</span>
                          <MapPin size={10} />
                          <span>{friend.locations[0].city}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/map`}>
                        <Navigation size={13} />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      disabled={removingId === friend.id}
                      onClick={() => {
                        setRemovingId(friend.id);
                        removeFriend(friend.id, { onSettled: () => setRemovingId(null) });
                      }}
                    >
                      <UserMinus size={13} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
