"use client";

import React from "react";
import { useAppSelector } from "@/store/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KpiCard from "@/components/dashboard/KpiCard";
import StatsChart from "@/components/dashboard/StatsChart";
import { useFriends } from "@/hooks/useFriends";
import { useGroups } from "@/hooks/useGroups";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useLocationStore } from "@/store/useLocationStore";
import {
  Users,
  MapIcon,
  Bell,
  Navigation,
  UserCheck,
  Users2,
  Calendar,
  DownloadCloud,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const { data: friends = [] } = useFriends();
  const { data: groups = [] } = useGroups();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { myLocation, friendsLocations, isSharing } = useLocationStore();

  const stats = [
    {
      label: "Friends",
      value: friends.length,
      icon: UserCheck,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-950/50",
      href: "/dashboard/friends",
    },
    {
      label: "Groups",
      value: groups.length,
      icon: Users2,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/50",
      href: "/dashboard/groups",
    },
    {
      label: "Online Friends",
      value: friends.filter((f) => f.isOnline).length,
      icon: Navigation,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      href: "/dashboard/map",
    },
    {
      label: "Notifications",
      value: unreadCount,
      icon: Bell,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/50",
      href: "/dashboard/notifications",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isSharing
                ? `Your location is being shared with ${friends.length} friend${friends.length !== 1 ? "s" : ""}.`
                : "Location sharing is paused."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card text-sm text-muted-foreground hover:shadow-sm">
              <Calendar size={16} />
              <span>Last 7 days</span>
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-primary/10 text-sm text-primary hover:brightness-95">
              <DownloadCloud size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07 }}
          >
            <KpiCard
              label={s.label}
              value={s.value}
              icon={s.icon}
              color={s.color}
              bg={s.bg}
              href={s.href}
              delta={Math.round((Math.random() - 0.35) * 24)}
            />
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My location status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Navigation size={16} className="text-primary" />
                My Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                  isSharing
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isSharing
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-muted-foreground",
                  )}
                />
                {isSharing ? "Sharing live" : "Sharing paused"}
              </div>

              {myLocation ? (
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">
                    {myLocation.city ??
                      `${myLocation.latitude.toFixed(4)}, ${myLocation.longitude.toFixed(4)}`}
                  </p>
                  {myLocation.accuracy && (
                    <p className="text-xs text-muted-foreground/60">
                      Accuracy: ±{Math.round(myLocation.accuracy)}m
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Acquiring GPS…</p>
              )}

              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/map">
                  <MapIcon size={14} className="mr-2" />
                  Open Map
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Friends on map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users size={16} className="text-primary" />
                Friends Online Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              {friends.filter((f) => f.isOnline).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users size={36} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No friends online right now</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/dashboard/friends">Invite friends</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Small activity chart */}
                  {(() => {
                    const chartData = Array.from({ length: 7 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (6 - i));
                      const label = d.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      });
                      const base = friends.length || 0;
                      const variance = Math.round(
                        Math.sin(i) * 3 + Math.random() * 3,
                      );
                      return {
                        date: label,
                        value: Math.max(0, base + variance),
                      };
                    });
                    return <StatsChart data={chartData} color="#7c3aed" />;
                  })()}
                  {friends
                    .filter((f) => f.isOnline)
                    .slice(0, 5)
                    .map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-3 py-2 px-1"
                      >
                        <div className="relative">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {f.name.charAt(0)}
                          </div>
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {f.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {f.locations?.[0]?.city ?? "Location active"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs shrink-0"
                          asChild
                        >
                          <Link href="/dashboard/map">View</Link>
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Groups */}
      {groups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users2 size={16} className="text-primary" />
                  My Groups
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" asChild>
                  <Link href="/dashboard/groups">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groups.slice(0, 3).map((g) => (
                  <Link key={g.id} href={`/dashboard/groups/${g.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {g.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{g.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {g._count?.members ?? g.members.length} members
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
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
