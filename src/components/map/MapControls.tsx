'use client';

/**
 * MapControls
 * -----------
 * Floating overlay bar rendered INSIDE the map canvas (absolute positioned).
 * Glass-morphic style — backdrop blur + semi-transparent background.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  LocateFixed,
  Users,
  Loader2,
  Scan,
  Layers,
  Check,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { useLocationStore } from '@/store/useLocationStore';
import { toast } from '@/lib/toast';
import { MAP_STYLES, type LatLng, type MapThemeStyle } from '@/lib/mapUtils';

export interface MapControlsProps {
  activeFriendCount: number;
  onFitAll:          () => void;
  onFullscreen:      () => void;
  isFullscreen:      boolean;
  allPoints:         LatLng[];
  onRecenter?:       () => void;
  canRecenter?:      boolean;
  mapTheme?:         MapThemeStyle;
  onSelectMapTheme?: (theme: MapThemeStyle) => void;
  is3D?:             boolean;
  onToggle3D?:       () => void;
  className?:        string;
}

// ── Icon button ────────────────────────────────────────────────────────────
function MapBtn({
  onClick,
  title,
  children,
  active,
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
        'h-7.5 w-7.5 rounded-lg flex items-center justify-center cursor-pointer',
        'transition-all duration-150 border active:scale-95 select-none',
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25'
          : 'bg-background/80 text-foreground/80 border-border/60 hover:bg-background hover:text-foreground',
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
  onRecenter,
  canRecenter = false,
  mapTheme = 'dark',
  onSelectMapTheme,
  is3D = false,
  onToggle3D,
  className,
}: MapControlsProps) {
  const { isSharing, setSharing } = useLocationStore();
  const [isPending, setIsPending] = useState(false);
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const styleMenuRef = useRef<HTMLDivElement>(null);

  // Close style menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (styleMenuRef.current && !styleMenuRef.current.contains(e.target as Node)) {
        setStyleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggleSharing = async () => {
    if (isPending) return;
    const next = !isSharing;
    setIsPending(true);
    setSharing(next);
    try {
      await api.patch('/location/sharing', { sharing: next });
      toast.success(next ? 'Live broadcasting resumed' : 'Location broadcasting paused');
    } catch {
      setSharing(!next);
      toast.error('Failed to update sharing preference');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={cn('flex items-center justify-between gap-3 px-3.5 py-2.5', className)}>

      {/* ── Left: sharing toggle + friend count ─────────────────── */}
      <div className="flex items-center gap-2">

        {/* Sharing pill */}
        <button
          onClick={handleToggleSharing}
          disabled={isPending}
          title={isSharing ? 'Pause location sharing' : 'Start sharing location'}
          className={cn(
            'inline-flex items-center gap-1.5 h-7.5 px-3 rounded-full text-xs font-bold cursor-pointer',
            'border transition-all duration-200 select-none active:scale-95',
            isSharing
              ? [
                  'bg-chart-5/90 text-white border-chart-5/50',
                  'shadow-sm shadow-chart-5/20',
                  'hover:bg-chart-5',
                ]
              : [
                  'bg-background/80 text-muted-foreground border-border/60',
                  'hover:bg-background hover:text-foreground',
                ],
          )}
        >
          {isPending ? (
            <Loader2 size={11} className="animate-spin shrink-0" />
          ) : (
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              {isSharing && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
              )}
              <span className={cn(
                'relative inline-flex h-1.5 w-1.5 rounded-full',
                isSharing ? 'bg-white' : 'bg-muted-foreground/50',
              )} />
            </span>
          )}
          <span>{isPending ? 'Saving…' : isSharing ? 'Live Radar' : 'Sharing Paused'}</span>
        </button>

        {/* Active friends count badge */}
        {activeFriendCount > 0 && (
          <div className={cn(
            'inline-flex items-center gap-1.5 h-7.5 px-2.5 rounded-full text-xs font-bold',
            'bg-background/80 text-foreground border border-border/60 shadow-xs',
          )}>
            <Users size={12} className="text-primary shrink-0" />
            <span>{activeFriendCount} live</span>
          </div>
        )}
      </div>

      {/* ── Right: action buttons & map style picker ────────────────── */}
      <div className="flex items-center gap-1.5">

        {/* Style switcher dropdown */}
        <div className="relative" ref={styleMenuRef}>
          <MapBtn
            onClick={() => setStyleMenuOpen((v) => !v)}
            title="Switch map layer style"
            active={styleMenuOpen}
          >
            <Layers size={14} />
          </MapBtn>

          {styleMenuOpen && (
            <div className="absolute right-0 top-9 w-48 bg-card/95 backdrop-blur-2xl border border-border/70 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-1.5">
                Map Styles
              </p>
              <div className="space-y-0.5">
                {(Object.keys(MAP_STYLES) as MapThemeStyle[]).map((themeKey) => {
                  const styleObj = MAP_STYLES[themeKey];
                  const isSelected = mapTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      onClick={() => {
                        onSelectMapTheme?.(themeKey);
                        setStyleMenuOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer',
                        isSelected
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <span>{styleObj.name}</span>
                      {isSelected && <Check size={13} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3D Tilt toggle */}
        {onToggle3D && (
          <MapBtn
            onClick={onToggle3D}
            title={is3D ? 'Reset to 2D Top-Down View' : '3D Perspective Tilt View'}
            active={is3D}
          >
            <Compass size={14} className={cn(is3D && 'text-primary')} />
          </MapBtn>
        )}

        {/* Recenter button */}
        {canRecenter && onRecenter && (
          <MapBtn onClick={onRecenter} title="Recenter on my location">
            <LocateFixed size={14} />
          </MapBtn>
        )}

        {/* Fit all markers */}
        {allPoints.length > 1 && (
          <MapBtn onClick={onFitAll} title="Fit all markers in view">
            <Scan size={14} />
          </MapBtn>
        )}

        {/* Fullscreen button */}
        <MapBtn
          onClick={onFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen view'}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </MapBtn>
      </div>
    </div>
  );
}
