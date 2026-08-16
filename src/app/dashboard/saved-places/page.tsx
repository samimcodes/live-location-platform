'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  useGetSavedPlaces,
  useCreateSavedPlace,
  useUpdateSavedPlace,
  useDeleteSavedPlace,
  type SavedPlace,
  type SavedPlaceInput,
} from '@/hooks/useSavedPlaces';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Bookmark, Plus, Trash2, Home, Briefcase,
  GraduationCap, Dumbbell, MapPin, X, Loader2, Pencil,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const MiniMap = dynamic(
  () => import('@/components/map/MiniMap').then((m) => m.MiniMap),
  { ssr: false }
);

// ── Place type config ──────────────────────────────────────────────────────
const PLACE_TYPES = [
  { value: 'HOME',   label: 'Home',   icon: Home,          color: '#6366f1' },
  { value: 'WORK',   label: 'Work',   icon: Briefcase,     color: '#10b981' },
  { value: 'SCHOOL', label: 'School', icon: GraduationCap, color: '#f59e0b' },
  { value: 'GYM',    label: 'Gym',    icon: Dumbbell,      color: '#ec4899' },
  { value: 'OTHER',  label: 'Other',  icon: MapPin,        color: '#6b7280' },
] as const;

type PlaceType = SavedPlace['type'];

const getTypeConfig = (type: string) =>
  PLACE_TYPES.find((t) => t.value === type) ?? PLACE_TYPES[4];

// ── Empty form factory ─────────────────────────────────────────────────────
const emptyForm = (): {
  name: string; address: string; latitude: string; longitude: string; type: PlaceType;
} => ({ name: '', address: '', latitude: '', longitude: '', type: 'OTHER' });

// ── Validation ─────────────────────────────────────────────────────────────
function validateForm(f: ReturnType<typeof emptyForm>): string | null {
  if (!f.name.trim())                         return 'Name is required';
  if (!f.latitude || !f.longitude)            return 'Latitude and longitude are required';
  const lat = parseFloat(f.latitude);
  const lng = parseFloat(f.longitude);
  if (isNaN(lat) || lat < -90  || lat > 90)  return 'Latitude must be between -90 and 90';
  if (isNaN(lng) || lng < -180 || lng > 180) return 'Longitude must be between -180 and 180';
  return null;
}

// ── PlaceForm modal (shared by create + edit) ──────────────────────────────
interface PlaceFormProps {
  title: string;
  initial: ReturnType<typeof emptyForm>;
  submitting: boolean;
  onSubmit: (input: SavedPlaceInput) => void;
  onClose: () => void;
}

function PlaceForm({ title, initial, submitting, onSubmit, onClose }: PlaceFormProps) {
  const [form, setForm] = useState(initial);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const validationError = validateForm(form);
  const lat = parseFloat(form.latitude);
  const lng = parseFloat(form.longitude);
  const hasValidCoords = !isNaN(lat) && !isNaN(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude:  pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission denied. Allow it in your browser settings.');
        } else {
          setGeoError('Could not get your location. Try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  const handleSubmit = () => {
    if (validationError) return;
    const t = getTypeConfig(form.type);
    onSubmit({
      name:      form.name.trim(),
      address:   form.address.trim() || undefined,
      latitude:  lat,
      longitude: lng,
      type:      form.type,
      color:     t.color,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              placeholder="My Home"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            />
          </div>

          {/* Type selector */}
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-2">
              {PLACE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value as PlaceType })}
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

          {/* Address */}
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input
              placeholder="Optional address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          {/* Lat / Lng */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Latitude *</Label>
              <Input
                type="number" step="any" placeholder="23.8103"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Longitude *</Label>
              <Input
                type="number" step="any" placeholder="90.4125"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              />
            </div>
          </div>

          {/* Use my location */}
          <Button
            variant="outline" size="sm" className="w-full"
            type="button" disabled={locating}
            onClick={handleUseMyLocation}
          >
            {locating ? (
              <><Loader2 size={13} className="mr-2 animate-spin" />Locating…</>
            ) : (
              <><MapPin size={13} className="mr-2" />Use my current location</>
            )}
          </Button>

          {/* Geolocation error */}
          {geoError && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {geoError}
            </p>
          )}

          {/* Validation error */}
          {validationError && form.name && (
            <p className="text-xs text-destructive">{validationError}</p>
          )}

          {/* Preview mini-map */}
          {hasValidCoords && (
            <MiniMap
              center={[lng, lat]}
              zoom={14}
              markers={[{ latitude: lat, longitude: lng, color: getTypeConfig(form.type).color }]}
              className="h-32 rounded-xl border border-border"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!!validationError || submitting}
          >
            {submitting
              ? <><Loader2 size={13} className="mr-2 animate-spin" />Saving…</>
              : title === 'Edit Place' ? 'Save Changes' : 'Save Place'
            }
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function SavedPlacesPage() {
  const { data: places = [], isLoading }       = useGetSavedPlaces();
  const { mutate: createPlace, isPending: creating } = useCreateSavedPlace();
  const { mutate: updatePlace, isPending: updating } = useUpdateSavedPlace();
  const { mutate: deletePlace, isPending: deleting } = useDeleteSavedPlace();

  const [showCreate,  setShowCreate]  = useState(false);
  const [editTarget,  setEditTarget]  = useState<SavedPlace | null>(null);
  const [deletingId,  setDeletingId]  = useState<number | null>(null);

  const handleCreate = useCallback((input: SavedPlaceInput) => {
    createPlace(input, { onSuccess: () => setShowCreate(false) });
  }, [createPlace]);

  const handleUpdate = useCallback((input: SavedPlaceInput) => {
    if (!editTarget) return;
    updatePlace(
      { id: editTarget.id, ...input },
      { onSuccess: () => setEditTarget(null) }
    );
  }, [updatePlace, editTarget]);

  const handleDelete = useCallback((place: SavedPlace) => {
    if (!confirm(`Delete "${place.name}"?`)) return;
    setDeletingId(place.id);
    deletePlace(place.id, { onSettled: () => setDeletingId(null) });
  }, [deletePlace]);

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Saved Places</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {places.length} saved
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} className="mr-2" />
          Add Place
        </Button>
      </div>

      {/* ── Create modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <PlaceForm
            key="create"
            title="Add Saved Place"
            initial={emptyForm()}
            submitting={creating}
            onSubmit={handleCreate}
            onClose={() => setShowCreate(false)}
          />
        )}

        {/* ── Edit modal ─────────────────────────────────────────── */}
        {editTarget && (
          <PlaceForm
            key={`edit-${editTarget.id}`}
            title="Edit Place"
            initial={{
              name:      editTarget.name,
              address:   editTarget.address ?? '',
              latitude:  String(editTarget.latitude),
              longitude: String(editTarget.longitude),
              type:      editTarget.type,
            }}
            submitting={updating}
            onSubmit={handleUpdate}
            onClose={() => setEditTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Grid ───────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : places.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
            <Bookmark size={40} className="mb-3 opacity-20" />
            <p className="font-medium">No saved places</p>
            <p className="text-sm mt-1">Save frequent locations like Home and Work</p>
            <Button className="mt-4" size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={14} className="mr-2" />
              Add your first place
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place, i) => {
            const t         = getTypeConfig(place.type);
            const isDeleting = deletingId === place.id && deleting;

            return (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={cn(
                  'overflow-hidden hover:shadow-md transition-shadow group',
                  isDeleting && 'opacity-50 pointer-events-none'
                )}>
                  {/* Mini map thumbnail */}
                  <MiniMap
                    center={[place.longitude, place.latitude]}
                    zoom={14}
                    markers={[{
                      latitude:  place.latitude,
                      longitude: place.longitude,
                      color:     place.color ?? t.color,
                    }]}
                    className="h-32 rounded-none"
                  />

                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      {/* Icon + name + type */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${t.color}20` }}
                        >
                          <t.icon size={16} style={{ color: t.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{place.name}</p>
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${t.color}20`, color: t.color }}
                          >
                            {t.label}
                          </span>
                        </div>
                      </div>

                      {/* Edit + Delete — show on hover */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditTarget(place)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(place)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          {isDeleting
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} />
                          }
                        </button>
                      </div>
                    </div>

                    {place.address && (
                      <p className="text-xs text-muted-foreground mt-2 truncate">
                        {place.address}
                      </p>
                    )}
                    <p className="text-[11px] font-mono text-muted-foreground/60 mt-1">
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
