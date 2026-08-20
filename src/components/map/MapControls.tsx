'use client';

/**
 * MapControls
 * -----------
 * Floating overlay bar rendered INSIDE the map canvas (absolute positioned).
 * Glass-morphic style — backdrop blur + semi-transparent background.
 */

import React, { useState } from 'react';
import { Radio, Maximize2, Minimize2, LocateFixed, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { useLocationStore } from '@/store/useLocationStore';
import { toast } from '@/lib/toast';
import type { LatLng } from '@/lib/mapUtils';

export interface MapControlsProps {
  activeFriendCount: number;
  onFitAll:          () => void;
  onFullscreen:      () => void;
  isFullscreen:      boolean;
  allPoints:         LatLng[];
  className?:        string;
}

// ── Icon button ────────────────────────────────────────────────────────────
function MapBtn({
  onClick, title, children, active,
}: {
  onClick:  () => void;
  title:    string;
  children: React.ReactNode;
  active?:  boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'h-7 w-7 rounded-lg flex items-center justify-center',
        'transition-all duration-150 border',
        active
          ? 'bg-primary text-primary-foreground border-primary/60 shadow-sm shadow-primary/20'
          : 'bg-background/70 text-foreground/70 border-border/50 hover:bg-background hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
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
    setSharing(next);
    try {
      await api.patch('/location/sharing', { sharing: next });
    } catch {
      setSharing(!next);
      toast.error('Failed to update sharing preference');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={cn('flex items-center justify-between gap-3 px-3 py-2', className)}>

      {/* ── Left: sharing toggle + friend count ─────────────────── */}
      <div className="flex items-center gap-2">

        {/* Sharing pill */}
        <button
          onClick={handleToggleSharing}
          disabled={isPending}
          title={isSharing ? 'Pause location sharing' : 'Start sharing location'}
          className={cn(
            'inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold',
            'border transition-all duration-200 select-none',
            isSharing
              ? [
                  'bg-chart-5/90 text-white border-chart-5/40',
                  'shadow-sm',
                  'hover:bg-chart-5 active:scale-95',
                ]
              : [
                  'bg-background/70 text-muted-foreground border-border/50',
                  'hover:bg-background hover:text-foreground active:scale-95',
                ],
          )}
        >
          {isPending ? (
            <Loader2 size={10} className="animate-spin shrink-0" />
          ) : (
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              {isSharing && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
              )}
              <span className={cn(
                'relative inline-flex h-1.5 w-1.5 rounded-full',
                isSharing ? 'bg-white' : 'bg-muted-foreground/50',
              )} />
            </span>
          )}
          {isPending ? 'Saving…' : isSharing ? 'Live' : 'Paused'}
        </button>

        {/* Active friends count */}
        {activeFriendCount > 0 && (
          <div className={cn(
            'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-semibold',
            'bg-background/70 text-foreground border border-border/50',
          )}>
            <Users size={10} className="text-primary shrink-0" />
            <span>{activeFriendCount}</span>
          </div>
        )}
      </div>

      {/* ── Right: action buttons ────────────────────────────────── */}
      <div className="flex items-center gap-1">
        {allPoints.length > 1 && (
          <MapBtn onClick={onFitAll} title="Fit all markers in view">
            <LocateFixed size={13} />
          </MapBtn>
        )}
        <MapBtn
          onClick={onFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </MapBtn>
      </div>
    </div>
  );
}
