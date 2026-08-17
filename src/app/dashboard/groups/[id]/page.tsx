'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useGroup,
  useUpdateGroup,
  useAddMember,
  useRemoveMember,
  useLeaveGroup,
  useDeleteGroup,
} from '@/hooks/useGroups';
import { useFriends } from '@/hooks/useFriends';
import { useFriendsLocations } from '@/hooks/useFriendsLocations';
import { useLocationStore } from '@/store/useLocationStore';
import { useAppSelector } from '@/store/store';
import { useSocketContext } from '@/components/SocketProvider';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(
  () => import('@/components/map/LiveMap').then((m) => m.LiveMap),
  { ssr: false }
);
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, ArrowLeft, Navigation, UserPlus, UserMinus,
  Loader2, Edit2, Check, X, Trash2, LogOut, Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// ── Member avatar ──────────────────────────────────────────────────────────
function Avatar({ name, avatar, size = 9 }: { name: string; avatar?: string | null; size?: number }) {
  return (
    <div className={`relative h-${size} w-${size} shrink-0`}>
      {avatar ? (
        <Image src={avatar} alt={name} fill sizes="36px" className="rounded-full object-cover" />
      ) : (
        <div
          className={`h-${size} w-${size} rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold`}
          style={{ fontSize: size > 8 ? 14 : 11 }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export default function GroupDetailPage() {
  const { id }   = useParams() as { id: string };
  const groupId  = Number(id);
  const router   = useRouter();

  const { data: group, isLoading, error } = useGroup(groupId);
  const { data: friends = [] }            = useFriends();
  const { friendsLocations }              = useLocationStore();
  const currentUser                       = useAppSelector((s) => s.auth.user);
  const { emit }                          = useSocketContext();

  useFriendsLocations();

  // Hooks (called unconditionally — Rules of Hooks)
  const { mutate: updateGroup, isPending: updating } = useUpdateGroup(groupId);
  const { mutate: addMember,   isPending: adding   } = useAddMember(groupId);
  const { mutate: removeMember }                     = useRemoveMember(groupId);
  const { mutate: leaveGroup,  isPending: leaving  } = useLeaveGroup();
  const { mutate: deleteGroup, isPending: deleting } = useDeleteGroup();

  // Local UI state
  const [focusedUserId,  setFocusedUserId]  = useState<number | undefined>();
  const [editingName,    setEditingName]    = useState(false);
  const [nameInput,      setNameInput]      = useState('');
  const [removingId,     setRemovingId]     = useState<number | null>(null);
  const [showAddPanel,   setShowAddPanel]   = useState(false);

  // Join socket room so group:location:receive events arrive
  useEffect(() => {
    if (!groupId) return;
    emit('join', `group:${groupId}`);
    return () => { emit('leave', `group:${groupId}`); };
  }, [groupId, emit]);

  // Sync name input when group loads
  useEffect(() => {
    if (group) setNameInput(group.name);
  }, [group]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="h-64 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Group not found or you&apos;re not a member.</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/dashboard/groups">Back to Groups</Link>
        </Button>
      </div>
    );
  }

  const isAdmin     = group.members.find((m) => m.userId === currentUser?.id)?.role === 'ADMIN';
  const isCreator   = group.createdById === currentUser?.id;
  const onlineCount = group.members.filter((m) => m.user.isOnline).length;

  // Friends not yet in the group
  const memberUserIds  = new Set(group.members.map((m) => m.userId));
  const addableFriends = friends.filter((f) => !memberUserIds.has(f.id));

  const handleSaveName = () => {
    if (!nameInput.trim() || nameInput === group.name) { setEditingName(false); return; }
    updateGroup({ name: nameInput.trim() }, { onSettled: () => setEditingName(false) });
  };

  const handleRemoveMember = (userId: number, name: string) => {
    if (!confirm(`Remove ${name} from the group?`)) return;
    setRemovingId(userId);
    removeMember(userId, { onSettled: () => setRemovingId(null) });
  };

  const handleLeave = () => {
    if (!confirm(`Leave "${group.name}"?`)) return;
    leaveGroup(groupId, { onSuccess: () => router.push('/dashboard/groups') });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${group.name}"? This cannot be undone.`)) return;
    deleteGroup(groupId, { onSuccess: () => router.push('/dashboard/groups') });
  };

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
          <Link href="/dashboard/groups"><ArrowLeft size={16} /></Link>
        </Button>

        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {group.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="h-8 text-base font-bold max-w-xs"
                autoFocus
              />
              <Button size="sm" className="h-8 w-8 p-0" onClick={handleSaveName} disabled={updating}>
                {updating ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditingName(false)}>
                <X size={13} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold truncate">{group.name}</h1>
              {isAdmin && (
                <button
                  onClick={() => setEditingName(true)}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit name"
                >
                  <Edit2 size={13} />
                </button>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {group.members.length} members
            {onlineCount > 0 && (
              <span className="text-emerald-600 ml-2">· {onlineCount} online</span>
            )}
          </p>
        </div>

        {/* Admin actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isCreator ? (
            <Button
              variant="ghost" size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete} disabled={deleting} title="Delete group"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </Button>
          ) : (
            <Button
              variant="ghost" size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              onClick={handleLeave} disabled={leaving} title="Leave group"
            >
              {leaving ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Map ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <LiveMap
            className="h-[26rem] lg:h-[32rem]"
            showFriends
            focusUserId={focusedUserId}
          />
        </div>

        {/* ── Members panel ─────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users size={14} className="text-primary" />
                Members
                <span className="ml-auto text-xs text-muted-foreground font-normal">
                  {onlineCount}/{group.members.length} online
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-72 lg:max-h-[24rem]">
              {group.members.map((member) => {
                const loc        = friendsLocations.get(member.userId);
                const isSelf     = member.userId === currentUser?.id;
                const isFocused  = focusedUserId === member.userId;
                const canFocus   = !!loc && !isSelf;

                return (
                  <motion.button
                    key={member.id}
                    onClick={() => canFocus && setFocusedUserId(isFocused ? undefined : member.userId)}
                    disabled={!canFocus}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0 transition-colors text-left',
                      canFocus && 'hover:bg-muted/40 cursor-pointer',
                      !canFocus && 'cursor-default',
                      isFocused && 'bg-primary/5'
                    )}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <div className="relative shrink-0">
                      <Avatar name={member.user.name} avatar={member.user.avatar} size={9} />
                      <span className={cn(
                        'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card',
                        member.user.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-semibold truncate">{member.user.name}</p>
                        {member.role === 'ADMIN' && (
                          <Crown size={10} className="text-amber-500 shrink-0" />
                        )}
                        {isSelf && (
                          <span className="text-[9px] text-muted-foreground">(you)</span>
                        )}
                      </div>
                      {loc ? (
                        <p className="text-[10px] text-primary flex items-center gap-0.5 mt-0.5">
                          <Navigation size={8} className="shrink-0" />
                          {loc.city ?? `${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}`}
                          <span className="h-1 w-1 rounded-full bg-primary ml-0.5 animate-pulse" />
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                          {member.user.isOnline
                            ? 'Location hidden'
                            : `Last seen ${formatDistanceToNow(member.user.lastSeen ?? '')}`}
                        </p>
                      )}
                    </div>

                    {/* Remove member button — admin only, not self */}
                    {isAdmin && !isSelf && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveMember(member.userId, member.user.name); }}
                        disabled={removingId === member.userId}
                        className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        title="Remove member"
                      >
                        {removingId === member.userId ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <UserMinus size={11} />
                        )}
                      </button>
                    )}
                  </motion.button>
                );
              })}
            </CardContent>
          </Card>

          {/* ── Add Members (admin only) ─────────────────────────── */}
          {isAdmin && addableFriends.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <UserPlus size={14} className="text-primary" />
                    Add Members
                  </span>
                  <button
                    onClick={() => setShowAddPanel((v) => !v)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showAddPanel ? 'Hide' : 'Show'}
                  </button>
                </CardTitle>
              </CardHeader>
              <AnimatePresence>
                {showAddPanel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <CardContent className="pt-0 space-y-1.5 max-h-44 overflow-y-auto">
                      {addableFriends.map((friend) => (
                        <div key={friend.id} className="flex items-center gap-2.5 py-1.5">
                          <Avatar name={friend.name} avatar={friend.avatar} size={7} />
                          <span className="text-xs flex-1 truncate">{friend.name}</span>
                          {friend.isOnline && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs shrink-0"
                            disabled={adding}
                            onClick={() => addMember(friend.id)}
                          >
                            {adding ? <Loader2 size={11} className="animate-spin" /> : 'Add'}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
