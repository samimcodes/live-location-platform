'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquareQuote, CheckCircle2, Heart, Shield } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Nusrat Jahan',
    role: 'Mother of 2 (Dhaka)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    content:
      'LocaLink gives me total peace of mind every single morning. When my kids reach Scholastica school, I get an automated geofence alert on my phone. No more anxious calling!',
    rating: 5,
    tag: 'School Geofence Alert',
  },
  {
    name: 'Tanvir Hossain',
    role: 'Frequent Commuter & Driver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    content:
      'The speed tracking and 30-day trip replay is remarkably accurate. The battery drain is practically zero compared to other apps we tried in the past.',
    rating: 5,
    tag: 'Battery & Speed Tracking',
  },
  {
    name: 'Farhana Rahman',
    role: 'University Student (Uttara)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    content:
      'Ghost Mode is what made me love LocaLink. I can share live coordinates with my circle during late commute hours, and freeze my location when I am relaxing with friends.',
    rating: 5,
    tag: 'Ghost Mode & Privacy',
  },
  {
    name: 'Mahmudur Rahman',
    role: 'Family Circle Admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    content:
      'Setting up our entire family of 5 took less than 2 minutes using the 1-click invite code. The live map interface is clean, super responsive, and looks amazing.',
    rating: 5,
    tag: 'Instant Setup',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-white dark:bg-background border-t border-slate-100 dark:border-border/60 scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE9FE] border border-purple-200/60 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60 text-xs font-bold shadow-2xs mb-6">
            <Heart size={14} className="fill-[#7C3AED]/20 text-[#7C3AED]" />
            Loved by 2,000+ Families
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-foreground mb-6 tracking-tight">
            Real stories from{' '}
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#4F46E5] bg-clip-text text-transparent">
              connected families
            </span>
          </h2>

          <p className="text-slate-600 dark:text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            See how parents, students, and travelers use LocaLink everyday for safety and seamless coordination.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
              className="bg-[#F8F9FD] dark:bg-card p-6 rounded-3xl border border-slate-200/80 dark:border-border/80 shadow-xs hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between text-left relative"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal mb-6">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 dark:border-border/60">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-purple-400 shrink-0">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      width={40}
                      height={40}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-xs text-slate-900 dark:text-foreground truncate flex items-center gap-1">
                      {item.name}
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-muted-foreground truncate">{item.role}</div>
                  </div>
                </div>

                <div className="mt-2.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100/70 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300">
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
