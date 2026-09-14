'use client';

import React, { useState, useCallback, useRef, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FriendMarkerPanel } from '@/components/map/FriendMarkerPanel';
import { MapSearchBar } from '@/components/map/MapSearchBar';
import { useFriends } from '@/hooks/useFriends';
import { useFriendsLocations } from '@/hooks/useFriendsLocations';
import { useGetSavedPlaces } from '@/hooks/useSavedPlaces';
import { useLocationStore } from '@/store/useLocationStore';
import { useMapLibre } from '@/hooks/useMapLibre';
import {
  isValidLatLng,
  fetchLiveRoute,
  formatDistance,
  formatDuration,
  type LatLng,
  type RouteInfo,
} from '@/lib/mapUtils';
import {
  Users, MapPin, Loader2,
  X, Route, Sparkles, Car, Footprints, ChevronDown, ChevronUp,
  Ghost, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

import { MapSOSButton } from '@/components/map/EmergencySOSModal';
import { MapChatDrawer } from '@/components/map/MapChatDrawer';
import { GhostModeDialog } from '@/components/map/GhostModeDialog';
import type { RoutingProfile } from '@/lib/mapUtils';

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

  const searchParams                                     = useSearchParams();
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: savedPlaces = [] }                       = useGetSavedPlaces();
  const { myLocation, friendsLocations, geoError }       = useLocationStore();

  const [focusedUserId, setFocusedUserId]         = useState<number | undefined>();
  const [mobileDrawerOpen, setMobileDrawerOpen]   = useState(false);
  const [searchMarker, setSearchMarker]           = useState<{ latitude: number; longitude: number; name: string } | null>(null);
  const [activeRoute, setActiveRoute]             = useState<{ destination: string; info: RouteInfo } | null>(null);
  const [isRouting, setIsRouting]                 = useState(false);
  const [routingProfile, setRoutingProfile]       = useState<RoutingProfile>('driving');
  const [showSteps, setShowSteps]                 = useState(false);
  const [lastRouteDest, setLastRouteDest]         = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [chatTarget, setChatTarget]               = useState<{
    isOpen: boolean;
    friendId?: number;
    friendName?: string;
    friendAvatar?: string | null;
  }>({ isOpen: false });

  const [ghostModalOpen, setGhostModalOpen]       = useState(false);
  const { ghostUntil, batterySaverMode }          = useLocationStore();
  const isGhostActive = ghostUntil !== null && Date.now() < ghostUntil;

  const allPointsRef = useRef<LatLng[]>([]);

  const {
    containerRef, mapRef, mapLoaded, mapError,
    flyTo, fitToPoints, toggleFullscreen, isFullscreen,
    mapTheme, setMapThemeStyle, is3D, toggle3D,
    zoomIn, zoomOut,
  } = useMapLibre({ controls: true, initialTheme: 'satellite' });

  // ── Compute all active points ──────────────────────────────────────────
  const allPoints = useMemo<LatLng[]>(() => {
    const pts: LatLng[] = [];
    if (myLocation && isValidLatLng(myLocation.latitude, myLocation.longitude))
      pts.push({ latitude: myLocation.latitude, longitude: myLocation.longitude });
    friendsLocations.forEach((loc) => {
      if (isValidLatLng(loc.latitude, loc.longitude))
        pts.push({ latitude: loc.latitude, longitude: loc.longitude });
    });
    savedPlaces.forEach((p) => {
      if (isValidLatLng(p.latitude, p.longitude))
        pts.push({ latitude: p.latitude, longitude: p.longitude });
    });
    return pts;
  }, [myLocation, friendsLocations, savedPlaces]);

  const activeFriendCount = useMemo(
    () => friends.filter((f) => f.sharingLocation && friendsLocations.has(f.id)).length,
    [friends, friendsLocations]
  );

  useEffect(() => {
    allPointsRef.current = allPoints;
  }, [allPoints]);

  // Auto-focus from ?focus=ID
  const focusParam = searchParams?.get('focus');
  const [prevFocusParam, setPrevFocusParam] = useState<string | null>(null);
  if (focusParam && focusParam !== prevFocusParam) {
    setPrevFocusParam(focusParam);
    setFocusedUserId(Number(focusParam));
    setMobileDrawerOpen(false);
  }

  const handleFitAll = useCallback(() => {
    fitToPoints(allPointsRef.current, 80);
  }, [fitToPoints]);

  const handleRecenter = useCallback(() => {
    if (myLocation && isValidLatLng(myLocation.latitude, myLocation.longitude)) {
      flyTo(myLocation.latitude, myLocation.longitude, 16);
    }
  }, [myLocation, flyTo]);

  const handleFocusFriend = useCallback(
    (userId: number | undefined) => {
      setFocusedUserId(userId);
      if (userId) {
        const loc = friendsLocations.get(userId);
        if (loc && isValidLatLng(loc.latitude, loc.longitude)) {
          flyTo(loc.latitude, loc.longitude, 15);
        }
        setMobileDrawerOpen(false);
      }
    },
    [friendsLocations, flyTo]
  );

  // ── Global place search handler ────────────────────────────────────────
  const handleSelectSearchLocation = useCallback(
    (lat: number, lon: number, name: string) => {
      setSearchMarker({ latitude: lat, longitude: lon, name });
      flyTo(lat, lon, 15);
      toast.success(`Centered on ${name}`);
    },
    [flyTo]
  );

  // ── Live Routing / Directions Engine (OSRM) ────────────────────────────
  const handleGetRouteTo = useCallback(
    async (
      destLat: number,
      destLng: number,
      destName: string,
      profile: RoutingProfile = routingProfile
    ) => {
      if (!myLocation || !isValidLatLng(myLocation.latitude, myLocation.longitude)) {
        toast.error('Your current location is needed to calculate directions');
        return;
      }

      setIsRouting(true);
      setLastRouteDest({ lat: destLat, lng: destLng, name: destName });
      toast.info(`Calculating ${profile === 'walking' ? 'walking' : 'driving'} route to ${destName}…`);

      try {
        const route = await fetchLiveRoute(
          myLocation.longitude,
          myLocation.latitude,
          destLng,
          destLat,
          profile
        );

        if (!route) {
          toast.error('No road route found to this location');
          return;
        }

        setActiveRoute({ destination: destName, info: route });

        // Fit bounds to cover both points
        fitToPoints(
          [
            { latitude: myLocation.latitude, longitude: myLocation.longitude },
            { latitude: destLat, longitude: destLng },
          ],
          100
        );

        toast.success(`Route calculated (${(route.distanceMeters / 1000).toFixed(1)} km)`);
      } catch {
        toast.error('Could not compute directions');
      } finally {
        setIsRouting(false);
      }
    },
    [myLocation, fitToPoints, routingProfile]
  );

  const handleToggleProfile = (profile: RoutingProfile) => {
    setRoutingProfile(profile);
    if (lastRouteDest) {
      handleGetRouteTo(lastRouteDest.lat, lastRouteDest.lng, lastRouteDest.name, profile);
    }
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
    setShowSteps(false);
    setLastRouteDest(null);
  };

  return (
    <div className="h-full flex overflow-hidden relative">

      {/* ════════════════════════════════════════════════════
          MAP CANVAS — takes all space left of the sidebar
          ════════════════════════════════════════════════════ */}
      <div className="relative flex-1 min-w-0">

        <LiveMap
          className="absolute inset-0 rounded-none"
          showFriends
          focusUserId={focusedUserId}
          savedPlaces={savedPlaces}
          searchMarker={searchMarker}
          routeInfo={activeRoute?.info}
          containerRef={containerRef}
          mapRef={mapRef}
          mapLoaded={mapLoaded}
          mapError={mapError}
          flyTo={flyTo}
          fitToPoints={fitToPoints}
          overlayControls={{
            activeFriendCount,
            allPoints,
            onFitAll:         handleFitAll,
            onRecenter:       handleRecenter,
            canRecenter:      !!(myLocation && isValidLatLng(myLocation.latitude, myLocation.longitude)),
            onFullscreen:     toggleFullscreen,
            isFullscreen,
            mapTheme,
            onSelectMapTheme: setMapThemeStyle,
            is3D,
            onToggle3D:       toggle3D,
            onZoomIn:         zoomIn,
            onZoomOut:        zoomOut,
            searchSlot:       <MapSearchBar onSelectLocation={handleSelectSearchLocation} />,
          }}
        />

        {/* ── Active Route Navigation HUD (Top-Center) ───────── */}
        <AnimatePresence>
          {isRouting && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-16 sm:top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-[min(94%,26rem)]"
            >
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card/90 dark:bg-card/85 backdrop-blur-2xl border border-primary/40 shadow-xl">
                <Loader2 size={15} className="animate-spin text-primary shrink-0" />
                <span className="text-xs font-bold text-foreground">
                  Calculating {routingProfile === 'walking' ? 'walking' : 'driving'} route…
                </span>
              </div>
            </motion.div>
          )}

          {activeRoute && !isRouting && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 sm:top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-[min(94%,28rem)] flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/95 backdrop-blur-2xl border border-primary/40 shadow-2xl shadow-primary/10">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white shadow-md shrink-0">
                  <Route size={18} className="animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Live Directions</span>
                    <Sparkles size={10} className="text-primary" />
                  </div>
                  <p className="text-xs font-bold text-foreground truncate">
                    To: {activeRoute.destination}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] font-semibold text-muted-foreground">
                    <span className="text-foreground font-bold">{formatDistance(activeRoute.info.distanceMeters / 1000)}</span>
                    <span>•</span>
                    <span className="text-chart-5 font-bold">{formatDuration(activeRoute.info.durationSeconds)} ETA</span>
                  </div>
                </div>

                {/* Profile Toggle (Drive / Walk) */}
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/60">
                  <button
                    type="button"
                    onClick={() => handleToggleProfile('driving')}
                    className={cn(
                      'h-6 w-6 rounded-lg flex items-center justify-center transition-all cursor-pointer',
                      routingProfile === 'driving' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    )}
                    title="Driving route"
                  >
                    <Car size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleProfile('walking')}
                    className={cn(
                      'h-6 w-6 rounded-lg flex items-center justify-center transition-all cursor-pointer',
                      routingProfile === 'walking' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    )}
                    title="Walking route"
                  >
                    <Footprints size={13} />
                  </button>
                </div>

                {activeRoute.info.steps && activeRoute.info.steps.length > 0 && (
                  <button
                    onClick={() => setShowSteps((s) => !s)}
                    className="h-7 w-7 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title={showSteps ? 'Hide steps' : 'View steps'}
                  >
                    {showSteps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}

                <button
                  onClick={handleClearRoute}
                  className="h-7 w-7 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Clear route"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Expandable Step Summary */}
              {showSteps && activeRoute.info.steps && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="max-h-48 overflow-y-auto rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/80 p-2.5 shadow-xl space-y-1 text-xs"
                >
                  {activeRoute.info.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-muted/40">
                      <span className="font-medium text-foreground truncate pr-2">
                        {idx + 1}. {step.instruction}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold shrink-0 tabular-nums">
                        {step.distanceMeters > 1000
                          ? `${(step.distanceMeters / 1000).toFixed(1)} km`
                          : `${Math.round(step.distanceMeters)} m`}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── GPS error alert ─────────────────────────────────── */}
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

        {/* ── Privacy / Ghost Mode & Battery Button ──────────── */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setGhostModalOpen(true)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border shadow-lg backdrop-blur-md text-xs font-bold transition-all cursor-pointer select-none active:scale-95',
              isGhostActive
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/30'
                : batterySaverMode
                ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/30'
                : 'bg-card/90 text-foreground border-border/70 hover:bg-card shadow-black/10'
            )}
          >
            {isGhostActive ? (
              <>
                <Ghost size={14} className="animate-pulse" />
                <span>Ghost Active</span>
              </>
            ) : batterySaverMode ? (
              <>
                <Zap size={14} />
                <span>Battery Saver</span>
              </>
            ) : (
              <>
                <Ghost size={14} className="text-muted-foreground" />
                <span className="hidden sm:inline">Ghost & Battery</span>
                <span className="sm:hidden">Ghost</span>
              </>
            )}
          </button>
        </div>

        {/* ── Ghost Mode & Battery Dialog ─────────────────────── */}
        <GhostModeDialog
          open={ghostModalOpen}
          onClose={() => setGhostModalOpen(false)}
        />

        {/* ── Floating 1-Click Emergency SOS Dispatch Button ──── */}
        <MapSOSButton />

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
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-xl shadow-primary/30 active:scale-95 transition-transform cursor-pointer"
              >
                <Users size={16} />
                <span>Friends ({friends.length})</span>
                {activeFriendCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-chart-5 ring-2 ring-primary" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile Bottom Sheet Drawer ───────────────────────── */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileDrawerOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 340, damping: 32 }}
                className="absolute inset-x-0 bottom-0 z-40 max-h-[75vh] flex flex-col bg-card rounded-t-3xl border-t border-border/70 shadow-2xl overflow-hidden lg:hidden"
              >
                <div className="w-full flex justify-center pt-2.5 pb-1">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>
                <FriendMarkerPanel
                  friends={friends}
                  focusedUserId={focusedUserId}
                  onFocusFriend={handleFocusFriend}
                  onRouteTo={handleGetRouteTo}
                  onOpenChat={(f) =>
                    setChatTarget({
                      isOpen: true,
                      friendId: f.id,
                      friendName: f.name,
                      friendAvatar: f.avatar,
                    })
                  }
                  isLoading={friendsLoading}
                  className="w-full border-none flex-1"
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════════════════
          DESKTOP SIDEBAR — Radar Circle
          ════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex shrink-0">
        <FriendMarkerPanel
          friends={friends}
          focusedUserId={focusedUserId}
          onFocusFriend={handleFocusFriend}
          onRouteTo={handleGetRouteTo}
          onOpenChat={(f) =>
            setChatTarget({
              isOpen: true,
              friendId: f.id,
              friendName: f.name,
              friendAvatar: f.avatar,
            })
          }
          isLoading={friendsLoading}
        />
      </div>

      {/* ════════════════════════════════════════════════════
          SLIDING MAP CHAT DRAWER
          ════════════════════════════════════════════════════ */}
      <MapChatDrawer
        isOpen={chatTarget.isOpen}
        onClose={() => setChatTarget({ isOpen: false })}
        friendId={chatTarget.friendId}
        friendName={chatTarget.friendName}
        friendAvatar={chatTarget.friendAvatar}
      />

    </div>
  );
}
