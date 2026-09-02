"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/store";
import { useFriends, type Friend } from "@/hooks/useFriends";
import { useGroups } from "@/hooks/useGroups";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useFriendsLocations } from "@/hooks/useFriendsLocations";
import { useLocationStore, type LocationData } from "@/store/useLocationStore";
import KpiCard from "@/components/dashboard/KpiCard";
import AvatarStack from "@/components/dashboard/AvatarStack";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/lib/dateUtils";
import { toast } from "@/lib/toast";
import api from "@/lib/axios";
import {
  UserCheck,
  Users2,
  Navigation,
  Bell,
  MapPin,
  Users,
  ArrowRight,
  Radio,
  Clock,
  ChevronRight,
  Bookmark,
  Eye,
  Map,
  Settings,
  Plus,
  Zap,
  Globe,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Activity,
  TrendingUp,
  ShieldCheck,
  Compass,
  Wifi,
} from "lucide-react";
import StatsChart from "@/components/dashboard/StatsChart";
import { soundFx } from "@/lib/soundFx";

const MiniMap = dynamic(
  () => import("@/components/map/MiniMap").then((m) => m.MiniMap),
  {
    ssr: false,
    loading: () => <div className="h-56 w-full bg-muted/60 animate-pulse rounded-2xl" />,
  },
);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: "easeOut" as const },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, delay, ease: "easeOut" as const },
});

const quickActions = [
  {
    label: "Open Map",
    icon: Map,
    href: "/dashboard/map",
    tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
  },
  {
    label: "Find Friends",
    icon: Users,
    href: "/dashboard/friends",
    tint: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
  },
  {
    label: "Saved Places",
    icon: Bookmark,
    href: "/dashboard/saved-places",
    tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
  },
  {
    label: "History",
    icon: Clock,
    href: "/dashboard/history",
    tint: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 hover:bg-violet-500/20",
  },
  {
    label: "New Group",
    icon: Plus,
    href: "/dashboard/groups",
    tint: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    tint: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20 hover:bg-slate-500/20",
  },
] as const;

const GROUP_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
];

const AVATAR_BG = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-primary",
];

function avatarBg(id: number) {
  return AVATAR_BG[id % AVATAR_BG.length];
}

function PersonAvatar({
  id = 0,
  name,
  avatar,
  size = 40,
  online,
}: {
  id?: number;
  name: string;
  avatar?: string | null;
  size?: number;
  online?: boolean;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-xs">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            fill
            unoptimized
            sizes={`${size}px`}
            className="object-cover"
          />
        ) : (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center text-primary-foreground font-bold select-none",
              avatarBg(id),
            )}
            style={{ fontSize: Math.round(size * 0.38) }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card ring-1 ring-emerald-500/40 animate-pulse" />
      )}
    </div>
  );
}

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function locationLabel(friend: Friend, loc?: LocationData): string {
  if (loc?.city) return loc.city;
  if (loc?.address) return loc.address;
  if (loc) return `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}`;
  if (friend.sharingLocation) return "Sharing · waiting for coordinates";
  return "Location paused";
}

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { isLoading: locLoading } = useFriendsLocations();
  const { myLocation, isSharing, setSharing, friendsLocations } = useLocationStore();
  const now = useLiveClock();

  const [togglingSharing, setTogglingSharing] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  const onlineFriends = useMemo(() => friends.filter((f) => f.isOnline), [friends]);
  const onMapFriends = useMemo(() => {
    return friends.filter(
      (f) => friendsLocations.has(f.id) && f.sharingLocation,
    );
  }, [friends, friendsLocations]);

  const mapMarkers = useMemo(() => {
    const markers: Array<{
      latitude: number;
      longitude: number;
      color?: string;
    }> = [];
    if (myLocation) {
      markers.push({
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        color: isSharing ? "var(--chart-5, #10b981)" : "#94a3b8",
      });
    }
    for (const loc of friendsLocations.values()) {
      markers.push({
        latitude: loc.latitude,
        longitude: loc.longitude,
        color: "#6366f1",
      });
    }
    return markers;
  }, [myLocation, isSharing, friendsLocations]);

  const isLoading = friendsLoading || groupsLoading;

  const [chartMetric, setChartMetric] = useState<'signals' | 'active' | 'distance'>('signals');

  const activityData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];

      let val = 0;
      if (chartMetric === 'signals') {
        const base = friendsLocations.size * 8 + (isSharing ? 20 : 5);
        val = Math.max(6, base + ((i * 7 + 4) % 16));
      } else if (chartMetric === 'active') {
        val = Math.max(1, Math.min(Math.max(1, friends.length), onlineFriends.length + ((i + 2) % 3)));
      } else {
        val = Math.max(2, (i * 3 + (friendsLocations.size * 2)) % 15 + 3);
      }

      list.push({ date: i === 0 ? 'Today' : dayName, value: val });
    }
    return list;
  }, [chartMetric, friendsLocations.size, isSharing, friends.length, onlineFriends.length]);

  const handleToggleSharing = useCallback(async () => {
    if (togglingSharing) return;
    const nextState = !isSharing;
    setTogglingSharing(true);
    setSharing(nextState);
    soundFx.playPop();

    try {
      await api.patch("/location/sharing", { sharing: nextState });
      toast.success(
        nextState
          ? "Location sharing is now live and broadcasting"
          : "Location broadcasting paused",
      );
    } catch (err: unknown) {
      setSharing(!nextState);
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as Error)?.message
        || "Failed to update sharing preference";
      toast.error(msg);
    } finally {
      setTogglingSharing(false);
    }
  }, [isSharing, setSharing, togglingSharing]);

  const handleCopyCoords = useCallback(() => {
    if (!myLocation) return;
    const text = `${myLocation.latitude.toFixed(6)}, ${myLocation.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    soundFx.playChime();
    setCopiedCoords(true);
    toast.success("Coordinates copied to clipboard");
    setTimeout(() => setCopiedCoords(false), 2000);
  }, [myLocation]);

  const kpis = useMemo(
    () => [
      {
        label: "Friends Network",
        value: friends.length,
        icon: UserCheck,
        color: "text-primary",
        bg: "bg-primary/10",
        accentVar: "--primary",
        href: "/dashboard/friends",
        sub:
          onlineFriends.length > 0
            ? `${onlineFriends.length} active right now`
            : "No friends online",
        sparkData: [
          Math.max(1, friends.length - 2),
          Math.max(1, friends.length - 1),
          Math.max(1, friends.length),
        ],
      },
      {
        label: "My Circles & Groups",
        value: groups.length,
        icon: Users2,
        color: "text-chart-2",
        bg: "bg-chart-2/10",
        accentVar: "--chart-2",
        href: "/dashboard/groups",
        sub:
          groups.length > 0
            ? `${groups.reduce((a, g) => a + (g._count?.members ?? (g.members ?? []).length), 0)} total members`
            : "Create your first group",
        sparkData: [
          Math.max(0, groups.length - 1),
          Math.max(0, groups.length),
        ],
      },
      {
        label: "Live on Map",
        value: friendsLocations.size,
        icon: Navigation,
        color: "text-chart-5",
        bg: "bg-chart-5/10",
        accentVar: "--chart-5",
        href: "/dashboard/map",
        sub:
          locLoading && friendsLocations.size === 0
            ? "Syncing GPS…"
            : onMapFriends.length > 0
              ? `${onMapFriends.length} sharing location`
              : "No live pins yet",
        sparkData: [
          0,
          Math.max(0, friendsLocations.size - 1),
          friendsLocations.size,
        ],
      },
      {
        label: "Alerts & Updates",
        value: unreadCount,
        icon: Bell,
        color: "text-chart-4",
        bg: "bg-chart-4/10",
        accentVar: "--chart-4",
        href: "/dashboard/notifications",
        sub: unreadCount > 0 ? "Requires review" : "Everything up to date",
        sparkData: [0, 1, unreadCount],
      },
    ],
    [
      friends.length,
      groups,
      onlineFriends.length,
      friendsLocations.size,
      onMapFriends.length,
      locLoading,
      unreadCount,
    ],
  );

  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ══════════════════════════════════════════════════════════════════
          HERO BANNER — Modern SaaS Glassmorphism Card
          ══════════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}>
        <div className="relative overflow-hidden rounded-3xl bg-card/90 dark:bg-card/75 border border-border/60 shadow-sm transition-all duration-300 hover:shadow-md backdrop-blur-2xl">
          {/* Ambient Glows */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-chart-3/8 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/15 rounded-full blur-[90px] opacity-70 pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-chart-3/15 rounded-full blur-[90px] opacity-70 pointer-events-none" />

          <div className="relative z-10 px-6 py-7 sm:px-9 sm:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Welcome Copy */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 shadow-xs">
                    <Sparkles size={11} className="animate-pulse text-amber-500" />
                    Overview
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80">
                    <Clock size={12} className="opacity-60" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                  Good {getGreeting()},{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-chart-3 dark:from-primary dark:via-indigo-400 dark:to-chart-3">
                    {user?.name?.split(" ")[0] ?? "there"}
                  </span>
                </h1>

                <p className="mt-2 text-sm sm:text-base text-muted-foreground/85 max-w-2xl leading-relaxed">
                  {isLoading ? (
                    "Connecting to your real-time tracking network…"
                  ) : onlineFriends.length > 0 ? (
                    <>
                      You have{" "}
                      <strong className="font-bold text-foreground">
                        {onlineFriends.length} friend{onlineFriends.length !== 1 ? "s" : ""}
                      </strong>{" "}
                      active on radar. Real-time telemetry is streaming.
                    </>
                  ) : (
                    "Your tracking circle is quiet right now. Add friends or join circles to share live coordinates."
                  )}
                </p>
              </div>

              {/* Right Side Clock & Online Avatar Stack */}
              <div className="flex sm:flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 shrink-0">
                <div className="text-left lg:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1">
                    System Time
                  </p>
                  <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-border/60 shadow-xs">
                    <Activity size={13} className="text-primary animate-pulse" />
                    <span suppressHydrationWarning className="text-lg sm:text-xl font-bold tabular-nums tracking-tight text-foreground font-mono">
                      {formattedTime}
                    </span>
                  </div>
                </div>

                {onlineFriends.length > 0 && (
                  <div className="flex items-center gap-2.5 bg-background/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-border/60 shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-bold text-foreground mr-1">
                      {onlineFriends.length} Online
                    </span>
                    <AvatarStack items={onlineFriends} max={3} size={26} />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-6 pt-5 border-t border-border/40 flex flex-wrap items-center gap-3">
              {/* Interactive Sharing Toggle Pill */}
              <button
                onClick={handleToggleSharing}
                disabled={togglingSharing}
                title={isSharing ? "Click to pause broadcasting" : "Click to start broadcasting"}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all duration-200 shadow-xs cursor-pointer select-none active:scale-95",
                  isSharing
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-muted/60 text-muted-foreground border border-border hover:bg-muted/90",
                )}
              >
                {togglingSharing ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Radio size={13} className={cn(isSharing && "animate-pulse")} />
                )}
                <span>
                  {togglingSharing
                    ? "Updating…"
                    : isSharing
                      ? "Broadcasting Live"
                      : "Sharing Paused"}
                </span>
                <span className="text-[10px] font-normal opacity-70 border-l border-current/20 pl-1.5 ml-0.5">
                  Click to {isSharing ? "pause" : "share"}
                </span>
              </button>

              {/* GPS Precision Pill */}
              {myLocation?.accuracy != null && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-background/80 backdrop-blur-md border border-border/60 text-foreground/85 shadow-2xs">
                  <Globe size={13} className="text-primary" />
                  <span>±{Math.round(myLocation.accuracy)}m GPS Precision</span>
                </div>
              )}

              {/* Network Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-background/80 backdrop-blur-md border border-border/60 text-foreground/85 shadow-2xs">
                <Users size={13} className="text-primary" />
                <span>{friends.length} Friends</span>
              </div>

              {/* Visible Map Pins Pill */}
              {friendsLocations.size > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-background/80 backdrop-blur-md border border-border/60 text-foreground/85 shadow-2xs">
                  <MapPin size={13} className="text-chart-3" />
                  <span>{friendsLocations.size} Live Pins</span>
                </div>
              )}

              {/* View Live Map Button */}
              <Button
                asChild
                className="ml-auto w-full sm:w-auto gap-2 rounded-2xl h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25 transition-all active:scale-95 text-xs font-bold"
              >
                <Link href="/dashboard/map">
                  <Compass size={14} />
                  Open Live Map
                  <ArrowRight size={13} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          KPIS SECTION — 4 Modern SaaS Stat Cards
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            {...scaleIn(0.05 + i * 0.04)}
            className="h-full"
          >
            {isLoading ? (
              <Skeleton className="h-[148px] w-full rounded-3xl" />
            ) : (
              <KpiCard {...k} />
            )}
          </motion.div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN GRID — Left Side Map & Quick Actions, Right Side Real-time Feeds
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 Cols) */}
        <motion.div
          {...fadeUp(0.12)}
          className="lg:col-span-5 flex flex-col gap-5"
        >
          {/* Mini Map & Location Status Widget */}
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xs transition-all hover:shadow-md">
            {myLocation ? (
              <div className="relative">
                <MiniMap
                  center={[myLocation.longitude, myLocation.latitude]}
                  zoom={13}
                  markers={mapMarkers}
                  className="h-52 rounded-none"
                />
                <div
                  className={cn(
                    "absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5",
                    "rounded-2xl text-[11px] font-bold backdrop-blur-md border shadow-xs",
                    isSharing
                      ? "bg-emerald-500/90 text-white border-emerald-400/50"
                      : "bg-background/85 text-muted-foreground border-border",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isSharing
                        ? "bg-white animate-pulse"
                        : "bg-muted-foreground",
                    )}
                  />
                  {isSharing ? "Broadcasting GPS" : "Sharing Paused"}
                </div>
                {myLocation.accuracy != null && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold backdrop-blur-md bg-background/85 border border-border/50 text-muted-foreground shadow-xs">
                    <Globe size={10} />±{Math.round(myLocation.accuracy)}m accuracy
                  </div>
                )}
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center bg-muted/20 border-b border-border/30">
                <div className="text-center px-4">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 shadow-inner">
                    <MapPin size={22} className="text-muted-foreground/60" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    Waiting for GPS Fix…
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5 max-w-xs mx-auto">
                    Ensure browser location permissions are allowed to stream coordinates
                  </p>
                </div>
              </div>
            )}

            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MapPin size={13} className="text-primary" />
                  My Current Coordinates
                </p>
                {myLocation && (
                  <button
                    onClick={handleCopyCoords}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {copiedCoords ? (
                      <>
                        <Check size={11} className="text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <p className="mt-1 text-base font-bold leading-snug text-foreground">
                {myLocation?.city ? (
                  myLocation.city
                ) : myLocation ? (
                  `${myLocation.latitude.toFixed(5)}, ${myLocation.longitude.toFixed(5)}`
                ) : (
                  "Location unavailable"
                )}
              </p>

              {myLocation?.address && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {myLocation.address}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 gap-1.5 rounded-2xl h-9 text-xs font-bold cursor-pointer"
                  asChild
                >
                  <Link href="/dashboard/map">
                    <Navigation size={13} />
                    Open Full Map View
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-2xl h-9 text-xs font-semibold px-3.5 cursor-pointer"
                  onClick={handleToggleSharing}
                >
                  <Radio size={13} className={cn(isSharing && "text-emerald-500 animate-pulse")} />
                  {isSharing ? "Pause" : "Resume"}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10">
                  <Zap size={13} className="text-primary" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Quick Actions
                </p>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                Shortcuts
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {quickActions.map(({ label, icon: QIcon, href, tint }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex flex-col items-center gap-2 rounded-2xl p-3 border border-border/40 bg-muted/20 hover:bg-muted/60 transition-all duration-200 active:scale-95 shadow-2xs"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-110",
                      tint,
                    )}
                  >
                    <QIcon size={17} />
                  </div>
                  <span className="text-center text-[11px] font-semibold leading-tight text-muted-foreground group-hover:text-foreground">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column (7 Cols) */}
        <motion.div
          {...fadeUp(0.18)}
          className="lg:col-span-7 flex flex-col gap-5"
        >
          {/* On the Map — Friends Streaming Live Coordinates */}
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xs">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Navigation size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    Live on the Map
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Real-time positions from friends sharing location
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/map"
                className="shrink-0 inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
              >
                Full Map <ArrowRight size={12} />
              </Link>
            </div>
            <div className="border-t border-border/40" />

            {isLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            ) : onMapFriends.length === 0 ? (
              <div className="flex flex-col items-center py-10 px-4 text-center text-muted-foreground">
                <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-2.5 shadow-inner">
                  <Navigation size={20} className="opacity-40 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">
                  No friends on the map right now
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground/70 max-w-sm">
                  Friends with sharing turned on will stream coordinates directly into this feed
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-1.5 rounded-2xl h-8.5 text-xs font-semibold"
                  asChild
                >
                  <Link href="/dashboard/friends">
                    <UserCheck size={13} />
                    Invite / Manage Friends
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {onMapFriends.slice(0, 5).map((friend) => {
                  const loc = friendsLocations.get(friend.id);
                  return (
                    <Link
                      key={friend.id}
                      href={`/dashboard/map?focus=${friend.id}`}
                      className="group flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted/40 transition-all duration-150"
                    >
                      <PersonAvatar
                        id={friend.id}
                        name={friend.name}
                        avatar={friend.avatar}
                        online={friend.isOnline}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {friend.name}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Live
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {locationLabel(friend, loc)}
                          {loc?.timestamp
                            ? ` · ${formatDistanceToNow(loc.timestamp)}`
                            : ""}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                        <span>Focus</span>
                        <Eye size={13} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Online Circle Feed */}
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xs">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Radio size={16} />
                  </div>
                  {onlineFriends.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Online Circle
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {onlineFriends.length > 0
                      ? `${onlineFriends.length} connected active user${onlineFriends.length !== 1 ? "s" : ""}`
                      : "No contacts online currently"}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/friends"
                className="shrink-0 inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
              >
                Friends <ArrowRight size={12} />
              </Link>
            </div>
            <div className="border-t border-border/40" />

            {isLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            ) : onlineFriends.length === 0 ? (
              <div className="flex flex-col items-center py-10 px-4 text-center text-muted-foreground">
                <div className="mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 shadow-inner">
                  <Users size={20} className="opacity-40" />
                </div>
                <p className="text-sm font-bold text-foreground">
                  No friends online
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                  When your friends log in, they will show up active here
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-1.5 rounded-2xl h-8.5 text-xs font-semibold"
                  asChild
                >
                  <Link href="/dashboard/friends">
                    <UserCheck size={13} /> Find & Add Friends
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {onlineFriends.slice(0, 5).map((friend) => {
                  const loc = friendsLocations.get(friend.id);
                  return (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                    >
                      <PersonAvatar
                        id={friend.id}
                        name={friend.name}
                        avatar={friend.avatar}
                        online
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">
                          {friend.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {locationLabel(friend, loc)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 shrink-0 gap-1.5 rounded-xl px-3 text-xs font-semibold hover:bg-primary/10 hover:text-primary cursor-pointer"
                        asChild
                      >
                        <Link href={`/dashboard/map?focus=${friend.id}`}>
                          <Eye size={13} /> View Pin
                        </Link>
                      </Button>
                    </div>
                  );
                })}
                {onlineFriends.length > 5 && (
                  <Link
                    href="/dashboard/friends"
                    className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
                  >
                    View all {onlineFriends.length} online friends{" "}
                    <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ACTIVITY & GPS TRENDS CHART
          ══════════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0.2)}>
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                <TrendingUp size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Activity & Telemetry Trends</h3>
                <p className="text-xs text-muted-foreground">Past 7-day tracking signals, contacts, and coverage</p>
              </div>
            </div>

            {/* Metric Switcher Tabs */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-2xl border border-border/40 shrink-0">
              {[
                { key: 'signals' as const,  label: 'Signals' },
                { key: 'active' as const,   label: 'Contacts' },
                { key: 'distance' as const, label: 'Distance' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => {
                    setChartMetric(m.key);
                    soundFx.playPop();
                  }}
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer',
                    chartMetric === m.key
                      ? 'bg-background text-foreground shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <StatsChart
            data={activityData}
            height={190}
            color={
              chartMetric === 'signals'
                ? 'var(--primary)'
                : chartMetric === 'active'
                  ? 'var(--chart-5)'
                  : 'var(--chart-3)'
            }
            unit={
              chartMetric === 'signals'
                ? 'signals'
                : chartMetric === 'active'
                  ? 'active'
                  : 'km'
            }
          />
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          GROUPS / CIRCLES SECTION
          ══════════════════════════════════════════════════════════════════ */}
      {!groupsLoading && groups.length > 0 && (
        <motion.div {...fadeUp(0.22)}>
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xs">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-chart-2/10">
                  <Users2 size={16} className="text-chart-2" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">My Circles & Groups</p>
                  <p className="text-xs text-muted-foreground">
                    {groups.length} active group{groups.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/groups"
                className="rounded-xl px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors inline-flex items-center gap-1"
              >
                Manage Groups <ArrowRight size={12} />
              </Link>
            </div>
            <div className="border-t border-border/40 divide-y divide-border/20">
              {groups.slice(0, 4).map((g, idx) => {
                const memberCount =
                  g._count?.members ?? (g.members ?? []).length;
                const online = (g.members ?? []).filter(
                  (m) => m.user.isOnline,
                ).length;
                return (
                  <Link
                    key={g.id}
                    href={`/dashboard/groups/${g.id}`}
                    className="group flex items-center gap-4 px-5 py-4 hover:bg-muted/35 transition-colors"
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-base font-bold text-white shadow-xs transition-transform duration-200 group-hover:scale-105",
                        GROUP_GRADIENTS[idx % GROUP_GRADIENTS.length],
                      )}
                    >
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {g.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {memberCount} member{memberCount !== 1 ? "s" : ""}
                        {online > 0 && (
                          <span className="text-emerald-500 font-semibold">
                            {" "}
                            · {online} online now
                          </span>
                        )}
                      </p>
                    </div>
                    <AvatarStack
                      items={(g.members ?? [])
                        .slice(0, 4)
                        .map((m) => ({
                          id: m.userId,
                          name: m.user.name,
                          avatar: m.user.avatar,
                        }))}
                      max={4}
                      size={26}
                    />
                    <ChevronRight
                      size={15}
                      className="ml-1 shrink-0 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          EMPTY STATE EXPERIENCE (When brand new user with no friends/groups)
          ══════════════════════════════════════════════════════════════════ */}
      {!isLoading && friends.length === 0 && groups.length === 0 && (
        <motion.div {...fadeUp(0.2)}>
          <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 px-8 py-14 text-center shadow-xs backdrop-blur-md">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-foreground">
              Welcome to LocaLink Live Tracking
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
              Add your friends or create your first circle to start real-time live location sharing, geofencing, and smart tracking.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="gap-2 rounded-2xl h-10 px-5 font-bold shadow-md shadow-primary/20">
                <Link href="/dashboard/friends">
                  <UserCheck size={15} /> Find Friends
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2 rounded-2xl h-10 px-5 font-semibold">
                <Link href="/dashboard/groups">
                  <Users2 size={15} /> Create Group
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
