'use client';

/**
 * FriendMarkerPanel
 * -----------------
 * Sidebar panel listing all friends and their current map status.
 *
 * Features:
 *  - Online / offline indicator dot
 *  - Location available / hidden state
 *  - Last-seen timestamp when offline
 *  - Click to fly map to that friend (via onFocusFriend callback)
 *  - Visual highlight on focused friend
 *  - Empty state
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Navigation, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { useLocationStore } from '@/store/useLocationStore';
import type { Friend } from '@/hooks/useFriends';

export interface FriendMarkerPanelProps {
  friends: Friend[];
  focusedUserId?: number;
  onFocusFriend: (userId: number | undefined) => void;
  className?: string;
}

export function FriendMarkerPanel({
  friends,
  focusedUserId,
  onFocusFriend,
  className,
}: FriendMarkerPanelProps) {
  const { friendsLocations } = useLocationStore();

  const activeCount = friends.filter(
    (f) => f.sharingLocation && friendsLocations.has(f.id)
  ).length;

  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <CardHeader className="shrink-0 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users size={14} className="text-primary" />
          Friends on Map
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            {activeCount} active
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Users size={28} className="mb-2 opacity-20" />
            <p className="text-xs text-center">No friends yet</p>
            <p className="text-[11px] text-center mt-1 opacity-70">
              Add friends to see their locations
            </p>
          </div>
        ) : (
          friends.map((friend) => {
            const loc = friendsLocations.get(friend.id);
            const isFocused = focusedUserId === friend.id;
            const canFocus = !!loc && friend.sharingLocation;

            return (
              <button
                key={friend.id}
                onClick={() => {
                  if (!canFocus) return;
                  onFocusFriend(isFocused ? undefined : friend.id);
                }}
                disabled={!canFocus}
                className={cn(
                  'w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all',
                  canFocus && 'hover:bg-muted/50 cursor-pointer',
                  !canFocus && 'opacity-60 cursor-default',
                  isFocused
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-border'
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card',
                      friend.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                    )}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{friend.name}</p>

                  {loc && friend.sharingLocation ? (
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                      <Navigation size={9} className="shrink-0" />
                      {loc.city ?? `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}`}
                    </p>
                  ) : !friend.isOnline ? (
                    <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                      <Clock size={9} className="shrink-0" />
                      {formatDistanceToNow(friend.lastSeen)}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                      Location hidden
                    </p>
                  )}
                </div>

                {/* Focus indicator */}
                {isFocused && (
                  <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
