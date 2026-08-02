import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from '@/lib/toast';

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
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Failed to send request');
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
    onSuccess: (_, { action }) => {
      toast.success(action === 'ACCEPTED' ? 'Friend request accepted!' : 'Request rejected');
      qc.invalidateQueries({ queryKey: ['friend-requests', 'pending'] });
      qc.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: () => toast.error('Failed to respond to request'),
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
    },
    onError: () => toast.error('Failed to remove friend'),
  });
}

// ─── Types ───────────────────────────────────────────────────────
export interface Friend {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  isOnline: boolean;
  lastSeen: string;
  sharingLocation: boolean;
  locations?: Array<{ latitude: number; longitude: number; updatedAt: string; city?: string }>;
}

export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
  message?: string;
  createdAt: string;
  sender?: Pick<Friend, 'id' | 'name' | 'avatar' | 'email' | 'isOnline'>;
  receiver?: Pick<Friend, 'id' | 'name' | 'avatar' | 'email' | 'isOnline'>;
}
