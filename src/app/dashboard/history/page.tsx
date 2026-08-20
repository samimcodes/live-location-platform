'use client';

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  History, MapPin, Trash2, Navigation, Map as MapIcon,
  Route, Building2, Gauge, Calendar, Filter, Loader2,
  ListRestart, Clock,
} from 'lucide-react';
import { formatDateTime } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidLatLng } from '@/lib/mapUtils';
import { cn } from '@/lib/utils';

const MiniMap = dynamic(
  () => import('@/components/map/MiniMap').then((m) => m.MiniMap),
  { ssr: false, loading: () => <div className="h-64 w-full rounded-2xl bg-muted animate-pulse border border-border" /> }
);

// ── Types ──────────────────────────────────────────────────────────────────
interface HistoryEntry {
  id: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  city?: string;
  country?: string;
  address?: string;
  recordedAt: string;
}

interface HistoryResponse {
  records: HistoryEntry[];
  total: number;
  limit: number;
  skip: number;
}

interface HistoryStats {
  totalEntries: number;
  uniqueCities: number;
  estimatedDistanceKm: number;
  averageSpeedKmh: number | null;
  firstRecordedAt: string | null;
  lastRecordedAt: string | null;
  topCities: { city: string; count: number }[];
}

const PAGE_SIZE = 50;

// ── Date grouping helper ───────────────────────────────────────────────────
function groupByDate(entries: HistoryEntry[]): { label: string; entries: HistoryEntry[] }[] {
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const todayStr     = fmt(today);
  const yesterdayStr = fmt(yesterday);

  // Use a plain object + ordered keys array to avoid name clash with lucide Map icon
  const buckets: Record<string, HistoryEntry[]> = {};
  const order: string[] = [];

  for (const entry of entries) {
    const d   = new Date(entry.recordedAt);
    const key = fmt(d);
    const label =
      key === todayStr     ? 'Today' :
      key === yesterdayStr ? 'Yesterday' :
      key;

    if (!buckets[label]) {
      buckets[label] = [];
      order.push(label);
    }
    buckets[label].push(entry);
  }

  return order.map((label) => ({ label, entries: buckets[label] }));
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, colorGradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  colorGradient: string;
}) {
  return (
    <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow group">
      <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-sm group-hover:scale-105 transition-transform', colorGradient)}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-base font-bold truncate mt-0.5 leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Animation helpers ─────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: 'easeOut' as const },
});

// ── Page ───────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const qc = useQueryClient();

  const [startDate,    setStartDate]    = useState('');
  const [endDate,      setEndDate]      = useState('');
  const [applied,      setApplied]      = useState<{ start?: string; end?: string }>({});
  const [skip,         setSkip]         = useState(0);
  const [allRecords, setAllRecords] = useState<HistoryEntry[]>([]);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [showFilters,  setShowFilters]  = useState(false);

  // ── Main history query ─────────────────────────────────────────
  const { data: historyData, isLoading, isFetching } = useQuery({
    queryKey: ['location-history', applied, skip],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        skip:  String(skip),
      });
      if (applied.start) params.set('startDate', applied.start);
      if (applied.end)   params.set('endDate',   applied.end);
      const { data } = await api.get(`/location/history?${params}`);
      return data.data as HistoryResponse;
    },
    placeholderData: (prev) => prev,
  });

  // Accumulate pages into allRecords
  React.useEffect(() => {
    if (!historyData) return;
    const records = Array.isArray(historyData.records) ? historyData.records : [];
    if (skip === 0) {
      setAllRecords(records);
    } else {
      setAllRecords((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newOnes     = records.filter((r) => !existingIds.has(r.id));
        return [...prev, ...newOnes];
      });
    }
  }, [historyData, skip]);

  // ── Stats query ────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ['location-history-stats'],
    queryFn: async () => {
      const { data } = await api.get('/location/history/stats');
      return data.data as HistoryStats;
    },
    staleTime: 120_000,
  });

  // ── Clear mutation ─────────────────────────────────────────────
  const { mutate: clearHistory, isPending: clearing } = useMutation({
    mutationFn: async () => { await api.delete('/location/history'); },
    onSuccess: () => {
      toast.success('Location history cleared');
      setAllRecords([]);
      setSkip(0);
      setStartDate('');
      setEndDate('');
      setApplied({});
      qc.invalidateQueries({ queryKey: ['location-history'] });
      qc.invalidateQueries({ queryKey: ['location-history-stats'] });
    },
    onError: () => toast.error('Failed to clear history'),
  });

  const handleApplyFilter = useCallback(() => {
    setSkip(0);
    setAllRecords([]);
    setApplied({ start: startDate || undefined, end: endDate || undefined });
  }, [startDate, endDate]);

  const handleResetFilter = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setSkip(0);
    setAllRecords([]);
    setApplied({});
    setShowFilters(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    setSkip((prev) => prev + PAGE_SIZE);
  }, []);

  // ── Route coords ───────────────────────────────────────────────
  const routeCoords = useMemo<[number, number][]>(() => {
    if (!Array.isArray(allRecords)) return [];
    return [...allRecords]
      .reverse()
      .filter((e) => isValidLatLng(e.latitude, e.longitude))
      .map((e) => [e.longitude, e.latitude]);
  }, [allRecords]);

  const routeCenter = useMemo<[number, number] | null>(() => {
    if (routeCoords.length === 0) return null;
    return routeCoords[Math.floor(routeCoords.length / 2)];
  }, [routeCoords]);

  const grouped = useMemo(() => groupByDate(Array.isArray(allRecords) ? allRecords : []), [allRecords]);

  const total       = historyData?.total ?? 0;
  const hasMore     = allRecords.length < total;
  const isFiltered  = !!(applied.start || applied.end);

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ═══════════════════════════════════════════════════════════════
          HEADER — Premium Banner
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}>
        <div className="relative rounded-2xl overflow-hidden welcome-gradient border border-border/40 shadow-sm">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <History size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Location History</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {total > 0 ? `${total} points recorded` : 'No points recorded yet'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {routeCoords.length > 1 && (
                  <Button
                    variant={showRouteMap ? "secondary" : "outline"}
                    className={cn("gap-2 shadow-sm rounded-xl h-9", showRouteMap ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800" : "")}
                    onClick={() => setShowRouteMap((v) => !v)}
                  >
                    <MapIcon size={14} />
                    {showRouteMap ? 'Hide map' : 'View on map'}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className={cn("gap-2 shadow-sm rounded-xl h-9", isFiltered ? "border-primary text-primary" : "")}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={14} />
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          DATE FILTERS (Collapsible)
         ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar size={14} className="text-primary" />
                </div>
                <h3 className="font-semibold text-sm">Filter by Date</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-1.5 w-full sm:w-auto flex-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 rounded-xl bg-muted/30 focus:bg-card"
                  />
                </div>
                <div className="space-y-1.5 w-full sm:w-auto flex-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 rounded-xl bg-muted/30 focus:bg-card"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button className="h-10 rounded-xl flex-1 sm:flex-none px-6 shadow-sm" onClick={handleApplyFilter}>
                    Apply
                  </Button>
                  <Button variant="outline" className="h-10 rounded-xl flex-1 sm:flex-none px-4" onClick={handleResetFilter}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          STATS GRID
         ═══════════════════════════════════════════════════════════════ */}
      {stats && stats.totalEntries > 0 && !isFiltered && (
        <motion.div {...fadeUp(0.08)} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Route}
            label="Distance"
            value={`${stats.estimatedDistanceKm} km`}
            sub="Estimated total"
            colorGradient="from-blue-500 to-cyan-400"
          />
          <StatCard
            icon={Building2}
            label="Cities Visited"
            value={String(stats.uniqueCities)}
            sub={stats.topCities[0]?.city ? `Top: ${stats.topCities[0].city}` : undefined}
            colorGradient="from-emerald-500 to-teal-400"
          />
          {stats.averageSpeedKmh != null && (
            <StatCard
              icon={Gauge}
              label="Avg Speed"
              value={`${stats.averageSpeedKmh} km/h`}
              sub="Across all records"
              colorGradient="from-amber-500 to-orange-400"
            />
          )}
          <StatCard
            icon={Clock}
            label="First Log"
            value={stats.firstRecordedAt
              ? new Date(stats.firstRecordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : '—'}
            sub="Tracking started"
            colorGradient="from-purple-500 to-pink-500"
          />
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          ROUTE MAP
         ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showRouteMap && routeCenter && (
          <motion.div
            key="route-map"
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-1">
              <MiniMap
                center={routeCenter}
                zoom={12}
                routeCoords={routeCoords}
                routeColor="#f59e0b" // amber-500
                controls={true}
                className="h-[320px] rounded-xl border border-border/40"
              />
              <div className="p-3 text-center text-xs text-muted-foreground">
                Showing {routeCoords.length} points on map
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          TIMELINE
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0.12)}>
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center">
                <ListRestart size={16} className="text-muted-foreground" />
              </div>
              <h2 className="text-sm font-bold">Activity Log</h2>
            </div>
            
            {allRecords.length > 0 && (
              <Button
                variant="ghost" 
                size="sm"
                className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={clearing}
                onClick={() => {
                  if (confirm('Clear all location history? This cannot be undone.')) clearHistory();
                }}
              >
                {clearing ? <Loader2 size={12} className="animate-spin mr-1.5" /> : <Trash2 size={12} className="mr-1.5" />}
                Clear All
              </Button>
            )}
          </div>

          <div className="p-5 sm:p-6">
            {isLoading && allRecords.length === 0 ? (
              <div className="space-y-6">
                {[1, 2].map((group) => (
                  <div key={group} className="space-y-4">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="pl-4 border-l-2 border-muted space-y-4">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="h-14 w-full bg-muted/50 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : allRecords.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="mx-auto h-16 w-16 rounded-3xl bg-muted/50 flex items-center justify-center mb-4">
                  <History size={28} className="opacity-30" />
                </div>
                <h3 className="font-semibold text-foreground">No history found</h3>
                <p className="text-sm mt-1.5 max-w-sm mx-auto">
                  {isFiltered
                    ? 'No location records found in this date range.'
                    : 'Location history will appear here as you share your live location with friends.'}
                </p>
                {isFiltered && (
                  <Button variant="outline" size="sm" className="mt-5 rounded-xl shadow-sm" onClick={handleResetFilter}>
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {grouped.map(({ label, entries }, groupIdx) => (
                  <div key={label}>
                    {/* Date group label */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </div>
                      <div className="flex-1 h-px bg-border/40" />
                      <span className="text-[10px] font-medium text-muted-foreground/50">
                        {entries.length} RECORD{entries.length !== 1 ? 'S' : ''}
                      </span>
                    </div>

                    <div className="relative pl-3 sm:pl-4">
                      {/* Timeline spine */}
                      <div className="absolute left-[15px] sm:left-[19px] top-3 bottom-3 w-px bg-border/60" />

                      <div className="space-y-3">
                        {entries.map((entry, i) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i * 0.015, 0.3) + (groupIdx * 0.1) }}
                            className="relative flex items-center gap-3 sm:gap-4 group"
                          >
                            {/* Timeline dot */}
                            <div className="relative z-10 flex h-6 w-6 items-center justify-center bg-card rounded-full border-2 border-muted-foreground/20 group-hover:border-primary transition-colors shrink-0">
                              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-3.5 rounded-xl border border-border/50 bg-card hover:bg-muted/30 hover:border-border transition-all">
                              
                              <div className="min-w-0">
                                {(entry.city || entry.address) ? (
                                  <p className="text-sm font-semibold flex items-center gap-1.5 truncate text-foreground">
                                    <MapPin size={13} className="text-primary shrink-0" />
                                    <span className="truncate">
                                      {entry.city ?? entry.address}
                                      {entry.country && <span className="text-muted-foreground font-normal">, {entry.country}</span>}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="text-sm font-mono text-muted-foreground">
                                    {entry.latitude.toFixed(5)}, {entry.longitude.toFixed(5)}
                                  </p>
                                )}

                                {/* Secondary info row */}
                                <div className="flex items-center gap-3 mt-1.5 text-[11px] font-medium text-muted-foreground/70 flex-wrap">
                                  {entry.city && (
                                    <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                                      {entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}
                                    </span>
                                  )}
                                  {entry.accuracy != null && (
                                    <span className="flex items-center gap-1" title="Accuracy">
                                      <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                      ±{Math.round(entry.accuracy)}m
                                    </span>
                                  )}
                                  {entry.speed != null && entry.speed > 0 && (
                                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                                      <Navigation size={9} />
                                      {(entry.speed * 3.6).toFixed(0)} km/h
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/60 shrink-0 bg-muted/40 px-2.5 py-1 rounded-lg">
                                <Clock size={10} />
                                {new Date(entry.recordedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load more */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      className="rounded-xl shadow-sm bg-card hover:bg-muted/50"
                      onClick={handleLoadMore}
                      disabled={isFetching}
                    >
                      {isFetching ? (
                        <><Loader2 size={14} className="mr-2 animate-spin" />Loading…</>
                      ) : (
                        `Load more (${total - allRecords.length} remaining)`
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
