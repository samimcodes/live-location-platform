'use client';

/**
 * MapControls
 * -----------
 * Floating action panel rendered above the LiveMap canvas.
 *
 * Responsibilities:
 *  - Location-sharing toggle (calls Zustand + optional API)
 *  - "Fit all" button (fly map to contain all markers)
 *  - Fullscreen toggle
 *  - Sharing-status badge
 *
 * All map mutations go through the callbacks passed as props so
 * this component stays presentational and easy to test.
 */

import React, { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Radio, Maximize2, Minimize2, LocateFixed, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { useLocationStore } from '@/store/useLocationStore';
import { toast } from '@/lib/toast';
import type { LatLng } from '@/lib/mapUtils';

export interface MapControlsProps {
  /** Number of friends currently visible on the map. */
  activeFriendCount: number;
  /** Called when the user clicks "Fit all markers". */
  onFitAll: () => void;
  /** Called when the user clicks fullscreen toggle. */
  onFullscreen: () => void;
  /** Whether the map container is currently in fullscreen. */
  isFullscreen: boolean;
  /** All points currently on the map (for the fit-all button label). */
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
  const [isPending, startTransition] = useTransition();

  const handleToggleSharing = () => {
    const next = !isSharing;
    startTransition(async () => {
      // Optimistic update
      setSharing(next);
      try {
        await api.patch('/location/sharing', { sharing: next });
      } catch {
        // Roll back on failure
        setSharing(!next);
        toast.error('Failed to update sharing preference');
      }
    });
  };

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      {/* Left: status badge */}
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

      {/* Right: action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Fit all */}
        {allPoints.length > 1 && (
          <Button variant="outline" size="sm" onClick={onFitAll} title="Fit all markers">
            <LocateFixed size={13} className="mr-1.5" />
            Fit all
          </Button>
        )}

        {/* Fullscreen */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </Button>

        {/* Sharing toggle */}
        <Button
          variant={isSharing ? 'outline' : 'default'}
          size="sm"
          onClick={handleToggleSharing}
          disabled={isPending}
        >
          <Radio size={13} className="mr-1.5" />
          {isSharing ? 'Pause' : 'Share location'}
        </Button>
      </div>
    </div>
  );
}
