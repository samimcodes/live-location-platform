'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  useNotifications,
  useMarkAllRead,
  useMarkRead,
  useDeleteNotification,
  useDeleteAllRead,
} from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bell, Check, Trash2, UserPlus,
  MapPin, Users, Info, Loader2, CheckCheck,
  ArrowRight, AlertTriangle, X,
  Clock, Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';

// ── Icons and Colors Config ────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, {
  icon: React.ElementType;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  actionHref?: string;
  actionLabel?: string;
}> = {
  FRIEND_REQUEST: {
    icon: UserPlus,
    gradient: 'from-indigo-500 to-indigo-600',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40',
    badgeText: 'text-indigo-600 dark:text-indigo-400',
    actionHref: '/dashboard/friends/requests',
    actionLabel: 'View Request',
  },
  FRIEND_ACCEPTED: {
    icon: Users,
    gradient: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    actionHref: '/dashboard/friends',
    actionLabel: 'View Friends',
  },
  GROUP_INVITE: {
    icon: Users,
    gradient: 'from-violet-500 to-purple-600',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/40',
    badgeText: 'text-violet-600 dark:text-violet-400',
    actionHref: '/dashboard/groups',
    actionLabel: 'View Groups',
  },
  GROUP_JOINED: {
    icon: Users,
    gradient: 'from-fuchsia-500 to-pink-600',
    badgeBg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40 border-fuchsia-200 dark:border-fuchsia-800/40',
    badgeText: 'text-fuchsia-600 dark:text-fuchsia-400',
    actionHref: '/dashboard/groups',
    actionLabel: 'Open Group',
  },
  LOCATION_ALERT: {
    icon: MapPin,
    gradient: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40',
    badgeText: 'text-amber-600 dark:text-amber-400',
    actionHref: '/dashboard/map',
    actionLabel: 'Live Map',
  },
  SYSTEM: {
    icon: Info,
    gradient: 'from-blue-500 to-cyan-600',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40',
    badgeText: 'text-blue-600 dark:text-blue-400',
  },
};

// ── Confirm dialog component ───────────────────────────────────────────────
function ConfirmDialog({
  open, title, description, confirmLabel = 'Confirm', destructive = false,
  onConfirm, onCancel,
}: {
  open: boolean; title: string; description: string;
  confirmLabel?: string; destructive?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 w-full max-w-sm bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className={cn('h-1 w-full', destructive ? 'bg-destructive' : 'bg-blue-500')} />
            <div className="p-6">
              <div className="flex items-start gap-3.5">
                <div className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                  destructive ? 'bg-destructive/10' : 'bg-blue-500/10',
                )}>
                  <AlertTriangle size={18} className={destructive ? 'text-destructive' : 'text-blue-500'} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-bold text-sm leading-snug">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
                </div>
                <button
                  onClick={onCancel}
                  aria-label="Cancel"
                  className="p-1 -mt-0.5 -mr-0.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex gap-2.5 mt-5">
                <Button variant="outline" size="sm" className="flex-1 h-9 rounded-xl" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  variant={destructive ? 'destructive' : 'default'}
                  size="sm"
                  className="flex-1 h-9 rounded-xl"
                  onClick={onConfirm}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'FRIENDS' | 'GROUPS' | 'ALERTS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const { data, isLoading, isFetching }                  = useNotifications(page);
  const { mutate: markAllRead,  isPending: markingAll  } = useMarkAllRead();
  const { mutate: markRead }                              = useMarkRead();
  const { mutate: deleteNotif }                           = useDeleteNotification();
  const { mutate: deleteAllRead, isPending: deletingAll } = useDeleteAllRead();

  const notifications  = useMemo(() => data?.notifications ?? [], [data?.notifications]);
  const totalPages     = data?.pagination?.totalPages ?? 1;
  const total          = data?.pagination?.total ?? 0;
  const unread         = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const readCount      = useMemo(() => notifications.filter((n) => n.isRead).length, [notifications]);
  const hasMore        = page < totalPages;

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notifications.filter((n) => {
      if (filterType === 'UNREAD' && n.isRead) return false;
      if (filterType === 'FRIENDS' && n.type !== 'FRIEND_REQUEST' && n.type !== 'FRIEND_ACCEPTED') return false;
      if (filterType === 'GROUPS' && n.type !== 'GROUP_INVITE' && n.type !== 'GROUP_JOINED') return false;
      if (filterType === 'ALERTS' && n.type !== 'LOCATION_ALERT' && n.type !== 'SYSTEM') return false;
      if (q && !n.title.toLowerCase().includes(q) && !n.body.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [notifications, filterType, searchQuery]);

  const handleDeleteAllReadConfirm = useCallback(() => {
    deleteAllRead(undefined, {
      onSettled: () => setConfirmDeleteAll(false),
    });
  }, [deleteAllRead]);

  return (
    <div className="space-y-6 pb-8">

      {/* ── Confirm Delete Read Dialog ─────────────────────────────────── */}
      <ConfirmDialog
        open={confirmDeleteAll}
        title="Delete All Read Notifications?"
        description="All previously read notifications will be removed permanently. Unread notifications will remain untouched."
        confirmLabel="Delete Read"
        destructive={true}
        onConfirm={handleDeleteAllReadConfirm}
        onCancel={() => setConfirmDeleteAll(false)}
      />

      {/* ── HEADER — Premium Banner ────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/60 shadow-sm transition-all hover:shadow-md">
          {/* Subtle gradient background accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/5" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[80px] opacity-60 pointer-events-none" />
          
          <div className="relative z-10 px-6 py-8 sm:px-10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 border border-blue-400/20">
                  <Bell size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">Notifications</h1>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    Stay updated with friend requests, group activity, and alerts
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {readCount > 0 && (
                  <Button
                    variant="outline" size="sm"
                    className="text-muted-foreground hover:text-destructive border-border/60 hover:bg-destructive/10 rounded-xl h-11 px-5 transition-all text-[13px] font-bold"
                    onClick={() => setConfirmDeleteAll(true)}
                    disabled={deletingAll}
                  >
                    {deletingAll
                      ? <Loader2 size={16} className="mr-2 animate-spin" />
                      : <Trash2 size={16} className="mr-2" />
                    }
                    Clear read
                  </Button>
                )}
                {unread > 0 && (
                  <Button
                    size="sm"
                    className="rounded-xl h-11 shadow-sm shadow-primary/25 px-5 font-bold gap-2 text-[13px] transition-all active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => markAllRead()}
                    disabled={markingAll}
                  >
                    {markingAll
                      ? <Loader2 size={16} className="mr-2 animate-spin" />
                      : <CheckCheck size={16} className="mr-2" />
                    }
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Tabs Chips */}
            <div className="flex items-center gap-3 mt-8 flex-wrap">
              {[
                { key: 'ALL',     label: `All (${total})` },
                { key: 'UNREAD',  label: `Unread (${unread})` },
                { key: 'FRIENDS', label: 'Friends' },
                { key: 'GROUPS',  label: 'Groups' },
                { key: 'ALERTS',  label: 'Alerts' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key as typeof filterType)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-[12px] font-bold transition-all border shadow-sm backdrop-blur-md',
                    filterType === key
                      ? 'bg-primary text-primary-foreground border-primary shadow-primary/30'
                      : 'bg-card/80 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── SEARCH & FILTER ROW ────────────────────────────────────── */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
            <Input
              placeholder="Search notifications by title or message…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 pr-8 rounded-xl bg-card border-border/60 focus:border-blue-500/50 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS LIST ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all overflow-hidden relative">
          {isLoading && notifications.length === 0 ? (
            <div className="space-y-4 p-5 sm:p-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="h-12 w-12 rounded-2xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-1/3 bg-muted rounded-lg animate-pulse" />
                    <div className="h-3 w-3/4 bg-muted rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center py-24 px-6 text-center text-muted-foreground">
              <div className="mx-auto h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center mb-6 shadow-sm">
                <Bell size={40} className="text-primary opacity-80" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground">
                {searchQuery
                  ? 'No matching notifications'
                  : filterType === 'UNREAD'
                    ? 'No unread notifications'
                    : 'All caught up!'}
              </h3>
              <p className="text-sm mt-2 max-w-sm leading-relaxed text-muted-foreground font-medium">
                {searchQuery
                  ? `No alerts or messages matched "${searchQuery}".`
                  : filterType === 'UNREAD'
                    ? 'You have read all your notifications.'
                    : 'New alerts, friend updates, and group messages will appear here.'}
              </p>
              {(filterType !== 'ALL' || searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-6 rounded-xl shadow-sm h-10 px-5 font-bold text-[13px]"
                  onClick={() => {
                    setFilterType('ALL');
                    setSearchQuery('');
                  }}
                >
                  View All Notifications
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              <AnimatePresence initial={false}>
                {filteredNotifications.map((n, i) => {
                  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.SYSTEM;
                  const Icon = cfg.icon;
                  
                  return (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0, paddingBottom: 0 }}
                      transition={{ delay: Math.min(i * 0.025, 0.25) }}
                      className={cn(
                        'relative flex items-start gap-4 px-5 py-5 sm:px-6 sm:py-6 transition-all duration-300 group',
                        !n.isRead
                          ? 'bg-primary/[0.04] hover:bg-primary/[0.08]'
                          : 'hover:bg-muted/30'
                      )}
                    >
                      {/* Unread vertical indicator line */}
                      {!n.isRead && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />
                      )}

                      {/* Icon with gradient and shadow */}
                      <div className={cn(
                        'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br text-white border border-white/10 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300',
                        cfg.gradient,
                        !n.isRead && 'ring-2 ring-primary/25 ring-offset-2 ring-offset-card'
                      )}>
                        <Icon size={20} className="text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={cn(
                              'text-[15px] font-bold truncate leading-snug',
                              !n.isRead ? 'text-foreground font-extrabold' : 'text-foreground/80'
                            )}>
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/50" />
                            )}
                          </div>

                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80 shrink-0 bg-muted/50 px-2 py-0.5 rounded-md">
                            <Clock size={10} />
                            {formatDistanceToNow(n.createdAt)}
                          </span>
                        </div>

                        <p className={cn(
                          'text-[13px] mt-1.5 leading-relaxed', 
                          !n.isRead ? 'text-foreground/80' : 'text-muted-foreground'
                        )}>
                          {n.body}
                        </p>
                        
                        {/* Action link if applicable */}
                        {cfg.actionHref && (
                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                'h-7 text-xs font-semibold px-2.5 rounded-lg border gap-1 shadow-sm transition-all',
                                cfg.badgeBg, cfg.badgeText
                              )}
                              asChild
                            >
                              <Link href={cfg.actionHref}>
                                {cfg.actionLabel ?? 'View'} <ArrowRight size={11} />
                              </Link>
                            </Button>
                          </div>
                        )}

                        {/* Mobile Actions */}
                        <div className="flex sm:hidden items-center gap-2 mt-3 pt-2.5 border-t border-border/30">
                          {!n.isRead && (
                            <Button
                              variant="outline" size="sm"
                              onClick={() => markRead(n.id)}
                              className="h-7 text-xs px-2.5 rounded-lg gap-1"
                            >
                              <Check size={12} /> Mark Read
                            </Button>
                          )}
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => deleteNotif(n.id)}
                            className="h-7 text-xs px-2.5 rounded-lg gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={12} /> Delete
                          </Button>
                        </div>
                      </div>

                      {/* Desktop Actions */}
                      <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!n.isRead && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="p-2 rounded-xl bg-card hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border/50 shadow-sm transition-colors"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotif(n.id)}
                          className="p-2 rounded-xl bg-card hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/50 shadow-sm transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center p-6 bg-muted/10 border-t border-border/30">
                  <Button
                    variant="outline"
                    className="rounded-xl shadow-sm bg-card hover:bg-muted/50 px-8 h-11 font-bold text-[13px]"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isFetching}
                  >
                    {isFetching ? (
                      <><Loader2 size={16} className="mr-2 animate-spin" />Loading…</>
                    ) : (
                      'Load More Notifications'
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
