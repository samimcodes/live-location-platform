'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, EyeOff, Eye, UserPlus, Battery, CheckCircle2, Wifi, Send, ShieldAlert, Sparkles, Navigation } from 'lucide-react';
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
    battery: '92%',
    online: true,
    speed: '0 km/h',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    color: 'bg-emerald-500',
  },
  {
    id: 2,
    name: 'Robert (Dad)',
    status: 'Driving to Banani',
    distance: '8.4 km away',
    battery: '78%',
    online: true,
    speed: '45 km/h',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    color: 'bg-blue-500',
  },
  {
    id: 3,
    name: 'Alex (Brother)',
    status: 'At University Campus',
    distance: '4.1 km away',
    battery: '42%',
    online: true,
    speed: '0 km/h',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    color: 'bg-purple-500',
  },
  {
    id: 4,
    name: 'Sarah (Sister)',
    status: 'Offline (Ghost Mode)',
    distance: 'Location Hidden',
    battery: '85%',
    online: false,
    speed: 'Hidden',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    color: 'bg-slate-400',
  },
];

export function FriendsRealtimeSection() {
  const [friends, setFriends] = useState(initialFriends);
  const [checkedIn, setCheckedIn] = useState(false);

  const triggerCheckIn = () => {
    soundFx.playChime();
    setCheckedIn(true);
    setTimeout(() => setCheckedIn(false), 3000);
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
            status: newOnline ? 'Active Online • Live GPS' : 'Offline (Ghost Mode)',
            distance: newOnline ? '2.4 km away' : 'Location Hidden',
            color: newOnline ? 'bg-emerald-500' : 'bg-slate-400',
          };
        }
        return f;
      })
    );
  };

  return (
    <section id="circles-safety" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-white dark:bg-background border-y border-slate-100 dark:border-border/60 scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual UI Card Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <div className="rounded-3xl border border-slate-200/90 dark:border-border/90 bg-white dark:bg-card shadow-[0_20px_60px_rgba(124,58,237,0.08)] p-6 sm:p-8 space-y-6 relative overflow-hidden">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#EDE9FE] text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-center font-bold">
                    <Users size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 dark:text-foreground text-base">Family Circle (Dhaka)</h3>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground">4 Members Connected • Real-time Sync</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <Wifi size={13} className="animate-pulse" />
                  Socket Connected
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                {friends.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-muted/30 border border-slate-100 dark:border-border hover:border-purple-200 dark:hover:border-purple-800 transition-all flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <div className="h-11 w-11 rounded-full border-2 border-white dark:border-background overflow-hidden shadow-xs">
                          <Image
                            src={item.avatar}
                            alt={item.name}
                            width={44}
                            height={44}
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-background ${item.color}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-foreground">{item.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{item.status}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{item.distance}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMemberGhost(item.id)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-muted text-slate-500 hover:text-[#7C3AED] transition-colors cursor-pointer"
                        title="Toggle Ghost Mode"
                      >
                        {item.online ? <Eye size={13} /> : <EyeOff size={13} className="text-purple-600" />}
                      </button>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-card px-2 py-1 rounded-xl border border-slate-200/70 dark:border-border shadow-2xs">
                        <Battery size={13} className={parseInt(item.battery) < 50 ? 'text-amber-500' : 'text-emerald-500'} />
                        <span>{item.battery}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Quick Check-in Simulator */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-border">
                <Button
                  onClick={triggerCheckIn}
                  className="w-full h-11 font-bold text-xs rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] dark:bg-purple-950/50 dark:hover:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {checkedIn ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Navigation size={15} />}
                  <span>{checkedIn ? 'Check-in Broadcasted to Circle!' : 'Simulate 1-Click Family Check-in'}</span>
                </Button>
              </div>

              {/* Privacy Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/40 flex items-center gap-3 text-xs text-slate-700 dark:text-muted-foreground text-left">
                <EyeOff size={18} className="text-[#7C3AED] shrink-0" />
                <span>
                  <strong className="text-[#7C3AED] dark:text-purple-400">Interactive Ghost Mode:</strong> Click the eye icon beside any member to test visibility toggling.
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Text & Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-8 order-1 lg:order-2 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE9FE] border border-purple-200/60 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60 text-xs font-bold shadow-2xs">
              <Users size={14} />
              Circles & Privacy First
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-foreground tracking-tight leading-[1.15]">
              Stay connected with{' '}
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] bg-clip-text text-transparent">
                complete privacy control
              </span>
            </h2>

            <p className="text-slate-600 dark:text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
              Create invite-only circles for family, travel buddies, or close friends. Share live movements when you want, and hide your location with Ghost Mode whenever you need privacy.
            </p>

            <div className="space-y-3.5">
              {[
                {
                  icon: Users,
                  title: 'Invite-Only Private Circles',
                  desc: 'Nobody outside your explicit circle code can view your map coordinates or status.',
                  gradient: 'from-[#7C3AED] to-[#6366F1]',
                },
                {
                  icon: EyeOff,
                  title: 'Granular Ghost Mode',
                  desc: 'Choose to share precise GPS, approximate city-level area, or freeze your marker entirely.',
                  gradient: 'from-[#EC4899] to-[#F43F5E]',
                },
                {
                  icon: Battery,
                  title: 'Real-time Battery & Low-Power Alerts',
                  desc: 'Know when a family member\'s phone battery drops below 15% so you never lose contact.',
                  gradient: 'from-[#10B981] to-[#059669]',
                },
              ].map((point) => {
                const Icon = point.icon;
                return (
                  <div key={point.title} className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8F9FD] dark:bg-card/60 border border-slate-100 dark:border-border/60 hover:border-purple-200/80 dark:hover:border-purple-800/60 hover:shadow-xs transition-all duration-200 group">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300 ${point.gradient}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-foreground text-sm">{point.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed mt-0.5">{point.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="h-12 px-7 font-bold text-sm rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all group gap-2 cursor-pointer"
                asChild
              >
                <Link href="/register">
                  <UserPlus size={16} />
                  Create Your Circle Free
                </Link>
              </Button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
