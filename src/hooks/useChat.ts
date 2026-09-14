'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocketContext } from '@/components/SocketProvider';
import { useAppSelector } from '@/store/store';
import { soundFx } from '@/lib/soundFx';
import api from '@/lib/axios';

export interface ChatSender {
  id: number;
  name: string;
  avatar?: string | null;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId?: number | null;
  groupId?: number | null;
  type: 'TEXT' | 'VOICE' | 'QUICK_PING';
  content?: string | null;
  audioUrl?: string | null;
  audioDuration?: number | null;
  mediaUrl?: string | null;
  duration?: number | null;
  isRead: boolean;
  createdAt: string;
  sender: ChatSender;
}

interface UseChatOptions {
  friendId?: number;
  groupId?: number;
  enabled?: boolean;
}

export function useChat({ friendId, groupId, enabled = true }: UseChatOptions) {
  const qc = useQueryClient();
  const { socket, emit } = useSocketContext();
  const { user } = useAppSelector((s) => s.auth);
  const currentUserId = user?.id ?? 0;

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const queryKey = useMemo(() => {
    return friendId
      ? ['chat', 'direct', friendId]
      : groupId
      ? ['chat', 'group', groupId]
      : ['chat', 'none'];
  }, [friendId, groupId]);

  // Fetch initial message history
  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<ChatMessage[]>({
    queryKey,
    queryFn: async () => {
      if (friendId) {
        const res = await api.get<{ success: boolean; data: ChatMessage[] }>(
          `/chat/direct/${friendId}`
        );
        return res.data?.data ?? [];
      } else if (groupId) {
        const res = await api.get<{ success: boolean; data: ChatMessage[] }>(
          `/chat/group/${groupId}`
        );
        return res.data?.data ?? [];
      }
      return [];
    },
    enabled: enabled && (!!friendId || !!groupId),
    staleTime: 1000 * 60, // 1 minute
  });

  // Socket listener for new messages & typing
  useEffect(() => {
    if (!socket || !enabled) return;

    const handleNewMessage = (msg: ChatMessage) => {
      const isRelevant =
        (friendId && (msg.senderId === friendId || (msg.senderId === currentUserId && msg.receiverId === friendId))) ||
        (groupId && msg.groupId === groupId);

      if (isRelevant) {
        qc.setQueryData<ChatMessage[]>(queryKey, (prev = []) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        if (msg.senderId !== currentUserId) {
          soundFx.playMessageReceived();
          // Mark as read immediately if chat is open
          emit('chat:read', { senderId: friendId, groupId });
        }
      }
    };

    const handleTyping = (data: { senderId: number; groupId?: number; isTyping: boolean }) => {
      if (
        (friendId && data.senderId === friendId) ||
        (groupId && data.groupId === groupId && data.senderId !== currentUserId)
      ) {
        setIsTyping(data.isTyping);
      }
    };

    const handleReadReceipt = ({ readByUserId }: { readByUserId: number }) => {
      if (friendId && readByUserId === friendId) {
        qc.setQueryData<ChatMessage[]>(queryKey, (prev = []) =>
          prev.map((m) => (m.senderId === currentUserId ? { ...m, isRead: true } : m))
        );
      }
    };

    socket.on('chat:message', handleNewMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:read_receipt', handleReadReceipt);

    return () => {
      socket.off('chat:message', handleNewMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:read_receipt', handleReadReceipt);
    };
  }, [socket, enabled, friendId, groupId, queryKey, qc, currentUserId, emit]);

  // Send text message
  const sendTextMessage = useCallback(
    (content: string) => {
      const text = content.trim();
      if (!text) return;

      emit('chat:send', {
        receiverId: friendId,
        groupId,
        content: text,
        type: 'TEXT',
      });
      soundFx.playMessageSent();
    },
    [emit, friendId, groupId]
  );

  // Send quick ping
  const sendQuickPing = useCallback(
    (pingText: string) => {
      emit('chat:send', {
        receiverId: friendId,
        groupId,
        content: pingText,
        type: 'QUICK_PING',
      });
      soundFx.playMessageSent();
    },
    [emit, friendId, groupId]
  );

  // Send voice note
  const sendVoiceNote = useCallback(
    (audioUrl: string, audioDuration?: number) => {
      emit('chat:send', {
        receiverId: friendId,
        groupId,
        content: '🎙️ Voice note',
        type: 'VOICE',
        audioUrl,
        audioDuration,
      });
      soundFx.playMessageSent();
    },
    [emit, friendId, groupId]
  );

  // Send typing status
  const notifyTyping = useCallback(
    (typing: boolean) => {
      emit('chat:typing', {
        receiverId: friendId,
        groupId,
        isTyping: typing,
      });

      if (typing) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          emit('chat:typing', {
            receiverId: friendId,
            groupId,
            isTyping: false,
          });
        }, 2500);
      }
    },
    [emit, friendId, groupId]
  );

  return {
    messages,
    isLoading,
    isError,
    isTyping,
    sendTextMessage,
    sendQuickPing,
    sendVoiceNote,
    notifyTyping,
    refetch,
  };
}
