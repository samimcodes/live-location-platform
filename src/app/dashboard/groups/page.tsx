'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useGroups,
  useCreateGroup,
  useDeleteGroup,
  useLeaveGroup,
} from '@/hooks/useGroups';
import { useFriends } from '@/hooks/useFriends';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users2, Plus, Trash2, LogOut, Users, X, Loader2,
  Shield, MapPin, ArrowRight, AlertTriangle, Search,
  Crown, Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/store';
import { cn } from '@/lib/utils';
import AvatarStack from '@/components/dashboard/AvatarStack';

// ── Per-group gradient palette (cycled by name hash) ──────────────────────
const GROUP_GRADIENTS = [
  { from: 'from-violet-500',  to: 'to-indigo-600',  glow: 'shadow-violet-500/25',  bar: 'from-violet-500 via-fuchsia-500 to-indigo-500'  },
  { from: 'from-rose-500',    to: 'to-pink-600',    glow: 'shadow-rose-500/25',    bar: 'from-rose-500 via-pink-500 to-fuchsia-500'       },
  { from: 'from-emerald-500', to: 'to-teal-600',    glow: 'shadow-emerald-500/25', bar: 'from-emerald-500 via-teal-500 to-cyan-500'        },
  { from: 'from-amber-500',   to: 'to-orange-600',  glow: 'shadow-amber-500/25',   bar: 'from-amber-500 via-orange-500 to-red-500'         },
  { from: 'from-sky-500',     to: 'to-blue-600',    glow: 'shadow-sky-500/25',     bar: 'from-sky-500 via-blue-500 to-indigo-500'          },
  { from: 'from-fuchsia-500', to: 'to-purple-600',  glow: 'shadow-fuchsia-500/25', bar: 'from-fuchsia-500 via-purple-500 to-violet-500'    },
];

function groupGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return GROUP_GRADIENTS[h % GROUP_GRADIENTS.length];
}

// ── Member avatar ──────────────────────────────────────────────────────────
function MemberAvatar({ name, avatar, size = 32 }: { name: string; avatar?: string | null; size?: number }) {
  return (
    <div
      className="relative rounded-full border-2 border-card shrink-0"
      style={{ width: size, height: size }}
      title={name}
    >
      {avatar ? (
        <Image src={avatar} alt={name} fill sizes={`${size}px`} className="rounded-full object-cover" />
      ) : (
        <div
          className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold"
          style={{ fontSize: size * 0.4 }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

// ── Confirm dialog ─────────────────────────────────────────────────────────
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
            animate={{ y: 0,  opacity: 1, scale: 1    }}
            exit={{   y: 24, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 w-full max-w-sm bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Accent top bar */}
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

// ── Skeleton card ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="h-1.5 w-full bg-muted animate-pulse" />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded-lg bg-muted animate-pulse" />
            <div className="h-3 w-1/3 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-3 w-full rounded-lg bg-muted animate-pulse" />
        <div className="h-3 w-4/5 rounded-lg bg-muted animate-pulse" />
        <div className="h-11 w-full rounded-xl bg-muted/60 animate-pulse" />
        <div className="h-10 w-full rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function GroupsPage() {
  const { data: groups = [], isLoading }             = useGroups();
  const { data: friends = [] }                       = useFriends();
  const { mutate: createGroup, isPending: creating } = useCreateGroup();
  const { mutate: deleteGroup, isPending: deleting } = useDeleteGroup();
  const { mutate: leaveGroup,  isPending: leaving  } = useLeaveGroup();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [showCreate,      setShowCreate]      = useState(false);
  const [groupName,       setGroupName]       = useState('');
  const [groupDesc,       setGroupDesc]       = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [memberSearch,    setMemberSearch]    = useState('');
  const [actionGroupId,   setActionGroupId]   = useState<number | null>(null);

  const [confirmState, setConfirmState] = useState<{
    open: boolean; title: string; description: string;
    confirmLabel: string; destructive: boolean; onConfirm: () => void;
  }>({ open: false, title: '', description: '', confirmLabel: '', destructive: false, onConfirm: () => {} });

  const closeConfirm = useCallback(() =>
    setConfirmState((s) => ({ ...s, open: false })), []);
  const openConfirm = useCallback((opts: Omit<typeof confirmState, 'open'>) =>
    setConfirmState({ ...opts, open: true }), []);

  const filteredFriends = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    return q ? friends.filter((f) => f.name.toLowerCase().includes(q)) : friends;
  }, [friends, memberSearch]);

  const closeModal = useCallback(() => {
    setShowCreate(false); setMemberSearch(''); setSelectedMembers([]);
    setGroupName(''); setGroupDesc('');
  }, []);

  const toggleMember = (id: number) =>
    setSelectedMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);

  const handleCreate = () => {
    if (!groupName.trim()) return;
    createGroup(
      { name: groupName.trim(), description: groupDesc.trim() || undefined, memberIds: selectedMembers },
      { onSuccess: closeModal }
    );
  };

  const handleDelete = useCallback((groupId: number, name: string) => {
    openConfirm({
      title: `Delete "${name}"?`,
      description: 'This group and all its data will be permanently removed. This cannot be undone.',
      confirmLabel: 'Delete', destructive: true,
      onConfirm: () => {
        closeConfirm();
        setActionGroupId(groupId);
        deleteGroup(groupId, { onSettled: () => setActionGroupId(null) });
      },
    });
  }, [openConfirm, closeConfirm, deleteGroup]);

  const handleLeave = useCallback((groupId: number, name: string) => {
    openConfirm({
      title: `Leave "${name}"?`,
      description: 'You will be removed from this group and will no longer see group members on the map.',
      confirmLabel: 'Leave', destructive: false,
      onConfirm: () => {
        closeConfirm();
        setActionGroupId(groupId);
        leaveGroup(groupId, { onSettled: () => setActionGroupId(null) });
      },
    });
  }, [openConfirm, closeConfirm, leaveGroup]);

  const totalMembers    = groups.reduce((acc, g) => acc + (g._count?.members ?? g.members.length), 0);
  const myCreatedGroups = groups.filter((g) => g.createdById === currentUser?.id).length;
  const onlineTotal     = groups.reduce((acc, g) => acc + g.members.filter((m) => m.user.isOnline).length, 0);

  return (
    <div className="space-y-6 pb-8">
      <ConfirmDialog {...confirmState} onCancel={closeConfirm} />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/60 shadow-sm transition-all hover:shadow-md">
          {/* Subtle gradient background accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/5" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[80px] opacity-60 pointer-events-none" />
          
          <div className="relative z-10 px-6 py-8 sm:px-10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0 border border-violet-400/20">
                  <Users2 size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">My Groups</h1>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    Coordinate with your circles in real-time
                  </p>
                </div>
              </div>

              <Button onClick={() => setShowCreate(true)} className="gap-2 rounded-xl h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25 transition-all active:scale-95 text-[13px] font-bold shrink-0">
                <Plus size={16} />
                New Group
              </Button>
            </div>

            {/* Stat pills row */}
            <div className="flex items-center gap-3 mt-8 flex-wrap">
              {[
                { icon: Users2,  label: `${groups.length} Groups`,   color: 'text-violet-500',  bg: 'bg-violet-500/10 border-violet-500/20'   },
                { icon: Users,   label: `${totalMembers} Members`,   color: 'text-blue-500',    bg: 'bg-blue-500/10 border-blue-500/20'       },
                { icon: Globe,   label: `${onlineTotal} Online now`, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { icon: Shield,  label: `${myCreatedGroups} Admin`,  color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/20'     },
                { icon: MapPin,  label: 'Live location',             color: 'text-pink-500',    bg: 'bg-pink-500/10 border-pink-500/20'       },
              ].map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold border shadow-sm backdrop-blur-md', bg)}>
                  <Icon size={14} className={color} />
                  <span className={color}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── CREATE MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 24 }} transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="bg-card rounded-2xl border border-border/60 shadow-2xl w-full max-w-md relative overflow-hidden"
            >
              {/* Modal header with gradient banner */}
              <div className="relative h-24 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/15 to-indigo-500/10 border-b border-border/40 overflow-hidden">
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-violet-500/10 blur-xl" />
                <div className="relative h-full flex items-end px-6 pb-4 gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <Users2 size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Create a Group</h2>
                    <p className="text-xs text-muted-foreground">Add friends and share your location together</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  aria-label="Close"
                  className="absolute top-3 right-3 p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-foreground/60 hover:text-foreground transition-colors"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Group name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Group Name *</Label>
                  <Input
                    placeholder="e.g. Family, Work Team, Trip to Cox's Bazar"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && groupName.trim()) handleCreate(); }}
                    className="h-11 rounded-xl bg-muted/40 border-border/60 focus:bg-card focus:border-primary/50"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Description <span className="normal-case font-normal opacity-60">(Optional)</span>
                  </Label>
                  <Input
                    placeholder="What is this group for?"
                    value={groupDesc}
                    onChange={(e) => setGroupDesc(e.target.value)}
                    className="h-11 rounded-xl bg-muted/40 border-border/60 focus:bg-card focus:border-primary/50"
                  />
                </div>

                {/* Members */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add Members</Label>
                    {selectedMembers.length > 0 && (
                      <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {selectedMembers.length} selected
                      </span>
                    )}
                  </div>

                  {friends.length > 0 ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
                        <Input
                          placeholder="Search friends…"
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          className="h-9 pl-8 rounded-xl text-sm bg-muted/40 border-border/60 focus:bg-card focus:border-primary/50"
                        />
                      </div>
                      <div className="max-h-44 overflow-y-auto rounded-xl border border-border/50 bg-muted/20 divide-y divide-border/30 scrollbar-none">
                        {filteredFriends.length > 0 ? filteredFriends.map((f) => {
                          const selected = selectedMembers.includes(f.id);
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => toggleMember(f.id)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left',
                                selected ? 'bg-primary/8' : 'hover:bg-muted/60'
                              )}
                            >
                              <div className="relative shrink-0">
                                <MemberAvatar name={f.name} avatar={f.avatar} size={30} />
                                {f.isOnline && (
                                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                                )}
                              </div>
                              <span className={cn('flex-1 font-medium truncate', selected ? 'text-primary' : '')}>{f.name}</span>
                              <div className={cn(
                                'h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
                                selected
                                  ? 'bg-primary border-primary'
                                  : 'border-muted-foreground/30 bg-transparent'
                              )}>
                                {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        }) : (
                          <div className="py-6 text-center">
                            <Search size={18} className="mx-auto text-muted-foreground/30 mb-1" />
                            <p className="text-xs text-muted-foreground">No match for &ldquo;{memberSearch}&rdquo;</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-xl border border-dashed border-border/60 text-center bg-muted/20">
                      <Users size={20} className="mx-auto text-muted-foreground/30 mb-1.5" />
                      <p className="text-sm text-muted-foreground">Add friends first to invite them to a group.</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-border/30 mt-2">
                  <Button variant="ghost" className="flex-1 rounded-xl hover:bg-muted/60" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 rounded-xl shadow-md shadow-primary/20"
                    onClick={handleCreate}
                    disabled={!groupName.trim() || creating}
                  >
                    {creating
                      ? <><Loader2 size={13} className="mr-2 animate-spin" />Creating…</>
                      : <><Plus size={13} className="mr-1.5" />Create Group</>}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GROUPS GRID ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        /* ── Empty state ── */
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-dashed border-border/60 bg-card/40 px-8 py-24 text-center"
        >
          <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 border border-violet-500/20 flex items-center justify-center mb-6">
            <Users2 size={32} className="text-violet-500" />
          </div>
          <h3 className="text-xl font-bold">No groups yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
            Create a group to see all your friends on one map, plan trips, and stay connected in real-time.
          </p>
          <Button className="mt-6 gap-2 shadow-md shadow-primary/20" onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Create your first group
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group, i) => {
            const isCreator   = group.createdById === currentUser?.id;
            const onlineCount = group.members.filter((m) => m.user.isOnline).length;
            const isActing    = actionGroupId === group.id && (deleting || leaving);
            const memberCount = group._count?.members ?? group.members.length;
            const grad        = groupGradient(group.name);

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: 'easeOut' }}
              >
                <div className={cn(
                  'group/card h-full flex flex-col rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl',
                  'hover:shadow-xl hover:border-border transition-all duration-300 overflow-hidden relative',
                )}>
                  {/* Subtle background glow from the group's color */}
                  <div className={cn('absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none bg-gradient-to-br', grad.from, grad.to)} />
                  
                  <div className="p-6 flex-1 flex flex-col gap-5 z-10">

                    {/* ── Card header ── */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={cn(
                          'rounded-2xl bg-gradient-to-br flex items-center justify-center',
                          'text-white font-extrabold text-xl shrink-0 shadow-md border border-white/10',
                          'group-hover/card:scale-105 group-hover/card:-rotate-3 transition-transform duration-300',
                          grad.from, grad.to,
                        )} style={{ width: 52, height: 52 }}>
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-lg truncate leading-tight text-foreground/90">{group.name}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {isCreator ? (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-md shadow-sm">
                                <Crown size={10} /> Admin
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md shadow-sm">Member</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delete / Leave */}
                      <div className="shrink-0 -mr-2 -mt-2">
                        {isCreator ? (
                          <button
                            disabled={isActing}
                            title="Delete group"
                            aria-label="Delete group"
                            onClick={(e) => { e.preventDefault(); handleDelete(group.id, group.name); }}
                            className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          >
                            {isActing ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        ) : (
                          <button
                            disabled={isActing}
                            title="Leave group"
                            aria-label="Leave group"
                            onClick={(e) => { e.preventDefault(); handleLeave(group.id, group.name); }}
                            className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors disabled:opacity-50"
                          >
                            {isActing ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Description ── */}
                    {group.description ? (
                      <p className="text-[13px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {group.description}
                      </p>
                    ) : (
                      <p className="text-[13px] text-muted-foreground/40 italic">No description</p>
                    )}

                    <div className="mt-auto space-y-5 pt-2">
                      {/* ── Stats & Avatars ── */}
                      <div className="flex items-center justify-between bg-muted/30 rounded-2xl p-3 border border-border/40">
                        <div className="flex flex-col gap-1.5 pl-1">
                          <span className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                            <Users size={12} className="text-primary/70" />
                            {memberCount} Member{memberCount !== 1 ? 's' : ''}
                          </span>
                          {onlineCount > 0 ? (
                            <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inset-0 rounded-full bg-emerald-500 opacity-50" />
                                <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-500" />
                              </span>
                              {onlineCount} Live
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-muted-foreground/60 flex items-center gap-1.5">
                              <MapPin size={10} /> None live
                            </span>
                          )}
                        </div>
                        <div className="bg-background/80 p-1.5 rounded-full border border-border/50 shadow-sm">
                          <AvatarStack
                            items={group.members.map((m) => ({
                              id: m.userId,
                              name: m.user.name,
                              avatar: m.user.avatar,
                            }))}
                            max={4}
                            size={26}
                          />
                        </div>
                      </div>

                      {/* ── View button ── */}
                      <Button
                        className={cn(
                          'w-full h-11 rounded-xl gap-2 font-bold text-[13px]',
                          'bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10',
                          'transition-all duration-300 shadow-sm active:scale-95'
                        )}
                        asChild
                      >
                        <Link href={`/dashboard/groups/${group.id}`}>
                          View Group Hub
                          <ArrowRight size={16} className="group-hover/card:translate-x-1 transition-transform duration-300" />
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
