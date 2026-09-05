'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Heart, ShieldCheck, Zap, Radio, Bell } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  location: string;
  tag: string;
  tagIcon: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Nusrat Jahan',
    role: 'Mother of 2',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    content:
      'LocaLink gives me total peace of mind every morning. When my kids reach Scholastica school, I get an automated geofence alert on my phone.',
    rating: 5,
    location: 'Gulshan, Dhaka',
    tag: 'Safe Zone Geofence',
    tagIcon: '🔔',
  },
  {
    id: '2',
    name: 'Tanvir Hossain',
    role: 'Commuter & Driver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    content:
      'The speed tracking and 30-day trip replay are remarkably accurate. Battery drain is practically zero compared to Google Maps.',
    rating: 5,
    location: 'Banani Expressway',
    tag: 'Battery AI & Speed',
    tagIcon: '⚡',
  },
  {
    id: '3',
    name: 'Farhana Rahman',
    role: 'University Student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    content:
      'Ghost Mode is what made me love LocaLink. I can share live coordinates during late commute hours, and freeze location when relaxing.',
    rating: 5,
    location: 'Uttara Sector 7',
    tag: 'Ghost Mode Privacy',
    tagIcon: '🛡️',
  },
  {
    id: '4',
    name: 'Mahmudur Rahman',
    role: 'Family Circle Admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    content:
      'Setting up our entire family of 5 took less than 2 minutes with the 1-click invite code. The live map interface is clean and super responsive.',
    rating: 5,
    location: 'Dhanmondi, Dhaka',
    tag: 'Instant 60s Onboarding',
    tagIcon: '🚀',
  },
  {
    id: '5',
    name: 'Sonia Akhter',
    role: 'Working Parent',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    content:
      'The SOS alert with battery telemetry saved us when my daughter had a flat tire. The dispatch SMS reached us in seconds with direct navigation.',
    rating: 5,
    location: 'Mirpur DOHS',
    tag: '1-Click SOS Dispatch',
    tagIcon: '🚨',
  },
  {
    id: '6',
    name: 'Arif Chowdhury',
    role: 'Logistics Team Lead',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    content:
      'We tested several solutions, but LocaLink’s sub-20ms WebSocket speed and clean live radar view gave our team the best real-time accuracy.',
    rating: 5,
    location: 'Tejgaon, Dhaka',
    tag: 'Enterprise GPS Mesh',
    tagIcon: '📡',
  },
];

export function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false);

  // Triple duplicated list for seamless continuous infinite marquee
  const marqueeItems = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section
      id="testimonials"
      className="py-24 sm:py-32 px-0 relative overflow-hidden bg-white dark:bg-[#070B16] border-t border-slate-200/80 dark:border-slate-800/80 scroll-mt-16"
    >
      {/* High-tech ambient glowing lights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[350px] bg-violet-600/10 dark:bg-violet-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[350px] bg-cyan-500/10 dark:bg-cyan-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header - Clean & focused */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-14 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 text-xs font-bold shadow-2xs mb-5">
            <Heart size={14} className="fill-violet-600/30 text-violet-600" />
            <span>Loved by Over 2,400+ Families</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white mb-5 tracking-tight leading-[1.1]">
            Real stories from{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">
              connected families
            </span>
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            See how parents, students, commuters, and teams use LocaLink everyday for safety and seamless coordination.
          </p>
        </motion.div>
      </div>

      {/* ── 1-LINE INFINITE HORIZONTAL MARQUEE (Right to Left) ── */}
      <div
        className="relative w-full overflow-hidden py-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left & Right Gradient Fog Masks for Seamless Edge Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-40 bg-gradient-to-r from-white dark:from-[#070B16] via-white/80 dark:via-[#070B16]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-40 bg-gradient-to-l from-white dark:from-[#070B16] via-white/80 dark:via-[#070B16]/80 to-transparent z-20 pointer-events-none" />

        {/* Animated Marquee Flex Track */}
        <motion.div
          animate={isPaused ? {} : { x: ['0%', '-50%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 38,
              ease: 'linear',
            },
          }}
          className="flex items-stretch gap-5 sm:gap-6 w-max cursor-grab active:cursor-grabbing"
        >
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-[340px] sm:w-[390px] shrink-0 relative bg-white/90 dark:bg-[#0D1426]/90 backdrop-blur-2xl p-6 sm:p-7 rounded-[28px] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:border-violet-500/50 dark:hover:border-violet-500/50 hover:shadow-[0_20px_45px_rgba(124,58,237,0.12)] transition-all duration-300 flex flex-col justify-between text-left select-none hover:-translate-y-1.5 group overflow-hidden"
            >
              {/* Top Hairline Glowing Gradient Accent */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                {/* ── CARD HEADER: User Info + Stars ── */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="h-11 w-11 rounded-full overflow-hidden ring-2 ring-violet-500/30 group-hover:ring-violet-500 transition-all shadow-xs">
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          width={44}
                          height={44}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0D1426]" />
                    </div>

                    <div className="overflow-hidden min-w-0">
                      <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                        <span>{item.name}</span>
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">
                        {item.role} • {item.location}
                      </div>
                    </div>
                  </div>

                  {/* 5-Star Glowing Rating */}
                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                {/* ── CARD BODY: Quote Content ── */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal mb-5">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              {/* ── CARD FOOTER: Feature Pill ── */}
              <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-[#131C35] text-slate-700 dark:text-slate-300 text-[10px] font-mono font-semibold border border-slate-200/70 dark:border-slate-700/60">
                  <span>{item.tagIcon}</span>
                  <span>{item.tag}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Verified
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
