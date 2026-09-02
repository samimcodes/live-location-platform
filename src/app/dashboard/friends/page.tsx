"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useFriends,
  useRemoveFriend,
  useSendFriendRequest,
  usePendingRequestCount,
  useSentRequests,
} from "@/hooks/useFriends";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  UserMinus,
  Search,
  UserPlus,
  MapPin,
  Clock,
  Loader2,
  UserCheck,
  Eye,
  Radio,
  Sparkles,
  AlertTriangle,
  X,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { Friend } from "@/hooks/useFriends";
import { formatDistanceToNow } from "@/lib/dateUtils";
import { useLocationStore } from "@/store/useLocationStore";
import { useFriendsLocations } from "@/hooks/useFriendsLocations";
import { calculateDistanceKm, formatDistance, isValidLatLng } from "@/lib/mapUtils";

// ── Avatar color palette (id-based, never changes per user) ──────────────
const AVATAR_BG = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-primary",
  "bg-ring",
];
function avatarBg(id: number) {
  return AVATAR_BG[id % AVATAR_BG.length];
}

function FriendAvatar({
  id,
  name,
  avatar,
  size = 44,
  isOnline,
}: {
  id: number;
  name: string;
  avatar?: string | null;
  size?: number;
  isOnline?: boolean;
}) {
  const dotSize = Math.max(10, Math.round(size * 0.26));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="relative h-full w-full overflow-hidden rounded-2xl">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            fill
            className="object-cover"
            sizes={`${size}px`}
          />
        ) : (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center",
              "text-primary-foreground font-bold select-none",
              avatarBg(id),
            )}
            style={{ fontSize: Math.round(size * 0.38) }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-[2.5px] border-card",
            isOnline ? "bg-chart-5" : "bg-muted-foreground/30",
          )}
          style={{ width: dotSize, height: dotSize }}
        />
      )}
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Remove",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={16} className="text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-snug">{title}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {description}
                </p>
              </div>
              <button
                onClick={onCancel}
                aria-label="Close"
                className="text-muted-foreground/50 hover:text-foreground transition-colors -mt-1 -mr-1 p-1"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex gap-2 mt-5">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 h-9"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Types / helpers ───────────────────────────────────────────────────────
interface SearchUser {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  isOnline: boolean;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, delay, ease: "easeOut" as const },
});

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-muted animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-28 rounded-md bg-muted animate-pulse" />
          <div className="h-2.5 w-20 rounded-md bg-muted animate-pulse" />
        </div>
      </div>
      <div className="h-8 w-full rounded-lg bg-muted animate-pulse" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
export default function FriendsPage() {
  const router = useRouter();
  const { data: friends = [], isLoading, isError, refetch } = useFriends();
  const { mutate: removeFriend } = useRemoveFriend();
  const { mutate: sendRequest } = useSendFriendRequest();
  const { data: pendingCount = 0 } = usePendingRequestCount();
  const { data: sentRequests = [] } = useSentRequests();
  const { friendsLocations, myLocation } = useLocationStore();
  useFriendsLocations();

  const [removingId, setRemovingId] = useState<number | null>(null);
  const [confirmFriend, setConfirmFriend] = useState<Friend | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [listQuery, setListQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
  const sentIds = useMemo(
    () => new Set(sentRequests.map((r) => r.receiverId)),
    [sentRequests],
  );
  const onlineCount = useMemo(
    () => friends.filter((f) => f.isOnline).length,
    [friends],
  );
  const onMapCount = useMemo(
    () =>
      friends.filter((f) => f.sharingLocation && friendsLocations.has(f.id))
        .length,
    [friends, friendsLocations],
  );

  const filteredFriends = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    return friends.filter((f) => {
      if (filter === "online" && !f.isOnline) return false;
      if (filter === "offline" && f.isOnline) return false;
      if (
        q &&
        !f.name.toLowerCase().includes(q) &&
        !f.email.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [friends, filter, listQuery]);

  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val.trim()), 380);
  }, []);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const { data: searchResults = [], isFetching: searching } = useQuery({
    queryKey: ["user-search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const { data } = await api.get(
        `/friends/search?q=${encodeURIComponent(searchQuery)}`,
      );
      return data.data as SearchUser[];
    },
    enabled: searchQuery.length >= 2,
  });

  const handleSendRequest = useCallback(
    (receiverId: number) => {
      setSendingId(receiverId);
      sendRequest({ receiverId }, { onSettled: () => setSendingId(null) });
    },
    [sendRequest],
  );

  const handleConfirmRemove = useCallback(() => {
    if (!confirmFriend) return;
    setRemovingId(confirmFriend.id);
    setConfirmFriend(null);
    removeFriend(confirmFriend.id, { onSettled: () => setRemovingId(null) });
  }, [confirmFriend, removeFriend]);

  return (
    <div className="space-y-6 pb-8">
      <ConfirmDialog
        open={!!confirmFriend}
        title={`Remove ${confirmFriend?.name ?? "friend"}?`}
        description="They'll be removed from your friends list and won't appear on your map."
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmFriend(null)}
      />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)}>
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/60 shadow-sm transition-all hover:shadow-md">
          {/* Subtle gradient background accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/5" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[80px] opacity-60 pointer-events-none" />
          
          <div className="relative z-10 px-6 py-8 sm:px-10">
            {/* Top row */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30 border border-indigo-400/20">
                  <Users size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                    Friends
                  </h1>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    {friends.length} friend{friends.length !== 1 ? "s" : ""} ·{" "}
                    {onlineCount} online
                  </p>
                </div>
              </div>

              <Button asChild className="gap-2 rounded-xl h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25 transition-all active:scale-95 text-[13px] font-bold relative">
                <Link href="/dashboard/friends/requests">
                  <UserPlus size={16} />
                  Requests
                  {pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 animate-pulse shadow-md">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                {
                  icon: Users,
                  label: "Total Friends",
                  value: friends.length,
                  gradient: "from-indigo-500 to-violet-600",
                  glow: "shadow-indigo-500/25",
                },
                {
                  icon: Radio,
                  label: "Online Now",
                  value: onlineCount,
                  gradient: "from-emerald-500 to-teal-600",
                  glow: "shadow-emerald-500/25",
                },
                {
                  icon: MapPin,
                  label: "On The Map",
                  value: onMapCount,
                  gradient: "from-sky-500 to-blue-600",
                  glow: "shadow-sky-500/25",
                },
              ].map(({ icon: Icon, label, value, gradient, glow }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/60 backdrop-blur-md px-5 py-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br border border-white/10",
                      gradient, glow,
                    )}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold tabular-nums leading-none text-foreground/90">
                      {value}
                    </p>
                    <p className="text-[11px] font-bold text-muted-foreground mt-1.5 tracking-wide uppercase">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ── FIND PEOPLE (sidebar on wide screens) ───────────── */}
        <motion.div
          {...fadeUp(0.07)}
          className="xl:col-span-4 xl:sticky xl:top-4"
        >
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 pt-4 pb-3">
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Search size={14} className="text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">Find People</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Search by name or email
                </p>
              </div>
            </div>

            <div className="px-5 pb-4 space-y-3">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none"
                />
                <Input
                  placeholder="Search by name or email…"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-muted/40 border-border/40 text-sm focus:bg-card transition-colors"
                />
                {searching && (
                  <Loader2
                    size={14}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin"
                  />
                )}
                {searchInput && !searching && (
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setSearchQuery("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted-foreground/15 flex items-center justify-center hover:bg-muted-foreground/25 transition-colors"
                  >
                    <X size={10} className="text-muted-foreground" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="rounded-xl border border-border/40 divide-y divide-border/30 max-h-112 overflow-y-auto"
                  >
                    {searchResults.map((u) => {
                      const isFriend = friendIds.has(u.id);
                      const isSent = sentIds.has(u.id);
                      const isSending = sendingId === u.id;
                      return (
                        <div
                          key={u.id}
                          className="flex items-center gap-3 px-3.5 py-3 bg-card hover:bg-muted/30 transition-colors"
                        >
                          <FriendAvatar
                            id={u.id}
                            name={u.name}
                            avatar={u.avatar}
                            size={38}
                            isOnline={u.isOnline}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate leading-tight">
                              {u.name}
                            </p>
                            <p className="text-xs text-muted-foreground/60 truncate">
                              {u.email}
                            </p>
                          </div>
                          {isFriend ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-chart-5 font-semibold px-2.5 py-1 bg-chart-5/10 rounded-lg shrink-0">
                              <UserCheck size={11} /> Friends
                            </span>
                          ) : isSent ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium px-2.5 py-1 bg-muted/50 rounded-lg shrink-0">
                              <Clock size={10} /> Sent
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              disabled={isSending}
                              onClick={() => handleSendRequest(u.id)}
                              className="h-8 gap-1.5 rounded-lg shadow-sm shrink-0 text-xs px-3"
                            >
                              {isSending ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <UserPlus size={12} />
                              )}
                              Add
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {searchQuery.length >= 2 &&
                  !searching &&
                  searchResults.length === 0 && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center py-8 text-muted-foreground gap-1"
                    >
                      <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center mb-1">
                        <Search size={16} className="opacity-30" />
                      </div>
                      <p className="text-sm font-medium">No results</p>
                      <p className="text-xs opacity-50">
                        Try a different name or email
                      </p>
                    </motion.div>
                  )}
              </AnimatePresence>

              {searchQuery.length < 2 && (
                <p className="text-xs text-muted-foreground/50 px-0.5 pb-1">
                  Type at least 2 characters to search.
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── YOUR FRIENDS ───────────────────────────────────────── */}
        <motion.div {...fadeUp(0.12)} className="xl:col-span-8 min-w-0">
          {isLoading || isError || friends.length > 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <UserCheck size={14} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-none">
                      Your Friends
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {filteredFriends.length}
                      {filter !== "all" ? ` ${filter}` : ""} friend
                      {filteredFriends.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {friends.length > 0 && (
                    <div className="relative">
                      <Search
                        size={12}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none"
                      />
                      <input
                        value={listQuery}
                        onChange={(e) => setListQuery(e.target.value)}
                        placeholder="Filter list…"
                        className="h-8 w-36 sm:w-44 rounded-lg border border-border/40 bg-muted/40 pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  )}
                  <div className="flex gap-0.5 bg-muted/50 rounded-lg p-0.5">
                    {[
                      {
                        key: "all" as const,
                        label: "All",
                        count: friends.length,
                      },
                      {
                        key: "online" as const,
                        label: "Online",
                        count: onlineCount,
                      },
                      {
                        key: "offline" as const,
                        label: "Offline",
                        count: friends.length - onlineCount,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={cn(
                          "flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium transition-all",
                          filter === tab.key
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {tab.label}
                        <span
                          className={cn(
                            "tabular-nums text-[10px]",
                            filter === tab.key
                              ? "text-primary"
                              : "text-muted-foreground/40",
                          )}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border/30" />

              {isError ? (
                <div className="flex flex-col items-center py-12 text-muted-foreground gap-2">
                  <div className="h-11 w-11 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle size={18} className="text-destructive/70" />
                  </div>
                  <p className="text-sm font-semibold mt-1">
                    Failed to load friends
                  </p>
                  <p className="text-xs opacity-50">
                    Check your connection and try again.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-8 text-xs"
                    onClick={() => refetch()}
                  >
                    Retry
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="flex flex-col items-center py-14 text-muted-foreground gap-1">
                  <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-2">
                    <Users size={22} className="opacity-20" />
                  </div>
                  <p className="text-sm font-semibold">
                    {listQuery.trim()
                      ? "No matches"
                      : filter === "all"
                        ? "No friends yet"
                        : `No ${filter} friends`}
                  </p>
                  <p className="text-xs opacity-50 text-center max-w-[18rem]">
                    {listQuery.trim()
                      ? "Try a different name"
                      : filter === "all"
                        ? "Search on the left to find people"
                        : "Check back later"}
                  </p>
                  {(filter !== "all" || listQuery.trim()) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 h-8 text-xs"
                      onClick={() => {
                        setFilter("all");
                        setListQuery("");
                      }}
                    >
                      Show all
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                  {filteredFriends.map((friend, i) => {
                    const liveLoc = friendsLocations.get(friend.id);
                    const displayCity =
                      liveLoc?.city ?? friend.locations?.[0]?.city;
                    const isLive = !!liveLoc && friend.sharingLocation;

                    const distanceStr =
                      myLocation &&
                      liveLoc &&
                      isValidLatLng(myLocation.latitude, myLocation.longitude) &&
                      isValidLatLng(liveLoc.latitude, liveLoc.longitude)
                        ? formatDistance(
                            calculateDistanceKm(
                              myLocation.latitude,
                              myLocation.longitude,
                              liveLoc.latitude,
                              liveLoc.longitude,
                            ),
                          )
                        : null;

                    const speedKmh =
                      liveLoc?.speed != null && liveLoc.speed > 0
                        ? Math.round(liveLoc.speed * 3.6)
                        : null;

                    return (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: Math.min(i * 0.03, 0.24),
                          duration: 0.22,
                        }}
                        className="flex flex-col justify-between rounded-2xl border border-border/50 bg-background/50 p-4 hover:border-border hover:shadow-sm transition-all"
                      >
                        <div>
                          <div className="flex items-start gap-3">
                            <FriendAvatar
                              id={friend.id}
                              name={friend.name}
                              avatar={friend.avatar}
                              size={48}
                              isOnline={friend.isOnline}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-sm font-bold truncate text-foreground">
                                  {friend.name}
                                </p>
                                {distanceStr && (
                                  <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md shrink-0">
                                    📍 {distanceStr}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                {friend.isOnline ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-chart-5 font-semibold">
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inset-0 rounded-full bg-chart-5 opacity-50" />
                                      <span className="relative rounded-full h-1.5 w-1.5 bg-chart-5" />
                                    </span>
                                    Online
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                                    <Clock size={9} />
                                    {formatDistanceToNow(friend.lastSeen)}
                                  </span>
                                )}

                                {speedKmh != null && speedKmh > 2 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-chart-4 bg-chart-4/10 px-1.5 py-0.5 rounded-md">
                                    <Gauge size={9} /> {speedKmh} km/h
                                  </span>
                                )}
                              </div>
                              {displayCity && friend.sharingLocation && (
                                <p
                                  className={cn(
                                    "mt-1.5 inline-flex items-center gap-1 text-[11px]",
                                    isLive
                                      ? "text-primary font-semibold"
                                      : "text-muted-foreground/60",
                                  )}
                                >
                                  <MapPin size={10} className="shrink-0" />
                                  <span className="truncate">{displayCity}</span>
                                  {isLive && (
                                    <span className="h-1 w-1 rounded-full bg-primary animate-pulse shrink-0" />
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/map?focus=${friend.id}`)
                            }
                            className="h-8 flex-1 gap-1.5 text-xs rounded-lg"
                          >
                            <Eye size={13} />
                            View on map
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Remove friend"
                            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            disabled={removingId === friend.id}
                            onClick={() => setConfirmFriend(friend)}
                          >
                            {removingId === friend.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <UserMinus size={13} />
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 px-8 py-16 text-center h-full min-h-64 flex flex-col items-center justify-center">
              <div className="mx-auto h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
                <Sparkles size={28} className="text-primary" />
              </div>
              <h3 className="text-base font-bold">Start connecting</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                Search on the left for people you know and send a friend
                request.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
