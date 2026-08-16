'use client';

/**
 * Map Page
 * --------
 * Full-page live-location map powered by MapLibre GL JS + OpenStreetMap.
 *
 * Architecture:
 *  - useMapLibre() is called HERE (lifted up) so MapPage can directly call
 *    fitToPoints() and toggleFullscreen() without a callback dance.
 *  - LiveMap receives containerRef + mapRef + mapLoaded + mapError as props
 *    (the "controlled map" pattern).
 *  - useFriendsLocations() hydrates Zustand from REST; socket keeps it live.
 *
 * Layout (responsive):
 *  - flex-1: MapControls bar + map canvas
 *  - w-72 (lg+): FriendMarkerPanel sidebar
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LiveMap } from '@/components/map/LiveMap';
import { MapControls } from '@/components/map/MapControls';
import { FriendMarkerPanel } from '@/components/map/FriendMarkerPanel';
import { useFriends } from '@/hooks/useFriends';
import { useFriendsLocations } from '@/hooks/useFriendsLocations';
import { useLocationStore } from '@/store/useLocationStore';
import { useMapLibre } from '@/hooks/useMapLibre';
import { isValidLatLng, type LatLng } from '@/lib/mapUtils';

export default function MapPage() {
  // ── All hooks at the top — Rules of Hooks ─────────────────────────────────
  useFriendsLocations();

  const searchParams   = useSearchParams();
  const { data: friends = [] } = useFriends();
  const { myLocation, friendsLocations } = useLocationStore();
  const [focusedUserId, setFocusedUserId] = useState<number | undefined>();

  // Stable ref for allPoints — avoids stale closure in handleFitAll
  const allPointsRef = useRef<LatLng[]>([]);

  // ── Map lifecycle lifted to page ──────────────────────────────────────────
  const {
    containerRef,
    mapRef,
    mapLoaded,
    mapError,
    flyTo,
    fitToPoints,
    toggleFullscreen,
    isFullscreen,
  } = useMapLibre({ controls: true });

  // ── Derived values (not hooks) ────────────────────────────────────────────
  const allPoints: LatLng[] = [];
  if (myLocation && isValidLatLng(myLocation.latitude, myLocation.longitude)) {
    allPoints.push({ latitude: myLocation.latitude, longitude: myLocation.longitude });
  }
  friendsLocations.forEach((loc) => {
    if (isValidLatLng(loc.latitude, loc.longitude)) {
      allPoints.push({ latitude: loc.latitude, longitude: loc.longitude });
    }
  });

  const activeFriendCount = friends.filter(
    (f) => f.sharingLocation && friendsLocations.has(f.id)
  ).length;

  // Keep ref in sync every render so handleFitAll always reads latest points
  allPointsRef.current = allPoints;

  // ── Focus friend from ?focus= query param (navigated from Friends page) ───
  useEffect(() => {
    const focusId = searchParams.get('focus');
    if (focusId) setFocusedUserId(Number(focusId));
  }, [searchParams]);

  const handleFitAll = useCallback(() => {
    fitToPoints(allPointsRef.current, 80);
  }, [fitToPoints]);

  const handleFocusFriend = useCallback(
    (userId: number | undefined) => {
      setFocusedUserId(userId);
      if (userId) {
        const loc = friendsLocations.get(userId);
        if (loc && isValidLatLng(loc.latitude, loc.longitude)) {
          flyTo(loc.latitude, loc.longitude, 15);
        }
      }
    },
    [friendsLocations, flyTo]
  );

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4">
      {/* ── Left: controls + map ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <MapControls
          activeFriendCount={activeFriendCount}
          allPoints={allPoints}
          onFitAll={handleFitAll}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />

        {/* LiveMap in "controlled" mode — receives the already-initialised refs */}
        <LiveMap
          className="flex-1"
          showFriends
          focusUserId={focusedUserId}
          containerRef={containerRef}
          mapRef={mapRef}
          mapLoaded={mapLoaded}
          mapError={mapError}
          flyTo={flyTo}
          fitToPoints={fitToPoints}
        />
      </div>

      {/* ── Right: friends panel (lg+) ────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-72 shrink-0">
        <FriendMarkerPanel
          friends={friends}
          focusedUserId={focusedUserId}
          onFocusFriend={handleFocusFriend}
          className="flex-1"
        />
      </div>
    </div>
  );
}
