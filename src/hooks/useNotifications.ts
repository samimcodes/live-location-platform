import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useNotificationStore } from '@/store/useNotificationStore';
import { toast } from '@/lib/toast';

export function useNotifications(page = 1) {
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  return useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      const { data } = await api.get(`/notifications?page=${page}`);
      setNotifications(data.data.notifications);
      return data.data as {
        notifications: Array<{
          id: number;
          type: string;
          title: string;
          body: string;
          isRead: boolean;
          createdAt: string;
        }>;
        pagination: { total: number; page: number; totalPages: number };
      };
    },
  });
}

export function useUnreadCount() {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.data.count);
      return data.data.count as number;
    },
    refetchInterval: 30_000, // poll every 30s
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  return useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all');
    },
    onSuccess: () => {
      markAllRead();
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  const markRead = useNotificationStore((s) => s.markRead);
  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/notifications/${id}/read`);
      return id;
    },
    onSuccess: (id) => {
      markRead(id);
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      toast.success('Notification deleted');
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
