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
  Plus,
  Minus,
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
  onZoomIn?:         () => void;
  onZoomOut?:        () => void;
  searchSlot?:       React.ReactNode;
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
        'h-8 w-8 rounded-xl flex items-center justify-center cursor-pointer',
        'transition-all duration-150 border active:scale-95 select-none shrink-0',
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25 font-bold'
          : 'bg-background/80 text-foreground/80 border-border/60 hover:bg-background hover:text-foreground shadow-xs',
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
  mapTheme = 'street',
  onSelectMapTheme,
  is3D = false,
  onToggle3D,
  onZoomIn,
  onZoomOut,
  searchSlot,
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
    } catch (err: unknown) {
      setSharing(!next);
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as Error)?.message
        || 'Failed to update sharing preference';
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={cn('flex items-center justify-between gap-3 px-3 py-2', className)}>

      {/* ── Left: Search slot + Sharing toggle + Friend count ────────── */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        
        {/* Search Bar Slot */}
        {searchSlot && (
          <div className="shrink-0 max-w-[15rem] sm:max-w-xs w-full">
            {searchSlot}
          </div>
        )}

        {/* Sharing pill */}
        <button
          onClick={handleToggleSharing}
          disabled={isPending}
          title={isSharing ? 'Pause location sharing' : 'Start sharing location'}
          className={cn(
            'inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold cursor-pointer shrink-0',
            'border transition-all duration-200 select-none active:scale-95 shadow-xs',
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
          <span className="hidden sm:inline">{isPending ? 'Saving…' : isSharing ? 'Live Radar' : 'Sharing Paused'}</span>
        </button>

        {/* Active friends count badge */}
        {activeFriendCount > 0 && (
          <div className={cn(
            'hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-bold shrink-0',
            'bg-background/80 text-foreground border border-border/60 shadow-xs',
          )}>
            <Users size={12} className="text-primary shrink-0" />
            <span>{activeFriendCount} live</span>
          </div>
        )}
      </div>

      {/* ── Right: action buttons & map style picker ────────────────── */}
      <div className="flex items-center gap-1.5 shrink-0">

        {/* Zoom Controls */}
        {onZoomIn && onZoomOut && (
          <div className="hidden sm:flex items-center bg-background/80 border border-border/60 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={onZoomIn}
              title="Zoom In"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
            <div className="w-[1px] h-3.5 bg-border/60" />
            <button
              onClick={onZoomOut}
              title="Zoom Out"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <Minus size={13} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Style switcher dropdown */}
        <div className="relative" ref={styleMenuRef}>
          <MapBtn
            onClick={() => setStyleMenuOpen((prev) => !prev)}
            title="Switch Map Layers"
            active={styleMenuOpen}
          >
            <Layers size={15} />
          </MapBtn>

          {styleMenuOpen && onSelectMapTheme && (
            <div className="absolute right-0 top-10 w-44 rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/70 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest px-2.5 py-1">
                Map Style
              </p>
              {(Object.keys(MAP_STYLES) as MapThemeStyle[]).map((themeKey) => {
                const isSelected = mapTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    onClick={() => {
                      onSelectMapTheme(themeKey);
                      setStyleMenuOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer select-none',
                      isSelected
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'text-foreground hover:bg-muted/70'
                    )}
                  >
                    <span>{MAP_STYLES[themeKey].name}</span>
                    {isSelected && <Check size={13} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3D Perspective Tilt Button */}
        {onToggle3D && (
          <MapBtn
            onClick={onToggle3D}
            title={is3D ? 'Reset to 2D Top View' : 'Switch to 3D Perspective Tilt'}
            active={is3D}
          >
            <Compass size={15} className={cn('transition-transform duration-300', is3D && 'rotate-45')} />
          </MapBtn>
        )}

        {/* Fit all points */}
        {allPoints.length > 0 && (
          <MapBtn onClick={onFitAll} title={`Fit all ${allPoints.length} pins`}>
            <Scan size={15} />
          </MapBtn>
        )}

        {/* Recenter on me */}
        {canRecenter && onRecenter && (
          <MapBtn onClick={onRecenter} title="Recenter on my location">
            <LocateFixed size={15} className="text-primary" />
          </MapBtn>
        )}

        {/* Fullscreen */}
        <MapBtn
          onClick={onFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          active={isFullscreen}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </MapBtn>
      </div>
    </div>
  );
}
