'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  ArrowUp,
  Zap,
  ShieldCheck,
  Compass,
  Navigation,
  Loader2,
  Mic,
  MicOff,
  BatteryCharging,
  Route,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Headphones,
  Square,
  SquarePen,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { soundFx } from '@/lib/soundFx';
import { toast } from '@/lib/toast';
import type { LocationData } from '@/store/useLocationStore';
import type { Friend } from '@/hooks/useFriends';

interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  provider?: string;
  model?: string;
  audioBase64?: string | null;
  isStreaming?: boolean;
  action?: {
    type: 'FLY_TO' | 'ROUTE_TO';
    targetName: string;
    lat: number;
    lng: number;
    friendId?: number;
  } | null;
}

interface MapAICopilotProps {
  myLocation: LocationData | null;
  friendsLocations: LocationData[];
  friends: Friend[];
  onFlyToPerson?: (lat: number, lng: number) => void;
  onRouteToPerson?: (lat: number, lng: number, name: string) => void;
  onFocusFriend?: (friendId: number) => void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

type LiveVoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';
type SpeechLanguage = 'bn-BD' | 'en-US';

/** Beautiful Markdown & Typography Formatter */
function FormattedChatGPTResponse({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-2 leading-relaxed text-slate-100 text-[13px]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;

        // Bullet point
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const content = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
              <span className="text-slate-200">{renderBoldAndCode(content)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-cyan-300 font-mono font-medium shrink-0 mt-0.5">
                {numMatch[1]}.
              </span>
              <span className="text-slate-200">{renderBoldAndCode(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{renderBoldAndCode(trimmed)}</p>;
      })}
    </div>
  );
}

function renderBoldAndCode(str: string) {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const codeParts = part.split(/(`.*?`)/g);
    return codeParts.map((sub, j) => {
      if (sub.startsWith('`') && sub.endsWith('`')) {
        return (
          <code
            key={`${i}-${j}`}
            className="px-1.5 py-0.5 rounded-md bg-white/10 text-cyan-300 font-mono text-[12px] border border-cyan-500/20"
          >
            {sub.slice(1, -1)}
          </code>
        );
      }
      return sub;
    });
  });
}

export function MapAICopilot({
  myLocation,
  friendsLocations,
  friends,
  onFlyToPerson,
  onRouteToPerson,
  onFocusFriend,
}: MapAICopilotProps) {
  // Main Copilot drawer state
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  // Auto-open Copilot when triggered via global Navbar or URL query (?ai=1 or ?copilot=open)
  useEffect(() => {
    if (searchParams?.get('ai') === '1' || searchParams?.get('copilot') === 'open') {
      setIsOpen(true);
    }
  }, [searchParams]);

  // ChatGPT Voice Mode overlay state
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);

  // Input & Messaging states
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [likedMsgIds, setLikedMsgIds] = useState<Record<string, boolean>>({});

  // Voice recognition states
  const [liveVoiceStatus, setLiveVoiceStatus] = useState<LiveVoiceStatus>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveAiSpeechText, setLiveAiSpeechText] = useState('');
  const [voiceLang, setVoiceLang] = useState<SpeechLanguage>('bn-BD');

  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Tracking refs to avoid stale closures
  const isVoiceModeActiveRef = useRef(false);
  const liveVoiceStatusRef = useRef<LiveVoiceStatus>('idle');
  const currentTranscriptRef = useRef('');
  const voiceLangRef = useRef<SpeechLanguage>('bn-BD');
  const messagesRef = useRef<AIChatMessage[]>([]);

  useEffect(() => {
    isVoiceModeActiveRef.current = isVoiceModeOpen;
  }, [isVoiceModeOpen]);

  useEffect(() => {
    liveVoiceStatusRef.current = liveVoiceStatus;
  }, [liveVoiceStatus]);

  useEffect(() => {
    voiceLangRef.current = voiceLang;
    if (recognitionRef.current) {
      recognitionRef.current.lang = voiceLang;
    }
  }, [voiceLang]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && !isVoiceModeOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isVoiceModeOpen]);

  // Clean ChatGPT starter conversation
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: 'হ্যালো! আমি LocaLink AI Assistant।\n\nআপনি টাইপ করে যেকোনো কিছু জিজ্ঞাসা করতে পারেন, অথবা হেডফোন বাটনে চাপ দিয়ে সরাসরি মুখে কথা বলতে পারেন।',
      timestamp: 'এখন',
      provider: 'gemini',
      model: 'gemini-3.5-flash-lite',
    },
  ]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Compile real-time circle telemetry payload
  const getCircleTelemetry = useCallback(() => {
    return friends.map((f) => {
      const loc = friendsLocations.find((l) => l.userId === f.id);
      return {
        id: f.id,
        name: f.name,
        status: f.isOnline ? 'Online' : 'Offline',
        battery: loc?.batteryLevel ?? 85,
        speed: loc?.speed ?? 0,
        address: loc?.address || 'In transit',
        lat: loc?.latitude,
        lng: loc?.longitude,
      };
    });
  }, [friends, friendsLocations]);

  // Speech Recognition control
  const startSpeechListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      currentTranscriptRef.current = '';
      setLiveTranscript('');
      recognitionRef.current.lang = voiceLangRef.current;
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            if (isVoiceModeActiveRef.current) {
              recognitionRef.current.start();
            }
          } catch (e) {
            console.warn('Recognition start retry error:', e);
          }
        }, 120);
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  }, []);

  const stopSpeechListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, []);

  const handleCloseVoiceMode = useCallback(() => {
    soundFx?.playPop?.();
    setIsVoiceModeOpen(false);
    setLiveVoiceStatus('idle');
    stopSpeechListening();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [stopSpeechListening]);

  // Global Escape key UX handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isVoiceModeOpen) {
          handleCloseVoiceMode();
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVoiceModeOpen, isOpen, handleCloseVoiceMode]);

  // Fallback speech synthesis if audio stream is unavailable
  const playFallbackSpeech = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (isVoiceModeActiveRef.current) {
        setLiveVoiceStatus('listening');
        startSpeechListening();
      }
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_•]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const isBengali = /[\u0980-\u09FF]/.test(cleanText);
    utterance.lang = isBengali ? 'bn-BD' : 'en-US';
    utterance.rate = 1.0;

    utterance.onend = () => {
      setLiveAiSpeechText('');
      if (isVoiceModeActiveRef.current) {
        setLiveVoiceStatus('listening');
        setTimeout(() => {
          if (isVoiceModeActiveRef.current) {
            startSpeechListening();
          }
        }, 300);
      } else {
        setLiveVoiceStatus('idle');
      }
    };

    utterance.onerror = () => {
      if (isVoiceModeActiveRef.current) {
        setLiveVoiceStatus('listening');
        startSpeechListening();
      } else {
        setLiveVoiceStatus('idle');
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [startSpeechListening]);

  // Play official Google Neural Voice (MP3 Audio)
  const playAudioStream = useCallback((audioBase64: string | null, fallbackText: string) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setLiveVoiceStatus('speaking');
    setLiveAiSpeechText(fallbackText);

    if (audioBase64) {
      try {
        const audio = new Audio(audioBase64);
        currentAudioRef.current = audio;

        audio.onended = () => {
          currentAudioRef.current = null;
          setLiveAiSpeechText('');
          if (isVoiceModeActiveRef.current) {
            setLiveVoiceStatus('listening');
            setTimeout(() => {
              if (isVoiceModeActiveRef.current) {
                startSpeechListening();
              }
            }, 300);
          } else {
            setLiveVoiceStatus('idle');
          }
        };

        audio.onerror = () => {
          console.warn('Audio playback error, falling back');
          playFallbackSpeech(fallbackText);
        };

        audio.play().catch((err) => {
          console.warn('Audio play promise error:', err);
          playFallbackSpeech(fallbackText);
        });
        return;
      } catch (err) {
        console.warn('Audio constructor failed:', err);
      }
    }

    playFallbackSpeech(fallbackText);
  }, [startSpeechListening, playFallbackSpeech]);

  // Stop an active AI response stream
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
    setIsLoading(false);
  }, []);

  // Execute Query to Backend AI (Real-time SSE token streaming for ultra-low latency)
  const executeQuery = useCallback(
    async (userPrompt: string, shouldSpeakAloud = false) => {
      const q = userPrompt.trim();
      if (!q) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const userMsgId = 'user-' + Date.now();
      const userMsg: AIChatMessage = {
        id: userMsgId,
        role: 'user',
        text: q,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const historyPayload = messagesRef.current
        .filter((m) => m.id !== 'init-1' && m.id !== 'init-reset' && m.provider !== 'error')
        .slice(-6)
        .map((m) => ({ role: m.role, text: m.text }));

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      if (isVoiceModeActiveRef.current) {
        setLiveVoiceStatus('thinking');
        setLiveTranscript(q);
      }

      const circleData = getCircleTelemetry();
      const payload = {
        query: q,
        coords: myLocation
          ? { lat: myLocation.latitude, lng: myLocation.longitude }
          : undefined,
        locationName: myLocation?.address || 'Current Location',
        circleMembers: circleData,
        history: historyPayload,
      };

      const aiMsgId = 'ai-' + Date.now();
      let streamBubbleCreated = false;
      let streamedText = '';
      let finalAction: AIChatMessage['action'] = null;
      let finalProvider = 'gemini';
      let finalModel = 'gemini-3.5-flash-lite';

      const appendOrUpdateStreamBubble = (
        text: string,
        streaming: boolean,
        extras?: Partial<AIChatMessage>
      ) => {
        if (!streamBubbleCreated) {
          streamBubbleCreated = true;
          setMessages((prev) => [
            ...prev,
            {
              id: aiMsgId,
              role: 'assistant',
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              provider: extras?.provider ?? finalProvider,
              model: extras?.model ?? finalModel,
              action: extras?.action ?? finalAction,
              isStreaming: streaming,
            },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? {
                    ...m,
                    text,
                    isStreaming: streaming,
                    ...(extras ?? {}),
                  }
                : m
            )
          );
        }
      };

      try {
        const res = await fetch('/api/v1/ai/stream', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          const errMsg =
            errJson?.message ||
            'দুঃখিত, AI সার্ভার থেকে রেসপন্স পাওয়া যায়নি। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন।';
          appendOrUpdateStreamBubble(errMsg, false, { provider: 'error' });
          if (isVoiceModeActiveRef.current) {
            playAudioStream(null, errMsg);
          }
          return;
        }

        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('text/event-stream') && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() ?? '';

            for (const rawLine of lines) {
              const line = rawLine.trim();
              if (!line.startsWith('data:')) continue;
              const jsonStr = line.slice(5).trim();
              if (!jsonStr) continue;

              try {
                const evt = JSON.parse(jsonStr) as {
                  type?: 'chunk' | 'done' | 'error';
                  text?: string;
                  fullText?: string;
                  provider?: string;
                  model?: string;
                  action?: AIChatMessage['action'];
                  message?: string;
                };

                if (evt.type === 'chunk' && evt.text) {
                  streamedText += evt.text;
                  if (evt.model) finalModel = evt.model;
                  appendOrUpdateStreamBubble(streamedText, true);
                } else if (evt.type === 'done') {
                  const resolvedText =
                    evt.fullText?.trim() ||
                    streamedText.trim() ||
                    'টেলিমেট্রি স্ক্যান সম্পন্ন: সার্কেলের সকল অবস্থান সিঙ্কড রয়েছে।';
                  streamedText = resolvedText;
                  finalAction = evt.action ?? null;
                  finalProvider = evt.provider ?? finalProvider;
                  finalModel = evt.model ?? finalModel;
                  appendOrUpdateStreamBubble(resolvedText, false, {
                    action: finalAction,
                    provider: finalProvider,
                    model: finalModel,
                  });
                } else if (evt.type === 'error') {
                  const errMsg =
                    evt.message ||
                    'দুঃখিত, AI রেসপন্স প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
                  appendOrUpdateStreamBubble(errMsg, false, { provider: 'error' });
                }
              } catch {
                // Ignore partial SSE chunk boundaries
              }
            }
          }

          if (streamBubbleCreated) {
            appendOrUpdateStreamBubble(
              streamedText.trim() || 'টেলিমেট্রি স্ক্যান সম্পন্ন।',
              false,
              { action: finalAction, provider: finalProvider, model: finalModel }
            );
          }
        } else {
          // Fallback if response is plain JSON
          const json = await res.json();
          streamedText =
            json?.data?.response ||
            'টেলিমেট্রি স্ক্যান সম্পন্ন: সার্কেলের সকল অবস্থান সিঙ্কড রয়েছে।';
          finalAction = json?.data?.action || null;
          finalProvider = json?.provider || 'gemini';
          finalModel = json?.model || 'gemini-3.5-flash-lite';
          appendOrUpdateStreamBubble(streamedText, false, {
            action: finalAction,
            provider: finalProvider,
            model: finalModel,
            audioBase64: json?.data?.audioBase64 || null,
          });
        }

        if (streamedText) {
          soundFx?.playChime?.();

          if (finalAction && finalAction.lat && finalAction.lng) {
            if (finalAction.friendId && onFocusFriend) {
              onFocusFriend(finalAction.friendId);
            } else if (onFlyToPerson) {
              onFlyToPerson(finalAction.lat, finalAction.lng);
            }
          }

          if (shouldSpeakAloud || isVoiceModeActiveRef.current) {
            let voiceAudio: string | null = null;
            try {
              const ttsRes = await fetch('/api/v1/ai/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: streamedText,
                  lang: /[\u0980-\u09FF]/.test(streamedText) ? 'bn' : 'en',
                }),
              });
              if (ttsRes.ok) {
                const ttsJson = await ttsRes.json();
                voiceAudio = ttsJson?.audioBase64 || null;
              }
            } catch {}

            if (voiceAudio) {
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, audioBase64: voiceAudio } : m))
              );
            }
            playAudioStream(voiceAudio, streamedText);
          }
        }
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === 'AbortError') {
          if (streamBubbleCreated) {
            appendOrUpdateStreamBubble(streamedText || 'রেসপন্স থামানো হয়েছে।', false);
          }
          return;
        }
        console.error('AI Stream error:', err);
        const netErrMsg = 'দুঃখিত, সংযোগে সাময়িক সমস্যা হয়েছে। একটু পর আবার চেষ্টা করুন।';
        appendOrUpdateStreamBubble(netErrMsg, false, { provider: 'error' });
        if (isVoiceModeActiveRef.current) {
          playAudioStream(null, 'দুঃখিত, সংযোগে সাময়িক সমস্যা হয়েছে। আবার বলুন।');
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        setIsLoading(false);
      }
    },
    [myLocation, getCircleTelemetry, onFocusFriend, onFlyToPerson, playAudioStream]
  );

  // Initialize Speech Recognition on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as SpeechRecognitionWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRec) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = voiceLangRef.current;

        recognition.onstart = () => {
          if (isVoiceModeActiveRef.current) {
            setLiveVoiceStatus('listening');
          }
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            currentTranscriptRef.current = currentTranscript;
            setLiveTranscript(currentTranscript);
            setQuery(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event?.error);
          if (isVoiceModeActiveRef.current && event?.error !== 'aborted') {
            setTimeout(() => {
              if (isVoiceModeActiveRef.current && liveVoiceStatusRef.current === 'listening') {
                startSpeechListening();
              }
            }, 500);
          }
        };

        recognition.onend = () => {
          if (isVoiceModeActiveRef.current) {
            const spokenText = currentTranscriptRef.current.trim();
            if (spokenText && liveVoiceStatusRef.current === 'listening') {
              executeQuery(spokenText, true);
            } else if (liveVoiceStatusRef.current === 'listening') {
              setTimeout(() => {
                if (isVoiceModeActiveRef.current && liveVoiceStatusRef.current === 'listening') {
                  startSpeechListening();
                }
              }, 300);
            }
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Failed to initialize speech recognition:', err);
      }
    }
  }, [executeQuery, startSpeechListening]);

  // Auto scroll chat when messages update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Open & Close ChatGPT Voice Mode
  const handleOpenVoiceMode = () => {
    if (!speechSupported) {
      toast.info('আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট নেই। টাইপ করে চ্যাট করুন।');
      return;
    }
    soundFx?.playPop?.();
    setIsVoiceModeOpen(true);
    setLiveVoiceStatus('listening');
    setLiveTranscript('');
    setLiveAiSpeechText('');
    setTimeout(() => {
      startSpeechListening();
    }, 200);
  };

  const handleInterruptVoice = () => {
    soundFx?.playPop?.();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setLiveAiSpeechText('');
    setLiveVoiceStatus('listening');
    setTimeout(() => {
      startSpeechListening();
    }, 200);
  };

  // Play / Pause individual message audio
  const handleToggleSpeakMessage = async (msg: AIChatMessage) => {
    if (speakingMsgId === msg.id) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msg.id);

    if (msg.audioBase64) {
      const audio = new Audio(msg.audioBase64);
      currentAudioRef.current = audio;
      audio.onended = () => setSpeakingMsgId(null);
      audio.onerror = () => setSpeakingMsgId(null);
      audio.play().catch(() => setSpeakingMsgId(null));
      return;
    }

    try {
      const res = await fetch('/api/v1/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msg.text,
          lang: /[\u0980-\u09FF]/.test(msg.text) ? 'bn' : 'en',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(data.audioBase64);
          currentAudioRef.current = audio;
          audio.onended = () => setSpeakingMsgId(null);
          audio.onerror = () => setSpeakingMsgId(null);
          audio.play().catch(() => setSpeakingMsgId(null));
          return;
        }
      }
    } catch {}

    playFallbackSpeech(msg.text);
  };

  // Copy message text
  const handleCopyText = (msgId: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      toast.success('কপি করা হয়েছে');
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  // New Chat / Reset
  const handleNewChat = () => {
    soundFx?.playPop?.();
    handleStopGeneration();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setMessages([
      {
        id: 'init-reset',
        role: 'assistant',
        text: 'নতুন চ্যাট শুরু করা হয়েছে। আমাকে যেকোনো বিষয়ে প্রশ্ন করতে পারেন!',
        timestamp: 'এখন',
        provider: 'gemini',
        model: 'gemini-3.5-flash-lite',
      },
    ]);
  };

  return (
    <>
      {/* ── Floating ChatGPT Style Map Pill Button (Ultra-Premium Shimmering Glow) ── */}
      <div className="absolute top-[74px] sm:top-20 right-3 sm:right-4 z-30">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            soundFx?.playPop?.();
            setIsOpen(!isOpen);
          }}
          className="relative overflow-hidden flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-slate-950 via-indigo-950/90 to-slate-950 text-white border border-cyan-400/50 hover:border-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.4),0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all cursor-pointer group"
          aria-label="Toggle LocaLink AI Copilot"
        >
          {/* Sweeping Shimmer Light Beam */}
          <motion.span
            initial={{ x: '-150%' }}
            animate={{ x: '250%' }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', repeatDelay: 1.0 }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
          />

          <div className="relative h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(56,189,248,0.7)] group-hover:rotate-12 transition-transform">
            <Sparkles size={13} className="animate-pulse" />
          </div>

          <span className="relative text-xs font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            LocaLink AI
          </span>

          <span className="relative flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono text-[10px] font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
            </span>
            <span>Live</span>
          </span>
        </motion.button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MAIN CHATGPT PANEL (Ultra-Luxurious Obsidian Glass)
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-[118px] sm:top-32 right-3 sm:right-4 z-30 w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[430px] rounded-3xl bg-slate-950/90 border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-4 sm:p-5 text-white flex flex-col h-[530px] max-h-[calc(100dvh-8.5rem)] select-none font-sans overflow-hidden"
          >
            {/* Ambient Background Aura Glows */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header: ChatGPT Model Switcher & Clean Actions */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="relative overflow-hidden flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-cyan-400/50 hover:border-cyan-300 text-xs font-bold text-white transition-all cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.4),0_0_35px_rgba(139,92,246,0.25)] select-none group"
                >
                  {/* Sweeping Shimmer Light Beam */}
                  <motion.span
                    initial={{ x: '-150%' }}
                    animate={{ x: '250%' }}
                    transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', repeatDelay: 1.0 }}
                    className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
                  />

                  <div className="relative h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(56,189,248,0.7)] group-hover:rotate-12 transition-transform">
                    <Sparkles size={12} className="animate-pulse" />
                  </div>

                  <span className="relative text-xs font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                    LocaLink AI
                  </span>

                  <span className="relative flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono text-[10px] font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
                    </span>
                    <span>Live</span>
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {/* New Chat Button */}
                <button
                  type="button"
                  onClick={handleNewChat}
                  title="New chat"
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="New chat"
                >
                  <SquarePen size={16} />
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentAudioRef.current) {
                      currentAudioRef.current.pause();
                      currentAudioRef.current = null;
                    }
                    if (typeof window !== 'undefined' && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                    }
                    setSpeakingMsgId(null);
                    setIsOpen(false);
                  }}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Smart 1-Tap Prompt Chips (Vibrant Thematic Accents) */}
            <div className="relative z-10 flex items-center gap-2 py-2.5 border-b border-white/10 shrink-0 overflow-x-auto no-scrollbar scroll-smooth">
              <button
                type="button"
                onClick={() => executeQuery('আমার সবচেয়ে কাছে কে আছে?')}
                disabled={isLoading}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-[11px] font-semibold text-cyan-200 border border-cyan-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
              >
                <Compass size={12} className="text-cyan-400" />
                <span>কাছে কে আছে?</span>
              </button>

              <button
                type="button"
                onClick={() => executeQuery('সার্কেলের সবার ব্যাটারি ও ডিভাইস স্ট্যাটাস কেমন?')}
                disabled={isLoading}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] font-semibold text-emerald-200 border border-emerald-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
              >
                <BatteryCharging size={12} className="text-emerald-400" />
                <span>ব্যাটারি চেক</span>
              </button>

              <button
                type="button"
                onClick={() => executeQuery('সবাই কি নিরাপদ? কোনো ঝুঁকি বা অস্বাভাবিকতা আছে?')}
                disabled={isLoading}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-violet-500/10 hover:bg-violet-500/20 text-[11px] font-semibold text-violet-200 border border-violet-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
              >
                <ShieldCheck size={12} className="text-violet-400" />
                <span>নিরাপত্তা শিল্ড</span>
              </button>

              <button
                type="button"
                onClick={() => executeQuery('কার পৌঁছাতে আনুমানিক কতক্ষণ লাগবে এবং ট্র্যাফিক কেমন?')}
                disabled={isLoading}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-[11px] font-semibold text-amber-200 border border-amber-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
              >
                <Zap size={12} className="text-amber-400" />
                <span>ETA প্রেডিকশন</span>
              </button>
            </div>

            {/* Conversation Messages Stream (Clean Modern Prose) */}
            <div
              ref={chatScrollRef}
              className="relative z-10 flex-1 overflow-y-auto space-y-4 py-3.5 pr-1 text-[13px] select-text scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent min-h-[160px]"
            >
              {messages.map((m) => (
                <div key={m.id} className="space-y-1.5">
                  {m.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-3xl rounded-br-xs px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[13px] leading-relaxed break-words shadow-md shadow-violet-600/20 border border-violet-400/20">
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 pl-0.5">
                      <div className="h-7 w-7 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-violet-500/30">
                        <Sparkles size={13} />
                      </div>

                      <div className="flex-1 space-y-2 min-w-0">
                        {/* Formatted Text */}
                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-xs backdrop-blur-md">
                          <FormattedChatGPTResponse text={m.text} />
                          {m.isStreaming && (
                            <span className="inline-block ml-1.5 h-3.5 w-1.5 rounded-full bg-cyan-400 animate-pulse align-middle" />
                          )}
                        </div>

                        {/* Interactive map action pills */}
                        {m.action && (
                          <div className="pt-1 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                soundFx?.playPop?.();
                                if (m.action?.friendId && onFocusFriend) {
                                  onFocusFriend(m.action.friendId);
                                } else if (onFlyToPerson && m.action) {
                                  onFlyToPerson(m.action.lat, m.action.lng);
                                }
                              }}
                              className="flex items-center gap-1.5 h-6 px-3 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-[11px] font-bold text-emerald-300 border border-emerald-500/35 transition-all cursor-pointer active:scale-95 shadow-xs"
                            >
                              <Navigation size={10} />
                              <span>Focus {m.action.targetName}</span>
                            </button>

                            {onRouteToPerson && (
                              <button
                                type="button"
                                onClick={() => {
                                  soundFx?.playPop?.();
                                  if (m.action) {
                                    onRouteToPerson(
                                      m.action.lat,
                                      m.action.lng,
                                      m.action.targetName
                                    );
                                  }
                                }}
                                className="flex items-center gap-1.5 h-6 px-3 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-[11px] font-bold text-cyan-300 border border-cyan-500/35 transition-all cursor-pointer active:scale-95 shadow-xs"
                              >
                                <Route size={10} />
                                <span>Navigate</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* ChatGPT Action Buttons Bar */}
                        {!m.isStreaming && (
                          <div className="flex items-center gap-3 pt-0.5 text-slate-400">
                            <button
                              type="button"
                              onClick={() => handleToggleSpeakMessage(m)}
                              title={speakingMsgId === m.id ? 'Stop audio' : 'Read aloud'}
                              className={`hover:text-cyan-300 transition-colors cursor-pointer ${
                                speakingMsgId === m.id ? 'text-cyan-400 animate-pulse' : ''
                              }`}
                            >
                              {speakingMsgId === m.id ? (
                                <VolumeX size={13} />
                              ) : (
                                <Volume2 size={13} />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyText(m.id, m.text)}
                              title="Copy"
                              className="hover:text-cyan-300 transition-colors cursor-pointer"
                            >
                              {copiedMsgId === m.id ? (
                                <Check size={13} className="text-emerald-400" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                soundFx?.playPop?.();
                                setLikedMsgIds((prev) => ({ ...prev, [m.id]: !prev[m.id] }));
                              }}
                              title="Good response"
                              className={`hover:text-cyan-300 transition-colors cursor-pointer ${
                                likedMsgIds[m.id] ? 'text-cyan-400' : ''
                              }`}
                            >
                              <ThumbsUp size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && !messages.some((m) => m.isStreaming) && (
                <div className="flex items-center gap-2 pl-0.5 text-cyan-300 text-xs">
                  <div className="h-6 w-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0">
                    <Loader2 size={12} className="animate-spin" />
                  </div>
                  <span>LocaLink চিন্তা করছে...</span>
                </div>
              )}
            </div>

            {/* ── ChatGPT's Iconic Rounded Input Container ── */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isLoading && query.trim()) {
                  executeQuery(query);
                  setQuery('');
                }
              }}
              className="relative z-10 mt-2 rounded-[28px] bg-white/10 border border-white/20 focus-within:border-cyan-400/60 focus-within:bg-white/15 transition-all px-3 py-1.5 sm:py-2 flex items-center gap-2 shrink-0 shadow-inner backdrop-blur-md"
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask LocaLink anything..."
                className="bg-transparent border-none outline-hidden text-[13px] text-white placeholder:text-slate-400 w-full pl-2"
              />

              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  title="Stop response"
                  className="h-8 w-8 rounded-full bg-white/15 hover:bg-rose-500/30 border border-white/20 hover:border-rose-400/50 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                  aria-label="Stop response"
                >
                  <Square size={12} className="fill-white" />
                </button>
              ) : query.trim() ? (
                <button
                  type="submit"
                  className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center hover:brightness-110 transition-all cursor-pointer shrink-0 shadow-md shadow-violet-600/30 active:scale-95"
                  aria-label="Send message"
                >
                  <ArrowUp size={15} className="stroke-[2.5]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenVoiceMode}
                  title="Start Voice Mode"
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 border border-white/10"
                  aria-label="Start Voice Mode"
                >
                  <Headphones size={15} />
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          CHATGPT 4o VOICE MODE (Clean Pure White Orb & Transparent Background)
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isVoiceModeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCloseVoiceMode}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-3 sm:p-4 select-none font-sans"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[390px] sm:max-w-md h-[480px] max-h-[85dvh] rounded-3xl bg-slate-950/90 border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl p-5 sm:p-6 flex flex-col justify-between items-center text-center overflow-hidden"
            >
              {/* Header: Clean status & Language pill */}
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold tracking-tight text-white">
                    LocaLink AI Voice
                  </span>
                </div>

                {/* Language Toggle */}
                <div className="flex items-center bg-white/10 rounded-full p-0.5 border border-white/15 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceLang('bn-BD');
                      toast.success('বাংলা ভাষা সক্রিয়');
                    }}
                    className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      voiceLang === 'bn-BD'
                        ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    বাংলা
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceLang('en-US');
                      toast.success('English active');
                    }}
                    className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      voiceLang === 'en-US'
                        ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                </div>

                {/* Close to Chat */}
                <button
                  type="button"
                  onClick={handleCloseVoiceMode}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Exit Voice Mode"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Center: Clean White Fluid Orb (Pure, crisp, no blurry color aura) */}
              <div className="relative h-48 w-48 sm:h-52 sm:w-52 flex items-center justify-center my-auto">
                <motion.div
                  animate={{
                    scale:
                      liveVoiceStatus === 'speaking'
                        ? [1, 1.08, 0.98, 1.05, 1]
                        : liveVoiceStatus === 'listening'
                        ? [1, 1.04, 1]
                        : 1,
                    rotate: liveVoiceStatus === 'thinking' ? 360 : 0,
                  }}
                  transition={{
                    scale: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' },
                    rotate: { repeat: Infinity, duration: 4, ease: 'linear' },
                  }}
                  className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-white shadow-[0_0_35px_rgba(255,255,255,0.4)] flex items-center justify-center"
                >
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-900/10 flex items-center justify-center">
                    {liveVoiceStatus === 'thinking' ? (
                      <Loader2 size={22} className="text-slate-800 animate-spin" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-800/40 animate-ping" />
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Subtitle & State indicator */}
              <div className="w-full space-y-2 min-h-[56px] flex flex-col justify-center text-center px-2">
                <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                  {liveVoiceStatus === 'listening' && (voiceLang === 'bn-BD' ? 'শুনছি...' : 'Listening...')}
                  {liveVoiceStatus === 'thinking' && 'ভাবছি...'}
                  {liveVoiceStatus === 'speaking' && (voiceLang === 'bn-BD' ? 'কথা বলছি...' : 'Speaking...')}
                  {liveVoiceStatus === 'idle' && 'প্রস্তুত'}
                </span>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[13px] text-slate-100 leading-relaxed font-medium max-h-16 overflow-y-auto backdrop-blur-md">
                  {liveVoiceStatus === 'speaking' && liveAiSpeechText && (
                    <p className="text-cyan-300 font-semibold">{liveAiSpeechText}</p>
                  )}
                  {liveVoiceStatus !== 'speaking' && (
                    <p className="text-slate-300 italic">
                      {liveTranscript || (voiceLang === 'bn-BD' ? 'স্বাভাবিকভাবে কথা বলুন...' : 'Speak naturally...')}
                    </p>
                  )}
                </div>
              </div>

              {/* ChatGPT Circular Bottom Control Bar */}
              <div className="w-full flex items-center justify-center gap-4 pt-1">
                {/* Mute / Unmute */}
                <button
                  type="button"
                  onClick={() => {
                    if (liveVoiceStatus === 'listening') {
                      stopSpeechListening();
                      setLiveVoiceStatus('idle');
                    } else {
                      setLiveVoiceStatus('listening');
                      startSpeechListening();
                    }
                  }}
                  className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95 border border-white/10"
                  aria-label="Mute mic"
                >
                  {liveVoiceStatus === 'listening' ? <Mic size={18} /> : <MicOff size={18} />}
                </button>

                {/* Large Center Interrupt / Action Button */}
                {liveVoiceStatus === 'speaking' ? (
                  <button
                    type="button"
                    onClick={handleInterruptVoice}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-red-500 to-rose-600 hover:brightness-110 text-white flex items-center justify-center shadow-lg shadow-red-500/40 transition-transform active:scale-95 cursor-pointer"
                    aria-label="Interrupt"
                  >
                    <Square size={18} className="fill-white" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCloseVoiceMode}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white text-slate-950 hover:bg-slate-200 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer font-bold"
                    aria-label="Close voice mode"
                  >
                    <X size={20} className="stroke-[2.5]" />
                  </button>
                )}

                {/* Back to Chat icon */}
                <button
                  type="button"
                  onClick={handleCloseVoiceMode}
                  title="Switch to chat view"
                  className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95 border border-white/10"
                  aria-label="Chat view"
                >
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
