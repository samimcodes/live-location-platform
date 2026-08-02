import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from '@/lib/toast';

export interface GroupMemberUser {
  id: number;
  name: string;
  avatar?: string | null;
  isOnline: boolean;
  lastSeen?: string;
  sharingLocation?: boolean;
  locations?: Array<{ latitude: number; longitude: number; updatedAt: string; city?: string }>;
}

export interface GroupMember {
  id: number;
  userId: number;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: GroupMemberUser;
}

export interface Group {
  id: number;
  name: string;
  description?: string | null;
  avatar?: string | null;
  createdById: number;
  createdAt: string;
  members: GroupMember[];
  createdBy: { id: number; name: string; avatar?: string | null };
  _count?: { members: number };
}

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data } = await api.get('/groups');
      return data.data as Group[];
    },
  });
}

export function useGroup(id: number) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const { data } = await api.get(`/groups/${id}`);
      return data.data as Group;
    },
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string; memberIds?: number[] }) => {
      const { data } = await api.post('/groups', payload);
      return data.data as Group;
    },
    onSuccess: () => {
      toast.success('Group created!');
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: () => toast.error('Failed to create group'),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/groups/${id}`);
    },
    onSuccess: () => {
      toast.success('Group deleted');
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: () => toast.error('Failed to delete group'),
  });
}

export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/groups/${id}/leave`);
    },
    onSuccess: () => {
      toast.success('Left the group');
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Failed to leave group');
    },
  });
}
