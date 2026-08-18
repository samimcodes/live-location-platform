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
  Clock, ChevronRight,
} from "lucide-react";

// MiniMap is WebGL — load only on client
const MiniMap = dynamic(
  () => import("@/components/map/MiniMap").then((m) => m.MiniMap),
  { ssr: false, loading: () => <div className="h-36 w-full rounded-xl bg-muted animate-pulse" /> }
);

// ── Animation helper ──────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.32, delay, ease: 'easeOut' as const },
});

// ── Deterministic 7-point sparkline data (no Math.random) ─────────────────
function makeSparkData(base: number, phase = 0): number[] {
  return Array.from({ length: 7 }, (_, i) =>
    Math.max(0, base + Math.round(Math.sin(i * 1.3 + phase) * 2))
  );
}

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

  return (
    <div className="space-y-7 pb-8">

      {/* ── Greeting ────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-tight">
              Good {getGreeting()},{" "}
              <span className="text-primary">{user?.name?.split(" ")[0]}</span> 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSharing
                ? `Live location active · ${friends.length} friend${friends.length !== 1 ? "s" : ""} connected`
                : "Location sharing is paused · friends can't see you"}
            </p>
          </div>

          <div className={cn(
            "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border shrink-0",
            isSharing
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-muted text-muted-foreground border-border",
          )}>
            <Radio size={12} className={isSharing ? "animate-pulse" : ""} />
            {isSharing ? "Broadcasting live" : "Not broadcasting"}
          </div>
        </div>
      </motion.div>

      {/* ── KPI grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} {...fadeUp(0.06 + i * 0.07)} className="h-full">
            <KpiCard {...k} />
          </motion.div>
        ))}
      </div>

      {/* ── Main 3-col grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column ──────────────────────────────────────────── */}
        <motion.div {...fadeUp(0.24)} className="flex flex-col gap-5">

          {/* My Location card — MiniMap embedded */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
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
                  className="h-36 rounded-none"
                />
                {/* Overlay badge */}
                <div className={cn(
                  "absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1",
                  "rounded-full text-[11px] font-semibold backdrop-blur-md border",
                  isSharing
                    ? "bg-emerald-500/90 text-white border-emerald-400"
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
              <div className="h-36 flex items-center justify-center bg-muted/40">
                <div className="text-center">
                  <MapPin size={22} className="mx-auto text-muted-foreground/30 mb-1" />
                  <p className="text-xs text-muted-foreground">Waiting for GPS…</p>
                </div>
              </div>
            )}

            {/* Text section */}
            <div className="px-5 pt-4 pb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                My Location
              </p>
              <p className="text-base font-bold leading-snug">
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
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link href="/dashboard/map">
                  <Navigation size={13} className="mr-2" />
                  Open full map
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl border border-border bg-card px-4 py-4 space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              Quick Links
            </p>
            {[
              { label: "Find Friends",  href: "/dashboard/friends",      icon: Users    },
              { label: "View History",  href: "/dashboard/history",      icon: Clock    },
              { label: "Saved Places",  href: "/dashboard/saved-places", icon: MapPin   },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
              >
                <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <span className="text-sm font-medium flex-1">{label}</span>
                <ChevronRight size={13} className="text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── Right column ─────────────────────────────────────────── */}
        <motion.div {...fadeUp(0.3)} className="lg:col-span-2 flex flex-col gap-5">

          {/* Activity chart */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold">Friend Activity</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Online friends · last 7 days
                </p>
              </div>
              <Link
                href="/dashboard/friends"
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <StatsChart data={chartData} color="#7c3aed" height={138} />
          </div>

          {/* Online now */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden flex-1">
            {/* Header with AvatarStack */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-semibold leading-none">Online Now</p>
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
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1 shrink-0"
              >
                Map <ArrowRight size={12} />
              </Link>
            </div>

            <div className="border-t border-border/40" />

            {onlineFriends.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-muted-foreground">
                <div className="h-11 w-11 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <Users size={20} className="opacity-40" />
                </div>
                <p className="text-sm font-medium">No friends online</p>
                <p className="text-xs mt-0.5 opacity-60">Invite friends to see them here</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/dashboard/friends">Find friends</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {onlineFriends.slice(0, 5).map((friend) => {
                  const loc = friendsLocations.get(friend.id);
                  return (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                          {friend.avatar ? (
                            <Image
                              src={friend.avatar}
                              alt={friend.name}
                              fill
                              sizes="32px"
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
                        <p className="text-sm font-medium truncate leading-none">{friend.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
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
                        className="h-7 px-2.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        asChild
                      >
                        <Link href={`/dashboard/map?focus=${friend.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  );
                })}

                {onlineFriends.length > 5 && (
                  <Link
                    href="/dashboard/map"
                    className="flex items-center justify-center py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +{onlineFriends.length - 5} more online
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Groups — horizontal scroll on mobile ─────────────────────── */}
      {groups.length > 0 && (
        <motion.div {...fadeUp(0.35)}>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">My Groups</p>
                <span className="text-xs text-muted-foreground">
                  {groups.length} group{groups.length !== 1 ? "s" : ""}
                </span>
              </div>
              <Link
                href="/dashboard/groups"
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {/* Scrollable row on mobile, grid on sm+ */}
            <div className="border-t border-border/40">
              {/* Mobile: horizontal scroll */}
              <div className="flex sm:hidden overflow-x-auto scrollbar-none gap-3 px-4 py-3">
                {groups.slice(0, 6).map((g) => {
                  const memberCount   = g._count?.members ?? g.members.length;
                  const onlineInGroup = g.members.filter((m) => m.user.isOnline).length;
                  return (
                    <Link
                      key={g.id}
                      href={`/dashboard/groups/${g.id}`}
                      className="flex flex-col items-center gap-2 shrink-0 w-20 py-2 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
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
              <div className="hidden sm:block divide-y divide-border/30">
                {groups.slice(0, 3).map((g) => {
                  const memberCount   = g._count?.members ?? g.members.length;
                  const onlineInGroup = g.members.filter((m) => m.user.isOnline).length;
                  return (
                    <Link
                      key={g.id}
                      href={`/dashboard/groups/${g.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shrink-0">
                        {g.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{g.name}</p>
                        <div className="flex items-center gap-2">
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
                        className="text-muted-foreground/25 group-hover:text-muted-foreground/60 transition-colors shrink-0 ml-1"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {friends.length === 0 && groups.length === 0 && (
        <motion.div {...fadeUp(0.3)}>
          <div className="rounded-2xl border border-dashed border-border bg-card/40 px-8 py-14 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Users size={28} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold">Start connecting</h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
              Add friends and create groups to share your live location.
            </p>
            <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
              <Button asChild>
                <Link href="/dashboard/friends">
                  <UserCheck size={14} className="mr-2" />
                  Find Friends
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/groups">
                  <Users2 size={14} className="mr-2" />
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
