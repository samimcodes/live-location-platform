'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  EyeOff,
  Eye,
  UserPlus,
  Battery,
  CheckCircle2,
  Wifi,
  Send,
  ShieldAlert,
  Sparkles,
  Navigation,
  Copy,
  Check,
  ShieldCheck,
  Car,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';
import Image from 'next/image';

const initialFriends = [
  {
    id: 1,
    name: 'Emma (Mom)',
    status: 'Safe at Home',
    distance: '1.2 km away',
    battery: '94%',
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
    online: true,
    activity: 'driving',
    speed: '48 km/h',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    color: 'bg-violet-500',
  },
  {
    id: 3,
    name: 'Ayaan (Son)',
    status: 'Inside School Campus',
    distance: '4.1 km away',
    battery: '89%',
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
    online: false,
    activity: 'ghost',
    speed: 'Hidden',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    color: 'bg-slate-400',
  },
];

export function FriendsRealtimeSection() {
  const [friends, setFriends] = useState(initialFriends);
  const [checkedIn, setCheckedIn] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const triggerCheckIn = () => {
    soundFx.playChime();
    setCheckedIn(true);
    setTimeout(() => setCheckedIn(false), 3500);
  };

  const handleCopyInviteCode = () => {
    soundFx.playChime();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const toggleMemberGhost = (id: number) => {
    soundFx.playPop();
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
      className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-white dark:bg-[#0B1020] border-y border-slate-200/80 dark:border-slate-800/80 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual UI Interactive Circle Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            {/* Outer subtle glow */}
            <div className="relative rounded-[32px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1528] shadow-[0_20px_60px_rgba(124,58,237,0.08)] p-6 sm:p-8 space-y-6">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-10 w-10 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300 flex items-center justify-center font-bold shadow-xs">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-foreground text-base">
                      Family Circle (Dhaka Hub)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      4 Members Connected • 15s WebSocket Sync
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/70">
                  <Wifi size={13} className="animate-pulse" />
                  <span>Sync Active</span>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                {friends.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-left ${
                      item.online
                        ? 'bg-slate-50/90 dark:bg-[#121B33] border-slate-200/80 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700'
                        : 'bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className="h-11 w-11 rounded-full border-2 border-white dark:border-[#0E1528] overflow-hidden shadow-xs">
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
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-[#0E1528] ${item.color}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-sm text-slate-900 dark:text-foreground truncate">
                            {item.name}
                          </h4>
                          {item.activity === 'driving' && item.online && (
                            <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-1.5 py-0.2 rounded-md">
                              {item.speed}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate font-medium">
                          <span>{item.status}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.distance}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleMemberGhost(item.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          item.online
                            ? 'bg-white dark:bg-[#0E1528] text-slate-600 hover:text-violet-600 border border-slate-200 dark:border-slate-700'
                            : 'bg-violet-600 text-white shadow-xs'
                        }`}
                        title={item.online ? 'Turn on Ghost Mode' : 'Disable Ghost Mode'}
                      >
                        {item.online ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>

                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-[#0E1528] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <Battery
                          size={14}
                          className={parseInt(item.battery) < 50 ? 'text-amber-500' : 'text-emerald-500'}
                        />
                        <span>{item.battery}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Check-In Action Button */}
              <div className="pt-1">
                <Button
                  onClick={triggerCheckIn}
                  className="w-full h-12 font-black text-xs rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:hover:bg-violet-900/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {checkedIn ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-500 animate-bounce" />
                      <span>Check-in Broadcasted to All Members!</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={15} className="text-violet-600 dark:text-violet-400" />
                      <span>Simulate 1-Click Family Check-in</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Invite Code Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121B33] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-mono font-black text-violet-600 dark:text-violet-400">
                    Circle Invite Code
                  </span>
                  <div className="font-mono font-black text-slate-900 dark:text-foreground text-sm">
                    CIRCLE-89421
                  </div>
                </div>
                <button
                  onClick={handleCopyInviteCode}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-violet-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedCode ? (
                    <>
                      <Check size={13} className="text-emerald-500" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Text & Circles Value Proposition */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-7 text-left order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 text-xs font-bold shadow-2xs">
              <Sparkles size={14} />
              <span>Zero Privacy Compromises</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
              Stay connected with{' '}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                complete privacy control
              </span>
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              Create isolated invite-only circles for immediate family, travel companions, or close friends. Share live movements when you want, and hide your location with Ghost Mode whenever you desire privacy.
            </p>

            <div className="space-y-4 pt-1">
              {[
                {
                  icon: Users,
                  title: 'Invite-Only Private Circles',
                  desc: 'No outside party can view your GPS coordinates or status without an explicit cryptographic invite code.',
                  color: 'text-violet-600 bg-violet-100 dark:bg-violet-950/80',
                },
                {
                  icon: EyeOff,
                  title: 'Granular Ghost Mode Privacy',
                  desc: 'Choose to share pinpoint GPS, approximate neighborhood area, or freeze your location marker anytime.',
                  color: 'text-pink-600 bg-pink-100 dark:bg-pink-950/80',
                },
                {
                  icon: Battery,
                  title: 'Real-time Battery & Low-Power Warnings',
                  desc: 'Automatically know when a loved one’s device battery drops below 15% so you never lose communication.',
                  color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/80',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#10172C] border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-4 text-left hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                  >
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
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
                className="h-12 px-7 font-bold text-sm rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25 transition-all group gap-2 cursor-pointer border border-violet-400/30"
                onClick={() => soundFx.playPop()}
                asChild
              >
                <Link href="/register">
                  <span>Create Your Private Circle Free</span>
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
