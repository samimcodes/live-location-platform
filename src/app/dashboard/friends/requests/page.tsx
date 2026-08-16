'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  usePendingRequests,
  useSentRequests,
  useRequestHistory,
  useRespondToRequest,
  useCancelRequest,
  useAcceptAllRequests,
} from '@/hooks/useFriends';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UserPlus, Clock, Check, X, MessageSquare,
  Loader2, ArrowLeft, CheckCheck, History,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ name, avatar }: { name?: string; avatar?: string | null }) {
  const letter = (name ?? '?').charAt(0).toUpperCase();
  return (
    <div className="relative h-10 w-10 shrink-0">
      {avatar ? (
        <Image src={avatar} alt={name ?? 'User'} fill sizes="40px"
          className="rounded-full object-cover" />
      ) : (
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {letter}
        </div>
      )}
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────
type Tab = 'received' | 'sent' | 'history';

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('received');

  const { data: pending = [], isLoading: loadingPending } = usePendingRequests();
  const { data: sent    = [], isLoading: loadingSent    } = useSentRequests();
  const { data: history = [], isLoading: loadingHistory } = useRequestHistory();

  const { mutate: respond    } = useRespondToRequest();
  const { mutate: cancel     } = useCancelRequest();
  const { mutate: acceptAll, isPending: acceptingAll } = useAcceptAllRequests();

  // Per-item loading state
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const handleRespond = (id: number, action: 'ACCEPTED' | 'REJECTED') => {
    setRespondingId(id);
    respond({ id, action }, { onSettled: () => setRespondingId(null) });
  };

  const handleCancel = (id: number) => {
    setCancellingId(id);
    cancel(id, { onSettled: () => setCancellingId(null) });
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'received', label: 'Received', count: pending.length || undefined },
    { key: 'sent',     label: 'Sent',     count: sent.length    || undefined },
    { key: 'history',  label: 'History' },
  ];

  return (
    <div className="space-y-5 max-w-2xl">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
          <Link href="/dashboard/friends">
            <ArrowLeft size={16} />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Friend Requests</h1>
        </div>
        {/* Accept All — only visible when there are pending requests */}
        {pending.length > 1 && (
          <Button
            size="sm"
            disabled={acceptingAll}
            onClick={() => acceptAll()}
            className="shrink-0"
          >
            {acceptingAll ? (
              <Loader2 size={13} className="mr-2 animate-spin" />
            ) : (
              <CheckCheck size={13} className="mr-2" />
            )}
            Accept all ({pending.length})
          </Button>
        )}
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'h-5 min-w-5 rounded-full text-[10px] font-bold flex items-center justify-center px-1',
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* RECEIVED ─────────────────────────────────────────────── */}
        {activeTab === 'received' && (
          <motion.div
            key="received"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserPlus size={15} className="text-primary" />
                  Received Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPending ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : pending.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserPlus size={36} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No pending requests</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {pending.map((req, i) => (
                      <motion.div
                        key={req.id}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, paddingBottom: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                        className="flex items-start gap-3 p-3.5 rounded-xl border border-border mb-3 last:mb-0"
                      >
                        <Avatar name={req.sender?.name} avatar={req.sender?.avatar} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold truncate">
                              {req.sender?.name ?? 'Unknown'}
                            </p>
                            {req.sender?.isOnline && (
                              <span className="text-[10px] text-emerald-600 font-medium">
                                ● Online
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {req.sender?.email}
                          </p>

                          {req.message && (
                            <div className="flex items-start gap-1.5 mt-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1.5">
                              <MessageSquare size={11} className="shrink-0 mt-0.5" />
                              <span className="italic">&ldquo;{req.message}&rdquo;</span>
                            </div>
                          )}

                          <p className="text-[11px] text-muted-foreground/60 mt-1">
                            {formatDistanceToNow(req.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                          <Button
                            size="sm"
                            disabled={respondingId === req.id}
                            onClick={() => handleRespond(req.id, 'ACCEPTED')}
                            className="h-8"
                          >
                            {respondingId === req.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <><Check size={13} className="mr-1" />Accept</>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={respondingId === req.id}
                            onClick={() => handleRespond(req.id, 'REJECTED')}
                            className="h-8 w-8 p-0"
                            title="Reject"
                          >
                            <X size={13} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* SENT ──────────────────────────────────────────────────── */}
        {activeTab === 'sent' && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock size={15} className="text-muted-foreground" />
                  Sent Requests
                  {sent.length > 0 && (
                    <span className="text-xs text-muted-foreground font-normal ml-1">
                      {sent.length} pending
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSent ? (
                  <div className="h-14 rounded-xl bg-muted animate-pulse" />
                ) : sent.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    No sent requests
                  </p>
                ) : (
                  <AnimatePresence initial={false}>
                    {sent.map((req) => (
                      <motion.div
                        key={req.id}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/60 group mb-2 last:mb-0"
                      >
                        <Avatar name={req.receiver?.name} avatar={req.receiver?.avatar} />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {req.receiver?.name ?? 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            Sent {formatDistanceToNow(req.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn(
                            'text-[11px] px-2 py-0.5 rounded-full font-medium border',
                            'bg-amber-50 text-amber-600 border-amber-200',
                            'dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900'
                          )}>
                            Pending
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Cancel request"
                            disabled={cancellingId === req.id}
                            onClick={() => handleCancel(req.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {cancellingId === req.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <X size={13} />
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* HISTORY ───────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <History size={15} className="text-muted-foreground" />
                  Request History
                  <span className="text-xs text-muted-foreground font-normal ml-1">
                    last 30 days
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History size={36} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No request history</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((req, i) => {
                      const isAccepted = req.status === 'ACCEPTED';
                      const isRejected = req.status === 'REJECTED';

                      return (
                        <motion.div
                          key={req.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border/50"
                        >
                          <Avatar
                            name={req.sender?.name ?? req.receiver?.name}
                            avatar={req.sender?.avatar ?? req.receiver?.avatar}
                          />

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {req.sender?.name ?? req.receiver?.name ?? 'Unknown'}
                            </p>
                            <p className="text-[11px] text-muted-foreground/70">
                              {formatDistanceToNow(req.updatedAt ?? req.createdAt)}
                            </p>
                          </div>

                          <ChevronRight size={12} className="text-muted-foreground/40 shrink-0" />

                          {/* Status badge */}
                          <span className={cn(
                            'text-[11px] px-2 py-0.5 rounded-full font-medium border shrink-0',
                            isAccepted && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
                            isRejected && 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900',
                          )}>
                            {isAccepted ? '✓ Accepted' : '✕ Rejected'}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
