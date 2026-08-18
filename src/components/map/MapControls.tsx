'use client';

/**
 * MapControls
 * -----------
 * Floating overlay bar rendered INSIDE the map canvas (absolute positioned).
 * Glass-morphic style — backdrop blur + semi-transparent background.
 *
 * Rendered by LiveMap via the `overlayControls` prop so it sits on top of
 * the map tiles rather than above the canvas.
 */

import React, { useState } from 'react';
import { Radio, Maximize2, Minimize2, LocateFixed, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { useLocationStore } from '@/store/useLocationStore';
import { toast } from '@/lib/toast';
import type { LatLng } from '@/lib/mapUtils';

export interface MapControlsProps {
  activeFriendCount: number;
  onFitAll:     () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  allPoints:    LatLng[];
  /** Position inside the map canvas */
  className?: string;
}

// ── Icon button ────────────────────────────────────────────────────────────
function MapBtn({
  onClick, title, children, active, danger,
}: {
  onClick: () => void;
  title:   string;
  children: React.ReactNode;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'h-8 w-8 rounded-lg flex items-center justify-center transition-all',
        'backdrop-blur-md border shadow-sm text-xs font-semibold',
        active
          ? 'bg-primary text-primary-foreground border-primary/60 shadow-primary/20'
          : danger
          ? 'bg-background/80 text-destructive border-border/50 hover:bg-destructive/10'
          : 'bg-background/80 text-foreground border-border/50 hover:bg-background/95',
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
    <div className={cn('flex items-center justify-between gap-2 px-3 py-2', className)}>

      {/* ── Left: live status pill ───────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleSharing}
          disabled={isPending}
          title={isSharing ? 'Pause location sharing' : 'Start sharing location'}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold',
            'backdrop-blur-md border shadow-sm transition-all select-none',
            isSharing
              ? 'bg-emerald-500/90 text-white border-emerald-400/60 shadow-emerald-500/20'
              : 'bg-background/80 text-muted-foreground border-border/50 hover:bg-background/95',
          )}
        >
          <Radio
            size={11}
            className={isSharing && !isPending ? 'animate-pulse' : ''}
          />
          {isPending ? 'Saving…' : isSharing ? 'Live' : 'Paused'}
        </button>

        {activeFriendCount > 0 && (
          <div className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold',
            'backdrop-blur-md border shadow-sm',
            'bg-background/80 text-foreground border-border/50',
          )}>
            <Users size={11} />
            {activeFriendCount}
          </div>
        )}
      </div>

      {/* ── Right: action buttons ────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        {allPoints.length > 1 && (
          <MapBtn onClick={onFitAll} title="Fit all markers">
            <LocateFixed size={14} />
          </MapBtn>
        )}
        <MapBtn
          onClick={onFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </MapBtn>
      </div>
    </div>
  );
}
