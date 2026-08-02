'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { History, MapPin, Trash2, Navigation } from 'lucide-react';
import { formatDateTime } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';
import { motion } from 'framer-motion';

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

export default function HistoryPage() {
  const qc = useQueryClient();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applied, setApplied] = useState<{ start?: string; end?: string }>({});

  const { data = [], isLoading } = useQuery({
    queryKey: ['location-history', applied],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '200' });
      if (applied.start) params.set('startDate', applied.start);
      if (applied.end) params.set('endDate', applied.end);
      const { data } = await api.get(`/location/history?${params}`);
      return data.data as HistoryEntry[];
    },
  });

  const { mutate: clearHistory, isPending: clearing } = useMutation({
    mutationFn: async () => { await api.delete('/location/history'); },
    onSuccess: () => {
      toast.success('Location history cleared');
      qc.invalidateQueries({ queryKey: ['location-history'] });
    },
    onError: () => toast.error('Failed to clear history'),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Location History</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data.length} records</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => {
            if (confirm('Clear all location history? This cannot be undone.')) {
              clearHistory();
            }
          }}
          disabled={clearing || data.length === 0}
        >
          <Trash2 size={13} className="mr-2" />
          Clear All
        </Button>
      </div>

      {/* Filters */}
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
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setApplied({ start: startDate || undefined, end: endDate || undefined })}
              >
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setStartDate(''); setEndDate(''); setApplied({}); }}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <History size={15} className="text-primary" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No history found</p>
              <p className="text-sm mt-1">Location history will appear here as you share your location</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-1">
                {data.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.4) }}
                    className="relative flex items-start gap-3 pl-10 py-2.5 group hover:bg-muted/30 rounded-xl pr-3 transition-colors"
                  >
                    {/* Dot */}
                    <div className="absolute left-2.5 top-3.5 h-3 w-3 rounded-full bg-primary/20 border-2 border-primary shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {(entry.city || entry.address) && (
                            <p className="text-sm font-medium flex items-center gap-1">
                              <MapPin size={12} className="text-primary shrink-0" />
                              {entry.city ?? entry.address}
                              {entry.country && `, ${entry.country}`}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground font-mono">
                            {entry.latitude.toFixed(5)}, {entry.longitude.toFixed(5)}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground/70">
                            {entry.accuracy && <span>±{Math.round(entry.accuracy)}m</span>}
                            {entry.speed != null && entry.speed > 0 && (
                              <span className="flex items-center gap-1">
                                <Navigation size={9} />
                                {(entry.speed * 3.6).toFixed(0)} km/h
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground/70 shrink-0 text-right">
                          {formatDateTime(entry.recordedAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
