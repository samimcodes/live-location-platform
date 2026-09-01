'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';

// ── Avatar — fixed pixel sizes via inline style, no dynamic Tailwind classes ──
// Dynamic classes like `h-${size}` are purged in production by Tailwind JIT.
const AVATAR_BG = [
  'bg-chart-1', 'bg-chart-2', 'bg-chart-3',
  'bg-chart-4', 'bg-chart-5', 'bg-primary',
];
function avatarBg(id: number) { return AVATAR_BG[id % AVATAR_BG.length]; }

function Avatar({ id = 0, name, avatar, sizePx = 36 }: {
  id?: number; name: string; avatar?: string | null; sizePx?: number;
}) {
  return (
    <div
      className="relative shrink-0 rounded-full overflow-hidden"
      style={{ width: sizePx, height: sizePx }}
    >
      {avatar ? (
        <Image src={avatar} alt={name} fill sizes={`${sizePx}px`} className="object-cover" />
      ) : (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center text-primary-foreground font-bold select-none',
            avatarBg(id),
          )}
          style={{ fontSize: Math.round(sizePx * 0.4) }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

// ── Inline confirm dialog (reused from friends page pattern) ──────────────
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.97 }}
            animate={{ y: 0,  opacity: 1, scale: 1    }}
            exit={{   y: 20, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-start gap-3.5">
              <div className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                destructive ? 'bg-destructive/10' : 'bg-chart-4/10',
              )}>
                <AlertTriangle size={16} className={destructive ? 'text-destructive' : 'text-chart-4'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-snug">{title}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
              </div>
              <button
                onClick={onCancel}
                aria-label="Cancel"
                className="text-muted-foreground/50 hover:text-foreground transition-colors -mt-1 -mr-1 p-1"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" size="sm" className="flex-1 h-9" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                variant={destructive ? 'destructive' : 'default'}
                size="sm"
                className="flex-1 h-9"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────
export default function GroupDetailPage() {
  const { id }  = useParams() as { id: string };
  const router  = useRouter();

  // Guard: ensure id is a valid integer before using it
  const groupId = useMemo(() => {
    const n = parseInt(id, 10);
    return isNaN(n) ? null : n;
  }, [id]);

  const { data: group, isLoading, error } = useGroup(groupId ?? 0);
  const { data: friends = [] }            = useFriends();
  const { friendsLocations }              = useLocationStore();
  const currentUser                       = useAppSelector((s) => s.auth.user);
  const { emit }                          = useSocketContext();

  useFriendsLocations();

  // Hooks — always called unconditionally (Rules of Hooks)
  const { mutate: updateGroup, isPending: updating } = useUpdateGroup(groupId ?? 0);
  const { mutate: addMember,   isPending: adding   } = useAddMember(groupId ?? 0);
  const { mutate: removeMember }                     = useRemoveMember(groupId ?? 0);
  const { mutate: leaveGroup,  isPending: leaving  } = useLeaveGroup();
  const { mutate: deleteGroup, isPending: deleting } = useDeleteGroup();

  // UI state
  const [focusedUserId, setFocusedUserId] = useState<number | undefined>();
  const [editingName,   setEditingName]   = useState(false);
  const [nameInput,     setNameInput]     = useState('');
  const [removingId,    setRemovingId]    = useState<number | null>(null);
  const [showAddPanel,  setShowAddPanel]  = useState(false);

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    destructive: boolean;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', confirmLabel: '', destructive: false, onConfirm: () => {} });

  const closeConfirm = useCallback(() =>
    setConfirmState((s) => ({ ...s, open: false })), []);

  const openConfirm = useCallback((opts: Omit<typeof confirmState, 'open'>) =>
    setConfirmState({ ...opts, open: true }), []);

  // ── Socket room join/leave ────────────────────────────────────────────
  useEffect(() => {
    if (!groupId) return;
    emit('join', `group:${groupId}`);
    return () => { emit('leave', `group:${groupId}`); };
  }, [groupId, emit]);

  // ── Sync name input when group data arrives ───────────────────────────
  const [prevGroupName, setPrevGroupName] = useState(group?.name);
  if (group?.name !== prevGroupName) {
    setPrevGroupName(group?.name);
    if (group?.name) setNameInput(group.name);
  }

  // ── Derived values (memoized) ─────────────────────────────────────────
  const isAdmin = useMemo(
    () => group?.members.find((m) => m.userId === currentUser?.id)?.role === 'ADMIN',
    [group, currentUser]
  );
  const isCreator = useMemo(
    () => group?.createdById === currentUser?.id,
    [group, currentUser]
  );
  const onlineCount = useMemo(
    () => group?.members.filter((m) => m.user.isOnline).length ?? 0,
    [group]
  );
  const memberUserIds = useMemo(
    () => new Set((group?.members ?? []).map((m) => m.userId)),
    [group]
  );
  const addableFriends = useMemo(
    () => friends.filter((f) => !memberUserIds.has(f.id)),
    [friends, memberUserIds]
  );

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSaveName = useCallback(() => {
    if (!nameInput.trim() || nameInput === group?.name) { setEditingName(false); return; }
    updateGroup({ name: nameInput.trim() }, { onSettled: () => setEditingName(false) });
  }, [nameInput, group, updateGroup]);

  const handleRemoveMember = useCallback((userId: number, name: string) => {
    openConfirm({
      title: `Remove ${name}?`,
      description: 'They will be removed from this group and will no longer see group members on the map.',
      confirmLabel: 'Remove',
      destructive: true,
      onConfirm: () => {
        closeConfirm();
        setRemovingId(userId);
        removeMember(userId, { onSettled: () => setRemovingId(null) });
      },
    });
  }, [openConfirm, closeConfirm, removeMember]);

  const handleLeave = useCallback(() => {
    if (!group) return;
    openConfirm({
      title: `Leave "${group.name}"?`,
      description: 'You will be removed from this group and will no longer see group members on the map.',
      confirmLabel: 'Leave',
      destructive: false,
      onConfirm: () => {
        closeConfirm();
        leaveGroup(groupId!, { onSuccess: () => router.push('/dashboard/groups') });
      },
    });
  }, [group, openConfirm, closeConfirm, leaveGroup, groupId, router]);

  const handleDelete = useCallback(() => {
    if (!group) return;
    openConfirm({
      title: `Delete "${group.name}"?`,
      description: 'This group and all its members will be permanently removed. This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: () => {
        closeConfirm();
        deleteGroup(groupId!, { onSuccess: () => router.push('/dashboard/groups') });
      },
    });
  }, [group, openConfirm, closeConfirm, deleteGroup, groupId, router]);

  // ── Invalid route param ───────────────────────────────────────────────
  if (!groupId) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Invalid group ID.</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/dashboard/groups">Back to Groups</Link>
        </Button>
      </div>
    );
  }

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

  return (
    <div className="space-y-5">

      {/* Confirm dialog — replaces all window.confirm calls */}
      <ConfirmDialog {...confirmState} onCancel={closeConfirm} />

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" asChild>
          <Link href="/dashboard/groups"><ArrowLeft size={16} /></Link>
        </Button>

        {/* Group initial icon — fixed size, CSS token gradient */}
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
          {group.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setEditingName(false);
                }}
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
                  aria-label="Edit group name"
                >
                  <Edit2 size={13} />
                </button>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
            {onlineCount > 0 && (
              <span className="text-chart-5 ml-2">· {onlineCount} online</span>
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
              aria-label="Delete group"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </Button>
          ) : (
            <Button
              variant="ghost" size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-chart-4 hover:bg-chart-4/10"
              onClick={handleLeave} disabled={leaving} title="Leave group"
              aria-label="Leave group"
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
                const loc       = friendsLocations.get(member.userId);
                const isSelf    = member.userId === currentUser?.id;
                const isFocused = focusedUserId === member.userId;
                const canFocus  = !!loc && !isSelf;

                return (
                  // ── Fix: motion.div (not motion.button) so the inner remove button
                  // is not nested inside a button — invalid HTML otherwise.
                  // The `group` class enables group-hover on the remove button.
                  <motion.div
                    key={member.id}
                    role={canFocus ? 'button' : undefined}
                    tabIndex={canFocus ? 0 : undefined}
                    onClick={() => canFocus && setFocusedUserId(isFocused ? undefined : member.userId)}
                    onKeyDown={(e) => {
                      if (canFocus && (e.key === 'Enter' || e.key === ' '))
                        setFocusedUserId(isFocused ? undefined : member.userId);
                    }}
                    className={cn(
                      'group flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0 transition-colors',
                      canFocus && 'hover:bg-muted/40 cursor-pointer',
                      !canFocus && 'cursor-default',
                      isFocused && 'bg-primary/5',
                    )}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        id={member.userId}
                        name={member.user.name}
                        avatar={member.user.avatar}
                        sizePx={36}
                      />
                      <span className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card',
                        member.user.isOnline ? 'bg-chart-5' : 'bg-muted-foreground/40',
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-semibold truncate">{member.user.name}</p>
                        {member.role === 'ADMIN' && (
                          <Crown size={10} className="text-chart-4 shrink-0" />
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
                            : member.user.lastSeen
                              ? `Last seen ${formatDistanceToNow(member.user.lastSeen)}`
                              : 'Offline'}
                        </p>
                      )}
                    </div>

                    {/* Remove button — now correctly inside motion.div (not motion.button),
                        and the parent has `group` class so group-hover works. */}
                    {isAdmin && !isSelf && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMember(member.userId, member.user.name);
                        }}
                        disabled={removingId === member.userId}
                        aria-label={`Remove ${member.user.name}`}
                        className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        title="Remove member"
                      >
                        {removingId === member.userId
                          ? <Loader2 size={11} className="animate-spin" />
                          : <UserMinus size={11} />}
                      </button>
                    )}
                  </motion.div>
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
                          <Avatar
                            id={friend.id}
                            name={friend.name}
                            avatar={friend.avatar}
                            sizePx={28}
                          />
                          <span className="text-xs flex-1 truncate">{friend.name}</span>
                          {friend.isOnline && (
                            <span className="h-1.5 w-1.5 rounded-full bg-chart-5 shrink-0" />
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
