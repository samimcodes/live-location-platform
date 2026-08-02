'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bookmark, Plus, Trash2, Home, Briefcase, GraduationCap, Dumbbell, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface SavedPlace {
  id: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  type: 'HOME' | 'WORK' | 'SCHOOL' | 'GYM' | 'OTHER';
  color?: string;
}

const placeTypes = [
  { value: 'HOME', label: 'Home', icon: Home, color: '#6366f1' },
  { value: 'WORK', label: 'Work', icon: Briefcase, color: '#10b981' },
  { value: 'SCHOOL', label: 'School', icon: GraduationCap, color: '#f59e0b' },
  { value: 'GYM', label: 'Gym', icon: Dumbbell, color: '#ec4899' },
  { value: 'OTHER', label: 'Other', icon: MapPin, color: '#6b7280' },
] as const;

const typeIcon = (type: string) => {
  const found = placeTypes.find((t) => t.value === type);
  return found ?? placeTypes[4];
};

export default function SavedPlacesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', latitude: '', longitude: '', type: 'OTHER' as SavedPlace['type'] });

  const { data: places = [], isLoading } = useQuery({
    queryKey: ['saved-places'],
    queryFn: async () => {
      const { data } = await api.get('/saved-places');
      return data.data as SavedPlace[];
    },
  });

  const { mutate: createPlace, isPending: creating } = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        address: form.address || undefined,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        type: form.type,
        color: typeIcon(form.type).color,
      };
      const { data } = await api.post('/saved-places', payload);
      return data;
    },
    onSuccess: () => {
      toast.success('Place saved!');
      qc.invalidateQueries({ queryKey: ['saved-places'] });
      setShowForm(false);
      setForm({ name: '', address: '', latitude: '', longitude: '', type: 'OTHER' });
    },
    onError: () => toast.error('Failed to save place'),
  });

  const { mutate: deletePlace } = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/saved-places/${id}`); },
    onSuccess: () => {
      toast.success('Place deleted');
      qc.invalidateQueries({ queryKey: ['saved-places'] });
    },
  });

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm((f) => ({
        ...f,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      }));
    });
  };

  const isFormValid = form.name.trim() && form.latitude && form.longitude &&
    !isNaN(parseFloat(form.latitude)) && !isNaN(parseFloat(form.longitude));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Saved Places</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{places.length} saved</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={14} className="mr-2" />
          Add Place
        </Button>
      </div>

      {/* Create form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">Add Saved Place</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input placeholder="My Home" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {placeTypes.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm({ ...form, type: t.value as SavedPlace['type'] })}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                          form.type === t.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-muted'
                        )}
                      >
                        <t.icon size={12} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input placeholder="Optional address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Latitude *</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="23.8103"
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Longitude *</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="90.4125"
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    />
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full" onClick={useMyLocation} type="button">
                  <MapPin size={13} className="mr-2" />
                  Use my current location
                </Button>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button className="flex-1" onClick={() => createPlace()} disabled={!isFormValid || creating}>
                  {creating ? 'Saving…' : 'Save Place'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Places grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : places.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
            <Bookmark size={40} className="mb-3 opacity-20" />
            <p className="font-medium">No saved places</p>
            <p className="text-sm mt-1">Save frequent locations like Home and Work for quick alerts</p>
            <Button className="mt-4" size="sm" onClick={() => setShowForm(true)}>
              <Plus size={14} className="mr-2" />
              Add your first place
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place, i) => {
            const t = typeIcon(place.type);
            return (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="hover:shadow-md transition-shadow group">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${t.color}20` }}
                        >
                          <t.icon size={18} style={{ color: t.color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{place.name}</p>
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${t.color}20`, color: t.color }}
                          >
                            {t.label}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePlace(place.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {place.address && (
                      <p className="text-xs text-muted-foreground mb-2 truncate">{place.address}</p>
                    )}
                    <p className="text-[11px] font-mono text-muted-foreground/60">
                      {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
