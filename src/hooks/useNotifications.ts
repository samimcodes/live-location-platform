import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useNotificationStore } from '@/store/useNotificationStore';
import { toast } from '@/lib/toast';

// ── Types ──────────────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const QK = 'notifications' as const;

// ── useNotifications ───────────────────────────────────────────────────────
// Anti-pattern fix: store sync is done in useEffect, NOT inside queryFn.
// queryFn must be a pure data-fetching function with no side effects.
export function useNotifications(page = 1) {
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const setUnreadCount   = useNotificationStore((s) => s.setUnreadCount);

  const query = useQuery({
    queryKey: [QK, page],
    queryFn: async () => {
      const { data } = await api.get(`/notifications?page=${page}&limit=20`);
      return data.data as NotificationsResponse;
    },
    staleTime: 30_000,
  });

  // Sync to Zustand store outside queryFn
  useEffect(() => {
    if (!query.data) return;
    setNotifications(query.data.notifications);
    // Derive unread count from the current page snapshot
    const unread = query.data.notifications.filter((n) => !n.isRead).length;
    setUnreadCount(unread);
  }, [query.data, setNotifications, setUnreadCount]);

  return query;
}

// ── useUnreadCount — polls every 30 s ─────────────────────────────────────
export function useUnreadCount() {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const query = useQuery({
    queryKey: [QK, 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      return data.data.count as number;
    },
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  useEffect(() => {
    if (query.data !== undefined) setUnreadCount(query.data);
  }, [query.data, setUnreadCount]);

  return query;
}

// ── Mutations ─────────────────────────────────────────────────────────────

export function useMarkAllRead() {
  const qc       = useQueryClient();
  const markAll  = useNotificationStore((s) => s.markAllRead);
  return useMutation({
    mutationFn: async () => { await api.patch('/notifications/read-all'); },
    onSuccess: () => {
      markAll();
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: () => toast.error('Failed to mark all as read'),
  });
}

export function useMarkRead() {
  const qc      = useQueryClient();
  const markOne = useNotificationStore((s) => s.markRead);
  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/notifications/${id}/read`);
      return id;
    },
    onSuccess: (id) => {
      markOne(id);
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: () => toast.error('Failed to mark as read'),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/notifications/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: () => toast.error('Failed to delete notification'),
  });
}

export function useDeleteAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/notifications/read-all');
      return data as { message: string; data: { deleted: number } };
    },
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: () => toast.error('Failed to delete read notifications'),
  });
}
