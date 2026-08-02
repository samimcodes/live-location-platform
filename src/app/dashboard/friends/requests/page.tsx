'use client';

import React from 'react';
import { usePendingRequests, useSentRequests, useRespondToRequest } from '@/hooks/useFriends';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Clock, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from '@/lib/dateUtils';

export default function RequestsPage() {
  const { data: pending = [], isLoading: loadingPending } = usePendingRequests();
  const { data: sent = [], isLoading: loadingSent } = useSentRequests();
  const { mutate: respond, isPending: responding } = useRespondToRequest();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Friend Requests</h1>

      {/* Pending received */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <UserPlus size={15} className="text-primary" />
            Received
            {pending.length > 0 && (
              <span className="ml-1 h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                {pending.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPending ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                    {req.sender?.name?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{req.sender?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{req.sender?.email}</p>
                    <p className="text-[11px] text-muted-foreground/60">{formatDistanceToNow(req.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      disabled={responding}
                      onClick={() => respond({ id: req.id, action: 'ACCEPTED' })}
                    >
                      <Check size={13} className="mr-1" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={responding}
                      onClick={() => respond({ id: req.id, action: 'REJECTED' })}
                    >
                      <X size={13} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock size={15} className="text-muted-foreground" />
            Sent
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSent ? (
            <div className="h-12 rounded-xl bg-muted animate-pulse" />
          ) : sent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No sent requests</p>
          ) : (
            <div className="space-y-2">
              {sent.map((req) => (
                <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {req.receiver?.name?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{req.receiver?.name}</p>
                    <p className="text-xs text-muted-foreground">Pending · {formatDistanceToNow(req.createdAt)}</p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900 font-medium">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
