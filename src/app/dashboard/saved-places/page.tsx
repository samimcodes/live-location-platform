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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Bookmark, Plus, Trash2, Home, Briefcase,
  GraduationCap, Dumbbell, MapPin, X, Loader2, Pencil,
  Map as MapIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const MiniMap = dynamic(
  () => import('@/components/map/MiniMap').then((m) => m.MiniMap),
  { ssr: false, loading: () => <div className="h-32 w-full bg-muted animate-pulse" /> }
);

// ── Place type config ──────────────────────────────────────────────────────
const PLACE_TYPES = [
  { value: 'HOME',   label: 'Home',   icon: Home,          color: '#6366f1', gradient: 'from-indigo-500 to-indigo-400' },
  { value: 'WORK',   label: 'Work',   icon: Briefcase,     color: '#10b981', gradient: 'from-emerald-500 to-emerald-400' },
  { value: 'SCHOOL', label: 'School', icon: GraduationCap, color: '#f59e0b', gradient: 'from-amber-500 to-amber-400' },
  { value: 'GYM',    label: 'Gym',    icon: Dumbbell,      color: '#ec4899', gradient: 'from-pink-500 to-pink-400' },
  { value: 'OTHER',  label: 'Other',  icon: MapPin,        color: '#6b7280', gradient: 'from-slate-500 to-slate-400' },
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

// ── Animation helpers ─────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: 'easeOut' as const },
});

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-card rounded-2xl border border-border/60 shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <Bookmark size={16} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="relative space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name *</Label>
            <Input
              placeholder="e.g. My Home, Office, Gym"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              className="h-11 rounded-xl bg-muted/30 focus:bg-card"
            />
          </div>

          {/* Type selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</Label>
            <div className="flex flex-wrap gap-2">
              {PLACE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value as PlaceType })}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all',
                    form.type === t.value
                      ? 'border-transparent shadow-sm text-white'
                      : 'border-border/60 hover:bg-muted/50 bg-card text-muted-foreground'
                  )}
                  style={form.type === t.value ? { backgroundImage: `linear-gradient(to bottom right, ${t.color}, ${t.color}dd)` } : undefined}
                >
                  <t.icon size={14} className={form.type !== t.value ? "" : "text-white"} style={form.type !== t.value ? { color: t.color } : undefined} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address <span className="normal-case font-normal">(Optional)</span></Label>
            <Input
              placeholder="Street address or description"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="h-11 rounded-xl bg-muted/30 focus:bg-card"
            />
          </div>

          {/* Lat / Lng */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Latitude *</Label>
              <Input
                type="number" step="any" placeholder="23.8103"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="h-10 rounded-xl bg-muted/30 focus:bg-card font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Longitude *</Label>
              <Input
                type="number" step="any" placeholder="90.4125"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="h-10 rounded-xl bg-muted/30 focus:bg-card font-mono text-sm"
              />
            </div>
          </div>

          {/* Use my location */}
          <Button
            variant="outline" className="w-full rounded-xl border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-primary"
            type="button" disabled={locating}
            onClick={handleUseMyLocation}
          >
            {locating ? (
              <><Loader2 size={14} className="mr-2 animate-spin" />Getting location…</>
            ) : (
              <><MapPin size={14} className="mr-2" />Use my current location</>
            )}
          </Button>

          {/* Geolocation error */}
          <AnimatePresence>
            {geoError && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 mt-2 font-medium"
              >
                {geoError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Validation error */}
          {validationError && form.name && (
            <p className="text-xs text-destructive font-medium">{validationError}</p>
          )}

          {/* Preview mini-map */}
          <AnimatePresence>
            {hasValidCoords && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2 overflow-hidden"
              >
                <div className="rounded-xl border border-border/60 shadow-sm p-1">
                  <MiniMap
                    center={[lng, lat]}
                    zoom={15}
                    markers={[{ latitude: lat, longitude: lng, color: getTypeConfig(form.type).color }]}
                    className="h-32 rounded-lg"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="relative flex gap-3 mt-8 pt-4 border-t border-border/30">
          <Button variant="ghost" className="flex-1 rounded-xl hover:bg-muted/50" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl shadow-sm"
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
    <div className="space-y-6 max-w-5xl">
      
      {/* ═══════════════════════════════════════════════════════════════
          HEADER — Premium Banner
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}>
        <div className="relative rounded-2xl overflow-hidden welcome-gradient border border-border/40 shadow-sm">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Bookmark size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Saved Places</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {places.length} saved location{places.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <Button onClick={() => setShowCreate(true)} className="gap-2 shadow-sm">
                <Plus size={15} />
                Add Place
              </Button>
            </div>

            {/* Quick Summary pills */}
            <div className="flex items-center gap-3 mt-5 flex-wrap">
              {[
                { icon: Home, label: 'Home', type: 'HOME' },
                { icon: Briefcase, label: 'Work', type: 'WORK' },
                { icon: MapIcon, label: 'Other', type: 'OTHER' },
              ].map(({ icon: PillIcon, label, type }) => {
                const count = places.filter(p => p.type === type || (type === 'OTHER' && p.type !== 'HOME' && p.type !== 'WORK')).length;
                if (count === 0 && type !== 'OTHER') return null; // Only hide specific types if 0
                return (
                  <div
                    key={label}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors',
                      count > 0
                        ? 'bg-card/80 border-border/50 text-foreground'
                        : 'bg-muted/40 border-transparent text-muted-foreground',
                    )}
                  >
                    <PillIcon size={12} className={count > 0 ? 'text-emerald-500' : 'text-muted-foreground/50'} />
                    {count} {label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          MODALS
         ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {/* Create modal */}
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

        {/* Edit modal */}
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

      {/* ═══════════════════════════════════════════════════════════════
          GRID
         ═══════════════════════════════════════════════════════════════ */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : places.length === 0 ? (
        <motion.div {...fadeUp(0.1)} className="rounded-2xl border border-dashed border-border/60 bg-card/40 px-8 py-20 text-center">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-5">
            <Bookmark size={28} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold">No saved places</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Save frequent locations like Home, Work, or your favorite spots for quick access.
          </p>
          <Button className="mt-6 gap-2 shadow-sm" onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Add your first place
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {places.map((place, i) => {
            const t         = getTypeConfig(place.type);
            const isDeleting = deletingId === place.id && deleting;

            return (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <div className={cn(
                  'group h-full flex flex-col rounded-2xl border border-border/60 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative',
                  isDeleting && 'opacity-50 pointer-events-none scale-[0.98]'
                )}>
                  
                  {/* Decorative glass top line */}
                  <div 
                    className="h-1.5 w-full opacity-80" 
                    style={{ backgroundImage: `linear-gradient(to right, ${t.color}, ${t.color}80)` }} 
                  />

                  {/* Mini map thumbnail */}
                  <div className="relative h-32 w-full border-b border-border/40 overflow-hidden bg-muted">
                    <MiniMap
                      center={[place.longitude, place.latitude]}
                      zoom={15}
                      markers={[{
                        latitude:  place.latitude,
                        longitude: place.longitude,
                        color:     place.color ?? t.color,
                      }]}
                      className="absolute inset-0 h-full rounded-none"
                    />
                    
                    {/* Floating type badge */}
                    <div 
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-sm text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: `${t.color}cc`, borderColor: `${t.color}40` }}
                    >
                      <t.icon size={10} />
                      {t.label}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Gradient Icon */}
                        <div 
                          className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br", t.gradient)}
                        >
                          <t.icon size={18} className="text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-base truncate leading-tight">{place.name}</p>
                        </div>
                      </div>

                      {/* Edit + Delete — show on hover on desktop, always on mobile */}
                      <div className="flex items-center gap-1 shrink-0 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditTarget(place)}
                          className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(place)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg bg-muted/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
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
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                        {place.address}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-4 flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 text-[10px] font-mono text-muted-foreground/70 border border-border/40">
                        <MapPin size={10} />
                        {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
