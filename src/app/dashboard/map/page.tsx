'use client';

import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapControls } from '@/components/map/MapControls';
import { FriendMarkerPanel } from '@/components/map/FriendMarkerPanel';
import { useFriends } from '@/hooks/useFriends';
import { useFriendsLocations } from '@/hooks/useFriendsLocations';
import { useLocationStore } from '@/store/useLocationStore';
import { useMapLibre } from '@/hooks/useMapLibre';
import { isValidLatLng, type LatLng } from '@/lib/mapUtils';

// LiveMap must never render on the server — maplibre-gl uses
// `new URL(worker, import.meta.url)` which is not Node-compatible.
const LiveMap = dynamic(
  () => import('@/components/map/LiveMap').then((m) => m.LiveMap),
  { ssr: false }
);

// useSearchParams() must be inside a Suspense boundary for static export
export default function MapPage() {
  return (
    <Suspense fallback={null}>
      <MapPageInner />
    </Suspense>
  );
}

function MapPageInner() {
  useFriendsLocations();

  const searchParams                     = useSearchParams();
  const { data: friends = [] }           = useFriends();
  const { myLocation, friendsLocations } = useLocationStore();
  const [focusedUserId, setFocusedUserId] = useState<number | undefined>();
  const allPointsRef = useRef<LatLng[]>([]);

  const {
    containerRef, mapRef, mapLoaded, mapError,
    flyTo, fitToPoints, toggleFullscreen, isFullscreen,
  } = useMapLibre({ controls: true });

  // Build allPoints for Fit-All
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

  allPointsRef.current = allPoints;

  // Read ?focus=ID from Friends page navigation
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
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <MapControls
          activeFriendCount={activeFriendCount}
          allPoints={allPoints}
          onFitAll={handleFitAll}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
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
