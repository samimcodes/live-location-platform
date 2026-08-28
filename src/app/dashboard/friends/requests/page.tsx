'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  usePendingRequests, useSentRequests, useRequestHistory,
  useRespondToRequest, useCancelRequest, useAcceptAllRequests,
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
import { useAppSelector } from '@/store/store';

// ── Avatar (id-based stable color) ───────────────────────────────────────
const AVATAR_BG = [
  'bg-chart-1', 'bg-chart-2', 'bg-chart-3',
  'bg-chart-4', 'bg-chart-5', 'bg-primary',
];

function Avatar({
  id, name, avatar,
}: { id?: number; name?: string; avatar?: string | null }) {
  const letter = (name ?? '?').charAt(0).toUpperCase();
  const bg     = AVATAR_BG[(id ?? 0) % AVATAR_BG.length];
  return (
    <div className="relative h-11 w-11 shrink-0">
      <div className="relative h-full w-full overflow-hidden rounded-2xl">
        {avatar ? (
          <Image src={avatar} alt={name ?? 'User'} fill sizes="44px"
            className="object-cover" />
        ) : (
          <div className={cn(
            'h-full w-full flex items-center justify-center',
            'text-primary-foreground font-bold text-sm select-none', bg,
          )}>
            {letter}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────
type Tab = 'received' | 'sent' | 'history';

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.32, delay, ease: 'easeOut' as const },
});

function SkeletonRow({ wide = false }: { wide?: boolean }) {
  return (
    <div className="flex items-center gap-3.5 px-5 py-4">
      <div className="h-11 w-11 rounded-2xl bg-muted animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-28 rounded-md bg-muted animate-pulse" />
        <div className="h-2.5 w-20 rounded-md bg-muted animate-pulse" />
      </div>
      {wide && <div className="h-8 w-24 rounded-lg bg-muted animate-pulse shrink-0" />}
    </div>
  );
}

function ErrorRow({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4 text-sm text-destructive/80">
      <AlertTriangle size={15} className="shrink-0" />
      <span className="flex-1">Failed to load.</span>
      {onRetry && (
        <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

function EmptyRow({
  icon: Icon, title, subtitle,
}: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center py-14 text-muted-foreground gap-1">
      <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-2">
        <Icon size={20} className="opacity-25" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs opacity-50 text-center max-w-[16rem] leading-relaxed">{subtitle}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('received');
  const meId = useAppSelector((s) => s.auth.user?.id);

  const { data: pending = [], isLoading: lPending, isError: ePending, refetch: refetchPending } = usePendingRequests();
  const { data: sent    = [], isLoading: lSent,    isError: eSent,    refetch: refetchSent    } = useSentRequests();
  const { data: history = [], isLoading: lHistory, isError: eHistory, refetch: refetchHistory } = useRequestHistory();

  const { mutate: respond   } = useRespondToRequest();
  const { mutate: cancel    } = useCancelRequest();
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
    key: Tab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    count?: number;
  }[] = [
    { key: 'received', label: 'Received', icon: Inbox,   count: pending.length || undefined },
    { key: 'sent',     label: 'Sent',     icon: Send,    count: sent.length    || undefined },
    { key: 'history',  label: 'History',  icon: History },
  ];

  return (
    <div className="space-y-5 pb-8">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)}>
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/60 shadow-sm transition-all hover:shadow-md">
          {/* Subtle gradient background accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/5" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[80px] opacity-60 pointer-events-none" />
          
          <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 min-w-0">
                <Button variant="ghost" size="sm" className="h-12 w-12 p-0 rounded-2xl shrink-0 bg-background/50 backdrop-blur-md border border-border/50 hover:bg-background/80 transition-all shadow-sm" asChild>
                  <Link href="/dashboard/friends"><ArrowLeft size={18} className="text-foreground/70" /></Link>
                </Button>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                    Friend Requests
                  </h1>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    {pending.length} pending · {sent.length} sent
                  </p>
                </div>
              </div>
              {pending.length > 0 && (
                <Button size="sm" disabled={acceptingAll}
                  onClick={() => acceptAll()}
                  className="shrink-0 gap-2 rounded-xl h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25 transition-all active:scale-95 text-[13px] font-bold relative">
                  {acceptingAll
                    ? <Loader2 size={16} className="animate-spin" />
                    : <CheckCheck size={16} />}
                  Accept all{pending.length > 1 ? ` (${pending.length})` : ''}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── TAB BAR ────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.06)}>
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all',
                activeTab === key
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon size={14} className={activeTab === key ? 'text-primary' : ''} />
              <span>{label}</span>
              {count !== undefined && (
                <span className={cn(
                  'h-5 min-w-5 rounded-full text-[10px] font-bold flex items-center justify-center px-1',
                  activeTab === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/15 text-muted-foreground',
                )}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── TAB CONTENT ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* RECEIVED */}
        {activeTab === 'received' && (
          <motion.div key="received"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="h-8 w-8 rounded-lg bg-chart-5/10 flex items-center justify-center shrink-0">
                  <UserPlus size={14} className="text-chart-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold leading-none">Received</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pending.length} pending request{pending.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="border-t border-border/30" />

              {ePending     ? <ErrorRow onRetry={() => refetchPending()} />
              : lPending    ? <div className="divide-y divide-border/20">{[1,2].map(i => <SkeletonRow key={i} wide />)}</div>
              : pending.length === 0
                ? <EmptyRow icon={Inbox} title="No pending requests" subtitle="When someone sends you a request it'll appear here" />
              : (
                <AnimatePresence initial={false}>
                  <div className="divide-y divide-border/20">
                    {pending.map((req, i) => (
                      <motion.div key={req.id} layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0  }}
                        exit={{   opacity: 0, x: 16, height: 0, overflow: 'hidden' }}
                        transition={{ delay: i * 0.03, duration: 0.18 }}
                        className="flex items-start gap-3.5 px-5 py-4"
                      >
                        <Avatar id={req.sender?.id} name={req.sender?.name} avatar={req.sender?.avatar} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold leading-tight">
                              {req.sender?.name ?? 'Unknown'}
                            </p>
                            {req.sender?.isOnline && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-chart-5 font-semibold">
                                <span className="h-1.5 w-1.5 rounded-full bg-chart-5 inline-block" />
                                Online
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                            {req.sender?.email}
                          </p>
                          {req.message && (
                            <div className="flex items-start gap-1.5 mt-2 bg-muted/40 rounded-xl px-3 py-2 text-xs text-muted-foreground">
                              <MessageSquare size={10} className="shrink-0 mt-0.5 opacity-50" />
                              <span className="italic leading-relaxed">&ldquo;{req.message}&rdquo;</span>
                            </div>
                          )}
                          <p className="text-[11px] text-muted-foreground/40 mt-1.5">
                            {formatDistanceToNow(req.createdAt)}
                          </p>
                        </div>

                        {/* Accept / Reject */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 shrink-0 mt-0.5">
                          <Button size="sm"
                            disabled={respondingId === req.id}
                            onClick={() => handleRespond(req.id, 'ACCEPTED')}
                            className="h-8 gap-1 rounded-xl shadow-sm text-xs px-3">
                            {respondingId === req.id
                              ? <Loader2 size={12} className="animate-spin" />
                              : <><Check size={12} />Accept</>}
                          </Button>
                          <Button variant="outline" size="sm"
                            disabled={respondingId === req.id}
                            onClick={() => handleRespond(req.id, 'REJECTED')}
                            className="h-8 w-8 p-0 rounded-xl" title="Reject">
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

        {/* SENT */}
        {activeTab === 'sent' && (
          <motion.div key="sent"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="h-8 w-8 rounded-lg bg-chart-4/10 flex items-center justify-center shrink-0">
                  <Send size={14} className="text-chart-4" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">Sent</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {sent.length} pending approval
                  </p>
                </div>
              </div>
              <div className="border-t border-border/30" />

              {eSent     ? <ErrorRow onRetry={() => refetchSent()} />
              : lSent    ? <div className="divide-y divide-border/20">{[1,2].map(i => <SkeletonRow key={i} wide />)}</div>
              : sent.length === 0
                ? <EmptyRow icon={Send} title="No sent requests" subtitle="Requests you send will appear here" />
              : (
                <AnimatePresence initial={false}>
                  <div className="divide-y divide-border/20">
                    {sent.map((req, i) => (
                      <motion.div key={req.id} layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0  }}
                        exit={{   opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.16 }}
                        className="flex items-center gap-3.5 px-5 py-3.5 group"
                      >
                        <Avatar id={req.receiver?.id} name={req.receiver?.name} avatar={req.receiver?.avatar} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">
                            {req.receiver?.name ?? 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground/50 mt-0.5">
                            Sent {formatDistanceToNow(req.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-semibold border bg-chart-4/10 text-chart-4 border-chart-4/20">
                            <Clock size={10} /> Pending
                          </span>
                          <Button variant="ghost" size="sm"
                            title="Cancel request"
                            disabled={cancellingId === req.id}
                            onClick={() => handleCancel(req.id)}
                            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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

        {/* HISTORY */}
        {activeTab === 'history' && (
          <motion.div key="history"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <History size={14} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">History</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Last 30 days</p>
                </div>
              </div>
              <div className="border-t border-border/30" />

              {eHistory     ? <ErrorRow onRetry={() => refetchHistory()} />
              : lHistory    ? <div className="divide-y divide-border/20">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
              : history.length === 0
                ? <EmptyRow icon={History} title="No history yet" subtitle="Accepted and rejected requests appear here" />
              : (
                <div className="divide-y divide-border/20">
                  {history.map((req, i) => {
                    const isAccepted = req.status === 'ACCEPTED';
                    const youSent = meId != null && Number(req.senderId) === Number(meId);
                    const person = youSent ? req.receiver : req.sender;
                    return (
                      <motion.div key={req.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.025, duration: 0.18 }}
                        className="flex items-center gap-3.5 px-5 py-3.5"
                      >
                        <Avatar id={person?.id} name={person?.name} avatar={person?.avatar} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">
                            {person?.name ?? 'Unknown'}
                          </p>
                          <p className="text-[11px] text-muted-foreground/50 mt-0.5">
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
                            ? <><Check size={10} /> {youSent ? 'They accepted' : 'Accepted'}</>
                            : <><X size={10} /> {youSent ? 'They rejected' : 'Rejected'}</>}
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
