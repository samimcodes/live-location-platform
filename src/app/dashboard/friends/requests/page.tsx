'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  usePendingRequests,
  useSentRequests,
  useRespondToRequest,
  useCancelRequest,
} from '@/hooks/useFriends';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Clock, Check, X, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

// ── Shared avatar ──────────────────────────────────────────────────────────
function Avatar({ name, avatar }: { name?: string; avatar?: string | null }) {
  const letter = (name ?? '?').charAt(0).toUpperCase();
  return (
    <div className="relative h-10 w-10 shrink-0">
      {avatar ? (
        <Image
          src={avatar}
          alt={name ?? 'User'}
          fill
          sizes="40px"
          className="rounded-full object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {letter}
        </div>
      )}
    </div>
  );
}

export default function RequestsPage() {
  const { data: pending = [], isLoading: loadingPending } = usePendingRequests();
  const { data: sent = [],    isLoading: loadingSent    } = useSentRequests();
  const { mutate: respond }  = useRespondToRequest();
  const { mutate: cancel }   = useCancelRequest();

  // Track per-item loading state so buttons disable individually
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const handleRespond = (id: number, action: 'ACCEPTED' | 'REJECTED') => {
    setRespondingId(id);
    respond(
      { id, action },
      { onSettled: () => setRespondingId(null) }
    );
  };

  const handleCancel = (id: number) => {
    setCancellingId(id);
    cancel(id, { onSettled: () => setCancellingId(null) });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Friend Requests</h1>
        {pending.length > 0 && (
          <span className="h-6 min-w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center px-1.5">
            {pending.length}
          </span>
        )}
      </div>

      {/* ── Received ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <UserPlus size={15} className="text-primary" />
            Received
            {pending.length > 0 && (
              <span className="h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                {pending.length}
              </span>
            )}
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
            <div className="text-center py-10 text-muted-foreground">
              <UserPlus size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">No pending requests</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="space-y-3">
                {pending.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-border"
                  >
                    <Avatar name={req.sender?.name} avatar={req.sender?.avatar} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">
                          {req.sender?.name ?? 'Unknown'}
                        </p>
                        {req.sender?.isOnline && (
                          <span className="text-[10px] text-emerald-600 font-medium">● Online</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {req.sender?.email}
                      </p>

                      {/* Optional message from sender */}
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

                    {/* Accept / Reject — individually disabled */}
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
                          <>
                            <Check size={13} className="mr-1" />
                            Accept
                          </>
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
              </div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* ── Sent ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock size={15} className="text-muted-foreground" />
            Sent
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
            <p className="text-sm text-muted-foreground text-center py-8">
              No sent requests
            </p>
          ) : (
            <AnimatePresence initial={false}>
              <div className="space-y-2">
                {sent.map((req) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/60 group"
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

                    {/* Pending badge + cancel button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          'text-[11px] px-2 py-0.5 rounded-full font-medium border',
                          'bg-amber-50 text-amber-600 border-amber-200',
                          'dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900'
                        )}
                      >
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
              </div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
