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
  ListRestart, Clock, AlertTriangle, X, Sparkles,
  ChevronRight, Compass,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidLatLng } from '@/lib/mapUtils';
import { cn } from '@/lib/utils';

const MiniMap = dynamic(
  () => import('@/components/map/MiniMap').then((m) => m.MiniMap),
  { ssr: false, loading: () => <div className="h-72 w-full rounded-2xl bg-muted animate-pulse border border-border" /> }
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

// ── Confirm dialog component ───────────────────────────────────────────────
function ConfirmDialog({
  open, title, description, confirmLabel = 'Confirm', destructive = false,
  onConfirm, onCancel,
}: {
  open: boolean; title: string; description: string;
  confirmLabel?: string; destructive?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 w-full max-w-sm bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className={cn('h-1 w-full', destructive ? 'bg-destructive' : 'bg-amber-500')} />
            <div className="p-6">
              <div className="flex items-start gap-3.5">
                <div className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                  destructive ? 'bg-destructive/10' : 'bg-amber-500/10',
                )}>
                  <AlertTriangle size={18} className={destructive ? 'text-destructive' : 'text-amber-500'} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-bold text-sm leading-snug">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
                </div>
                <button
                  onClick={onCancel}
                  aria-label="Cancel"
                  className="p-1 -mt-0.5 -mr-0.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex gap-2.5 mt-5">
                <Button variant="outline" size="sm" className="flex-1 h-9 rounded-xl" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  variant={destructive ? 'destructive' : 'default'}
                  size="sm"
                  className="flex-1 h-9 rounded-xl"
                  onClick={onConfirm}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
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
    <div className="card-shine relative flex flex-col justify-center p-5 rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
      <div className={cn('absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none bg-gradient-to-br', colorGradient)} />
      <div className="flex items-center gap-4 z-10">
        <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-md border border-white/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300', colorGradient)}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-extrabold truncate mt-1 text-foreground leading-tight">{value}</p>
          {sub && <p className="text-[11px] font-medium text-muted-foreground/60 truncate mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const qc = useQueryClient();

  const [startDate,       setStartDate]       = useState('');
  const [endDate,         setEndDate]         = useState('');
  const [applied,         setApplied]         = useState<{ start?: string; end?: string }>({});
  const [preset,          setPreset]          = useState<'all' | 'today' | '7d' | '30d' | 'custom'>('all');
  const [skip,            setSkip]            = useState(0);
  const [allRecords,      setAllRecords]      = useState<HistoryEntry[]>([]);
  const [showRouteMap,    setShowRouteMap]    = useState(false);
  const [showFilters,     setShowFilters]     = useState(false);
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  // Accumulate pages into allRecords during render when historyData changes
  const [prevHistoryData, setPrevHistoryData] = useState<HistoryResponse | undefined>(undefined);
  if (historyData && historyData !== prevHistoryData) {
    setPrevHistoryData(historyData);
    const records = Array.isArray(historyData.records) ? historyData.records : [];
    if (skip === 0) {
      setAllRecords(records);
    } else {
      const existingIds = new Set(allRecords.map((r) => r.id));
      const newOnes     = records.filter((r) => !existingIds.has(r.id));
      setAllRecords([...allRecords, ...newOnes]);
    }
  }

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
      setPreset('all');
      setSelectedPointId(null);
      qc.invalidateQueries({ queryKey: ['location-history'] });
      qc.invalidateQueries({ queryKey: ['location-history-stats'] });
      setConfirmOpen(false);
    },
    onError: () => {
      toast.error('Failed to clear history');
      setConfirmOpen(false);
    },
  });

  // ── Quick presets ──────────────────────────────────────────────
  const applyPreset = (type: 'all' | 'today' | '7d' | '30d') => {
    setPreset(type);
    setSkip(0);
    setAllRecords([]);
    setSelectedPointId(null);

    const now = new Date();
    if (type === 'all') {
      setStartDate('');
      setEndDate('');
      setApplied({});
    } else if (type === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const end = now.toISOString();
      setStartDate(start.split('T')[0]);
      setEndDate(end.split('T')[0]);
      setApplied({ start, end });
    } else if (type === '7d') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
      setApplied({ start: past.toISOString(), end: now.toISOString() });
    } else if (type === '30d') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
      setApplied({ start: past.toISOString(), end: now.toISOString() });
    }
  };

  const handleApplyFilter = useCallback(() => {
    setSkip(0);
    setAllRecords([]);
    setPreset('custom');
    setApplied({ start: startDate || undefined, end: endDate || undefined });
  }, [startDate, endDate]);

  const handleResetFilter = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setSkip(0);
    setAllRecords([]);
    setApplied({});
    setPreset('all');
    setShowFilters(false);
    setSelectedPointId(null);
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
    <div className="space-y-6 pb-8">
      {/* ── Confirm clear dialog ───────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmOpen}
        title="Clear Location History?"
        description="This will permanently delete all recorded location points and route history. This action cannot be undone."
        confirmLabel="Clear All"
        destructive={true}
        onConfirm={() => clearHistory()}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* ── HEADER — Premium Banner ────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/60 shadow-sm transition-all hover:shadow-md">
          {/* Subtle gradient background accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/5" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[80px] opacity-60 pointer-events-none" />
          
          <div className="relative z-10 px-6 py-8 sm:px-10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0 border border-amber-400/20">
                  <History size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">Location History</h1>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    {total > 0 ? `${total} points recorded along your journeys` : 'Your movement history will appear here'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {routeCoords.length > 1 && (
                  <Button
                    variant={showRouteMap ? "secondary" : "outline"}
                    className={cn(
                      "gap-2 shadow-sm rounded-xl h-11 px-5 transition-all",
                      showRouteMap ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 font-bold" : "font-bold text-[13px]"
                    )}
                    onClick={() => setShowRouteMap((v) => !v)}
                  >
                    <MapIcon size={16} />
                    {showRouteMap ? 'Hide Route Map' : 'View on Map'}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className={cn("gap-2 shadow-sm rounded-xl h-11 px-5 font-bold text-[13px]", isFiltered ? "border-primary text-primary bg-primary/5" : "")}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={16} />
                  Filter
                </Button>
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center gap-3 mt-8 flex-wrap">
              {[
                { key: 'all',   label: 'All History' },
                { key: 'today', label: 'Today' },
                { key: '7d',    label: 'Last 7 Days' },
                { key: '30d',   label: 'Last 30 Days' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key as 'all' | 'today' | '7d' | '30d')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-[12px] font-bold transition-all border shadow-sm backdrop-blur-md',
                    preset === key
                      ? 'bg-amber-500 text-white border-amber-500 shadow-amber-500/30'
                      : 'bg-card/80 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {label}
                </button>
              ))}
              {isFiltered && preset === 'custom' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-primary/10 text-primary border border-primary/20 backdrop-blur-md shadow-sm">
                  <Sparkles size={13} /> Custom Date Filter
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── DATE FILTERS (Collapsible) ─────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Calendar size={14} className="text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-sm">Custom Date Range</h3>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60"
                >
                  <X size={15} />
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-1.5 w-full sm:w-auto flex-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 rounded-xl bg-muted/40 focus:bg-card border-border/60"
                  />
                </div>
                <div className="space-y-1.5 w-full sm:w-auto flex-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 rounded-xl bg-muted/40 focus:bg-card border-border/60"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button className="h-10 rounded-xl flex-1 sm:flex-none px-6 shadow-sm shadow-primary/20" onClick={handleApplyFilter}>
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

      {/* ── STATS GRID ─────────────────────────────────────────────────── */}
      {stats && stats.totalEntries > 0 && !isFiltered && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Route}
            label="Distance"
            value={`${stats.estimatedDistanceKm} km`}
            sub="Estimated total"
            colorGradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Building2}
            label="Cities Visited"
            value={String(stats.uniqueCities)}
            sub={stats.topCities[0]?.city ? `Top: ${stats.topCities[0].city}` : 'Mapped locations'}
            colorGradient="from-emerald-500 to-teal-500"
          />
          {stats.averageSpeedKmh != null && (
            <StatCard
              icon={Gauge}
              label="Avg Speed"
              value={`${stats.averageSpeedKmh} km/h`}
              sub="Recorded travel"
              colorGradient="from-amber-500 to-orange-500"
            />
          )}
          <StatCard
            icon={Clock}
            label="First Recorded"
            value={stats.firstRecordedAt
              ? new Date(stats.firstRecordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : '—'}
            sub="Log origin"
            colorGradient="from-purple-500 to-pink-500"
          />
        </motion.div>
      )}

      {/* ── ROUTE MAP ──────────────────────────────────────────────────── */}
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
                routeColor="#f59e0b"
                controls={true}
                className="h-[340px] rounded-xl border border-border/40"
              />
              <div className="px-4 py-3 flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Start Point
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-destructive" /> Latest Point
                  </span>
                </div>
                <span>Showing {routeCoords.length} path coordinates</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TIMELINE ───────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <ListRestart size={16} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Activity Log</h2>
                <p className="text-[11px] text-muted-foreground">Click a point for details</p>
              </div>
            </div>
            
            {allRecords.length > 0 && (
              <Button
                variant="ghost" 
                size="sm"
                className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                disabled={clearing}
                onClick={() => setConfirmOpen(true)}
              >
                {clearing ? <Loader2 size={12} className="animate-spin mr-1.5" /> : <Trash2 size={12} className="mr-1.5" />}
                Clear History
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
                        <div key={item} className="h-16 w-full bg-muted/50 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : allRecords.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/20 flex items-center justify-center mb-4">
                  <History size={32} className="text-amber-500" />
                </div>
                <h3 className="font-bold text-foreground text-base">No history records found</h3>
                <p className="text-sm mt-1.5 max-w-sm mx-auto leading-relaxed text-muted-foreground">
                  {isFiltered
                    ? 'No location points match the selected filter parameters.'
                    : 'Location updates will be logged here as you move and share location.'}
                </p>
                {isFiltered && (
                  <Button variant="outline" size="sm" className="mt-5 rounded-xl shadow-sm" onClick={handleResetFilter}>
                    Reset filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {grouped.map(({ label, entries }, groupIdx) => (
                  <div key={label}>
                    {/* Date group badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-3 py-1 rounded-full bg-muted/60 border border-border/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </div>
                      <div className="flex-1 h-px bg-border/40" />
                      <span className="text-[10px] font-semibold text-muted-foreground/60">
                        {entries.length} RECORD{entries.length !== 1 ? 'S' : ''}
                      </span>
                    </div>

                    <div className="relative pl-3 sm:pl-4">
                      {/* Timeline spine line */}
                      <div className="absolute left-[15px] sm:left-[19px] top-3 bottom-3 w-px bg-border/60" />

                      <div className="space-y-3">
                        {entries.map((entry, i) => {
                          const isSelected = selectedPointId === entry.id;
                          const isFirstOverall = groupIdx === 0 && i === 0;

                          return (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(i * 0.015, 0.25) + (groupIdx * 0.08) }}
                              className="relative flex items-start gap-3 sm:gap-4 group cursor-pointer"
                              onClick={() => setSelectedPointId(isSelected ? null : entry.id)}
                            >
                              {/* Timeline pin node */}
                              <div className={cn(
                                'relative z-10 flex h-6 w-6 mt-1.5 items-center justify-center rounded-full border-2 transition-all shrink-0',
                                isSelected
                                  ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/30'
                                  : isFirstOverall
                                    ? 'bg-card border-amber-500 text-amber-500'
                                    : 'bg-card border-muted-foreground/30 group-hover:border-amber-500/60 text-muted-foreground'
                              )}>
                                {isFirstOverall ? (
                                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                                ) : (
                                  <div className={cn(
                                    'h-1.5 w-1.5 rounded-full transition-colors',
                                    isSelected ? 'bg-white' : 'bg-muted-foreground/40 group-hover:bg-amber-500'
                                  )} />
                                )}
                              </div>

                              {/* Content Card */}
                              <div className={cn(
                                'flex-1 rounded-2xl border transition-all p-3.5 sm:p-4',
                                isSelected
                                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-md'
                                  : 'bg-card hover:bg-muted/30 border-border/60 hover:border-border'
                              )}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    {(entry.city || entry.address) ? (
                                      <p className="text-sm font-bold flex items-center gap-1.5 truncate text-foreground">
                                        <MapPin size={14} className="text-amber-500 shrink-0" />
                                        <span className="truncate">
                                          {entry.city ?? entry.address}
                                          {entry.country && <span className="text-muted-foreground font-normal">, {entry.country}</span>}
                                        </span>
                                      </p>
                                    ) : (
                                      <p className="text-sm font-mono font-semibold text-foreground flex items-center gap-1.5">
                                        <Compass size={14} className="text-amber-500 shrink-0" />
                                        {entry.latitude.toFixed(5)}, {entry.longitude.toFixed(5)}
                                      </p>
                                    )}

                                    {/* Secondary details */}
                                    <div className="flex items-center gap-2.5 mt-1.5 text-[11px] font-medium text-muted-foreground flex-wrap">
                                      {entry.city && (
                                        <span className="font-mono bg-muted/60 px-2 py-0.5 rounded-md text-[10px]">
                                          {entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}
                                        </span>
                                      )}
                                      {entry.accuracy != null && (
                                        <span className="flex items-center gap-1" title="GPS accuracy radius">
                                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                          ±{Math.round(entry.accuracy)}m
                                        </span>
                                      )}
                                      {entry.speed != null && entry.speed > 0 && (
                                        <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md font-semibold">
                                          <Navigation size={9} />
                                          {(entry.speed * 3.6).toFixed(0)} km/h
                                        </span>
                                      )}
                                      {isFirstOverall && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                                          Latest Location
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0 bg-muted/40 px-3 py-1.5 rounded-xl self-start sm:self-center">
                                    <Clock size={11} />
                                    {new Date(entry.recordedAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                    <ChevronRight size={13} className={cn('ml-1 transition-transform', isSelected ? 'rotate-90 text-amber-500' : 'text-muted-foreground/40')} />
                                  </div>
                                </div>

                                {/* Expanded detail view */}
                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground space-y-1.5"
                                    >
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-1">
                                        <div className="bg-card/70 p-2 rounded-lg border border-border/40">
                                          <p className="text-[10px] uppercase font-bold text-muted-foreground/60">Latitude</p>
                                          <p className="font-mono text-foreground font-semibold mt-0.5">{entry.latitude.toFixed(6)}</p>
                                        </div>
                                        <div className="bg-card/70 p-2 rounded-lg border border-border/40">
                                          <p className="text-[10px] uppercase font-bold text-muted-foreground/60">Longitude</p>
                                          <p className="font-mono text-foreground font-semibold mt-0.5">{entry.longitude.toFixed(6)}</p>
                                        </div>
                                        <div className="bg-card/70 p-2 rounded-lg border border-border/40 col-span-2 sm:col-span-1">
                                          <p className="text-[10px] uppercase font-bold text-muted-foreground/60">Recorded Time</p>
                                          <p className="text-foreground font-semibold mt-0.5">{new Date(entry.recordedAt).toLocaleString()}</p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load more */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      className="rounded-xl shadow-sm bg-card hover:bg-muted/50 px-6 h-10 font-semibold"
                      onClick={handleLoadMore}
                      disabled={isFetching}
                    >
                      {isFetching ? (
                        <><Loader2 size={14} className="mr-2 animate-spin" />Loading…</>
                      ) : (
                        `Load more points (${total - allRecords.length} remaining)`
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
