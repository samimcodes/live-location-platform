'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Mic, Square, Trash2, Play, Pause,
  Check, CheckCheck, Loader2, Battery, BatteryCharging,
  Zap, Radio,
} from 'lucide-react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useAppSelector } from '@/store/store';
import { useLocationStore } from '@/store/useLocationStore';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

interface MapChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  friendId?: number;
  friendName?: string;
  friendAvatar?: string | null;
  groupId?: number;
  groupName?: string;
}

const QUICK_PINGS = [
  '🚗 On my way!',
  '🏠 Safe at home',
  '📍 Where are you?',
  '☕ Coffee break?',
  '⚠️ Call me now!',
];

export function MapChatDrawer({
  isOpen,
  onClose,
  friendId,
  friendName = 'Friend',
  friendAvatar,
  groupId,
  groupName,
}: MapChatDrawerProps) {
  const { user } = useAppSelector((s) => s.auth);
  const currentUserId = user?.id ?? 0;
  const { friendsLocations } = useLocationStore();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isTyping,
    sendTextMessage,
    sendQuickPing,
    sendVoiceNote,
    notifyTyping,
  } = useChat({
    friendId,
    groupId,
    enabled: isOpen,
  });

  const {
    isRecording,
    recordingDuration,
    isUploading,
    startRecording,
    stopRecording,
    cancelRecording,
    uploadVoiceNote,
  } = useVoiceRecorder();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Friend battery status if available
  const friendLoc = friendId ? friendsLocations.get(friendId) : undefined;
  const batteryLevel = friendLoc?.batteryLevel;
  const isCharging = friendLoc?.isCharging;

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;
    sendTextMessage(inputVal);
    setInputVal('');
    notifyTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    notifyTyping(e.target.value.length > 0);
  };

  const handleStopAndSendVoice = async () => {
    const blob = await stopRecording();
    if (!blob) return;
    const toastId = toast.info('Uploading voice note…');
    const audioUrl = await uploadVoiceNote(blob);
    if (audioUrl) {
      sendVoiceNote(audioUrl, recordingDuration);
      toast.dismiss(toastId);
    } else {
      toast.error('Failed to send voice note');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className={cn(
            'fixed sm:absolute top-0 right-0 bottom-0 z-40',
            'w-full sm:w-96 bg-card/95 backdrop-blur-2xl border-l border-border/80 shadow-2xl',
            'flex flex-col overflow-hidden'
          )}
        >
          {/* ── Header ────────────────────────────────────────────── */}
          <div className="shrink-0 px-4 py-3.5 border-b border-border/60 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-10 w-10 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 shadow-xs border border-primary/20">
                {friendAvatar ? (
                  <Image src={friendAvatar} alt={friendName} fill sizes="40px" className="object-cover" />
                ) : (
                  (groupName || friendName).charAt(0).toUpperCase()
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-chart-5 border-2 border-card" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-foreground truncate">
                    {groupName || friendName}
                  </h3>
                  {groupId && (
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                      Circle
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                  {batteryLevel != null && (
                    <div className="flex items-center gap-1">
                      {isCharging ? (
                        <BatteryCharging size={13} className="text-chart-5 animate-pulse" />
                      ) : (
                        <Battery
                          size={13}
                          className={cn(
                            batteryLevel <= 20
                              ? 'text-destructive'
                              : batteryLevel <= 50
                              ? 'text-chart-4'
                              : 'text-chart-5'
                          )}
                        />
                      )}
                      <span className="font-bold tabular-nums">{batteryLevel}%</span>
                    </div>
                  )}

                  {isTyping ? (
                    <span className="text-primary font-bold animate-pulse">Typing…</span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Radio size={9} className="text-chart-5 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Message Stream ────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground gap-2">
                <Loader2 size={18} className="animate-spin text-primary" />
                <span className="text-xs font-semibold">Connecting to chat…</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-inner">
                  <Zap size={22} />
                </div>
                <p className="text-sm font-bold text-foreground">Start the conversation</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Send a live message, quick ping, or voice note.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}
                  >
                    {!isMe && groupId && (
                      <span className="text-[10px] font-bold text-muted-foreground mb-1 ml-1">
                        {msg.sender?.name}
                      </span>
                    )}

                    <div
                      className={cn(
                        'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs',
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-xs'
                          : 'bg-muted/80 text-foreground border border-border/40 rounded-bl-xs',
                        msg.type === 'QUICK_PING' &&
                          (isMe
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 font-bold'
                            : 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border-primary/30 font-bold')
                      )}
                    >
                      {msg.type === 'VOICE' && msg.audioUrl ? (
                        <VoiceMessageBubble audioUrl={msg.audioUrl} duration={msg.audioDuration} isMe={isMe} />
                      ) : (
                        <p className="leading-relaxed break-words">{msg.content}</p>
                      )}

                      <div
                        className={cn(
                          'flex items-center justify-end gap-1 mt-1 text-[9px]',
                          isMe ? 'text-primary-foreground/75' : 'text-muted-foreground/75'
                        )}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && (
                          msg.isRead ? <CheckCheck size={11} className="text-cyan-300" /> : <Check size={11} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick Pings Carousel ──────────────────────────────── */}
          <div className="shrink-0 px-3 py-2 border-t border-border/40 bg-muted/20 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {QUICK_PINGS.map((ping) => (
              <button
                key={ping}
                type="button"
                onClick={() => sendQuickPing(ping)}
                className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-card border border-border/60 hover:border-primary/40 hover:bg-primary/10 text-foreground hover:text-primary transition-all active:scale-95 shadow-2xs"
              >
                {ping}
              </button>
            ))}
          </div>

          {/* ── Input & Voice Recorder Bar ────────────────────────── */}
          <div className="shrink-0 p-3 border-t border-border/60 bg-card">
            {isRecording ? (
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-destructive/10 border border-destructive/30 animate-pulse">
                <span className="h-3 w-3 rounded-full bg-destructive animate-ping" />
                <span className="text-xs font-bold text-destructive flex-1">
                  Recording… {Math.floor(recordingDuration / 60)}:
                  {String(recordingDuration % 60).padStart(2, '0')}
                </span>

                <button
                  type="button"
                  onClick={cancelRecording}
                  title="Cancel recording"
                  className="h-8 w-8 rounded-xl bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                >
                  <Trash2 size={15} />
                </button>

                <button
                  type="button"
                  onClick={handleStopAndSendVoice}
                  disabled={isUploading}
                  title="Send voice note"
                  className="h-8 px-3 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
                >
                  {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Square size={13} />}
                  <span>Send</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={handleInputChange}
                  placeholder={`Message ${friendName}…`}
                  className="flex-1 h-10 px-3.5 rounded-2xl bg-muted/50 border border-border/60 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/60 transition-all"
                />

                <button
                  type="button"
                  onClick={startRecording}
                  title="Record voice note"
                  className="h-10 w-10 rounded-2xl bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border/60 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <Mic size={17} />
                </button>

                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  title="Send message"
                  className="h-10 w-10 rounded-2xl bg-primary disabled:opacity-40 text-primary-foreground flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 shadow-md shadow-primary/20"
                >
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Voice Message Audio Bubble ──────────────────────────────────────────────
function VoiceMessageBubble({
  audioUrl,
  duration,
  isMe,
}: {
  audioUrl: string;
  duration?: number | null;
  isMe: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 min-w-[140px] py-0.5">
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
        preload="metadata"
      />

      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          'h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-90',
          isMe
            ? 'bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground'
            : 'bg-primary text-primary-foreground shadow-xs'
        )}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 h-3">
          {[40, 70, 90, 45, 80, 100, 60, 30, 75, 50].map((h, i) => (
            <span
              key={i}
              style={{ height: `${isPlaying ? h : 35}%` }}
              className={cn(
                'w-1 rounded-full transition-all duration-150',
                isMe ? 'bg-primary-foreground/70' : 'bg-primary/70'
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            'text-[10px] font-bold block mt-1',
            isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}
        >
          {duration ? `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}` : 'Voice note'}
        </span>
      </div>
    </div>
  );
}
