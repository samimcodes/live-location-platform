'use client';

/**
 * MapControls
 * -----------
 * Controls bar rendered above the LiveMap canvas.
 *
 * Fix: useTransition does not support async callbacks in React 19 concurrent
 * mode. Replaced with a plain useState isPending flag + try/finally pattern.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Radio, Maximize2, Minimize2, LocateFixed, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { useLocationStore } from '@/store/useLocationStore';
import { toast } from '@/lib/toast';
import type { LatLng } from '@/lib/mapUtils';

export interface MapControlsProps {
  activeFriendCount: number;
  onFitAll: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  allPoints: LatLng[];
  className?: string;
}

export function MapControls({
  activeFriendCount,
  onFitAll,
  onFullscreen,
  isFullscreen,
  allPoints,
  className,
}: MapControlsProps) {
  const { isSharing, setSharing } = useLocationStore();
  const [isPending, setIsPending] = useState(false);

  const handleToggleSharing = async () => {
    if (isPending) return;
    const next = !isSharing;
    setIsPending(true);
    // Optimistic update immediately
    setSharing(next);
    try {
      await api.patch('/location/sharing', { sharing: next });
    } catch {
      // Roll back on network failure
      setSharing(!next);
      toast.error('Failed to update sharing preference');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={cn('flex items-center justify-between gap-3 flex-wrap', className)}>
      {/* ── Left: status badges ─────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border select-none',
            isSharing
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900'
              : 'bg-muted text-muted-foreground border-border'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isSharing ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'
            )}
          />
          {isSharing ? 'Sharing your location' : 'Location hidden'}
        </div>

        {activeFriendCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900">
            <Users size={11} />
            {activeFriendCount} friend{activeFriendCount !== 1 ? 's' : ''} on map
          </div>
        )}
      </div>

      {/* ── Right: action buttons ───────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {allPoints.length > 1 && (
          <Button variant="outline" size="sm" onClick={onFitAll} title="Fit all markers in view">
            <LocateFixed size={13} className="mr-1.5" />
            Fit all
          </Button>
        )}

        <Button
          variant="outline"
          size="icon-sm"
          onClick={onFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </Button>

        <Button
          variant={isSharing ? 'outline' : 'default'}
          size="sm"
          onClick={handleToggleSharing}
          disabled={isPending}
        >
          <Radio size={13} className="mr-1.5" />
          {isPending ? 'Saving…' : isSharing ? 'Pause' : 'Share location'}
        </Button>
      </div>
    </div>
  );
}
