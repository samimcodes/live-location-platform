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
  Clock, ChevronRight, Bookmark,
  Activity, Eye,
  Map, Settings, Plus,
} from "lucide-react";

// ── WebGL component — client only ────────────────────────────────────────
const MiniMap = dynamic(
  () => import("@/components/map/MiniMap").then((m) => m.MiniMap),
  {
    ssr:     false,
    loading: () => <div className="h-44 w-full rounded-xl bg-muted animate-pulse" />,
  }
);

// ── Framer Motion helpers (ease as string — avoids TS errors) ────────────
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

// ── Deterministic sparkline data (no Math.random) ────────────────────────
function makeSparkData(base: number, phase = 0): number[] {
  return Array.from({ length: 7 }, (_, i) =>
    Math.max(0, base + Math.round(Math.sin(i * 1.3 + phase) * 2))
  );
}

// ── Quick Actions config — uses chart color tokens from globals.css ───────
// Icon bg gradients use chart color variables so they stay design-system compliant
const quickActions = [
  { label: "Open Map",     icon: Map,      href: "/dashboard/map",          bg: "bg-chart-3/15",    icon_color: "text-chart-3"    },
  { label: "Find Friends", icon: Users,    href: "/dashboard/friends",       bg: "bg-primary/10",   icon_color: "text-primary"    },
  { label: "Saved Places", icon: Bookmark, href: "/dashboard/saved-places",  bg: "bg-chart-5/15",   icon_color: "text-chart-5"    },
  { label: "History",      icon: Clock,    href: "/dashboard/history",        bg: "bg-chart-4/15",   icon_color: "text-chart-4"    },
  { label: "Settings",     icon: Settings, href: "/dashboard/settings",       bg: "bg-muted",        icon_color: "text-muted-foreground" },
  { label: "New Group",    icon: Plus,     href: "/dashboard/groups",         bg: "bg-chart-2/15",   icon_color: "text-chart-2"    },
] as const;

export default function DashboardPage() {
  const user                      = useAppSelector((s) => s.auth.user);
  const { data: friends = [] }    = useFriends();
  const { data: groups  = [] }    = useGroups();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { myLocation, isSharing, friendsLocations } = useLocationStore();

  const onlineFriends  = friends.filter((f) => f.isOnline);
  const sharingFriends = onlineFriends.filter((f) => f.sharingLocation && friendsLocations.has(f.id));
  const base           = Math.max(1, friends.length);

  // ── KPI config — accent colors are hex equivalents of design tokens ───
  const kpis = [
    {
      label:     "Friends",
      value:     friends.length,
      icon:      UserCheck,
      color:     "text-primary",
      bg:        "bg-primary/10",
      accent:    "#7c3aed",          // primary token (oklch 0.55 0.2 280 ≈ #7c3aed)
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
      accent:    "#a855f7",          // chart-2 token
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
      color:     "text-chart-5",
      bg:        "bg-chart-5/10",
      accent:    "#10b981",          // chart-5 token (oklch 0.8 0.15 150 ≈ emerald)
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
      accent:    "#f59e0b",          // chart-4 token (oklch 0.75 0.15 200 ≈ amber)
      href:      "/dashboard/notifications",
      sub:       unreadCount > 0 ? "Needs attention" : "All caught up",
      sparkData: makeSparkData(Math.max(0, unreadCount), 3.6),
    },
  ];

  // ── Chart data ─────────────────────────────────────────────────────────
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date:  d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: Math.max(0, base + Math.round(Math.sin(i * 1.3 + 0.5) * 2)),
    };
  });

  return (
    <div className="space-y-6 pb-8">

      {/* ══════════════════════════════════════════════════════════════
          HERO BANNER — reference design: lavender bg, greeting left,
          map illustration + friend avatars right, two status pills
         ══════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}>
        <div
          className="relative rounded-2xl overflow-hidden border-0"
          style={{ background: "oklch(0.94 0.04 280)" }}
        >
          {/* Dark mode override */}
          <div className="dark:hidden absolute inset-0 rounded-2xl" style={{ background: "oklch(0.94 0.04 280)" }} />
          <div className="hidden dark:block absolute inset-0 rounded-2xl" style={{ background: "oklch(0.22 0.04 280)" }} />

          {/* Subtle radial glow — top-right, uses primary */}
          <div
            className="absolute top-0 right-0 w-[55%] h-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 80% 30%, oklch(0.75 0.12 280 / 0.25) 0%, transparent 70%)",
            }}
          />

          {/* ── Content row ───────────────────────────────────────── */}
          <div className="relative flex items-center justify-between min-h-[160px] px-7 py-7 sm:px-10 sm:py-8">

            {/* LEFT: greeting + subtitle + pills */}
            <div className="flex flex-col justify-center gap-4 flex-1 min-w-0 pr-4 sm:pr-8 z-10">

              {/* Greeting */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  Good {getGreeting()},{" "}
                  <span className="text-primary">{user?.name?.split(" ")[0]}</span>! 👋
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5 font-medium">
                  Stay connected with the people who matter.
                </p>
              </div>

              {/* Two status pills — matching reference exactly */}
              <div className="flex items-center gap-2.5 flex-wrap">

                {/* Location sharing pill */}
                <div className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-300",
                  isSharing
                    ? "bg-white/70 dark:bg-card/60 text-chart-5 border border-chart-5/30 shadow-sm backdrop-blur-sm"
                    : "bg-white/50 dark:bg-card/40 text-muted-foreground border border-border/40 backdrop-blur-sm",
                )}>
                  <span className="relative flex h-2 w-2 shrink-0">
                    {isSharing && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-5 opacity-60" />
                    )}
                    <span className={cn(
                      "relative inline-flex rounded-full h-2 w-2",
                      isSharing ? "bg-chart-5" : "bg-muted-foreground/40",
                    )} />
                  </span>
                  {isSharing ? "Location sharing is active" : "Location sharing paused"}
                </div>

                {/* Live tracking pill */}
                <div className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold",
                  "bg-white/70 dark:bg-card/60 border backdrop-blur-sm shadow-sm",
                  friendsLocations.size > 0
                    ? "text-primary border-primary/25"
                    : "text-muted-foreground border-border/40",
                )}>
                  <MapPin size={11} className={friendsLocations.size > 0 ? "text-primary" : "text-muted-foreground/50"} />
                  {friendsLocations.size > 0 ? "Live tracking enabled" : "No live tracking"}
                </div>
              </div>
            </div>

            {/* RIGHT: Illustration — map + floating friend avatars */}
            <div
              className="hidden sm:flex relative shrink-0 items-center justify-center"
              style={{ width: 260, height: 140 }}
              aria-hidden="true"
            >
              {/* Map card illustration */}
              <div
                className="absolute inset-x-8 inset-y-2 rounded-2xl overflow-hidden shadow-lg border border-primary/10"
                style={{ background: "oklch(0.97 0.02 280)" }}
              >
                {/* Grid lines — subtle map look */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  {/* Horizontal roads */}
                  <line x1="0" y1="38%" x2="100%" y2="42%" stroke="currentColor" strokeWidth="3.5" className="text-primary/50" strokeLinecap="round" />
                  <line x1="0" y1="68%" x2="100%" y2="65%" stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeLinecap="round" />
                  {/* Vertical roads */}
                  <line x1="30%" y1="0" x2="28%" y2="100%" stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeLinecap="round" />
                  <line x1="68%" y1="0" x2="70%" y2="100%" stroke="currentColor" strokeWidth="3" className="text-primary/40" strokeLinecap="round" />
                  {/* Dashed path between pins */}
                  <path d="M 48 72 Q 90 30 140 52 Q 170 65 190 48" stroke="currentColor" strokeWidth="1.5" className="text-primary/60" strokeDasharray="5 4" fill="none" strokeLinecap="round" />
                </svg>

                {/* Center map pin — primary */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[65%] flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <MapPin size={18} className="text-white" />
                  </div>
                  <div className="h-2 w-2 rounded-full bg-primary/40 mt-0.5" />
                </div>
              </div>

              {/* Floating friend avatars — scattered around the map */}
              {/* Top-left avatar */}
              <div className="absolute top-0 left-10 z-10">
                <div className="relative">
                  <div
                    className="h-10 w-10 rounded-full border-2 border-white dark:border-card shadow-md flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: "oklch(0.6 0.15 320)" }}
                  >
                    {onlineFriends[0]?.name.charAt(0).toUpperCase() ?? (
                      <Users size={14} className="text-white/70" />
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-chart-5 border-2 border-white dark:border-card" />
                </div>
              </div>

              {/* Bottom-right avatar */}
              <div className="absolute bottom-0 right-6 z-10">
                <div className="relative">
                  <div
                    className="h-10 w-10 rounded-full border-2 border-white dark:border-card shadow-md flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: "oklch(0.65 0.15 200)" }}
                  >
                    {onlineFriends[1]?.name.charAt(0).toUpperCase() ?? (
                      <Users size={14} className="text-white/70" />
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-chart-5 border-2 border-white dark:border-card" />
                </div>
              </div>

              {/* Small secondary pin — top-right */}
              <div className="absolute top-3 right-3 z-10">
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-card"
                  style={{ background: "oklch(0.75 0.15 150)" }}
                >
                  <MapPin size={12} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════
          KPI GRID — 4 cards with .card-shine .glow-shadow from CSS
         ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} {...scaleIn(0.08 + i * 0.06)} className="h-full">
            <KpiCard {...k} />
          </motion.div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BENTO GRID — location + quick actions | chart + online now
         ══════════════════════════════════════════════════════════════ */}
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
                    color:     isSharing ? "#10b981" : "#94a3b8",
                  }]}
                  className="h-44 rounded-none"
                />
                {/* Status badge — uses semantic tokens */}
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
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center bg-muted/20">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-2">
                    <MapPin size={20} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Waiting for GPS…</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Enable location to see your position</p>
                </div>
              </div>
            )}

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

          {/* Quick Actions — icon bg uses chart color tokens */}
          <div className={cn(
            "rounded-2xl bg-card border border-border/60 p-4",
            "shadow-sm",
          )}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
              Quick Actions
            </p>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map(({ label, icon: QIcon, href, bg, icon_color }) => (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "group flex flex-col items-center gap-2 p-3 rounded-xl",
                    "transition-all duration-200 hover:bg-muted/50",
                    "hover:-translate-y-0.5 active:scale-95",
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    "shadow-sm transition-transform duration-200 group-hover:scale-110",
                    bg,
                  )}>
                    <QIcon size={18} className={icon_color} />
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

          {/* Activity Chart — chart-1 token */}
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
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {/* StatsChart color uses CSS custom property --chart-1 via the hex equivalent */}
            <StatsChart data={chartData} color="oklch(0.65 0.2 280)" height={158} />
          </div>

          {/* Online Now */}
          <div className={cn(
            "rounded-2xl bg-card border border-border/60 overflow-hidden flex-1",
            "shadow-sm hover:shadow-md transition-shadow duration-300",
          )}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-chart-5/10 flex items-center justify-center">
                  <Radio size={16} className="text-chart-5" />
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
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors shrink-0"
              >
                Map <ArrowRight size={12} />
              </Link>
            </div>

            <div className="border-t border-border/30" />

            {onlineFriends.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                  <Users size={22} className="opacity-30" />
                </div>
                <p className="text-sm font-semibold">No friends online</p>
                <p className="text-xs mt-0.5 opacity-60">Invite friends to stay connected</p>
                <Button variant="outline" size="sm" className="mt-4 gap-2" asChild>
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
                        <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-primary/60 to-ring/80 flex items-center justify-center text-white font-bold text-xs">
                          {friend.avatar ? (
                            <Image src={friend.avatar} alt={friend.name} fill sizes="36px" className="object-cover" />
                          ) : (
                            friend.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-chart-5 border-2 border-card" />
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
                        className="h-7 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity gap-1 shrink-0"
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

      {/* ══════════════════════════════════════════════════════════════
          GROUPS — mobile horizontal scroll / desktop rows
         ══════════════════════════════════════════════════════════════ */}
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

            <div className="border-t border-border/30">
              {/* Mobile scroll */}
              <div className="flex sm:hidden overflow-x-auto scrollbar-none gap-3 px-4 py-4">
                {groups.slice(0, 6).map((g) => {
                  const online = g.members.filter((m) => m.user.isOnline).length;
                  return (
                    <Link key={g.id} href={`/dashboard/groups/${g.id}`}
                      className="flex flex-col items-center gap-2 shrink-0 w-20 py-2 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-ring flex items-center justify-center text-white font-bold text-lg shadow-sm">
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
                {groups.slice(0, 3).map((g) => {
                  const memberCount = g._count?.members ?? g.members.length;
                  const online      = g.members.filter((m) => m.user.isOnline).length;
                  return (
                    <Link key={g.id} href={`/dashboard/groups/${g.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-ring flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                        {g.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{g.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{memberCount} members</span>
                          {online > 0 && (
                            <>
                              <span className="text-muted-foreground/30 text-xs">·</span>
                              <span className="text-xs text-chart-5 font-medium">{online} online</span>
                            </>
                          )}
                        </div>
                      </div>
                      <AvatarStack
                        items={g.members.slice(0, 4).map((m) => ({ id: m.userId, name: m.user.name, avatar: m.user.avatar }))}
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

      {/* ══════════════════════════════════════════════════════════════
          EMPTY STATE
         ══════════════════════════════════════════════════════════════ */}
      {friends.length === 0 && groups.length === 0 && (
        <motion.div {...fadeUp(0.3)}>
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 px-8 py-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
              <Users size={30} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold">Start connecting</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Add friends and create groups to share your live location.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <Button asChild className="gap-2">
                <Link href="/dashboard/friends"><UserCheck size={14} /> Find Friends</Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
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
