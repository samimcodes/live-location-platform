'use client';

import React, { useState } from 'react';
import {
  useNotifications,
  useMarkAllRead,
  useMarkRead,
  useDeleteNotification,
  useDeleteAllRead,
} from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import {
  Bell, Check, Trash2, UserPlus,
  MapPin, Users, Info, Loader2, CheckCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';

// ── Icons and Colors Config ────────────────────────────────────────────────
const typeIcon: Record<string, React.ElementType> = {
  FRIEND_REQUEST:  UserPlus,
  FRIEND_ACCEPTED: Users,
  GROUP_INVITE:    Users,
  GROUP_JOINED:    Users,
  LOCATION_ALERT:  MapPin,
  SYSTEM:          Info,
};

const typeGradient: Record<string, string> = {
  FRIEND_REQUEST:  'from-indigo-500 to-indigo-400',
  FRIEND_ACCEPTED: 'from-emerald-500 to-emerald-400',
  GROUP_INVITE:    'from-purple-500 to-purple-400',
  GROUP_JOINED:    'from-fuchsia-500 to-fuchsia-400',
  LOCATION_ALERT:  'from-orange-500 to-orange-400',
  SYSTEM:          'from-blue-500 to-blue-400',
};

// ── Animation helpers ─────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

export default function NotificationsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching }      = useNotifications(page);
  const { mutate: markAllRead,  isPending: markingAll  } = useMarkAllRead();
  const { mutate: markRead }                              = useMarkRead();
  const { mutate: deleteNotif }                           = useDeleteNotification();
  const { mutate: deleteAllRead, isPending: deletingAll } = useDeleteAllRead();

  const notifications  = data?.notifications ?? [];
  const totalPages     = data?.pagination?.totalPages ?? 1;
  const total          = data?.pagination?.total ?? 0;
  const unread         = notifications.filter((n) => !n.isRead).length;
  const readCount      = notifications.filter((n) => n.isRead).length;
  const hasMore        = page < totalPages;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ═══════════════════════════════════════════════════════════════
          HEADER — Premium Banner
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}>
        <div className="relative rounded-2xl overflow-hidden welcome-gradient border border-border/40 shadow-sm">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bell size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Notifications</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {total > 0 ? `${total} total` : 'No notifications'}
                    {unread > 0 && ` · ${unread} unread`}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {readCount > 0 && (
                  <Button
                    variant="outline" size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl h-9"
                    onClick={() => deleteAllRead()}
                    disabled={deletingAll}
                  >
                    {deletingAll
                      ? <Loader2 size={13} className="mr-2 animate-spin" />
                      : <Trash2 size={13} className="mr-2" />
                    }
                    Delete read
                  </Button>
                )}
                {unread > 0 && (
                  <Button size="sm" className="rounded-xl h-9 shadow-sm" onClick={() => markAllRead()} disabled={markingAll}>
                    {markingAll
                      ? <Loader2 size={13} className="mr-2 animate-spin" />
                      : <CheckCheck size={13} className="mr-2" />
                    }
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          NOTIFICATIONS LIST
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0.08)}>
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {isLoading && notifications.length === 0 ? (
            <div className="space-y-4 p-5 sm:p-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="h-11 w-11 rounded-2xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-muted-foreground">
              <div className="mx-auto h-16 w-16 rounded-3xl bg-muted/60 flex items-center justify-center mb-5">
                <Bell size={28} className="opacity-30" />
              </div>
              <h3 className="text-lg font-bold text-foreground">All caught up!</h3>
              <p className="text-sm mt-1">You have no new notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              <AnimatePresence initial={false}>
                {notifications.map((n, i) => {
                  const Icon = typeIcon[n.type] ?? Info;
                  const gradient = typeGradient[n.type] ?? 'from-slate-500 to-slate-400';
                  
                  return (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0, paddingBottom: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className={cn(
                        'relative flex items-start gap-4 px-5 py-4 sm:px-6 sm:py-5 transition-colors group',
                        !n.isRead ? 'bg-primary/[0.03] hover:bg-primary/[0.06]' : 'hover:bg-muted/30'
                      )}
                    >
                      {/* Unread indicator line */}
                      {!n.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                      )}

                      {/* Icon */}
                      <div className={cn(
                        'h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br',
                        gradient,
                        !n.isRead && 'ring-2 ring-primary/20 ring-offset-2 ring-offset-card'
                      )}>
                        <Icon size={18} className="text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn('text-sm font-bold truncate pr-4', !n.isRead ? 'text-foreground' : 'text-muted-foreground')}>
                            {n.title}
                          </p>
                          <p className="text-[11px] font-medium text-muted-foreground/60 shrink-0 tabular-nums">
                            {formatDistanceToNow(n.createdAt)}
                          </p>
                        </div>
                        <p className={cn(
                          "text-sm mt-1 leading-relaxed", 
                          !n.isRead ? "text-muted-foreground" : "text-muted-foreground/70"
                        )}>
                          {n.body}
                        </p>
                        
                        {/* Mobile Actions */}
                        <div className="flex sm:hidden items-center gap-2 mt-3 pt-3 border-t border-border/40">
                          {!n.isRead && (
                            <Button
                              variant="outline" size="sm"
                              onClick={() => markRead(n.id)}
                              className="h-7 text-xs px-2 gap-1"
                            >
                              <Check size={12} /> Mark Read
                            </Button>
                          )}
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => deleteNotif(n.id)}
                            className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={12} /> Delete
                          </Button>
                        </div>
                      </div>

                      {/* Desktop Actions */}
                      <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!n.isRead && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="p-1.5 rounded-xl bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotif(n.id)}
                          className="p-1.5 rounded-xl bg-muted/60 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Simple unread dot for desktop */}
                      {!n.isRead && (
                        <div className="hidden sm:block h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center p-5 sm:p-6">
                  <Button
                    variant="outline"
                    className="rounded-xl shadow-sm bg-card hover:bg-muted/50"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isFetching}
                  >
                    {isFetching ? (
                      <><Loader2 size={14} className="mr-2 animate-spin" />Loading…</>
                    ) : (
                      `Load more`
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
