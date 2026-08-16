'use client';

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  History, MapPin, Trash2, Navigation, Map as MapIcon,
  Route, Building2, Gauge, Calendar,
} from 'lucide-react';
import { formatDateTime } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidLatLng } from '@/lib/mapUtils';
import { cn } from '@/lib/utils';

const MiniMap = dynamic(
  () => import('@/components/map/MiniMap').then((m) => m.MiniMap),
  { ssr: false }
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
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
      <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', color)}>
        <Icon size={16} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold truncate">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const qc = useQueryClient();

  const [startDate,    setStartDate]    = useState('');
  const [endDate,      setEndDate]      = useState('');
  const [applied,      setApplied]      = useState<{ start?: string; end?: string }>({});
  const [skip,         setSkip]         = useState(0);
  const [allRecords, setAllRecords] = useState<HistoryEntry[]>([]);
  const [showRouteMap, setShowRouteMap] = useState(false);

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

  return (
    <div className="space-y-5 max-w-3xl">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Location History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total > 0 ? `${total} records` : 'No records'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {routeCoords.length > 1 && (
            <Button variant="outline" size="sm" onClick={() => setShowRouteMap((v) => !v)}>
              <MapIcon size={13} className="mr-2" />
              {showRouteMap ? 'Hide map' : 'Route map'}
            </Button>
          )}
          <Button
            variant="outline" size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            disabled={clearing || allRecords.length === 0}
            onClick={() => {
              if (confirm('Clear all location history? This cannot be undone.')) clearHistory();
            }}
          >
            <Trash2 size={13} className="mr-2" />
            {clearing ? 'Clearing…' : 'Clear All'}
          </Button>
        </div>
      </div>

      {/* ── Stats cards ────────────────────────────────────────── */}
      {stats && stats.totalEntries > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Route}
            label="Distance"
            value={`${stats.estimatedDistanceKm} km`}
            sub="estimated total"
            color="bg-indigo-500"
          />
          <StatCard
            icon={Building2}
            label="Cities"
            value={String(stats.uniqueCities)}
            sub={stats.topCities[0]?.city ?? undefined}
            color="bg-emerald-500"
          />
          {stats.averageSpeedKmh && (
            <StatCard
              icon={Gauge}
              label="Avg Speed"
              value={`${stats.averageSpeedKmh} km/h`}
              color="bg-amber-500"
            />
          )}
          <StatCard
            icon={Calendar}
            label="Tracking since"
            value={stats.firstRecordedAt
              ? new Date(stats.firstRecordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : '—'}
            color="bg-purple-500"
          />
        </div>
      )}

      {/* ── Route map ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showRouteMap && routeCenter && (
          <motion.div
            key="route-map"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapIcon size={14} className="text-primary" />
                  Route Map
                  <span className="ml-auto text-xs text-muted-foreground font-normal">
                    {routeCoords.length} points
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <MiniMap
                  center={routeCenter}
                  zoom={12}
                  routeCoords={routeCoords}
                  routeColor="#6366f1"
                  controls={true}
                  className="h-64 rounded-xl border border-border"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Date filter ────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={handleApplyFilter}>
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetFilter}>
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Timeline ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <History size={15} className="text-primary" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && allRecords.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : allRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No history found</p>
              <p className="text-sm mt-1">
                {applied.start || applied.end
                  ? 'No records in this date range.'
                  : 'Location history will appear here as you share your location.'}
              </p>
              {(applied.start || applied.end) && (
                <Button variant="outline" size="sm" className="mt-3" onClick={handleResetFilter}>
                  Clear filter
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map(({ label, entries }) => (
                <div key={label}>
                  {/* Date group label */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {label}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground/60">
                      {entries.length} stop{entries.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="relative">
                    {/* Timeline spine */}
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-border/60" />

                    <div className="space-y-1">
                      {entries.map((entry, i) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.015, 0.3) }}
                          className="relative flex items-start gap-3 pl-10 py-2.5 pr-3 group hover:bg-muted/30 rounded-xl transition-colors"
                        >
                          {/* Timeline dot */}
                          <div className="absolute left-[11px] top-4 h-2.5 w-2.5 rounded-full bg-background border-2 border-primary/50 group-hover:border-primary transition-colors shrink-0" />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                {(entry.city || entry.address) ? (
                                  <p className="text-sm font-medium flex items-center gap-1 truncate">
                                    <MapPin size={11} className="text-primary shrink-0" />
                                    <span className="truncate">
                                      {entry.city ?? entry.address}
                                      {entry.country && `, ${entry.country}`}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="text-sm font-mono text-muted-foreground">
                                    {entry.latitude.toFixed(5)}, {entry.longitude.toFixed(5)}
                                  </p>
                                )}

                                {/* Secondary info row */}
                                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground/70 flex-wrap">
                                  {entry.city && (
                                    <span className="font-mono">
                                      {entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}
                                    </span>
                                  )}
                                  {entry.accuracy != null && (
                                    <span>±{Math.round(entry.accuracy)}m</span>
                                  )}
                                  {entry.speed != null && entry.speed > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Navigation size={9} />
                                      {(entry.speed * 3.6).toFixed(0)} km/h
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span className="text-[11px] text-muted-foreground/60 shrink-0 tabular-nums">
                                {new Date(entry.recordedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
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
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={isFetching}
                  >
                    {isFetching
                      ? 'Loading…'
                      : `Load more (${total - allRecords.length} remaining)`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
