'use client';

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
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
  Search, AlertTriangle, ExternalLink,
  Copy, Check, Navigation,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

const MiniMap = dynamic(
  () => import('@/components/map/MiniMap').then((m) => m.MiniMap),
  { ssr: false, loading: () => <div className="h-36 w-full bg-muted animate-pulse" /> }
);

// ── Place type config ──────────────────────────────────────────────────────
const PLACE_TYPES = [
  { value: 'HOME',   label: 'Home',   icon: Home,          color: '#6366f1', gradient: 'from-indigo-500 to-indigo-600',  bgLight: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
  { value: 'WORK',   label: 'Work',   icon: Briefcase,     color: '#10b981', gradient: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
  { value: 'SCHOOL', label: 'School', icon: GraduationCap, color: '#f59e0b', gradient: 'from-amber-500 to-amber-600',    bgLight: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
  { value: 'GYM',    label: 'Gym',    icon: Dumbbell,      color: '#ec4899', gradient: 'from-pink-500 to-pink-600',       bgLight: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400' },
  { value: 'OTHER',  label: 'Other',  icon: MapPin,        color: '#8b5cf6', gradient: 'from-violet-500 to-violet-600',   bgLight: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400' },
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
            <div className={cn('h-1 w-full', destructive ? 'bg-destructive' : 'bg-emerald-500')} />
            <div className="p-6">
              <div className="flex items-start gap-3.5">
                <div className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                  destructive ? 'bg-destructive/10' : 'bg-emerald-500/10',
                )}>
                  <AlertTriangle size={18} className={destructive ? 'text-destructive' : 'text-emerald-500'} />
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

  const currentTypeConfig = getTypeConfig(form.type);

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
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 24 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className="bg-card rounded-2xl border border-border/60 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header banner with dynamic gradient */}
        <div className={cn('relative h-24 bg-gradient-to-br border-b border-border/40 overflow-hidden', currentTypeConfig.gradient)}>
          <div className="absolute inset-0 bg-black/15" />
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative h-full flex items-end px-6 pb-4 gap-3 text-white">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
              <currentTypeConfig.icon size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
              <p className="text-xs text-white/80">Save key locations for 1-click access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Place Name *</Label>
            <Input
              placeholder="e.g. My Home, Head Office, Fitness Hub"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              className="h-11 rounded-xl bg-muted/40 focus:bg-card border-border/60 font-medium"
            />
          </div>

          {/* Type selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</Label>
            <div className="flex flex-wrap gap-2">
              {PLACE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value as PlaceType })}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
                    form.type === t.value
                      ? 'border-transparent shadow-md text-white'
                      : 'border-border/60 hover:bg-muted/60 bg-muted/20 text-muted-foreground'
                  )}
                  style={form.type === t.value ? { backgroundImage: `linear-gradient(to bottom right, ${t.color}, ${t.color}ee)` } : undefined}
                >
                  <t.icon size={13} className={form.type === t.value ? "text-white" : ""} style={form.type !== t.value ? { color: t.color } : undefined} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Address <span className="normal-case font-normal opacity-60">(Optional)</span>
            </Label>
            <Input
              placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="h-11 rounded-xl bg-muted/40 focus:bg-card border-border/60 text-sm"
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
                className="h-10 rounded-xl bg-muted/40 focus:bg-card font-mono text-sm border-border/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Longitude *</Label>
              <Input
                type="number" step="any" placeholder="90.4125"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="h-10 rounded-xl bg-muted/40 focus:bg-card font-mono text-sm border-border/60"
              />
            </div>
          </div>

          {/* Use my location */}
          <Button
            variant="outline"
            className="w-full h-10 rounded-xl border-dashed border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-semibold transition-all"
            type="button" disabled={locating}
            onClick={handleUseMyLocation}
          >
            {locating ? (
              <><Loader2 size={14} className="mr-2 animate-spin" />Getting GPS location…</>
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
                    markers={[{ latitude: lat, longitude: lng, color: currentTypeConfig.color }]}
                    className="h-32 rounded-lg"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer actions */}
          <div className="flex gap-3 pt-3 border-t border-border/30 mt-4">
            <Button variant="ghost" className="flex-1 rounded-xl hover:bg-muted/60" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={cn('flex-1 rounded-xl shadow-md text-white font-semibold bg-gradient-to-r', currentTypeConfig.gradient)}
              onClick={handleSubmit}
              disabled={!!validationError || submitting}
            >
              {submitting
                ? <><Loader2 size={13} className="mr-2 animate-spin" />Saving…</>
                : title === 'Edit Place' ? 'Save Changes' : 'Save Place'
              }
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function SavedPlacesPage() {
  const { data: places = [], isLoading }             = useGetSavedPlaces();
  const { mutate: createPlace, isPending: creating } = useCreateSavedPlace();
  const { mutate: updatePlace, isPending: updating } = useUpdateSavedPlace();
  const { mutate: deletePlace }                      = useDeleteSavedPlace();

  const [showCreate,     setShowCreate]     = useState(false);
  const [editTarget,     setEditTarget]     = useState<SavedPlace | null>(null);
  const [selectedType,   setSelectedType]   = useState<string>('ALL');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [copiedId,       setCopiedId]       = useState<number | null>(null);
  const [hoveredCardId,  setHoveredCardId]  = useState<number | null>(null);

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    open: boolean; title: string; description: string;
    confirmLabel: string; destructive: boolean; onConfirm: () => void;
  }>({ open: false, title: '', description: '', confirmLabel: '', destructive: false, onConfirm: () => {} });

  const closeConfirm = useCallback(() =>
    setConfirmState((s) => ({ ...s, open: false })), []);
  const openConfirm = useCallback((opts: Omit<typeof confirmState, 'open'>) =>
    setConfirmState({ ...opts, open: true }), []);

  const handleCreate = useCallback((input: SavedPlaceInput) => {
    createPlace(input, {
      onSuccess: () => {
        setShowCreate(false);
        toast.success(`Saved "${input.name}"`);
      },
    });
  }, [createPlace]);

  const handleUpdate = useCallback((input: SavedPlaceInput) => {
    if (!editTarget) return;
    updatePlace(
      { id: editTarget.id, ...input },
      {
        onSuccess: () => {
          setEditTarget(null);
          toast.success(`Updated "${input.name}"`);
        },
      }
    );
  }, [updatePlace, editTarget]);

  const handleDelete = useCallback((place: SavedPlace) => {
    openConfirm({
      title: `Delete "${place.name}"?`,
      description: 'This saved location will be permanently removed from your account.',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: () => {
        closeConfirm();
        deletePlace(place.id, {
          onSuccess: () => toast.success(`Removed "${place.name}"`),
        });
      },
    });
  }, [openConfirm, closeConfirm, deletePlace]);

  const handleCopyCoords = useCallback((place: SavedPlace) => {
    navigator.clipboard.writeText(`${place.latitude.toFixed(6)}, ${place.longitude.toFixed(6)}`);
    setCopiedId(place.id);
    toast.success('Coordinates copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchesType = selectedType === 'ALL' || p.type === selectedType;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        (p.address && p.address.toLowerCase().includes(q));
      return matchesType && matchesSearch;
    });
  }, [places, selectedType, searchQuery]);

  return (
    <div className="space-y-6 pb-8">
      
      {/* ── Custom Confirm Dialog ───────────────────────────────────────── */}
      <ConfirmDialog {...confirmState} onCancel={closeConfirm} />

      {/* ── HEADER — Premium Banner ────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/60 shadow-sm transition-all hover:shadow-md">
          {/* Subtle gradient background accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/5" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[80px] opacity-60 pointer-events-none" />
          
          <div className="relative z-10 px-6 py-8 sm:px-10">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0 border border-emerald-400/20">
                  <Bookmark size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">Saved Places</h1>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    {places.length} saved location{places.length !== 1 ? 's' : ''} for instant routing & sharing
                  </p>
                </div>
              </div>

              <Button onClick={() => setShowCreate(true)} className="gap-2 rounded-xl h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25 transition-all active:scale-95 text-[13px] font-bold shrink-0">
                <Plus size={16} />
                Add Place
              </Button>
            </div>

            {/* Quick Type Filter Chips */}
            <div className="flex items-center gap-3 mt-8 flex-wrap">
              <button
                onClick={() => setSelectedType('ALL')}
                className={cn(
                  'px-4 py-2 rounded-xl text-[12px] font-bold transition-all border shadow-sm backdrop-blur-md',
                  selectedType === 'ALL'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/30'
                    : 'bg-card/80 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                All ({places.length})
              </button>

              {PLACE_TYPES.map((t) => {
                const count = places.filter((p) => p.type === t.value).length;
                if (count === 0 && t.value !== 'HOME' && t.value !== 'WORK') return null;

                return (
                  <button
                    key={t.value}
                    onClick={() => setSelectedType(t.value)}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all border shadow-sm backdrop-blur-md',
                      selectedType === t.value
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/30'
                        : 'bg-card/80 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <t.icon size={14} className={selectedType === t.value ? 'text-white' : ''} style={selectedType !== t.value ? { color: t.color } : undefined} />
                    {t.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── SEARCH & STATS BAR ─────────────────────────────────────────── */}
      {places.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
            <Input
              placeholder="Search by place name or address…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 rounded-xl bg-card border-border/60 focus:border-emerald-500/50 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── MODALS (Create & Edit) ─────────────────────────────────────── */}
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

      {/* ── PLACES GRID ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse border border-border/40" />
          ))}
        </div>
      ) : places.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-dashed border-border/60 bg-card/40 px-8 py-24 text-center"
        >
          <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/20 flex items-center justify-center mb-6">
            <Bookmark size={32} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold">No saved places yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
            Bookmark frequent locations like Home, Work, Gym, or favorite hangouts for quick reference.
          </p>
          <Button className="mt-6 gap-2 shadow-md shadow-emerald-500/20" onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Add your first place
          </Button>
        </motion.div>
      ) : filteredPlaces.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 py-16 text-center text-muted-foreground">
          <Search size={28} className="mx-auto opacity-30 mb-2" />
          <h4 className="font-semibold text-foreground">No matches found</h4>
          <p className="text-xs mt-1">Try searching for a different keyword or reset filters.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-xl shadow-sm"
            onClick={() => { setSelectedType('ALL'); setSearchQuery(''); }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlaces.map((place, i) => {
            const t = getTypeConfig(place.type);

            return (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3, ease: 'easeOut' }}
              >
                <div
                  className="group h-full flex flex-col rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden relative"
                  onMouseEnter={() => setHoveredCardId(place.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                >
                  
                  {/* Subtle background glow from the place's color */}
                  <div className={cn('absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none bg-gradient-to-br', t.gradient)} />
                  
                  {/* Decorative top accent line */}
                  <div
                    className={cn('h-1.5 w-full bg-gradient-to-r relative z-10', t.gradient)}
                  />

                  {/* Mini map preview — only renders on hover for performance */}
                  <div className="relative h-36 w-full border-b border-border/40 overflow-hidden bg-muted z-10">
                    {hoveredCardId === place.id ? (
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
                    ) : (
                      // Placeholder when not hovered — lightweight
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <div
                          className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-br border border-white/10"
                          style={{ background: `${t.color}33` }}
                        >
                          <t.icon size={18} style={{ color: t.color }} />
                        </div>
                        <p className="text-[11px] font-semibold text-muted-foreground/60">Hover to preview map</p>
                      </div>
                    )}
                    
                    {/* Floating category badge */}
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-sm text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: `${t.color}e6`, borderColor: `${t.color}40` }}
                    >
                      <t.icon size={11} />
                      {t.label}
                    </div>

                    {/* Quick navigation link overlaid on map hover */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-[11px] font-bold text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                      title="Open in Google Maps"
                    >
                      <Navigation size={12} />
                      Navigate
                    </a>
                  </div>

                  <div className="p-6 flex-1 flex flex-col gap-4 z-10">
                    {/* Place title and action buttons */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white bg-gradient-to-br border border-white/10 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300', t.gradient)}
                        >
                          <t.icon size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-lg truncate leading-tight text-foreground/90">{place.name}</p>
                          <span className={cn('inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md mt-1 shadow-sm', t.bgLight)}>
                            {t.label}
                          </span>
                        </div>
                      </div>

                      {/* Edit & Delete actions */}
                      <div className="flex items-center gap-1 shrink-0 -mr-2 -mt-2">
                        <button
                          onClick={() => setEditTarget(place)}
                          className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition-colors"
                          title="Edit place"
                          aria-label="Edit place"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(place)}
                          className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete place"
                          aria-label="Delete place"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Address */}
                    {place.address ? (
                      <p className="text-[13px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {place.address}
                      </p>
                    ) : (
                      <p className="text-[13px] text-muted-foreground/40 italic">No street address saved</p>
                    )}
                    
                    {/* Bottom coordinates + copy button */}
                    <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-border/30">
                      <button
                        onClick={() => handleCopyCoords(place)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 hover:bg-muted/60 text-[11px] font-mono font-medium text-muted-foreground hover:text-foreground border border-border/40 transition-colors"
                        title="Click to copy coordinates"
                      >
                        <MapPin size={12} className="shrink-0" style={{ color: t.color }} />
                        <span>{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</span>
                        {copiedId === place.id ? <Check size={12} style={{ color: t.color }} className="ml-0.5" /> : <Copy size={12} className="opacity-40 ml-0.5" />}
                      </button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-[12px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl gap-1.5"
                        asChild
                      >
                        <Link href={`/dashboard/map?lat=${place.latitude}&lng=${place.longitude}&zoom=16`}>
                          View <ExternalLink size={13} />
                        </Link>
                      </Button>
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
