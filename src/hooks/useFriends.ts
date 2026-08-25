import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from '@/lib/toast';

// ─── Query hooks ───────────────────────────────────────────────────────────

export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data } = await api.get('/friends');
      return data.data as Friend[];
    },
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: ['friend-requests', 'pending'],
    queryFn: async () => {
      const { data } = await api.get('/friends/requests/pending');
      return data.data as FriendRequest[];
    },
  });
}

export function useSentRequests() {
  return useQuery({
    queryKey: ['friend-requests', 'sent'],
    queryFn: async () => {
      const { data } = await api.get('/friends/requests/sent');
      return data.data as FriendRequest[];
    },
  });
}

/** Polls unread pending count every 30 s — drives nav badge.
 *  Reuses the same cache key as usePendingRequests to avoid a duplicate HTTP request.
 */
export function usePendingRequestCount() {
  return useQuery({
    queryKey: ['friend-requests', 'pending'],
    queryFn: async () => {
      const { data } = await api.get('/friends/requests/pending');
      return data.data as FriendRequest[];
    },
    select: (data) => data.length,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
}

/** Last 30 days of ACCEPTED + REJECTED requests. */
export function useRequestHistory() {
  return useQuery({
    queryKey: ['friend-requests', 'history'],
    queryFn: async () => {
      const { data } = await api.get('/friends/requests/history');
      return data.data as FriendRequest[];
    },
    staleTime: 60_000,
  });
}

// ─── Mutation hooks ────────────────────────────────────────────────────────

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ receiverId, message }: { receiverId: number; message?: string }) => {
      const { data } = await api.post('/friends/requests', { receiverId, message });
      return data;
    },
    onSuccess: () => {
      toast.success('Friend request sent!');
      qc.invalidateQueries({ queryKey: ['friend-requests', 'sent'] });
      qc.invalidateQueries({ queryKey: ['friend-requests', 'pending'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to send request');
    },
  });
}

export function useRespondToRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'ACCEPTED' | 'REJECTED' }) => {
      const { data } = await api.patch(`/friends/requests/${id}`, { action });
      return data;
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: ['friend-requests', 'pending'] });
      const prev = qc.getQueryData<FriendRequest[]>(['friend-requests', 'pending']);
      qc.setQueryData<FriendRequest[]>(['friend-requests', 'pending'], (old) =>
        (old ?? []).filter((r) => r.id !== id),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['friend-requests', 'pending'], ctx.prev);
      toast.error('Failed to respond to request');
    },
    onSuccess: (_, { action }) => {
      toast.success(action === 'ACCEPTED' ? 'Friend request accepted!' : 'Request rejected');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
      qc.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export function useCancelRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: number) => {
      const { data } = await api.delete(`/friends/requests/${requestId}`);
      return data;
    },
    onMutate: async (requestId) => {
      await qc.cancelQueries({ queryKey: ['friend-requests', 'sent'] });
      const prev = qc.getQueryData<FriendRequest[]>(['friend-requests', 'sent']);
      qc.setQueryData<FriendRequest[]>(['friend-requests', 'sent'], (old) =>
        (old ?? []).filter((r) => r.id !== requestId),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['friend-requests', 'sent'], ctx.prev);
      toast.error('Failed to cancel request');
    },
    onSuccess: () => {
      toast.success('Request cancelled');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });
}

export function useAcceptAllRequests() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/friends/requests/accept-all');
      return data as { message: string; data: { accepted: number } };
    },
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ['friend-requests', 'pending'] });
      qc.invalidateQueries({ queryKey: ['friend-requests', 'history'] });
      qc.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: () => toast.error('Failed to accept all requests'),
  });
}

export function useRemoveFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (friendId: number) => {
      const { data } = await api.delete(`/friends/${friendId}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Friend removed');
      qc.invalidateQueries({ queryKey: ['friends'] });
      // Also clear the removed friend's location from the initial-hydration cache
      qc.invalidateQueries({ queryKey: ['friends-locations-initial'] });
    },
    onError: () => toast.error('Failed to remove friend'),
  });
}

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Friend {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  isOnline: boolean;
  lastSeen: string;
  sharingLocation: boolean;
  locations?: Array<{
    latitude: number;
    longitude: number;
    updatedAt: string;
    city?: string;
  }>;
}

export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string;
  createdAt: string;
  updatedAt?: string;
  sender?: Pick<Friend, 'id' | 'name' | 'avatar' | 'email' | 'isOnline'>;
  receiver?: Pick<Friend, 'id' | 'name' | 'avatar' | 'email' | 'isOnline'>;
}
