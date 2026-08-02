'use client';

import React, { useState } from 'react';
import { useGroups, useCreateGroup, useDeleteGroup, useLeaveGroup } from '@/hooks/useGroups';
import { useFriends } from '@/hooks/useFriends';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users2, Plus, Trash2, LogOut, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppSelector } from '@/store/store';
import { cn } from '@/lib/utils';

export default function GroupsPage() {
  const { data: groups = [], isLoading } = useGroups();
  const { data: friends = [] } = useFriends();
  const { mutate: createGroup, isPending: creating } = useCreateGroup();
  const { mutate: deleteGroup } = useDeleteGroup();
  const { mutate: leaveGroup } = useLeaveGroup();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  const toggleMember = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={15} className="mr-2" />
          New Group
        </Button>
      </div>

      {/* Create group modal */}
      <AnimatePresence>
        {showCreate && (
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
                <h2 className="text-lg font-bold">Create Group</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-muted">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Group Name *</Label>
                  <Input placeholder="Family, Work Team, etc." value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input placeholder="Optional description" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} />
                </div>
                {friends.length > 0 && (
                  <div className="space-y-2">
                    <Label>Add Friends</Label>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-border p-2">
                      {friends.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => toggleMember(f.id)}
                          className={cn(
                            'w-full flex items-center gap-2.5 p-2 rounded-lg text-sm transition-colors text-left',
                            selectedMembers.includes(f.id)
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted'
                          )}
                        >
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {f.name.charAt(0)}
                          </div>
                          <span className="truncate">{f.name}</span>
                          {selectedMembers.includes(f.id) && (
                            <span className="ml-auto text-primary">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedMembers.length} friend{selectedMembers.length !== 1 ? 's' : ''} selected</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleCreate} disabled={!groupName.trim() || creating}>
                  {creating ? 'Creating…' : 'Create Group'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Groups grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
            <Group size={40} className="mb-3 opacity-20" />
            <p className="font-medium">No groups yet</p>
            <p className="text-sm mt-1">Create a group to share location with multiple people at once</p>
            <Button className="mt-4" size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={14} className="mr-2" />
              Create your first group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, i) => {
            const isCreator = group.createdById === currentUser?.id;
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {group.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold truncate">{group.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users size={10} />
                            {group._count?.members ?? group.members.length} members
                          </p>
                        </div>
                      </div>
                    </div>

                    {group.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{group.description}</p>
                    )}

                    {/* Member avatars */}
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 5).map((m) => (
                        <div
                          key={m.id}
                          className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-card flex items-center justify-center text-white text-[9px] font-bold"
                          title={m.user.name}
                        >
                          {m.user.name.charAt(0)}
                        </div>
                      ))}
                      {group.members.length > 5 && (
                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-muted-foreground text-[9px] font-bold">
                          +{group.members.length - 5}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/dashboard/groups/${group.id}`}>View</Link>
                      </Button>
                      {isCreator ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => deleteGroup(group.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => leaveGroup(group.id)}
                        >
                          <LogOut size={13} />
                        </Button>
                      )}
                    </div>
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
