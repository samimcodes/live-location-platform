'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  EyeOff,
  Eye,
  Battery,
  Zap,
  CheckCircle2,
  Wifi,
  Sparkles,
  Navigation,
  Copy,
  Check,
  ArrowRight,
  Mic,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { useLocationStore } from '@/store/useLocationStore';
import { cn } from '@/lib/utils';

const initialFriends = [
  {
    id: 1,
    name: 'Emma (Mom)',
    status: 'Safe at Home',
    distance: '1.2 km away',
    battery: '94%',
    charging: true,
    online: true,
    activity: 'home',
    speed: '0 km/h',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    color: 'bg-emerald-500',
  },
  {
    id: 2,
    name: 'Robert (Dad)',
    status: 'Driving to Banani',
    distance: '8.4 km away',
    battery: '86%',
    charging: false,
    online: true,
    activity: 'driving',
    speed: '48 km/h',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    color: 'bg-indigo-500',
  },
  {
    id: 3,
    name: 'Ayaan (Son)',
    status: 'Inside School Campus',
    distance: '4.1 km away',
    battery: '89%',
    charging: false,
    online: true,
    activity: 'school',
    speed: '0 km/h',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    color: 'bg-amber-500',
  },
  {
    id: 4,
    name: 'Sarah (Sister)',
    status: 'Offline (Ghost Mode Active)',
    distance: 'Location Hidden',
    battery: '74%',
    charging: true,
    online: false,
    activity: 'ghost',
    speed: 'Hidden',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    color: 'bg-slate-400',
  },
];

export function FriendsRealtimeSection() {
  const [friends, setFriends] = useState(initialFriends);
  const [ghostOverrides, setGhostOverrides] = useState<Record<number, boolean>>({});
  const [checkedIn, setCheckedIn] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sentPing, setSentPing] = useState<{ id: number; name: string } | null>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scheduleTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  useEffect(() => {
    const activeTimers = timersRef.current;
    return () => {
      activeTimers.forEach(clearTimeout);
    };
  }, []);

  const { isAuthenticated } = useAuth();
  const { data: realFriends = [] } = useFriends();
  const { friendsLocations } = useLocationStore();

  const shareOrigin = React.useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => ''
  );

  const isRealCircle = isAuthenticated && realFriends.length > 0;

  const displayFriends = useMemo(() => {
    if (isRealCircle) {
      return realFriends.slice(0, 4).map((f) => {
        const loc = friendsLocations.get(f.id);
        const hasBat = loc?.batteryLevel != null;
        const effectiveOnline = ghostOverrides[f.id] ?? f.isOnline;
        return {
          id: f.id,
          name: f.name,
          status: !effectiveOnline
            ? 'Paused (Ghost Preview)'
            : loc?.city
              ? `In ${loc.city}`
              : 'Online • In Circle',
          distance: !effectiveOnline
            ? 'Location Hidden'
            : loc?.city
              ? loc.city
              : 'Sharing Live GPS',
          battery: hasBat ? `${loc!.batteryLevel}%` : '--',
          charging: loc?.isCharging ?? false,
          online: effectiveOnline,
          activity: effectiveOnline && loc?.speed && loc.speed > 2 ? 'driving' : 'home',
          speed: loc?.speed ? `${Math.round(loc.speed * 3.6)} km/h` : '0 km/h',
          avatar: f.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          color: effectiveOnline ? 'bg-emerald-500' : 'bg-slate-400',
        };
      });
    }
    return friends;
  }, [isRealCircle, realFriends, friendsLocations, friends, ghostOverrides]);

  const triggerCheckIn = () => {
    soundFx?.playChime?.();
    setCheckedIn(true);
    scheduleTimer(() => setCheckedIn(false), 3200);
  };

  const handleCopyInviteCode = async () => {
    soundFx?.playChime?.();
    try {
      await navigator.clipboard.writeText('CIRCLE-89421');
    } catch {
      // Ignore if clipboard access is denied
    }
    setCopiedCode(true);
    scheduleTimer(() => setCopiedCode(false), 2500);
  };

  const handleSendPing = (id: number, name: string) => {
    soundFx?.playPing?.();
    setSentPing({ id, name });
    scheduleTimer(() => {
      setSentPing((cur) => (cur?.id === id ? null : cur));
    }, 2200);
  };

  const toggleMemberGhost = (id: number, currentlyOnline: boolean) => {
    soundFx?.playPop?.();
    if (isRealCircle) {
      setGhostOverrides((prev) => ({ ...prev, [id]: !currentlyOnline }));
      return;
    }

    setFriends((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const newOnline = !f.online;
          return {
            ...f,
            online: newOnline,
            status: newOnline ? 'Active Online • Live GPS' : 'Offline (Ghost Mode Active)',
            distance: newOnline ? '2.4 km away' : 'Location Hidden',
            color: newOnline ? 'bg-emerald-500' : 'bg-slate-400',
          };
        }
        return f;
      })
    );
  };

  return (
    <section
      id="circles-safety"
      className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 relative overflow-hidden bg-white dark:bg-[#080D1A] border-y border-slate-200/80 dark:border-white/[0.06] scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Visual UI Interactive Circle Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <div className="relative rounded-3xl sm:rounded-[32px] border border-slate-200/85 dark:border-white/[0.08] bg-white dark:bg-[#0D1426] shadow-[0_20px_60px_rgba(99,102,241,0.08)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] p-4 sm:p-7 space-y-5">
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
                <div className="flex items-center gap-3 text-left min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-400/20 flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Users size={19} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-950 dark:text-white text-sm sm:text-base truncate">
                      {isRealCircle ? `Your Circle (${realFriends.length} Members)` : 'Family Circle (Dhaka Hub)'}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                      {sentPing
                        ? `Voice ping sent to ${sentPing.name}`
                        : isRealCircle
                          ? 'Connected to Dashboard Database • Live WebSocket Sync'
                          : '4 Members Connected • 15s WebSocket Sync'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/25 shrink-0">
                  <Wifi size={13} className="animate-pulse" />
                  <span>{isRealCircle ? 'Live DB Sync' : 'Sync Active'}</span>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2.5 sm:space-y-3">
                {displayFriends.map((item) => {
                  const batteryNumeric = Number.parseInt(item.battery, 10);
                  const isLowBattery = !Number.isNaN(batteryNumeric) && batteryNumeric < 50;
                  const isPinged = sentPing?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col min-[430px]:flex-row min-[430px]:items-center justify-between gap-2.5 sm:gap-3 text-left',
                        item.online
                          ? 'bg-slate-50/90 dark:bg-[#121B33] border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-500/40'
                          : 'bg-slate-100/70 dark:bg-[#0B1020] border-dashed border-slate-300 dark:border-slate-700/80 opacity-85'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full border-2 border-white dark:border-[#0D1426] overflow-hidden shadow-xs">
                            <Image
                              src={item.avatar}
                              alt={item.name}
                              width={44}
                              height={44}
                              unoptimized
                              className={`w-full h-full object-cover ${!item.online ? 'grayscale' : ''}`}
                            />
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-[#0D1426] ${item.color}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-slate-950 dark:text-white truncate">
                              {item.name}
                            </h4>
                            {item.activity === 'driving' && item.online && (
                              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                                {item.speed}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate font-medium">
                            <span className="truncate">{item.status}</span>
                            <span aria-hidden="true">•</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                              {item.distance}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end min-[430px]:self-auto">
                        {/* Send Ping / Voice simulated reaction */}
                        <button
                          type="button"
                          onClick={() => handleSendPing(item.id, item.name)}
                          className={cn(
                            'p-2 rounded-xl transition-all cursor-pointer relative border',
                            isPinged
                              ? 'bg-indigo-600 text-white border-indigo-500 scale-105 shadow-sm'
                              : 'bg-white dark:bg-[#0D1426] text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border-slate-200 dark:border-white/[0.1] hover:border-indigo-300 dark:hover:border-indigo-500/40'
                          )}
                          title="Send Instant Voice Ping"
                          aria-label={`Send voice ping to ${item.name}`}
                        >
                          <Mic size={14} className={isPinged ? 'animate-pulse' : ''} />
                          {isPinged && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                          )}
                        </button>

                        {/* Ghost mode privacy toggle */}
                        <button
                          type="button"
                          onClick={() => toggleMemberGhost(item.id, item.online)}
                          className={cn(
                            'p-2 rounded-xl transition-all cursor-pointer border',
                            item.online
                              ? 'bg-white dark:bg-[#0D1426] text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border-slate-200 dark:border-white/[0.1] hover:border-indigo-300 dark:hover:border-indigo-500/40'
                              : 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                          )}
                          title={item.online ? 'Turn on Ghost Mode' : 'Disable Ghost Mode'}
                          aria-label={item.online ? `Turn on Ghost Mode for ${item.name}` : `Disable Ghost Mode for ${item.name}`}
                          aria-pressed={!item.online}
                        >
                          {item.online ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>

                        {/* Battery telemetry badge */}
                        <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-200 font-mono bg-white dark:bg-[#0D1426] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.1] shadow-2xs tabular-nums">
                          {item.charging ? (
                            <Zap size={13} className="text-amber-500 fill-amber-500 animate-pulse" />
                          ) : (
                            <Battery
                              size={14}
                              className={
                                item.battery === '--'
                                  ? 'text-slate-400 dark:text-slate-500'
                                  : isLowBattery
                                    ? 'text-amber-500'
                                    : 'text-emerald-500'
                              }
                            />
                          )}
                          <span>{item.battery}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Check-In Action Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={triggerCheckIn}
                  className="relative w-full h-auto min-h-12 py-2.5 px-4 font-semibold text-xs sm:text-sm rounded-2xl bg-indigo-50/90 hover:bg-indigo-100/90 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-400/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.98] overflow-hidden group whitespace-normal text-center"
                >
                  {checkedIn ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>Check-in Broadcasted to All Members!</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={15} className="text-indigo-600 dark:text-indigo-300 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Simulate 1-Click Family Check-in</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Invite Code & WhatsApp Share Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#121B33] border border-slate-200/80 dark:border-white/[0.08] flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="text-left min-w-0">
                  <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 dark:text-indigo-300 block tracking-wider">
                    Invite Code &amp; 1-Tap Link
                  </span>
                  <div className="font-mono font-black text-slate-900 dark:text-white text-sm truncate">
                    CIRCLE-89421
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyInviteCode}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0D1426] border border-slate-200 dark:border-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedCode ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Join my private family circle on LocaLink with code CIRCLE-89421: ${shareOrigin}/register?invite=CIRCLE-89421`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    title="Share via WhatsApp"
                  >
                    <Share2 size={13} />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Text & Circles Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.06, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6 text-left order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-400/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" />
              <span>Zero Privacy Compromises</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-[-0.025em] leading-[1.1]">
              Stay connected with{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-indigo-400 dark:via-violet-300 dark:to-cyan-300 bg-clip-text text-transparent">
                complete privacy control
              </span>
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
              Create isolated invite-only circles for immediate family, travel companions, or close friends. Share live movements when you want, and hide your location with Ghost Mode whenever you desire privacy.
            </p>

            <div className="space-y-3.5 pt-1">
              {[
                {
                  icon: Users,
                  title: 'Invite-Only Private Circles',
                  desc: 'No outside party can view your GPS coordinates or status without an explicit cryptographic invite code.',
                  color: 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200/70 dark:border-indigo-400/20',
                },
                {
                  icon: EyeOff,
                  title: 'Granular Ghost Mode Privacy',
                  desc: 'Choose to share pinpoint GPS, approximate neighborhood area, or freeze your location marker anytime.',
                  color: 'text-pink-600 dark:text-pink-300 bg-pink-50 dark:bg-pink-500/15 border-pink-200/70 dark:border-pink-400/20',
                },
                {
                  icon: Battery,
                  title: 'Real-time Battery & Low-Power Warnings',
                  desc: 'Automatically know when a loved one’s device battery drops below 15% so you never lose communication.',
                  color: 'text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200/70 dark:border-emerald-400/20',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#0D1426] border border-slate-200/80 dark:border-white/[0.08] flex items-start gap-4 text-left hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors"
                  >
                    <div
                      className={cn(
                        'h-11 w-11 rounded-xl border flex items-center justify-center shrink-0',
                        item.color
                      )}
                    >
                      <Icon size={19} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-950 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                className="w-full sm:w-auto h-auto min-h-12 py-3 px-7 font-semibold text-sm rounded-full bg-gradient-to-b from-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_8px_24px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.22)] hover:-translate-y-0.5 active:translate-y-0 transition-all group gap-2 cursor-pointer justify-center"
                onClick={() => soundFx?.playPop?.()}
                asChild
              >
                <Link href={isAuthenticated ? '/dashboard/groups' : '/register'}>
                  <span>{isAuthenticated ? 'Manage Your Circles' : 'Create Your Private Circle Free'}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
