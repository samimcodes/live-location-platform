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
import { Button } from '@/components/ui/button';
import {
  UserPlus, Clock, Check, X, MessageSquare,
  Loader2, ArrowLeft, CheckCheck, History,
  Inbox, Send, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

// ── Avatar — uses CSS design tokens ───────────────────────────────────────
const AVATAR_GRADIENTS = [
  ['from-primary/80',  'to-chart-1/90'],
  ['from-chart-5/80',  'to-chart-3/90'],
  ['from-chart-4/80',  'to-chart-2/90'],
  ['from-chart-2/80',  'to-chart-5/90'],
  ['from-chart-3/80',  'to-primary/90'],
] as const;

function Avatar({ name, avatar, index = 0 }: { name?: string; avatar?: string | null; index?: number }) {
  const letter = (name ?? '?').charAt(0).toUpperCase();
  const [from, to] = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  return (
    <div className="relative h-11 w-11 shrink-0">
      {avatar ? (
        <Image src={avatar} alt={name ?? 'User'} fill sizes="44px" className="rounded-2xl object-cover" />
      ) : (
        <div className={cn('h-11 w-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-primary-foreground font-bold text-sm', from, to)}>
          {letter}
        </div>
      )}
    </div>
  );
}

// ── Tab type ───────────────────────────────────────────────────────────────
type Tab = 'received' | 'sent' | 'history';

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: 'easeOut' as const },
});

// ── Shared skeleton ────────────────────────────────────────────────────────
function ListSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="h-11 w-11 rounded-2xl bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 rounded-lg bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Error banner ───────────────────────────────────────────────────────────
function ErrorBanner() {
  return (
    <div className="flex items-center gap-3 px-5 py-4 text-sm text-destructive">
      <AlertTriangle size={16} className="shrink-0" />
      <span>Failed to load. Check your connection and refresh the page.</span>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, subtitle }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center py-14 text-muted-foreground">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
        <Icon size={22} className="opacity-25" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs mt-1 opacity-60">{subtitle}</p>
    </div>
  );
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('received');

  const { data: pending = [], isLoading: loadingPending, isError: errorPending } = usePendingRequests();
  const { data: sent    = [], isLoading: loadingSent,    isError: errorSent    } = useSentRequests();
  const { data: history = [], isLoading: loadingHistory, isError: errorHistory } = useRequestHistory();

  const { mutate: respond    } = useRespondToRequest();
  const { mutate: cancel     } = useCancelRequest();
  const { mutate: acceptAll, isPending: acceptingAll } = useAcceptAllRequests();

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

  const tabs: {
    key:   Tab;
    label: string;
    icon:  React.ComponentType<{ size?: number; className?: string }>;
    count?: number;
  }[] = [
    { key: 'received', label: 'Received', icon: Inbox,   count: pending.length || undefined },
    { key: 'sent',     label: 'Sent',     icon: Send,    count: sent.length    || undefined },
    { key: 'history',  label: 'History',  icon: History },
  ];

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ═══════════════════════════════════════════════════════════════
          HEADER
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}>
        <div className="relative rounded-2xl overflow-hidden welcome-gradient border border-border/40">
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="relative px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl" asChild>
                <Link href="/dashboard/friends"><ArrowLeft size={16} /></Link>
              </Button>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Friend Requests</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {pending.length} pending · {sent.length} sent
                </p>
              </div>
              {/* Accept All — show whenever there's at least one pending request */}
              {pending.length > 0 && (
                <Button
                  size="sm"
                  disabled={acceptingAll}
                  onClick={() => acceptAll()}
                  className="shrink-0 gap-2 shadow-sm"
                >
                  {acceptingAll
                    ? <Loader2 size={13} className="animate-spin" />
                    : <CheckCheck size={13} />}
                  Accept all ({pending.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB BAR
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0.06)}>
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.key
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <TabIcon size={14} className={activeTab === tab.key ? 'text-primary' : ''} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    'h-5 min-w-5 rounded-full text-[10px] font-bold flex items-center justify-center px-1',
                    activeTab === tab.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB CONTENT
         ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">

        {/* ── RECEIVED ──────────────────────────────────────────── */}
        {activeTab === 'received' && (
          <motion.div key="received" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-chart-5/10 flex items-center justify-center">
                  <UserPlus size={16} className="text-chart-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Received Requests</p>
                  <p className="text-xs text-muted-foreground">{pending.length} people want to connect</p>
                </div>
              </div>
              <div className="border-t border-border/30" />

              {errorPending ? <ErrorBanner />
              : loadingPending ? <ListSkeleton rows={2} />
              : pending.length === 0 ? (
                <EmptyState icon={Inbox} title="No pending requests" subtitle="When someone sends you a request, it'll appear here" />
              ) : (
                <AnimatePresence initial={false}>
                  <div className="divide-y divide-border/20">
                    {pending.map((req, i) => (
                      <motion.div
                        key={req.id}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                        className="flex items-start gap-3.5 px-5 py-4"
                      >
                        <Avatar name={req.sender?.name} avatar={req.sender?.avatar} index={i} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold truncate">{req.sender?.name ?? 'Unknown'}</p>
                            {req.sender?.isOnline && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-chart-5 font-semibold">
                                <span className="h-1.5 w-1.5 rounded-full bg-chart-5" />
                                Online
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{req.sender?.email}</p>

                          {req.message && (
                            <div className="flex items-start gap-1.5 mt-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2">
                              <MessageSquare size={11} className="shrink-0 mt-0.5 text-muted-foreground/50" />
                              <span className="italic">&ldquo;{req.message}&rdquo;</span>
                            </div>
                          )}
                          <p className="text-[11px] text-muted-foreground/50 mt-1.5">{formatDistanceToNow(req.createdAt)}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 mt-1">
                          <Button
                            size="sm"
                            disabled={respondingId === req.id}
                            onClick={() => handleRespond(req.id, 'ACCEPTED')}
                            className="h-9 gap-1.5 rounded-xl shadow-sm"
                          >
                            {respondingId === req.id
                              ? <Loader2 size={13} className="animate-spin" />
                              : <><Check size={13} />Accept</>}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={respondingId === req.id}
                            onClick={() => handleRespond(req.id, 'REJECTED')}
                            className="h-9 w-9 p-0 rounded-xl"
                            title="Reject"
                          >
                            <X size={13} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}

        {/* ── SENT ──────────────────────────────────────────────── */}
        {activeTab === 'sent' && (
          <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <Send size={16} className="text-chart-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">Sent Requests</p>
                  <p className="text-xs text-muted-foreground">{sent.length} pending approval</p>
                </div>
              </div>
              <div className="border-t border-border/30" />

              {errorSent ? <ErrorBanner />
              : loadingSent ? <ListSkeleton rows={1} />
              : sent.length === 0 ? (
                <EmptyState icon={Send} title="No sent requests" subtitle="Requests you send will appear here" />
              ) : (
                <AnimatePresence initial={false}>
                  <div className="divide-y divide-border/20">
                    {sent.map((req, i) => (
                      <motion.div
                        key={req.id}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3.5 px-5 py-4 group"
                      >
                        <Avatar name={req.receiver?.name} avatar={req.receiver?.avatar} index={i} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{req.receiver?.name ?? 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground/60">Sent {formatDistanceToNow(req.createdAt)}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-semibold border bg-chart-4/10 text-chart-4 border-chart-4/20">
                            <Clock size={10} />
                            Pending
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Cancel request"
                            disabled={cancellingId === req.id}
                            onClick={() => handleCancel(req.id)}
                            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {cancellingId === req.id
                              ? <Loader2 size={13} className="animate-spin" />
                              : <X size={13} />}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}

        {/* ── HISTORY ───────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                  <History size={16} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold">Request History</p>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </div>
              </div>
              <div className="border-t border-border/30" />

              {errorHistory ? <ErrorBanner />
              : loadingHistory ? <ListSkeleton rows={3} />
              : history.length === 0 ? (
                <EmptyState icon={History} title="No request history" subtitle="Past accepted or rejected requests appear here" />
              ) : (
                <div className="divide-y divide-border/20">
                  {history.map((req, i) => {
                    const isAccepted = req.status === 'ACCEPTED';
                    return (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3.5 px-5 py-4"
                      >
                        <Avatar
                          name={req.sender?.name ?? req.receiver?.name}
                          avatar={req.sender?.avatar ?? req.receiver?.avatar}
                          index={i}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {req.sender?.name ?? req.receiver?.name ?? 'Unknown'}
                          </p>
                          <p className="text-[11px] text-muted-foreground/60">
                            {formatDistanceToNow(req.updatedAt ?? req.createdAt)}
                          </p>
                        </div>

                        <span className={cn(
                          'inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-semibold border shrink-0',
                          isAccepted
                            ? 'bg-chart-5/10 text-chart-5 border-chart-5/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20',
                        )}>
                          {isAccepted
                            ? <><Check size={10} /> Accepted</>
                            : <><X size={10} /> Rejected</>}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
