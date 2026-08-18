"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
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
  Clock, ChevronRight, Map, Bookmark,
  Settings, Plus, Shield, Activity,
  Sparkles, Eye,
} from "lucide-react";

// MiniMap is WebGL — load only on client
const MiniMap = dynamic(
  () => import("@/components/map/MiniMap").then((m) => m.MiniMap),
  { ssr: false, loading: () => <div className="h-44 w-full rounded-xl bg-muted animate-pulse" /> }
);

// ── Animation helper ──────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const scaleIn = (delay = 0) => ({
  initial:    { opacity: 0, scale: 0.95 },
  animate:    { opacity: 1, scale: 1 },
  transition: { duration: 0.35, delay, ease: 'easeOut' as const },
});

// ── Deterministic 7-point sparkline data (no Math.random) ─────────────────
function makeSparkData(base: number, phase = 0): number[] {
  return Array.from({ length: 7 }, (_, i) =>
    Math.max(0, base + Math.round(Math.sin(i * 1.3 + phase) * 2))
  );
}

// ── Quick Action tile config ──────────────────────────────────────────────
const quickActions = [
  {
    label: "Open Map",
    icon:  Map,
    href:  "/dashboard/map",
    gradient: "from-blue-500 to-cyan-400",
    hoverGlow: "group-hover:shadow-blue-500/20",
  },
  {
    label: "Find Friends",
    icon:  Users,
    href:  "/dashboard/friends",
    gradient: "from-violet-500 to-purple-400",
    hoverGlow: "group-hover:shadow-violet-500/20",
  },
  {
    label: "Saved Places",
    icon:  Bookmark,
    href:  "/dashboard/saved-places",
    gradient: "from-emerald-500 to-teal-400",
    hoverGlow: "group-hover:shadow-emerald-500/20",
  },
  {
    label: "View History",
    icon:  Clock,
    href:  "/dashboard/history",
    gradient: "from-amber-500 to-orange-400",
    hoverGlow: "group-hover:shadow-amber-500/20",
  },
  {
    label: "Settings",
    icon:  Settings,
    href:  "/dashboard/settings",
    gradient: "from-slate-500 to-gray-400",
    hoverGlow: "group-hover:shadow-slate-500/20",
  },
  {
    label: "New Group",
    icon:  Plus,
    href:  "/dashboard/groups",
    gradient: "from-pink-500 to-rose-400",
    hoverGlow: "group-hover:shadow-pink-500/20",
  },
];

export default function DashboardPage() {
  const user                    = useAppSelector((s) => s.auth.user);
  const { data: friends = [] }  = useFriends();
  const { data: groups  = [] }  = useGroups();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { myLocation, isSharing, friendsLocations } = useLocationStore();

  const onlineFriends  = friends.filter((f) => f.isOnline);
  const sharingFriends = onlineFriends.filter((f) => f.sharingLocation && friendsLocations.has(f.id));
  const base           = Math.max(1, friends.length);

  // ── KPI config ────────────────────────────────────────────────────────
  const kpis = [
    {
      label:     "Friends",
      value:     friends.length,
      icon:      UserCheck,
      color:     "text-indigo-500",
      bg:        "bg-indigo-50 dark:bg-indigo-950/40",
      accent:    "#6366f1",
      href:      "/dashboard/friends",
      sub:       onlineFriends.length > 0 ? `${onlineFriends.length} online` : "None online",
      sparkData: makeSparkData(base, 0),
    },
    {
      label:     "Groups",
      value:     groups.length,
      icon:      Users2,
      color:     "text-violet-500",
      bg:        "bg-violet-50 dark:bg-violet-950/40",
      accent:    "#8b5cf6",
      href:      "/dashboard/groups",
      sub:       groups.length > 0
        ? `${groups.reduce((a, g) => a + (g._count?.members ?? g.members.length), 0)} members`
        : "Create your first",
      sparkData: makeSparkData(Math.max(1, groups.length), 1.2),
    },
    {
      label:     "On the Map",
      value:     friendsLocations.size,
      icon:      Navigation,
      color:     "text-emerald-500",
      bg:        "bg-emerald-50 dark:bg-emerald-950/40",
      accent:    "#10b981",
      href:      "/dashboard/map",
      sub:       sharingFriends.length > 0 ? `${sharingFriends.length} sharing now` : "Go to map",
      sparkData: makeSparkData(Math.max(1, friendsLocations.size), 2.4),
    },
    {
      label:     "Notifications",
      value:     unreadCount,
      icon:      Bell,
      color:     "text-amber-500",
      bg:        "bg-amber-50 dark:bg-amber-950/40",
      accent:    "#f59e0b",
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

  // Current date formatted
  const today = new Date();
  const dateString = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 pb-8">

      {/* ════════════════════════════════════════════════════════════════
          WELCOME BANNER — rich gradient card with user info
         ════════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}>
        <div className="relative rounded-2xl overflow-hidden welcome-gradient border border-border/40">
          {/* Decorative blurred orbs */}
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-violet-500/8 blur-3xl" />

          <div className="relative px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
              {/* Left: Avatar + greeting */}
              <div className="flex items-center gap-4">
                {/* User avatar */}
                <div className="relative shrink-0">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-primary/20">
                    <div className="h-full w-full rounded-[14px] bg-card flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user?.name ?? "User"}
                          fill
                          sizes="56px"
                          className="object-cover rounded-[14px]"
                        />
                      ) : (
                        <span className="text-xl font-bold bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                          {user?.name?.charAt(0).toUpperCase() ?? "U"}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Online dot */}
                  <span className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-[2.5px] border-card",
                    isSharing ? "bg-emerald-500" : "bg-muted-foreground/40",
                  )} />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-medium">{dateString}</p>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight mt-0.5">
                    Good {getGreeting()},{" "}
                    <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                      {user?.name?.split(" ")[0]}
                    </span> 👋
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {isSharing
                      ? `Live location active · ${friends.length} friend${friends.length !== 1 ? "s" : ""} connected`
                      : "Location sharing is paused · friends can't see you"}
                  </p>
                </div>
              </div>

              {/* Right: Status pill */}
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border shrink-0",
                "transition-all duration-300",
                isSharing
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-700/40"
                  : "bg-muted text-muted-foreground border-border",
              )}>
                <span className="relative flex h-2.5 w-2.5">
                  {isSharing && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-50" />
                  )}
                  <span className={cn(
                    "relative inline-flex rounded-full h-2.5 w-2.5",
                    isSharing ? "bg-emerald-500" : "bg-muted-foreground/50",
                  )} />
                </span>
                {isSharing ? "Broadcasting live" : "Not broadcasting"}
              </div>
            </div>

            {/* Mini stat pills inside banner */}
            <div className="flex items-center gap-3 mt-5 flex-wrap">
              {[
                { icon: Users, label: `${friends.length} friends`, active: friends.length > 0 },
                { icon: Eye, label: `${onlineFriends.length} online`, active: onlineFriends.length > 0 },
                { icon: Bell, label: `${unreadCount} unread`, active: unreadCount > 0 },
                { icon: Shield, label: `${groups.length} groups`, active: groups.length > 0 },
              ].map(({ icon: PillIcon, label, active }) => (
                <div
                  key={label}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium",
                    "border transition-colors",
                    active
                      ? "bg-card/80 border-border/50 text-foreground"
                      : "bg-muted/40 border-transparent text-muted-foreground",
                  )}
                >
                  <PillIcon size={12} className={active ? "text-primary" : "text-muted-foreground/50"} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════
          KPI GRID — 4 premium glass cards
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} {...scaleIn(0.08 + i * 0.06)} className="h-full">
            <KpiCard {...k} />
          </motion.div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          BENTO GRID — main content area
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Left column (5 cols) ──────────────────────────────────── */}
        <motion.div {...fadeUp(0.2)} className="lg:col-span-5 flex flex-col gap-5">

          {/* My Location card — MiniMap embedded */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* MiniMap thumbnail */}
            {myLocation ? (
              <div className="relative">
                <MiniMap
                  center={[myLocation.longitude, myLocation.latitude]}
                  zoom={13}
                  markers={[{
                    latitude:  myLocation.latitude,
                    longitude: myLocation.longitude,
                    color:     isSharing ? "#10b981" : "#94a3b8",
                  }]}
                  className="h-44 rounded-none"
                />
                {/* Overlay badge */}
                <div className={cn(
                  "absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5",
                  "rounded-xl text-[11px] font-bold backdrop-blur-md border shadow-sm",
                  isSharing
                    ? "bg-emerald-500/90 text-white border-emerald-400/50"
                    : "bg-background/80 text-muted-foreground border-border",
                )}>
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    isSharing ? "bg-white animate-pulse" : "bg-muted-foreground",
                  )} />
                  {isSharing ? "Live" : "Paused"}
                </div>
              </div>
            ) : (
              /* No GPS yet — placeholder */
              <div className="h-44 flex items-center justify-center bg-muted/30">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-2">
                    <MapPin size={20} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Waiting for GPS…</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Enable location to see your position</p>
                </div>
              </div>
            )}

            {/* Text section */}
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-center gap-2 mb-1">
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
              {myLocation?.accuracy != null && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  ±{Math.round(myLocation.accuracy)}m accuracy
                </p>
              )}
              <Button variant="outline" size="sm" className="w-full mt-4 gap-2" asChild>
                <Link href="/dashboard/map">
                  <Navigation size={13} />
                  Open full map
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Sparkles size={14} className="text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map(({ label, icon: QIcon, href, gradient, hoverGlow }) => (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "group flex flex-col items-center gap-2 p-3 rounded-xl",
                    "transition-all duration-300 hover:-translate-y-0.5",
                    "hover:bg-muted/40 hover:shadow-lg",
                    hoverGlow,
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                    "shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110",
                    gradient,
                  )}>
                    <QIcon size={18} className="text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Right column (7 cols) ─────────────────────────────────── */}
        <motion.div {...fadeUp(0.28)} className="lg:col-span-7 flex flex-col gap-5">

          {/* Activity chart */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
                  <Activity size={16} className="text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">Friend Activity</p>
                  <p className="text-xs text-muted-foreground">
                    Online friends · last 7 days
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/friends"
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <StatsChart data={chartData} color="#7c3aed" height={160} />
          </div>

          {/* Online now */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex-1 shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Header with AvatarStack */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <Radio size={16} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">Online Now</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {onlineFriends.length > 0
                      ? `${onlineFriends.length} friend${onlineFriends.length !== 1 ? "s" : ""} active`
                      : "No one online"}
                  </p>
                </div>
                {onlineFriends.length > 0 && (
                  <AvatarStack items={onlineFriends} max={4} size={26} className="-ml-1" />
                )}
              </div>
              <Link
                href="/dashboard/map"
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors shrink-0"
              >
                Map <ArrowRight size={12} />
              </Link>
            </div>

            <div className="border-t border-border/30" />

            {onlineFriends.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                  <Users size={22} className="opacity-30" />
                </div>
                <p className="text-sm font-semibold">No friends online</p>
                <p className="text-xs mt-1 opacity-60">Invite friends to see them here</p>
                <Button variant="outline" size="sm" className="mt-4 gap-2" asChild>
                  <Link href="/dashboard/friends">
                    <UserCheck size={13} />
                    Find friends
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
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                          {friend.avatar ? (
                            <Image
                              src={friend.avatar}
                              alt={friend.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            friend.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-none">{friend.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {loc?.city
                            ? `📍 ${loc.city}`
                            : friend.sharingLocation
                            ? "Sharing location"
                            : "Location hidden"}
                        </p>
                      </div>

                      {/* Hover action */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0 gap-1"
                        asChild
                      >
                        <Link href={`/dashboard/map?focus=${friend.id}`}>
                          <Eye size={12} />
                          View
                        </Link>
                      </Button>
                    </div>
                  );
                })}

                {onlineFriends.length > 5 && (
                  <Link
                    href="/dashboard/map"
                    className="flex items-center justify-center py-3.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors gap-1"
                  >
                    +{onlineFriends.length - 5} more online
                    <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          GROUPS SECTION — horizontal scroll on mobile, grid on desktop
         ════════════════════════════════════════════════════════════════ */}
      {groups.length > 0 && (
        <motion.div {...fadeUp(0.35)}>
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
                  <Users2 size={16} className="text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">My Groups</p>
                  <p className="text-xs text-muted-foreground">
                    {groups.length} group{groups.length !== 1 ? "s" : ""} · {groups.reduce((a, g) => a + (g._count?.members ?? g.members.length), 0)} total members
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/groups"
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {/* Scrollable row on mobile, grid on sm+ */}
            <div className="border-t border-border/30">
              {/* Mobile: horizontal scroll */}
              <div className="flex sm:hidden overflow-x-auto scrollbar-none gap-3 px-4 py-4">
                {groups.slice(0, 6).map((g) => {
                  const onlineInGroup = g.members.filter((m) => m.user.isOnline).length;
                  return (
                    <Link
                      key={g.id}
                      href={`/dashboard/groups/${g.id}`}
                      className="flex flex-col items-center gap-2 shrink-0 w-20 py-2 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {g.name.charAt(0)}
                      </div>
                      <p className="text-xs font-medium text-center leading-tight line-clamp-1 w-full px-1">
                        {g.name}
                      </p>
                      {onlineInGroup > 0 && (
                        <span className="text-[9px] text-emerald-600 font-semibold">
                          {onlineInGroup} online
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* sm+: clean grid rows */}
              <div className="hidden sm:block divide-y divide-border/20">
                {groups.slice(0, 3).map((g) => {
                  const memberCount   = g._count?.members ?? g.members.length;
                  const onlineInGroup = g.members.filter((m) => m.user.isOnline).length;
                  return (
                    <Link
                      key={g.id}
                      href={`/dashboard/groups/${g.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                        {g.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{g.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{memberCount} members</span>
                          {onlineInGroup > 0 && (
                            <>
                              <span className="text-muted-foreground/30 text-xs">·</span>
                              <span className="text-xs text-emerald-600 font-medium">
                                {onlineInGroup} online
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Member avatars */}
                      <AvatarStack
                        items={g.members.slice(0, 4).map((m) => ({
                          id:     m.userId,
                          name:   m.user.name,
                          avatar: m.user.avatar,
                        }))}
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

      {/* ════════════════════════════════════════════════════════════════
          EMPTY STATE — when no friends or groups
         ════════════════════════════════════════════════════════════════ */}
      {friends.length === 0 && groups.length === 0 && (
        <motion.div {...fadeUp(0.3)}>
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 px-8 py-16 text-center">
            <div className="mx-auto h-18 w-18 rounded-3xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center mb-5">
              <Users size={32} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold">Start connecting</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Add friends and create groups to share your live location and stay connected.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <Button asChild className="gap-2">
                <Link href="/dashboard/friends">
                  <UserCheck size={15} />
                  Find Friends
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link href="/dashboard/groups">
                  <Users2 size={15} />
                  Create Group
                </Link>
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
