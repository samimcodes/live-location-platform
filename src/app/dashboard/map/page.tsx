'use client';

import React, { useState, useCallback, useRef, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FriendMarkerPanel } from '@/components/map/FriendMarkerPanel';
import { useFriends } from '@/hooks/useFriends';
import { useFriendsLocations } from '@/hooks/useFriendsLocations';
import { useLocationStore } from '@/store/useLocationStore';
import { useMapLibre } from '@/hooks/useMapLibre';
import { isValidLatLng, type LatLng } from '@/lib/mapUtils';
import { cn } from '@/lib/utils';
import { Users, ChevronUp, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// LiveMap is WebGL — client only
const LiveMap = dynamic(
  () => import('@/components/map/LiveMap').then((m) => m.LiveMap),
  { ssr: false }
);

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <MapPageInner />
    </Suspense>
  );
}

function MapPageInner() {
  useFriendsLocations();

  const searchParams                      = useSearchParams();
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { myLocation, friendsLocations, geoError } = useLocationStore();
  const [focusedUserId, setFocusedUserId] = useState<number | undefined>();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const allPointsRef = useRef<LatLng[]>([]);

  const {
    containerRef, mapRef, mapLoaded, mapError,
    flyTo, fitToPoints, toggleFullscreen, isFullscreen,
  } = useMapLibre({ controls: true });

  // Memoize allPoints so it only recalculates when locations actually change,
  // preventing unnecessary LiveMap re-renders on every unrelated state update.
  const allPoints = useMemo<LatLng[]>(() => {
    const pts: LatLng[] = [];
    if (myLocation && isValidLatLng(myLocation.latitude, myLocation.longitude))
      pts.push({ latitude: myLocation.latitude, longitude: myLocation.longitude });
    friendsLocations.forEach((loc) => {
      if (isValidLatLng(loc.latitude, loc.longitude))
        pts.push({ latitude: loc.latitude, longitude: loc.longitude });
    });
    return pts;
  }, [myLocation, friendsLocations]);

  const activeFriendCount = useMemo(
    () => friends.filter((f) => f.sharingLocation && friendsLocations.has(f.id)).length,
    [friends, friendsLocations]
  );

  allPointsRef.current = allPoints;

  // Auto-focus from ?focus=ID (navigated from Friends page)
  useEffect(() => {
    const id = searchParams.get('focus');
    if (id) {
      setFocusedUserId(Number(id));
      setMobileDrawerOpen(false);
    }
  }, [searchParams]);

  const handleFitAll = useCallback(() => {
    fitToPoints(allPointsRef.current, 80);
  }, [fitToPoints]);

  const handleRecenter = useCallback(() => {
    if (myLocation && isValidLatLng(myLocation.latitude, myLocation.longitude)) {
      flyTo(myLocation.latitude, myLocation.longitude, 15);
    }
  }, [myLocation, flyTo]);

  const handleFocusFriend = useCallback(
    (userId: number | undefined) => {
      setFocusedUserId(userId);
      if (userId) {
        const loc = friendsLocations.get(userId);
        if (loc && isValidLatLng(loc.latitude, loc.longitude))
          flyTo(loc.latitude, loc.longitude, 15);
        setMobileDrawerOpen(false);
      }
    },
    [friendsLocations, flyTo]
  );

  return (
    // Full height of the slot the layout gives us (no padding, no container)
    <div className="h-full flex overflow-hidden">

      {/* ════════════════════════════════════════════════════
          MAP CANVAS — takes all space left of the sidebar
          ════════════════════════════════════════════════════ */}
      <div className="relative flex-1 min-w-0">

        <LiveMap
          className="absolute inset-0 rounded-none"
          showFriends
          focusUserId={focusedUserId}
          containerRef={containerRef}
          mapRef={mapRef}
          mapLoaded={mapLoaded}
          mapError={mapError}
          flyTo={flyTo}
          fitToPoints={fitToPoints}
          overlayControls={{
            activeFriendCount,
            allPoints,
            onFitAll:     handleFitAll,
            onRecenter:   handleRecenter,
            canRecenter:  !!(myLocation && isValidLatLng(myLocation.latitude, myLocation.longitude)),
            onFullscreen: toggleFullscreen,
            isFullscreen,
          }}
        />

        {geoError && (
          <div className="absolute top-17 left-3 right-3 lg:right-22 z-20">
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-background/95 px-3 py-2.5 shadow-lg backdrop-blur-md">
              <MapPin size={14} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {geoError.code === 1
                  ? 'Location permission denied. Enable it in the browser to show your pin.'
                  : 'Couldn’t read GPS. Check that location services are on.'}
              </p>
            </div>
          </div>
        )}

        {/* ── Mobile FAB: open friends drawer ─────────────────── */}
        <AnimatePresence>
          {!mobileDrawerOpen && (
            <motion.div
              key="fab"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{ scale: 0.8,    opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="absolute bottom-20 right-4 z-20 lg:hidden"
            >
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className={cn(
                  'flex items-center gap-2.5 pl-3.5 pr-4 py-2.5',
                  'rounded-full shadow-xl border',
                  'bg-card/95 backdrop-blur-md border-border/60',
                  'active:scale-95 transition-transform',
                )}
              >
                <div className="relative">
                  <Users size={16} className="text-foreground" />
                  {activeFriendCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-chart-5 text-white text-[8px] font-bold flex items-center justify-center">
                      {activeFriendCount > 9 ? '9+' : activeFriendCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold">Friends</span>
                <ChevronUp size={12} className="text-muted-foreground" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile bottom sheet ──────────────────────────────── */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-black/30 z-20 lg:hidden"
              onClick={() => setMobileDrawerOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileDrawerOpen && (
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 z-30 lg:hidden rounded-t-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: '60vh' }}
            >
              <div
                className="flex justify-center items-center h-8 bg-card border-t border-x border-border cursor-pointer shrink-0"
                onClick={() => setMobileDrawerOpen(false)}
              >
                <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
              </div>
              <FriendMarkerPanel
                friends={friends}
                isLoading={friendsLoading}
                focusedUserId={focusedUserId}
                onFocusFriend={handleFocusFriend}
                className="rounded-none border-t-0 border-x border-b-0 min-h-0 flex-1"
                style={{ maxHeight: 'calc(60vh - 2rem)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════════════════
          DESKTOP SIDEBAR — right panel, flush to edges
          ════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 border-l border-border bg-card">
        <FriendMarkerPanel
          friends={friends}
          isLoading={friendsLoading}
          focusedUserId={focusedUserId}
          onFocusFriend={handleFocusFriend}
          className="flex-1 rounded-none border-0"
        />
      </div>
    </div>
  );
}
