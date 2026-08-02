'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGroup } from '@/hooks/useGroups';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LiveMap } from '@/components/map/LiveMap';
import { Users, ArrowLeft, Navigation } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLocationStore } from '@/store/useLocationStore';

export default function GroupDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: group, isLoading, error } = useGroup(Number(id));
  const { friendsLocations } = useLocationStore();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="h-64 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Group not found or you&apos;re not a member.</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/dashboard/groups">Back to Groups</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/groups">
            <ArrowLeft size={16} />
          </Link>
        </Button>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {group.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-bold">{group.name}</h1>
          <p className="text-sm text-muted-foreground">{group.members.length} members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <LiveMap className="h-96" showFriends />
        </div>

        {/* Members */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users size={15} className="text-primary" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {group.members.map((member) => {
                const loc = friendsLocations.get(member.userId);
                return (
                  <div key={member.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 border-b border-border/30 last:border-0 transition-colors">
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {member.user.name.charAt(0)}
                      </div>
                      <span className={cn(
                        'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card',
                        member.user.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium truncate">{member.user.name}</p>
                        {member.role === 'ADMIN' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Admin</span>
                        )}
                      </div>
                      {loc ? (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Navigation size={8} />
                          {loc.city ?? `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}`}
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground/50">No location</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
