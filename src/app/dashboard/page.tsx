"use client";

import React, { useMemo, useState, useEffect } from "react";
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
} from "lucide-react";

const MiniMap = dynamic(
  () => import("@/components/map/MiniMap").then((m) => m.MiniMap),
  {
    ssr: false,
    loading: () => <div className="h-52 w-full bg-muted animate-pulse" />,
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
    tint: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  {
    label: "Find Friends",
    icon: Users,
    href: "/dashboard/friends",
    tint: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  },
  {
    label: "Saved Places",
    icon: Bookmark,
    href: "/dashboard/saved-places",
    tint: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  },
  {
    label: "History",
    icon: Clock,
    href: "/dashboard/history",
    tint: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
  },
  {
    label: "New Group",
    icon: Plus,
    href: "/dashboard/groups",
    tint: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    tint: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
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

function PersonAvatar({
  name,
  avatar,
  size = 40,
  online,
}: {
  name: string;
  avatar?: string | null;
  size?: number;
  online?: boolean;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="relative h-full w-full overflow-hidden rounded-full bg-gradient-to-br from-primary/70 to-ring/80 text-white font-bold flex items-center justify-center">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            fill
            sizes={`${size}px`}
            className="object-cover"
          />
        ) : (
          <span style={{ fontSize: Math.round(size * 0.38) }}>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-chart-5 border-2 border-card" />
      )}
    </div>
  );
}

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
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
  if (loc) return `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}`;
  if (friend.sharingLocation) return "Sharing · waiting for ping";
  return "Location hidden";
}

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { isLoading: locLoading } = useFriendsLocations();
  const { myLocation, isSharing, friendsLocations } = useLocationStore();
  const now = useLiveClock();

  const onlineFriends = friends.filter((f) => f.isOnline);
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
        color: isSharing ? "#10b981" : "#94a3b8",
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

  const kpis = [
    {
      label: "Friends",
      value: friends.length,
      icon: UserCheck,
      color: "text-primary",
      bg: "bg-primary/10",
      accentVar: "--primary",
      href: "/dashboard/friends",
      sub:
        onlineFriends.length > 0
          ? `${onlineFriends.length} online`
          : "None online",
    },
    {
      label: "Groups",
      value: groups.length,
      icon: Users2,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
      accentVar: "--chart-2",
      href: "/dashboard/groups",
      sub:
        groups.length > 0
          ? `${groups.reduce((a, g) => a + (g._count?.members ?? (g.members ?? []).length), 0)} members`
          : "Create your first",
    },
    {
      label: "On the Map",
      value: friendsLocations.size,
      icon: Navigation,
      color: "text-chart-5",
      bg: "bg-chart-5/10",
      accentVar: "--chart-5",
      href: "/dashboard/map",
      sub:
        locLoading && friendsLocations.size === 0
          ? "Loading…"
          : onMapFriends.length > 0
            ? `${onMapFriends.length} sharing now`
            : "No live pins yet",
    },
    {
      label: "Notifications",
      value: unreadCount,
      icon: Bell,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
      accentVar: "--chart-4",
      href: "/dashboard/notifications",
      sub: unreadCount > 0 ? "Needs attention" : "All caught up",
    },
  ];

  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Hero */}
      <motion.div {...fadeUp(0)}>
        <div className="relative overflow-hidden rounded-2xl welcome-gradient border shadow-sm">
          <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {formattedDate}
                </p>
                <h1 className="mt-1.5 text-2xl sm:text-[1.85rem] font-extrabold tracking-tight leading-tight">
                  Good {getGreeting()},{" "}
                  <span className="text-primary">
                    {user?.name?.split(" ")[0] ?? "there"}
                  </span>
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
                  {isLoading
                    ? "Loading your circle…"
                    : onlineFriends.length > 0
                      ? `${onlineFriends.length} friend${onlineFriends.length !== 1 ? "s" : ""} online.`
                      : "No friends online right now."}{" "}
                  {isSharing
                    ? "Your location is live."
                    : "Location sharing is paused."}
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-3 shrink-0">
                <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground/80">
                  {formattedTime}
                </p>
                {onlineFriends.length > 0 && (
                  <AvatarStack items={onlineFriends} max={5} size={32} />
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md",
                  isSharing
                    ? "bg-card/70 text-chart-5 border-chart-5/30"
                    : "bg-card/50 text-muted-foreground border-border/50",
                )}
              >
                <span className="relative flex h-2 w-2">
                  {isSharing && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-5 opacity-60" />
                  )}
                  <span
                    className={cn(
                      "relative h-2 w-2 rounded-full",
                      isSharing ? "bg-chart-5" : "bg-muted-foreground/40",
                    )}
                  />
                </span>
                {isSharing ? "Location live" : "Sharing paused"}
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-card/70 border border-border/50 backdrop-blur-md">
                <UserCheck size={12} className="text-primary" />
                {friends.length} friend{friends.length !== 1 ? "s" : ""}
              </div>

              {friendsLocations.size > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-card/70 border border-border/50 backdrop-blur-md">
                  <Navigation size={12} className="text-chart-3" />
                  {friendsLocations.size} on map
                </div>
              )}

              {unreadCount > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-card/70 border border-chart-4/30 text-chart-4 backdrop-blur-md">
                  <Bell size={12} />
                  {unreadCount} unread
                </div>
              )}

              <Button
                asChild
                size="sm"
                className="ml-auto w-full sm:w-auto gap-2 rounded-xl shadow-md shadow-primary/15 font-semibold"
              >
                <Link href="/dashboard/map">
                  <Navigation size={13} />
                  Open Map
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            {...scaleIn(0.06 + i * 0.05)}
            className="h-full"
          >
            {isLoading ? (
              <Skeleton className="h-[148px] w-full rounded-2xl" />
            ) : (
              <KpiCard {...k} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <motion.div
          {...fadeUp(0.12)}
          className="lg:col-span-5 flex flex-col gap-5"
        >
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            {myLocation ? (
              <div className="relative">
                <MiniMap
                  center={[myLocation.longitude, myLocation.latitude]}
                  zoom={12}
                  markers={mapMarkers}
                  className="h-52 rounded-none"
                />
                <div
                  className={cn(
                    "absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5",
                    "rounded-xl text-[11px] font-bold backdrop-blur-md border shadow-sm",
                    isSharing
                      ? "bg-chart-5/90 text-white border-chart-5/50"
                      : "bg-background/80 text-muted-foreground border-border",
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
                  {isSharing ? "Live" : "Paused"}
                </div>
                {myLocation.accuracy != null && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold backdrop-blur-md bg-background/70 border border-border/50 text-muted-foreground shadow-sm">
                    <Globe size={10} />±{Math.round(myLocation.accuracy)}m
                  </div>
                )}
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center bg-muted/20">
                <div className="text-center px-4">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                    <MapPin size={22} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Waiting for GPS…
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    Allow location access to see yourself on the map
                  </p>
                </div>
              </div>
            )}

            <div className="px-5 pt-4 pb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MapPin size={13} className="text-primary" />
                My Location
              </p>
              <p className="mt-1 text-lg font-bold leading-snug">
                {myLocation?.city ??
                  (myLocation
                    ? `${myLocation.latitude.toFixed(4)}, ${myLocation.longitude.toFixed(4)}`
                    : "Not available yet")}
              </p>
              {myLocation?.address && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {myLocation.address}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full gap-2 rounded-xl"
                asChild
              >
                <Link href="/dashboard/map">
                  <Navigation size={13} />
                  Open full map
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Zap size={13} className="text-primary" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider">
                Quick Actions
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map(({ label, icon: QIcon, href, tint }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-all hover:bg-muted/50 active:scale-95"
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105",
                      tint,
                    )}
                  >
                    <QIcon size={18} />
                  </div>
                  <span className="text-center text-[11px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          {...fadeUp(0.18)}
          className="lg:col-span-7 flex flex-col gap-5"
        >
          {/* Real people on the map — replaces fake 7-day chart */}
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chart-5/10">
                  <Navigation size={16} className="text-chart-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold">On the map</p>
                  <p className="text-xs text-muted-foreground">
                    Live positions from friends who are sharing
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/map"
                className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
              >
                Map <ArrowRight size={12} className="inline" />
              </Link>
            </div>
            <div className="border-t border-border/30" />

            {onMapFriends.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-muted-foreground">
                <Navigation size={22} className="mb-2 opacity-30" />
                <p className="text-sm font-semibold">Nobody on the map yet</p>
                <p className="mt-0.5 text-xs opacity-60">
                  Friends appear here when they share location
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {onMapFriends.slice(0, 5).map((friend) => {
                  const loc = friendsLocations.get(friend.id);
                  return (
                    <Link
                      key={friend.id}
                      href={`/dashboard/map?focus=${friend.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                    >
                      <PersonAvatar
                        name={friend.name}
                        avatar={friend.avatar}
                        online={friend.isOnline}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {friend.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {locationLabel(friend, loc)}
                          {loc?.timestamp
                            ? ` · ${formatDistanceToNow(loc.timestamp)}`
                            : ""}
                        </p>
                      </div>
                      <Eye
                        size={14}
                        className="shrink-0 text-muted-foreground/40"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Online now */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chart-5/10">
                    <Radio size={16} className="text-chart-5" />
                  </div>
                  {onlineFriends.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-chart-5 border-2 border-card" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">Online now</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {onlineFriends.length > 0
                      ? `${onlineFriends.length} active`
                      : "No one online"}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/friends"
                className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
              >
                Friends <ArrowRight size={12} className="inline" />
              </Link>
            </div>
            <div className="border-t border-border/30" />

            {isLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : onlineFriends.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
                  <Users size={24} className="opacity-30" />
                </div>
                <p className="text-sm font-semibold">No friends online</p>
                <p className="mt-0.5 text-xs opacity-60">
                  Invite people to see them here
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2 rounded-xl"
                  asChild
                >
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
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                    >
                      <PersonAvatar
                        name={friend.name}
                        avatar={friend.avatar}
                        online
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {friend.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {locationLabel(friend, loc)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 shrink-0 gap-1.5 rounded-lg px-3 text-xs"
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
                    href="/dashboard/friends"
                    className="flex items-center justify-center gap-1 py-3.5 text-xs font-medium text-primary"
                  >
                    +{onlineFriends.length - 5} more online{" "}
                    <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Groups */}
      {!groupsLoading && groups.length > 0 && (
        <motion.div {...fadeUp(0.24)}>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chart-2/10">
                  <Users2 size={16} className="text-chart-2" />
                </div>
                <div>
                  <p className="text-sm font-bold">My Groups</p>
                  <p className="text-xs text-muted-foreground">
                    {groups.length} group{groups.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/groups"
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
              >
                View all <ArrowRight size={12} className="inline" />
              </Link>
            </div>
            <div className="border-t border-border/30 hidden sm:block divide-y divide-border/20">
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
                    className="group flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-base font-bold text-white shadow-sm",
                        GROUP_GRADIENTS[idx % GROUP_GRADIENTS.length],
                      )}
                    >
                      {g.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{g.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {memberCount} members
                        {online > 0 && (
                          <span className="text-chart-5 font-medium">
                            {" "}
                            · {online} online
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
                      size={24}
                    />
                    <ChevronRight
                      size={14}
                      className="ml-1 shrink-0 text-muted-foreground/25 group-hover:text-muted-foreground/60"
                    />
                  </Link>
                );
              })}
            </div>
            <div className="flex sm:hidden overflow-x-auto scrollbar-none gap-3 px-4 py-4">
              {groups.slice(0, 8).map((g, idx) => (
                <Link
                  key={g.id}
                  href={`/dashboard/groups/${g.id}`}
                  className="flex w-20 shrink-0 flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white",
                      GROUP_GRADIENTS[idx % GROUP_GRADIENTS.length],
                    )}
                  >
                    {g.name.charAt(0)}
                  </div>
                  <p className="line-clamp-1 w-full px-1 text-center text-xs font-medium">
                    {g.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!isLoading && friends.length === 0 && groups.length === 0 && (
        <motion.div {...fadeUp(0.2)}>
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 px-8 py-14 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
              <Sparkles size={28} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold">Get started with LocaLink</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Add friends and create a group to share live location.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="gap-2 rounded-xl shadow-md">
                <Link href="/dashboard/friends">
                  <UserCheck size={14} /> Find Friends
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2 rounded-xl">
                <Link href="/dashboard/groups">
                  <Users2 size={14} /> Create Group
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
