'use client';

import React, { useState } from 'react';
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
  Shield, MapPin, Activity, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/store';
import { cn } from '@/lib/utils';
import AvatarStack from '@/components/dashboard/AvatarStack';

// ── Small avatar stack ─────────────────────────────────────────────────────
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
        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold"
          style={{ fontSize: size * 0.4 }}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

// ── Animation helpers ─────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

export default function GroupsPage() {
  const { data: groups = [], isLoading }       = useGroups();
  const { data: friends = [] }                 = useFriends();
  const { mutate: createGroup, isPending: creating } = useCreateGroup();
  const { mutate: deleteGroup, isPending: deleting } = useDeleteGroup();
  const { mutate: leaveGroup,  isPending: leaving  } = useLeaveGroup();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [showCreate,       setShowCreate]       = useState(false);
  const [groupName,        setGroupName]        = useState('');
  const [groupDesc,        setGroupDesc]        = useState('');
  const [selectedMembers,  setSelectedMembers]  = useState<number[]>([]);
  // Track which group's action button is in-flight
  const [actionGroupId,    setActionGroupId]    = useState<number | null>(null);

  const toggleMember = (id: number) =>
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );

  const handleCreate = () => {
    if (!groupName.trim()) return;
    createGroup(
      { name: groupName.trim(), description: groupDesc.trim() || undefined, memberIds: selectedMembers },
      {
        onSuccess: () => {
          setShowCreate(false);
          setGroupName('');
          setGroupDesc('');
          setSelectedMembers([]);
        },
      }
    );
  };

  const handleDelete = (groupId: number, groupName: string) => {
    if (!confirm(`Delete "${groupName}"? This cannot be undone.`)) return;
    setActionGroupId(groupId);
    deleteGroup(groupId, { onSettled: () => setActionGroupId(null) });
  };

  const handleLeave = (groupId: number, groupName: string) => {
    if (!confirm(`Leave "${groupName}"?`)) return;
    setActionGroupId(groupId);
    leaveGroup(groupId, { onSettled: () => setActionGroupId(null) });
  };

  // Pre-calculate some stats
  const totalMembers = groups.reduce((acc, g) => acc + (g._count?.members ?? g.members.length), 0);
  const myCreatedGroups = groups.filter(g => g.createdById === currentUser?.id).length;

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ═══════════════════════════════════════════════════════════════
          HEADER — rich banner style
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}>
        <div className="relative rounded-2xl overflow-hidden welcome-gradient border border-border/40">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          
          <div className="relative px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Users2 size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">My Groups</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {groups.length} group{groups.length !== 1 ? 's' : ''} · {totalMembers} total members
                  </p>
                </div>
              </div>

              <Button onClick={() => setShowCreate(true)} className="gap-2 shadow-sm">
                <Plus size={15} />
                New Group
              </Button>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-3 mt-5 flex-wrap">
              {[
                { icon: Shield, label: `${myCreatedGroups} created by me`, active: myCreatedGroups > 0 },
                { icon: Users, label: `${groups.length - myCreatedGroups} joined`, active: (groups.length - myCreatedGroups) > 0 },
                { icon: MapPin, label: 'Live location sharing', active: true },
              ].map(({ icon: PillIcon, label, active }) => (
                <div
                  key={label}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors',
                    active
                      ? 'bg-card/80 border-border/50 text-foreground'
                      : 'bg-muted/40 border-transparent text-muted-foreground',
                  )}
                >
                  <PillIcon size={12} className={active ? 'text-violet-500' : 'text-muted-foreground/50'} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          CREATE MODAL
         ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl border border-border/60 shadow-2xl w-full max-w-md p-6 relative overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Plus size={16} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Create Group</h2>
                  </div>
                  <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Group Name</Label>
                    <Input
                      placeholder="e.g. Family, Work Team, Trip to Cox's Bazar"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="h-11 rounded-xl bg-muted/30 focus:bg-card"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description <span className="normal-case font-normal">(Optional)</span></Label>
                    <Input
                      placeholder="What is this group for?"
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                      className="h-11 rounded-xl bg-muted/30 focus:bg-card"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Add Members <span className="normal-case font-normal text-muted-foreground/60">({selectedMembers.length} selected)</span>
                    </Label>
                    
                    {friends.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-border/50 p-1.5 bg-muted/10 scrollbar-none">
                        {friends.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => toggleMember(f.id)}
                            className={cn(
                              'w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-all text-left group',
                              selectedMembers.includes(f.id)
                                ? 'bg-primary/10 border border-primary/20 shadow-sm'
                                : 'hover:bg-muted/50 border border-transparent'
                            )}
                          >
                            <MemberAvatar name={f.name} avatar={f.avatar} size={28} />
                            <span className={cn(
                              "flex-1 truncate font-medium transition-colors",
                              selectedMembers.includes(f.id) ? "text-primary" : ""
                            )}>
                              {f.name}
                            </span>
                            {selectedMembers.includes(f.id) && (
                              <span className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                                <Plus size={12} className="rotate-45 transition-transform" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-border/60 text-center bg-muted/20">
                        <p className="text-sm text-muted-foreground">You don't have any friends to add yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-8 pt-4 border-t border-border/30">
                  <Button variant="ghost" className="flex-1 rounded-xl hover:bg-muted/50" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 rounded-xl shadow-sm"
                    onClick={handleCreate}
                    disabled={!groupName.trim() || creating}
                  >
                    {creating ? <><Loader2 size={13} className="mr-2 animate-spin" />Creating…</> : 'Create Group'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          GROUPS GRID
         ═══════════════════════════════════════════════════════════════ */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <motion.div {...fadeUp(0.1)} className="rounded-2xl border border-dashed border-border/60 bg-card/40 px-8 py-20 text-center">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center mb-5">
            <Users2 size={28} className="text-violet-500" />
          </div>
          <h3 className="text-lg font-bold">No groups yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Create a group to see all your friends on a single map, plan trips, and stay connected.
          </p>
          <Button className="mt-6 gap-2 shadow-sm" onClick={() => setShowCreate(true)}>
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

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <div className="group h-full flex flex-col rounded-2xl border border-border/60 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                  
                  {/* Glassmorphic decorative top bar based on name hash (just for visual variety) */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 opacity-80" />

                  <div className="p-5 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-12 w-12 rounded-[14px] bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-base truncate leading-tight">{group.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {isCreator ? (
                              <span className="text-[9px] uppercase tracking-wider font-bold text-violet-600 bg-violet-100 dark:bg-violet-900/40 dark:text-violet-400 px-1.5 py-0.5 rounded-md">Admin</span>
                            ) : (
                              <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">Member</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {group.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                        {group.description}
                      </p>
                    )}

                    <div className="mt-auto pt-2 space-y-4">
                      {/* Stats row */}
                      <div className="flex items-center justify-between text-xs font-medium">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users size={14} />
                          {memberCount} Members
                        </div>
                        {onlineCount > 0 && (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-50" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            {onlineCount} active
                          </div>
                        )}
                      </div>

                      {/* Avatars */}
                      <div className="bg-muted/30 rounded-xl p-3 flex items-center justify-between">
                        <AvatarStack 
                          items={group.members.map(m => ({
                            id: m.userId,
                            name: m.user.name,
                            avatar: m.user.avatar,
                          }))}
                          max={5}
                          size={28}
                        />
                        
                        {/* Secondary Actions (Delete/Leave) */}
                        {isCreator ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                            disabled={isActing}
                            title="Delete group"
                            onClick={(e) => { e.preventDefault(); handleDelete(group.id, group.name); }}
                          >
                            {isActing ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg shrink-0"
                            disabled={isActing}
                            title="Leave group"
                            onClick={(e) => { e.preventDefault(); handleLeave(group.id, group.name); }}
                          >
                            {isActing ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <LogOut size={13} />
                            )}
                          </Button>
                        )}
                      </div>
                      
                      {/* Main Action */}
                      <Button className="w-full gap-2 rounded-xl h-10 group-hover:bg-primary/90" asChild>
                        <Link href={`/dashboard/groups/${group.id}`}>
                          View Group <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
