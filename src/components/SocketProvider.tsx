'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
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
  const socketRef = useRef<Socket | null>(null);
  const updateFriendLocation = useLocationStore((s) => s.updateFriendLocation);
  const removeFriendLocation = useLocationStore((s) => s.removeFriendLocation);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      socketRef.current = null;
      return;
    }

    const s = connectSocket(token);
    socketRef.current = s;

    // ── Location events ──────────────────────────────────────
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

    // ── Friend online/offline ────────────────────────────────
    s.on('friend:online', ({ userId }: { userId: number }) => {
      // Could update friend online status in a friends store
      console.log(`Friend ${userId} came online`);
    });

    s.on('friend:offline', ({ userId }: { userId: number }) => {
      removeFriendLocation(userId);
    });

    // ── Notifications ────────────────────────────────────────
    s.on('notification', (data: {
      type: string;
      message: string;
      data?: Record<string, unknown>;
    }) => {
      addNotification({
        id: Date.now(),
        type: data.type,
        title: data.message,
        body: data.message,
        data: data.data,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    return () => {
      s.off('location:receive');
      s.off('friend:online');
      s.off('friend:offline');
      s.off('notification');
    };
  }, [isAuthenticated, token, updateFriendLocation, removeFriendLocation, addNotification]);

  const emit = (event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, emit }}>
      {children}
    </SocketContext.Provider>
  );
}
