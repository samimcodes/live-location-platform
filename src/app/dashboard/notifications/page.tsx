'use client';

import React from 'react';
import { useNotifications, useMarkAllRead, useMarkRead, useDeleteNotification } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash2, UserPlus, MapPin, Users, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';

const typeIcon: Record<string, React.ElementType> = {
  FRIEND_REQUEST: UserPlus,
  FRIEND_ACCEPTED: Users,
  GROUP_INVITE: Users,
  GROUP_JOINED: Users,
  LOCATION_ALERT: MapPin,
  SYSTEM: Info,
};

const typeBg: Record<string, string> = {
  FRIEND_REQUEST: 'bg-indigo-50 dark:bg-indigo-950/50',
  FRIEND_ACCEPTED: 'bg-emerald-50 dark:bg-emerald-950/50',
  GROUP_INVITE: 'bg-purple-50 dark:bg-purple-950/50',
  GROUP_JOINED: 'bg-purple-50 dark:bg-purple-950/50',
  LOCATION_ALERT: 'bg-orange-50 dark:bg-orange-950/50',
  SYSTEM: 'bg-blue-50 dark:bg-blue-950/50',
};

const typeColor: Record<string, string> = {
  FRIEND_REQUEST: 'text-indigo-500',
  FRIEND_ACCEPTED: 'text-emerald-500',
  GROUP_INVITE: 'text-purple-500',
  GROUP_JOINED: 'text-purple-500',
  LOCATION_ALERT: 'text-orange-500',
  SYSTEM: 'text-blue-500',
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllRead();
  const { mutate: markRead } = useMarkRead();
  const { mutate: deleteNotif } = useDeleteNotification();

  const notifications = data?.notifications ?? [];
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unread > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">{unread} unread</p>
          )}
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead()} disabled={markingAll}>
            <Check size={14} className="mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <Bell size={40} className="mb-3 opacity-20" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm mt-1">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((n, i) => {
                const Icon = typeIcon[n.type] ?? Info;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      'flex items-start gap-3 px-4 py-4 border-b border-border/40 last:border-0 transition-colors group',
                      !n.isRead && 'bg-primary/5'
                    )}
                  >
                    <div className={cn(
                      'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
                      typeBg[n.type] ?? 'bg-muted'
                    )}>
                      <Icon size={15} className={cn(typeColor[n.type] ?? 'text-muted-foreground')} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', !n.isRead && 'text-foreground')}>{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1">{formatDistanceToNow(n.createdAt)}</p>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!n.isRead && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Mark as read"
                        >
                          <Check size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotif(n.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
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
