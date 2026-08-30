'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useAppSelector } from '@/store/store';
import { useLocationStore } from '@/store/useLocationStore';
import { useNotificationStore } from '@/store/useNotificationStore';

interface SocketContextValue {
  socket: Socket | null;
  emit: (event: string, data?: unknown) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  emit: () => undefined,
});

export const useSocketContext = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAppSelector((s) => s.auth);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const updateFriendLocation = useLocationStore((s) => s.updateFriendLocation);
  const removeFriendLocation = useLocationStore((s) => s.removeFriendLocation);
  const addNotification      = useNotificationStore((s) => s.addNotification);

  // TanStack Query client — used to invalidate stale queries on socket events
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      socketRef.current = null;
      return;
    }

    const s = connectSocket(token || '');
    socketRef.current = s;

    const handleConnect = () => setSocket(s);
    const handleDisconnect = () => setSocket(null);

    if (s.connected) {
      handleConnect();
    }
    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);

    // ── location:receive — real-time friend position update ──────────
    s.on('location:receive', (data: {
      userId: number;
      latitude: number;
      longitude: number;
      accuracy?: number;
      speed?: number;
      heading?: number;
      address?: string;
      city?: string;
      timestamp?: string;
    }) => {
      updateFriendLocation(data);
    });

    s.on('group:location:receive', (data: {
      userId: number;
      latitude: number;
      longitude: number;
      accuracy?: number;
      speed?: number;
      heading?: number;
      address?: string;
      city?: string;
      timestamp?: string;
    }) => {
      updateFriendLocation(data);
    });

    // ── friend:online — friend connected; refresh their online flag ──
    s.on('friend:online', ({ userId }: { userId: number }) => {
      // Invalidate the friends list so isOnline reflects the new state
      // immediately in FriendMarkerPanel and elsewhere.
      qc.invalidateQueries({ queryKey: ['friends'] });
      console.debug(`[socket] friend:online userId=${userId}`);
    });

    // ── friend:offline — remove their map marker + refresh list ──────
    s.on('friend:offline', ({ userId }: { userId: number }) => {
      removeFriendLocation(userId);
      qc.invalidateQueries({ queryKey: ['friends'] });
      console.debug(`[socket] friend:offline userId=${userId}`);
    });

    // ── notification ─────────────────────────────────────────────────
    s.on('notification', (data: {
      id?: number;
      type: string;
      message: string;
      data?: Record<string, unknown>;
    }) => {
      // Use the server-provided id so mark-read/delete API calls use the
      // correct database id. Fall back to a random int only if the server
      // omits the id (should not happen in production).
      const notifId = data.id ?? Math.floor(Math.random() * 1_000_000_000);

      addNotification({
        id: notifId,
        type: data.type,
        title: data.message,
        body: data.message,
        data: data.data,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // Invalidate friend-request queries so the requests page updates live
      if (data.type === 'FRIEND_REQUEST') {
        qc.invalidateQueries({ queryKey: ['friend-requests', 'pending'] });
        qc.invalidateQueries({ queryKey: ['friend-requests', 'pending-count'] });
      }
      if (data.type === 'FRIEND_ACCEPTED') {
        qc.invalidateQueries({ queryKey: ['friends'] });
        qc.invalidateQueries({ queryKey: ['friend-requests', 'sent'] });
        qc.invalidateQueries({ queryKey: ['friend-requests', 'history'] });
      }
    });

    s.on('friend:request:updated', () => {
      qc.invalidateQueries({ queryKey: ['friend-requests'] });
      qc.invalidateQueries({ queryKey: ['friends'] });
    });

    // ── sharing:changed — a friend toggled their location sharing ─────
    // Re-fetch their location list so sharingLocation flag stays accurate
    s.on('sharing:changed', ({ userId: _uid }: { userId: number; sharing: boolean }) => {
      qc.invalidateQueries({ queryKey: ['friends'] });
      qc.invalidateQueries({ queryKey: ['friends-locations-initial'] });
    });

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('location:receive');
      s.off('group:location:receive');
      s.off('friend:online');
      s.off('friend:offline');
      s.off('notification');
      s.off('friend:request:updated');
      s.off('sharing:changed');
    };
  }, [isAuthenticated, token, updateFriendLocation, removeFriendLocation, addNotification, qc]);

  // Stable emit — wrapped in useCallback so the function reference stays the
  // same across re-renders, preventing unnecessary effect re-runs in consumers.
  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return (
    <SocketContext.Provider value={{ socket, emit }}>
      {children}
    </SocketContext.Provider>
  );
}
