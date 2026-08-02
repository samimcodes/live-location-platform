'use client';

import React, { useState } from 'react';
import { LiveMap } from '@/components/map/LiveMap';
import { useFriends } from '@/hooks/useFriends';
import { useLocationStore } from '@/store/useLocationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation, Users, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';

export default function MapPage() {
  const { data: friends = [] } = useFriends();
  const { isSharing, setSharing, friendsLocations } = useLocationStore();
  const [focusedUserId, setFocusedUserId] = useState<number | undefined>();

  const sharingFriends = friends.filter((f) => f.sharingLocation && friendsLocations.has(f.id));

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4">
      {/* Map */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Controls bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border',
              isSharing
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900'
                : 'bg-muted text-muted-foreground border-border'
            )}>
              <span className={cn('h-1.5 w-1.5 rounded-full', isSharing ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground')} />
              {isSharing ? 'Sharing your location' : 'Sharing paused'}
            </div>
          </div>
          <Button
            variant={isSharing ? 'outline' : 'default'}
            size="sm"
            onClick={() => setSharing(!isSharing)}
          >
            <Radio size={14} className="mr-2" />
            {isSharing ? 'Pause sharing' : 'Share location'}
          </Button>
        </div>

        <LiveMap
          className="flex-1"
          showFriends
          focusUserId={focusedUserId}
        />
      </div>

      {/* Friends panel */}
      <div className="hidden lg:flex flex-col w-72 shrink-0">
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users size={15} className="text-primary" />
              Friends on Map
              <span className="ml-auto text-xs text-muted-foreground font-normal">
                {sharingFriends.length} active
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-2">
            {friends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">No friends yet</p>
              </div>
            ) : (
              friends.map((f) => {
                const loc = friendsLocations.get(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => setFocusedUserId(focusedUserId === f.id ? undefined : f.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left',
                      focusedUserId === f.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {f.name.charAt(0)}
                      </div>
                      <span className={cn(
                        'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card',
                        f.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{f.name}</p>
                      {loc ? (
                        <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                          <Navigation size={9} />
                          {loc.city ?? `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}`}
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/50">Location hidden</p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
