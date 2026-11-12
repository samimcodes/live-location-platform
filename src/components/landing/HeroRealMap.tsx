'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MAP_STYLES, MapThemeStyle } from '@/lib/mapUtils';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Minus,
  Sparkles,
  X,
  ArrowRight,
  VolumeX,
  Loader2,
  Mic,
  Battery,
  MapPin,
  Crosshair,
  Radio,
} from 'lucide-react';
import { soundFx } from '@/lib/soundFx';
import { useAuth } from '@/hooks/useAuth';
import type { Map as MglMap, Marker as MglMarker } from 'maplibre-gl';

// Fallback coordinate if GPS is blocked
const DEFAULT_COORDS: [number, number] = [90.3994, 23.7771]; // Dhaka Center

interface TelemetryState {
  coords: [number, number] | null;
  locationName: string;
  accuracy: number | null;
  speed: number | null;
  batteryLevel: number | null;
  isCharging: boolean | null;
  isGpsLocked: boolean;
}

const PROMPT_SUGGESTIONS = [
  "Ask: 'Where am I right now?'",
  "Ask: 'Check my live battery & GPS accuracy'",
  "Ask: 'Is my current location secure?'",
  "Ask: 'What are the nearest landmarks around me?'",
];

function formatSuggestionPrompt(raw: string): string {
  return raw.replace(/^Ask:\s*'/, '').replace(/'$/, '').trim();
}

export function HeroRealMap() {
  const { isAuthenticated } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MglMap | null>(null);
  const userMarkerRef = useRef<MglMarker | null>(null);
  const mapInitializedRef = useRef(false);

  const [mapStyle, setMapStyle] = useState<MapThemeStyle>('satellite');
  const [isLoaded, setIsLoaded] = useState(false);

  // Real Live Telemetry
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    coords: null,
    locationName: 'Detecting live location...',
    accuracy: null,
    speed: null,
    batteryLevel: null,
    isCharging: null,
    isGpsLocked: false,
  });

  // Spotlight Command Bar State
  const [inputValue, setInputValue] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [isTypingForward, setIsTypingForward] = useState(true);

  // AI Response HUD State
  const [aiThinking, setAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showResponseHud, setShowResponseHud] = useState(false);
  const aiAbortRef = useRef<AbortController | null>(null);

  // Audio & Voice State
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<{
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
    abort?: () => void;
  } | null>(null);
  const onVoiceTranscriptRef = useRef<((text: string) => void) | null>(null);

  // ─── Real Device Battery Telemetry (with cleanup) ───────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    let cleanupBattery: (() => void) | undefined;

    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{
        level: number;
        charging: boolean;
        addEventListener: (type: string, listener: () => void) => void;
        removeEventListener: (type: string, listener: () => void) => void;
      }>;
    };

    if (nav.getBattery) {
      nav
        .getBattery()
        .then((battery) => {
          if (cancelled) return;
          const updateBattery = () => {
            if (cancelled) return;
            setTelemetry((prev) => ({
              ...prev,
              batteryLevel: Math.round(battery.level * 100),
              isCharging: battery.charging,
            }));
          };
          updateBattery();
          battery.addEventListener('levelchange', updateBattery);
          battery.addEventListener('chargingchange', updateBattery);
          cleanupBattery = () => {
            battery.removeEventListener('levelchange', updateBattery);
            battery.removeEventListener('chargingchange', updateBattery);
          };
        })
        .catch(() => {
          // Battery API unsupported or blocked -> keep null instead of faking percentage
        });
    }

    return () => {
      cancelled = true;
      cleanupBattery?.();
    };
  }, []);

  // ─── Smooth Animated Typewriter Placeholder ─────────────────
  useEffect(() => {
    const fullText = PROMPT_SUGGESTIONS[placeholderIndex];
    let timeout: NodeJS.Timeout;

    if (isTypingForward) {
      if (typedPlaceholder.length < fullText.length) {
        timeout = setTimeout(() => {
          setTypedPlaceholder(fullText.slice(0, typedPlaceholder.length + 1));
        }, 45);
      } else {
        timeout = setTimeout(() => {
          setIsTypingForward(false);
        }, 2600);
      }
    } else {
      if (typedPlaceholder.length > 0) {
        timeout = setTimeout(() => {
          setTypedPlaceholder(typedPlaceholder.slice(0, -1));
        }, 20);
      } else {
        setIsTypingForward(true);
        setPlaceholderIndex((prev) => (prev + 1) % PROMPT_SUGGESTIONS.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [typedPlaceholder, isTypingForward, placeholderIndex]);

  // ─── Audio Helpers ──────────────────────────────────────────
  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsPlayingAudio(false);
  }, []);

  // ─── Speech Recognition Setup ───────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as {
      SpeechRecognition?: new () => NonNullable<typeof recognitionRef.current>;
      webkitSpeechRecognition?: new () => NonNullable<typeof recognitionRef.current>;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => setIsListening(true);
        rec.onresult = (event) => {
          setIsListening(false);
          const transcript = event.results?.[0]?.[0]?.transcript;
          if (transcript) {
            setInputValue(transcript);
            onVoiceTranscriptRef.current?.(transcript);
          }
        };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
      } catch {
        // SpeechRecognition unavailable
      }
    }

    return () => {
      try {
        recognitionRef.current?.abort?.();
      } catch {
        // ignore
      }
      stopAudio();
      aiAbortRef.current?.abort();
    };
  }, [stopAudio]);

  const toggleVoiceListening = () => {
    soundFx?.playPop?.();
    stopAudio();

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      return;
    }

    if (recognitionRef.current) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  // ─── Reverse Geocoding (Real Address from Nominatim) ─────────
  const fetchAddressName = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`
      );
      if (res.ok) {
        const data = await res.json();
        const address = data.address;
        const name =
          address?.suburb ||
          address?.neighbourhood ||
          address?.residential ||
          address?.city ||
          address?.town ||
          data.display_name?.split(',')[0];
        if (name) {
          const fullPlace = address?.city && name !== address.city ? `${name}, ${address.city}` : name;
          setTelemetry((prev) => ({ ...prev, locationName: fullPlace }));
          return;
        }
      }
    } catch {
      // ignore network failure
    }
    setTelemetry((prev) => ({
      ...prev,
      locationName: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
    }));
  }, []);

  // ─── Real GPS Tracker ────────────────────────────────────────
  const locateUser = useCallback(
    (zoomLevel = 15.6) => {
      if (typeof window === 'undefined' || !('geolocation' in navigator)) {
        setTelemetry((prev) => ({
          ...prev,
          coords: DEFAULT_COORDS,
          locationName: 'Dhaka Metropolitan • Demo Radar',
          isGpsLocked: false,
        }));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lng = pos.coords.longitude;
          const lat = pos.coords.latitude;
          const coords: [number, number] = [lng, lat];
          const accuracy = Math.round(pos.coords.accuracy);
          const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;

          setTelemetry((prev) => ({
            ...prev,
            coords,
            accuracy,
            speed,
            isGpsLocked: true,
          }));

          fetchAddressName(lat, lng);

          if (mapRef.current) {
            mapRef.current.flyTo({
              center: coords,
              zoom: zoomLevel,
              pitch: 32,
              speed: 1.2,
              essential: true,
            });

            if (userMarkerRef.current) {
              userMarkerRef.current.setLngLat(coords);
            }
          }
        },
        () => {
          // Geolocation denied or unavailable -> fallback gracefully
          setTelemetry((prev) => ({
            ...prev,
            coords: DEFAULT_COORDS,
            locationName: 'Dhaka Metropolitan • Demo Radar',
            isGpsLocked: false,
          }));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    },
    [fetchAddressName]
  );

  const initialCoordsRef = useRef<[number, number]>(DEFAULT_COORDS);
  const executeSpatialQueryRef = useRef<((queryText: string) => void) | null>(null);

  // Sync marker position when coords update
  useEffect(() => {
    if (telemetry.coords) {
      initialCoordsRef.current = telemetry.coords;
      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat(telemetry.coords);
      }
    }
  }, [telemetry.coords]);

  // ─── Initialize MapLibre Once (Preserves Camera Across Style Switches) ──
  useEffect(() => {
    if (!containerRef.current) return;
    let isCancelled = false;

    import('maplibre-gl').then((mgl) => {
      if (isCancelled || !containerRef.current) return;

      const initialStyleConfig = MAP_STYLES.satellite.style;
      const initialCenter = initialCoordsRef.current;

      const map = new mgl.Map({
        container: containerRef.current,
        style: initialStyleConfig as unknown as string,
        center: initialCenter,
        zoom: 14.8,
        pitch: 28,
        bearing: -6,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on('load', () => {
        if (isCancelled) return;
        mapInitializedRef.current = true;
        setIsLoaded(true);

        const activeCenter = initialCoordsRef.current;

        // Visitor's Live Marker
        const youEl = document.createElement('div');
        youEl.className =
          'flex flex-col items-center cursor-pointer select-none z-30 group transition-transform hover:scale-110 active:scale-95';
        youEl.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="absolute h-12 w-12 rounded-full bg-cyan-400/35 animate-ping pointer-events-none"></span>
            <span class="absolute h-8 w-8 rounded-full bg-cyan-400/25 border border-cyan-400/60"></span>
            <div class="h-4 w-4 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_#06B6D4]"></div>
          </div>
          <div class="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/90 text-[11px] font-bold text-cyan-300 border border-cyan-400/40 shadow-lg backdrop-blur-md flex items-center gap-1.5 hover:border-cyan-400 transition-colors">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>You (Live GPS)</span>
          </div>
        `;
        youEl.onclick = () => {
          soundFx?.playPop?.();
          executeSpatialQueryRef.current?.('Where am I right now and is my location safe?');
        };
        const userMarker = new mgl.Marker({ element: youEl })
          .setLngLat(activeCenter)
          .addTo(map);
        userMarkerRef.current = userMarker;
      });
    });

    return () => {
      isCancelled = true;
      mapInitializedRef.current = false;
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Switch style seamlessly without tearing down map or resetting camera
  useEffect(() => {
    if (!mapRef.current || !mapInitializedRef.current) return;
    const nextStyle = MAP_STYLES[mapStyle]?.style || MAP_STYLES.satellite.style;
    mapRef.current.setStyle(nextStyle as unknown as string);
  }, [mapStyle]);

  useEffect(() => {
    locateUser(15.2);
  }, [locateUser]);

  // ─── Execute Fast Streaming AI Query with Real Context ───────
  const executeSpatialQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    soundFx?.playPop?.();
    aiAbortRef.current?.abort();
    const controller = new AbortController();
    aiAbortRef.current = controller;

    setAiThinking(true);
    setAiResponse('');
    setShowResponseHud(true);
    stopAudio();

    const activeCenter = telemetry.coords || DEFAULT_COORDS;

    mapRef.current?.flyTo({
      center: activeCenter,
      zoom: 16.2,
      pitch: 36,
      speed: 1.2,
      essential: true,
    });

    const buildOfflineSummary = () => {
      const accuracyText =
        telemetry.accuracy !== null ? `±${telemetry.accuracy}m GPS precision` : 'Demo radar mode';
      const batteryText =
        telemetry.batteryLevel !== null ? `Device battery at ${telemetry.batteryLevel}%` : 'Telemetry active';
      return `${telemetry.locationName} (${accuracyText}). ${batteryText}.`;
    };

    try {
      const res = await fetch('/api/v1/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          query: q,
          coords: { lat: activeCenter[1], lng: activeCenter[0] },
          locationName: telemetry.locationName,
          circleMembers: [
            {
              name: 'You (Current Device)',
              status: telemetry.isGpsLocked ? 'Online' : 'Standby',
              address: telemetry.locationName,
              battery: telemetry.batteryLevel ?? undefined,
              speed: telemetry.speed ?? 0,
              lat: activeCenter[1],
              lng: activeCenter[0],
            },
          ],
        }),
      });

      if (!res.ok) {
        setAiResponse(buildOfflineSummary());
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream') || !res.body) {
        const json = await res.json().catch(() => null);
        const text = json?.data?.response || json?.fullText || json?.message;
        setAiResponse(text || buildOfflineSummary());
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      const processLine = (rawLine: string) => {
        const line = rawLine.trim();
        if (!line.startsWith('data:')) return;
        const jsonStr = line.slice(5).trim();
        if (!jsonStr) return;

        try {
          const evt = JSON.parse(jsonStr) as {
            type?: 'chunk' | 'done' | 'error';
            text?: string;
            fullText?: string;
            message?: string;
          };

          if (evt.type === 'chunk' && typeof evt.text === 'string') {
            accumulated += evt.text;
            setAiThinking(false);
            setAiResponse(accumulated);
          } else if (evt.type === 'done' && typeof evt.fullText === 'string') {
            accumulated = evt.fullText.trim() || accumulated;
            setAiThinking(false);
            setAiResponse(accumulated);
          } else if (evt.type === 'error') {
            setAiThinking(false);
            setAiResponse(evt.message || buildOfflineSummary());
          }
        } catch {
          // Ignore partial SSE chunk boundaries
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          processLine(line);
        }
      }

      if (buffer.trim()) {
        processLine(buffer);
      }

      if (!accumulated) {
        setAiResponse(buildOfflineSummary());
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setAiResponse(buildOfflineSummary());
    } finally {
      if (aiAbortRef.current === controller) {
        setAiThinking(false);
      }
    }
  };

  useEffect(() => {
    executeSpatialQueryRef.current = executeSpatialQuery;
    onVoiceTranscriptRef.current = executeSpatialQuery;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim() || formatSuggestionPrompt(PROMPT_SUGGESTIONS[placeholderIndex]);
    executeSpatialQuery(query);
  };

  const centerOnUser = () => {
    soundFx?.playPop?.();
    locateUser(16.0);
  };

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center pt-24 sm:pt-28 pb-24 sm:pb-16 select-none bg-[#F8FAFF] dark:bg-[#070B16] transition-colors duration-500"
    >
      {/* ════════════════════════════════════════════════════
          1. FULL-BLEED REAL SATELLITE CANVAS (Background)
      ════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F8FAFF] dark:bg-[#070B16] text-slate-800 dark:text-white z-10 gap-3">
            <div className="h-7 w-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 tracking-wider">
              CONNECTING SATELLITE RADAR...
            </span>
          </div>
        )}

        {/* Central atmospheric readability veil + top/bottom edge fades */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(248,250,255,0.88)_0%,rgba(248,250,255,0.68)_42%,rgba(248,250,255,0.18)_78%,transparent_100%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(7,11,22,0.82)_0%,rgba(7,11,22,0.56)_44%,rgba(7,11,22,0.18)_80%,transparent_100%)] pointer-events-none transition-colors duration-500" />
        <div className="absolute top-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-b from-[#F8FAFF]/90 via-[#F8FAFF]/45 to-transparent dark:from-[#070B16]/90 dark:via-[#070B16]/45 dark:to-transparent pointer-events-none transition-colors duration-500" />
        <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-t from-[#F8FAFF] via-[#F8FAFF]/75 to-transparent dark:from-[#070B16] dark:via-[#070B16]/75 dark:to-transparent pointer-events-none transition-colors duration-500" />
      </div>

      {/* ════════════════════════════════════════════════════
          2. COHESIVE CENTERPIECE: HEADLINE, CTA & SPOTLIGHT
      ════════════════════════════════════════════════════ */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center space-y-5 sm:space-y-6 w-full my-auto">
        {/* Clean Executive Status Badge */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex max-w-full items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/85 dark:bg-slate-950/85 border border-slate-200/90 dark:border-white/[0.12] backdrop-blur-xl shadow-sm select-none"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight truncate">
              LocaLink 2.0 • Autonomous Spatial Intelligence
            </span>
          </motion.div>
        </div>

        {/* Razor-Sharp Clean Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl min-[400px]:text-4xl sm:text-6xl md:text-7xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.06] sm:leading-[1.04]"
        >
          Real-Time Family Presence.{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-indigo-400 dark:via-violet-300 dark:to-cyan-300 bg-clip-text text-transparent">
            Powered by Spatial AI.
          </span>
        </motion.h1>

        {/* Crisp Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm sm:text-base md:text-lg text-slate-700 dark:text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto"
        >
          Sub-meter live GPS tracking, automated safe zone geofences, and natural voice intelligence designed for modern families.
        </motion.p>

        {/* Primary Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center justify-center pt-1"
        >
          <Button
            size="lg"
            className="h-11 sm:h-12 px-7 sm:px-8 font-semibold text-sm sm:text-base rounded-full bg-gradient-to-b from-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_8px_24px_rgba(99,102,241,0.32),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer gap-2"
            onClick={() => soundFx?.playPop?.()}
            asChild
          >
            <Link href={isAuthenticated ? '/dashboard' : '/register'}>
              <span>{isAuthenticated ? 'Open Dashboard' : 'Start Free with AI'}</span>
              <ArrowRight size={16} />
            </Link>
          </Button>
        </motion.div>

        {/* ════════════════════════════════════════════════════
            3. SPOTLIGHT COMMAND PALETTE & LIVE TELEMETRY
        ════════════════════════════════════════════════════ */}
        <div className="max-w-2xl mx-auto w-full space-y-3 pt-2">
          {/* Floating Omnibar Capsule */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="relative rounded-full bg-slate-950/92 border border-white/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(15,23,42,0.28)] p-1.5 sm:p-2 transition-all duration-300 focus-within:border-indigo-400/70 focus-within:ring-2 focus-within:ring-indigo-400/25"
          >
            <form onSubmit={handleFormSubmit} className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-300 shrink-0">
                <Sparkles size={15} />
              </div>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={typedPlaceholder || "Ask: 'Where am I right now?'"}
                aria-label="Ask LocaLink Spatial AI"
                className="flex-1 min-w-0 h-9 sm:h-10 bg-transparent px-1.5 sm:px-2 text-xs sm:text-sm font-medium text-white placeholder:text-slate-400 focus:outline-none"
              />

              {inputValue && (
                <button
                  type="button"
                  onClick={() => setInputValue('')}
                  aria-label="Clear prompt"
                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}

              <button
                type="button"
                onClick={toggleVoiceListening}
                aria-label={isListening ? 'Stop voice input' : 'Speak to AI'}
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-md shadow-rose-500/50'
                    : 'bg-white/10 hover:bg-white/20 text-cyan-300 border-white/10'
                }`}
                title="Speak to AI"
              >
                <Mic size={15} />
              </button>

              <button
                type="submit"
                disabled={aiThinking}
                className="h-9 px-3.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-75"
              >
                {aiThinking ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <span className="hidden min-[380px]:inline">Ask</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Live Telemetry Status Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-2 select-none"
          >
            {/* Location Pill */}
            <button
              type="button"
              onClick={() => {
                centerOnUser();
                executeSpatialQuery('Where am I right now and what area is around me?');
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/88 dark:bg-slate-950/88 border border-white/12 text-[11px] font-semibold text-slate-200 backdrop-blur-md hover:border-cyan-400/50 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <MapPin size={12} className="text-cyan-400 shrink-0" />
              <span className="truncate max-w-[180px]">{telemetry.locationName}</span>
            </button>

            {/* Battery Pill (Honest telemetry: avoids fake percentage on unsupported browsers) */}
            <button
              type="button"
              onClick={() => executeSpatialQuery('Summarize my device battery and power telemetry.')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/88 dark:bg-slate-950/88 border border-white/12 text-[11px] font-semibold text-slate-200 backdrop-blur-md hover:border-emerald-400/50 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Battery size={12} className="text-emerald-400 shrink-0" />
              <span>
                {telemetry.batteryLevel !== null
                  ? `${telemetry.batteryLevel}%${telemetry.isCharging ? ' (Charging)' : ' • Healthy'}`
                  : 'Device Online'}
              </span>
            </button>

            {/* GPS Precision Pill */}
            <button
              type="button"
              onClick={() => {
                centerOnUser();
                executeSpatialQuery('Check my current GPS lock status and accuracy.');
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/88 dark:bg-slate-950/88 border border-white/12 text-[11px] font-semibold text-slate-200 backdrop-blur-md hover:border-violet-400/50 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Crosshair size={12} className="text-violet-400 shrink-0" />
              <span>
                {telemetry.accuracy !== null ? `±${telemetry.accuracy}m Accuracy` : 'GPS Ready'}
              </span>
            </button>

            {/* Speed Pill */}
            <button
              type="button"
              onClick={() => executeSpatialQuery('What is my current speed and movement status?')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/88 dark:bg-slate-950/88 border border-white/12 text-[11px] font-semibold text-slate-300 backdrop-blur-md hover:border-cyan-400/50 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Radio size={12} className="text-cyan-400 shrink-0 animate-pulse" />
              <span>{telemetry.speed ? `${telemetry.speed} km/h` : 'Stationary (0 km/h)'}</span>
            </button>
          </motion.div>

          {/* ─── Interactive AI Telemetry HUD (Dismissible & Copyable) ─────── */}
          <AnimatePresence>
            {showResponseHud && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl bg-slate-950/95 border border-indigo-400/35 backdrop-blur-2xl p-3.5 shadow-2xl text-left space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold font-mono border border-indigo-400/30">
                      <Sparkles size={10} className={aiThinking ? 'animate-spin' : ''} />
                      <span>LocaLink Spatial AI</span>
                    </span>

                    {isPlayingAudio && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 font-mono">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Voice Speaking
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPlayingAudio && (
                      <button
                        type="button"
                        onClick={stopAudio}
                        className="p-1 rounded-lg bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Stop audio"
                      >
                        <VolumeX size={13} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        aiAbortRef.current?.abort();
                        setShowResponseHud(false);
                        stopAudio();
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Close"
                      aria-label="Close AI response"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed select-text">
                  {aiThinking && !aiResponse ? (
                    <span className="text-indigo-300 font-mono animate-pulse">
                      Streaming spatial telemetry analysis...
                    </span>
                  ) : (
                    aiResponse
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          4. MINIMALIST FLOATING MAP CONTROLS (Bottom Right)
      ════════════════════════════════════════════════════ */}
      <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-20 flex items-center gap-1 bg-slate-900/90 dark:bg-slate-950/90 border border-white/15 rounded-full p-1 backdrop-blur-xl shadow-lg">
        <button
          type="button"
          onClick={() => {
            soundFx?.playPop?.();
            setMapStyle((prev) => (prev === 'satellite' ? 'street' : 'satellite'));
          }}
          className="px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
        >
          {mapStyle === 'satellite' ? 'Street' : 'Satellite'}
        </button>

        <span className="h-3 w-px bg-white/20" />

        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Zoom in"
          className="p-1 rounded-full text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Plus size={13} />
        </button>

        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Zoom out"
          className="p-1 rounded-full text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Minus size={13} />
        </button>

        <button
          type="button"
          onClick={centerOnUser}
          aria-label="Locate Me"
          title="Center on my location"
          className="p-1 rounded-full text-cyan-400 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Crosshair size={13} />
        </button>
      </div>
    </section>
  );
}
