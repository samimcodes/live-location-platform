'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquareQuote, CheckCircle2, Heart, Shield, Sparkles } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Nusrat Jahan',
    role: 'Mother of 2 (Dhaka)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    content:
      'LocaLink gives me total peace of mind every single morning. When my kids reach Scholastica school, I get an automated geofence alert on my phone. No more anxious calling in traffic!',
    rating: 5,
    tag: 'Safe Zone Geofencing',
    location: 'Gulshan, Dhaka',
  },
  {
    name: 'Tanvir Hossain',
    role: 'Frequent Commuter & Driver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    content:
      'The speed tracking and 30-day trip replay are remarkably accurate. Battery drain is practically zero compared to Life360 or Google Maps which used to kill my phone by afternoon.',
    rating: 5,
    tag: 'Battery & Speed Telemetry',
    location: 'Banani Expressway',
  },
  {
    name: 'Farhana Rahman',
    role: 'University Student (Uttara)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    content:
      'Ghost Mode is what made me love LocaLink. I can share live coordinates with my circle during late commute hours, and freeze my location when I am relaxing with friends on weekends.',
    rating: 5,
    tag: 'Ghost Mode & Privacy',
    location: 'Uttara Sector 7',
  },
  {
    name: 'Mahmudur Rahman',
    role: 'Family Circle Admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    content:
      'Setting up our entire family of 5 took less than 2 minutes using the 1-click invite code. The live map interface is clean, super responsive, and looks phenomenal on desktop and mobile.',
    rating: 5,
    tag: 'Instant 60s Onboarding',
    location: 'Dhanmondi, Dhaka',
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-white dark:bg-[#0B1020] border-t border-slate-200/80 dark:border-slate-800/80 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 text-xs font-bold shadow-2xs mb-5">
            <Heart size={14} className="fill-violet-600/30 text-violet-600" />
            <span>Loved by Over 2,400+ Families</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white mb-6 tracking-tight leading-[1.1]">
            Real stories from{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              connected families
            </span>
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            See how parents, students, commuters, and teams use LocaLink everyday for safety and seamless coordination.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
              className="bg-slate-50/90 dark:bg-[#0E1528] p-7 rounded-[28px] border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-violet-400/50 dark:hover:border-violet-700/60 hover:shadow-[0_15px_40px_rgba(124,58,237,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group"
            >
              <div>
                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    {item.location}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal mb-6">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-violet-500/40 shrink-0">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      width={40}
                      height={40}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <div className="font-black text-xs text-slate-900 dark:text-foreground truncate flex items-center gap-1">
                      <span>{item.name}</span>
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {item.role}
                    </div>
                  </div>
                </div>

                <div className="mt-3 inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50">
                  {item.tag}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
