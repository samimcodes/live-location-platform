"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/store";
import { useFriends } from "@/hooks/useFriends";
import { useGroups } from "@/hooks/useGroups";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useLocationStore } from "@/store/useLocationStore";
import KpiCard from "@/components/dashboard/KpiCard";
import StatsChart from "@/components/dashboard/StatsChart";
import AvatarStack from "@/components/dashboard/AvatarStack";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  UserCheck, Users2, Navigation, Bell,
  MapPin, Users, ArrowRight, Radio,
  Clock, ChevronRight, Bookmark,
  Activity, Eye,
  Map, Settings, Plus,
  Shield, Zap, Globe, Sparkles,
} from "lucide-react";

// ── WebGL component — client only ────────────────────────────────────────
const MiniMap = dynamic(
  () => import("@/components/map/MiniMap").then((m) => m.MiniMap),
  {
    ssr:     false,
    loading: () => <div className="h-52 w-full rounded-xl bg-muted animate-pulse" />,
  }
);

// ── Framer Motion helpers ─────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 18 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.38, delay, ease: "easeOut" as const },
});

const scaleIn = (delay = 0) => ({
  initial:    { opacity: 0, scale: 0.96 },
  animate:    { opacity: 1, scale: 1    },
  transition: { duration: 0.32, delay, ease: "easeOut" as const },
});

// ── Deterministic sparkline data (no Math.random) ─────────────────────────
function makeSparkData(base: number, phase = 0): number[] {
  return Array.from({ length: 7 }, (_, i) =>
    Math.max(0, base + Math.round(Math.sin(i * 1.3 + phase) * 2))
  );
}

// ── Quick Actions config ──────────────────────────────────────────────────
const quickActions = [
  { label: "Open Map",     icon: Map,      href: "/dashboard/map",          gradient: "from-emerald-500 to-teal-600",   bgLight: "bg-emerald-50 dark:bg-emerald-950/30" },
  { label: "Find Friends", icon: Users,    href: "/dashboard/friends",       gradient: "from-blue-500 to-indigo-600",    bgLight: "bg-blue-50 dark:bg-blue-950/30" },
  { label: "Saved Places", icon: Bookmark, href: "/dashboard/saved-places",  gradient: "from-amber-500 to-orange-600",   bgLight: "bg-amber-50 dark:bg-amber-950/30" },
  { label: "History",      icon: Clock,    href: "/dashboard/history",        gradient: "from-violet-500 to-purple-600",  bgLight: "bg-violet-50 dark:bg-violet-950/30" },
  { label: "Settings",     icon: Settings, href: "/dashboard/settings",       gradient: "from-slate-500 to-slate-700",    bgLight: "bg-slate-50 dark:bg-slate-950/30" },
  { label: "New Group",    icon: Plus,     href: "/dashboard/groups",         gradient: "from-rose-500 to-pink-600",      bgLight: "bg-rose-50 dark:bg-rose-950/30" },
] as const;

// ── Live clock hook ───────────────────────────────────────────────────────
function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ── Group gradient colors ─────────────────────────────────────────────────
const GROUP_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
];

export default function DashboardPage() {
  const user                      = useAppSelector((s) => s.auth.user);
  const { data: friends = [] }    = useFriends();
  const { data: groups  = [] }    = useGroups();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { myLocation, isSharing, friendsLocations } = useLocationStore();
  const now = useLiveClock();

  const onlineFriends  = friends.filter((f) => f.isOnline);
  const sharingFriends = onlineFriends.filter((f) => f.sharingLocation && friendsLocations.has(f.id));
  const base           = Math.max(1, friends.length);

  // ── Resolve CSS token colors for WebGL/SVG contexts ───────────────────
  const markerActiveColor  = React.useMemo(() =>
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue("--chart-5").trim() || "oklch(0.8 0.15 150)"
      : "oklch(0.8 0.15 150)"
  , []);
  const markerPausedColor  = React.useMemo(() =>
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue("--muted-foreground").trim() || "oklch(0.55 0.02 250)"
      : "oklch(0.55 0.02 250)"
  , []);

  // ── KPI data ──────────────────────────────────────────────────────────
  const kpis = [
    {
      label:     "Friends",
      value:     friends.length,
      icon:      UserCheck,
      color:     "text-primary",
      bg:        "bg-primary/10",
      accentVar: "--primary",
      href:      "/dashboard/friends",
      sub:       onlineFriends.length > 0 ? `${onlineFriends.length} online` : "None online",
      sparkData: makeSparkData(base, 0),
    },
    {
      label:     "Groups",
      value:     groups.length,
      icon:      Users2,
      color:     "text-chart-2",
      bg:        "bg-chart-2/10",
      accentVar: "--chart-2",
      href:      "/dashboard/groups",
      sub:       groups.length > 0
        ? `${groups.reduce((a, g) => a + (g._count?.members ?? (g.members ?? []).length), 0)} members`
        : "Create your first",
      sparkData: makeSparkData(Math.max(1, groups.length), 1.2),
    },
    {
      label:     "On the Map",
      value:     friendsLocations.size,
      icon:      Navigation,
      color:     "text-chart-5",
      bg:        "bg-chart-5/10",
      accentVar: "--chart-5",
      href:      "/dashboard/map",
      sub:       sharingFriends.length > 0 ? `${sharingFriends.length} sharing now` : "Open map",
      sparkData: makeSparkData(Math.max(1, friendsLocations.size), 2.4),
    },
    {
      label:     "Notifications",
      value:     unreadCount,
      icon:      Bell,
      color:     "text-chart-4",
      bg:        "bg-chart-4/10",
      accentVar: "--chart-4",
      href:      "/dashboard/notifications",
      sub:       unreadCount > 0 ? "Needs attention" : "All caught up",
      sparkData: makeSparkData(Math.max(0, unreadCount), 3.6),
    },
  ];

  // ── Chart data ────────────────────────────────────────────────────────
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date:  d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: Math.max(0, base + Math.round(Math.sin(i * 1.3 + 0.5) * 2)),
    };
  });

  // ── Formatted date/time ───────────────────────────────────────────────
  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  return (
    <div className="space-y-6 pb-8">

      {/* ══════════════════════════════════════════════════════════════════
          HERO BANNER
         ══════════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}>
        <div className="relative rounded-2xl overflow-hidden welcome-gradient border border-border/40 shadow-sm">

          {/* Gradient mesh orbs */}
          <div className="absolute -top-10 -left-10 h-52 w-52 rounded-full blur-3xl opacity-25 dark:opacity-20 pointer-events-none bg-primary" />
          <div className="absolute -top-8 right-16 h-40 w-40 rounded-full blur-3xl opacity-15 dark:opacity-10 pointer-events-none bg-chart-3" />
          <div className="absolute -bottom-12 right-8 h-48 w-48 rounded-full blur-3xl opacity-20 dark:opacity-15 pointer-events-none bg-chart-4" />
          <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full blur-2xl opacity-10 dark:opacity-10 pointer-events-none bg-chart-5" />

          <div className="relative z-10 px-7 py-8 sm:px-10 sm:py-10">

            {/* Top: greeting left, avatar stack + time right */}
            <div className="flex items-start justify-between gap-4">

              {/* LEFT — greeting */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-primary/70">
                    Dashboard
                  </span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-[11px] font-medium text-muted-foreground/60">
                    {formattedDate}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-[2rem] font-extrabold tracking-tight leading-tight text-foreground">
                  Good {getGreeting()},{" "}
                  <span className="text-primary">
                    {user?.name?.split(" ")[0] ?? "there"}
                  </span>{" "}
                  <span>👋</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                  {onlineFriends.length > 0
                    ? `${onlineFriends.length} friend${onlineFriends.length !== 1 ? "s" : ""} online right now.`
                    : "No friends online right now."}{" "}
                  {isSharing ? "Your location is live." : "Location sharing is paused."}
                </p>
              </div>

              {/* RIGHT — time + online stack */}
              <div className="hidden sm:flex flex-col items-end gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground/80">
                    {formattedTime}
                  </p>
                </div>

                {onlineFriends.length > 0 && (
                  <div className="flex items-center gap-2.5">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {onlineFriends.length} online
                    </p>
                    <div className="flex items-center -space-x-2.5">
                      {onlineFriends.slice(0, 5).map((f, idx) => (
                        <div
                          key={f.id}
                          className={cn(
                            "h-8 w-8 rounded-full border-2 border-card",
                            "flex items-center justify-center text-white text-[10px] font-bold shadow-md shrink-0",
                            [
                              "bg-chart-1",
                              "bg-chart-3",
                              "bg-chart-5",
                              "bg-chart-2",
                              "bg-chart-4",
                            ][idx % 5],
                          )}
                          style={{ zIndex: 10 - idx }}
                        >
                          {f.avatar ? (
                            <Image src={f.avatar} alt={f.name} fill sizes="32px" className="object-cover rounded-full" />
                          ) : (
                            f.name?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                      ))}
                      {onlineFriends.length > 5 && (
                        <div className="h-8 w-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground shadow-md shrink-0">
                          +{onlineFriends.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom row: stat badges + CTA */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">

              {/* Location sharing badge */}
              <div className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold",
                "border backdrop-blur-md shadow-sm transition-colors duration-300",
                isSharing
                  ? "bg-card/60 text-chart-5 border-chart-5/30"
                  : "bg-card/40 text-muted-foreground border-border/50",
              )}>
                <span className="relative flex h-2 w-2 shrink-0">
                  {isSharing && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-5 opacity-60" />
                  )}
                  <span className={cn(
                    "relative inline-flex h-2 w-2 rounded-full",
                    isSharing ? "bg-chart-5" : "bg-muted-foreground/40",
                  )} />
                </span>
                {isSharing ? "Location live" : "Sharing paused"}
              </div>

              {/* Friends badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-card/60 border border-border/50 backdrop-blur-md shadow-sm text-foreground">
                <UserCheck size={12} className="text-primary shrink-0" />
                <span>{friends.length} friend{friends.length !== 1 ? "s" : ""}</span>
              </div>

              {/* On map badge */}
              {friendsLocations.size > 0 && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-card/60 border border-border/50 backdrop-blur-md shadow-sm text-foreground">
                  <Navigation size={12} className="text-chart-5 shrink-0" />
                  <span>{friendsLocations.size} on map</span>
                </div>
              )}

              {/* Notifications badge */}
              {unreadCount > 0 && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-card/60 border border-chart-4/30 backdrop-blur-md shadow-sm text-chart-4">
                  <Bell size={12} className="shrink-0" />
                  <span>{unreadCount} unread</span>
                </div>
              )}

              {/* Spacer + CTA */}
              <div className="ml-auto hidden sm:block">
                <Button asChild size="sm" className="gap-2 shadow-md shadow-primary/20 font-semibold rounded-xl">
                  <Link href="/dashboard/map">
                    <Navigation size={13} />
                    Open Map
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          KPI GRID
         ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} {...scaleIn(0.08 + i * 0.06)} className="h-full">
            <KpiCard {...k} />
          </motion.div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BENTO GRID — location + quick actions | chart + online now
         ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Left column ── */}
        <motion.div {...fadeUp(0.2)} className="lg:col-span-5 flex flex-col gap-5">

          {/* My Location — MiniMap + text */}
          <div className={cn(
            "rounded-2xl bg-card border border-border/60 overflow-hidden",
            "shadow-sm hover:shadow-md transition-shadow duration-300",
          )}>
            {myLocation ? (
              <div className="relative">
                <MiniMap
                  center={[myLocation.longitude, myLocation.latitude]}
                  zoom={13}
                  markers={[{
                    latitude:  myLocation.latitude,
                    longitude: myLocation.longitude,
                    color:     isSharing ? markerActiveColor : markerPausedColor,
                  }]}
                  className="h-52 rounded-none"
                />
                {/* Status badge */}
                <div className={cn(
                  "absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5",
                  "rounded-xl text-[11px] font-bold backdrop-blur-md border shadow-sm",
                  isSharing
                    ? "bg-chart-5/90 text-white border-chart-5/50 dark:bg-chart-5/80"
                    : "bg-background/80 text-muted-foreground border-border",
                )}>
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    isSharing ? "bg-white animate-pulse" : "bg-muted-foreground",
                  )} />
                  {isSharing ? "Live" : "Paused"}
                </div>

                {/* Accuracy badge */}
                {myLocation.accuracy != null && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold backdrop-blur-md bg-background/70 border border-border/50 text-muted-foreground shadow-sm">
                    <Globe size={10} />
                    ±{Math.round(myLocation.accuracy)}m
                  </div>
                )}
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center bg-muted/20">
                <div className="text-center">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <MapPin size={22} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">Waiting for GPS…</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Enable location to see your position</p>
                </div>
              </div>
            )}

            <div className="px-5 pt-4 pb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin size={13} className="text-primary" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  My Location
                </p>
              </div>
              <p className="text-lg font-bold leading-snug">
                {myLocation?.city
                  ?? (myLocation
                    ? `${myLocation.latitude.toFixed(4)}, ${myLocation.longitude.toFixed(4)}`
                    : "Not sharing")}
              </p>
              {myLocation?.address && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{myLocation.address}</p>
              )}
              <Button variant="outline" size="sm" className="w-full mt-4 gap-2 rounded-xl" asChild>
                <Link href="/dashboard/map">
                  <Navigation size={13} />
                  Open full map
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={cn(
            "rounded-2xl bg-card border border-border/60 p-5",
            "shadow-sm hover:shadow-md transition-shadow duration-300",
          )}>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap size={13} className="text-primary" />
              </div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Quick Actions
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {quickActions.map(({ label, icon: QIcon, href, gradient, bgLight }) => (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "group flex flex-col items-center gap-2.5 p-3.5 rounded-xl",
                    "transition-all duration-200 hover:bg-muted/50",
                    "hover:-translate-y-0.5 active:scale-95",
                    "border border-transparent hover:border-border/40",
                  )}
                >
                  <div className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center",
                    "shadow-sm transition-all duration-300",
                    "group-hover:scale-110 group-hover:shadow-md",
                    bgLight,
                  )}>
                    <QIcon size={18} className="text-foreground/70 group-hover:text-foreground transition-colors" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Right column ── */}
        <motion.div {...fadeUp(0.27)} className="lg:col-span-7 flex flex-col gap-5">

          {/* Activity Chart */}
          <div className={cn(
            "rounded-2xl bg-card border border-border/60 p-5",
            "shadow-sm hover:shadow-md transition-shadow duration-300",
          )}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">Friend Activity</p>
                  <p className="text-xs text-muted-foreground">Online friends · last 7 days</p>
                </div>
              </div>
              <Link
                href="/dashboard/friends"
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-primary/5 transition-colors"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <StatsChart data={chartData} height={158} />
          </div>

          {/* Online Now */}
          <div className={cn(
            "rounded-2xl bg-card border border-border/60 overflow-hidden flex-1",
            "shadow-sm hover:shadow-md transition-shadow duration-300",
          )}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-9 w-9 rounded-xl bg-chart-5/10 flex items-center justify-center">
                    <Radio size={16} className="text-chart-5" />
                  </div>
                  {onlineFriends.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-chart-5 border-2 border-card animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">Online Now</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {onlineFriends.length > 0
                      ? `${onlineFriends.length} active`
                      : "No one online"}
                  </p>
                </div>
                {onlineFriends.length > 0 && (
                  <AvatarStack items={onlineFriends} max={4} size={26} className="-ml-1" />
                )}
              </div>
              <Link
                href="/dashboard/map"
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-primary/5 transition-colors shrink-0"
              >
                Map <ArrowRight size={12} />
              </Link>
            </div>

            <div className="border-t border-border/30" />

            {onlineFriends.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-muted-foreground">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                  <Users size={24} className="opacity-30" />
                </div>
                <p className="text-sm font-semibold">No friends online</p>
                <p className="text-xs mt-0.5 opacity-60">Invite friends to stay connected</p>
                <Button variant="outline" size="sm" className="mt-4 gap-2 rounded-xl" asChild>
                  <Link href="/dashboard/friends">
                    <UserCheck size={13} /> Find friends
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
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="relative shrink-0">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/60 to-ring/80 flex items-center justify-center text-white font-bold text-xs">
                          {friend.avatar ? (
                            <Image src={friend.avatar} alt={friend.name} fill sizes="40px" className="object-cover" />
                          ) : (
                            friend.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-chart-5 border-2 border-card" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-none">{friend.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {loc?.city
                            ? `📍 ${loc.city}`
                            : friend.sharingLocation ? "Sharing location" : "Location hidden"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity gap-1.5 shrink-0 rounded-lg"
                        asChild
                      >
                        <Link href={`/dashboard/map?focus=${friend.id}`}>
                          <Eye size={12} /> View
                        </Link>
                      </Button>
                    </div>
                  );
                })}
                {onlineFriends.length > 5 && (
                  <Link
                    href="/dashboard/map"
                    className="flex items-center justify-center py-3.5 text-xs font-medium text-primary hover:text-primary/80 gap-1 transition-colors"
                  >
                    +{onlineFriends.length - 5} more online <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          GROUPS
         ══════════════════════════════════════════════════════════════════ */}
      {groups.length > 0 && (
        <motion.div {...fadeUp(0.34)}>
          <div className={cn(
            "rounded-2xl bg-card border border-border/60 overflow-hidden",
            "shadow-sm hover:shadow-md transition-shadow duration-300",
          )}>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Users2 size={16} className="text-chart-2" />
                </div>
                <div>
                  <p className="text-sm font-bold">My Groups</p>
                  <p className="text-xs text-muted-foreground">
                    {groups.length} group{groups.length !== 1 ? "s" : ""} · {groups.reduce((a, g) => a + (g._count?.members ?? (g.members ?? []).length), 0)} total members
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/groups"
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-primary/5 transition-colors"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="border-t border-border/30">
              {/* Mobile scroll */}
              <div className="flex sm:hidden overflow-x-auto scrollbar-none gap-3 px-4 py-4">
                {groups.slice(0, 6).map((g, idx) => {
                  const online = (g.members ?? []).filter((m) => m.user.isOnline).length;
                  return (
                    <Link key={g.id} href={`/dashboard/groups/${g.id}`}
                      className="flex flex-col items-center gap-2 shrink-0 w-20 py-2 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-sm",
                        GROUP_GRADIENTS[idx % GROUP_GRADIENTS.length],
                      )}>
                        {g.name.charAt(0)}
                      </div>
                      <p className="text-xs font-medium text-center leading-tight line-clamp-1 w-full px-1">{g.name}</p>
                      {online > 0 && <span className="text-[9px] text-chart-5 font-semibold">{online} online</span>}
                    </Link>
                  );
                })}
              </div>

              {/* Desktop rows */}
              <div className="hidden sm:block divide-y divide-border/20">
                {groups.slice(0, 3).map((g, idx) => {
                  const memberCount = g._count?.members ?? (g.members ?? []).length;
                  const online      = (g.members ?? []).filter((m) => m.user.isOnline).length;
                  return (
                    <Link key={g.id} href={`/dashboard/groups/${g.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group">
                      <div className={cn(
                        "h-11 w-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm group-hover:shadow-md transition-shadow",
                        GROUP_GRADIENTS[idx % GROUP_GRADIENTS.length],
                      )}>
                        {g.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{g.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{memberCount} members</span>
                          {online > 0 && (
                            <>
                              <span className="text-muted-foreground/30 text-xs">·</span>
                              <span className="text-xs text-chart-5 font-medium flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-chart-5 animate-pulse" />
                                {online} online
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <AvatarStack
                        items={(g.members ?? []).slice(0, 4).map((m) => ({ id: m.userId, name: m.user.name, avatar: m.user.avatar }))}
                        max={4}
                        size={24}
                      />
                      <ChevronRight
                        size={14}
                        className="text-muted-foreground/20 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          EMPTY STATE
         ══════════════════════════════════════════════════════════════════ */}
      {friends.length === 0 && groups.length === 0 && (
        <motion.div {...fadeUp(0.3)}>
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 px-8 py-16 text-center">
            <div className="mx-auto h-18 w-18 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
              <Sparkles size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold">Get Started with LocaLink</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Add friends and create groups to share your live location and stay connected in real time.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <Button asChild className="gap-2 rounded-xl shadow-md">
                <Link href="/dashboard/friends"><UserCheck size={14} /> Find Friends</Link>
              </Button>
              <Button variant="outline" asChild className="gap-2 rounded-xl">
                <Link href="/dashboard/groups"><Users2 size={14} /> Create Group</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
