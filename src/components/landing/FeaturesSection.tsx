'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bell, Users, History, Shield, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: MapPin,
    title: 'Live 15s Location Sync',
    description: 'Track movements smoothly on an interactive map with continuous refresh intervals and high-accuracy GPS coordinates.',
    colSpan: 'md:col-span-2 lg:col-span-8',
    gradient: 'from-[#7C3AED] to-[#6366F1]',
  },
  {
    icon: Bell,
    title: 'Smart Place Geofencing',
    description: 'Receive automated notifications when family members safely arrive at or leave home, school, or work.',
    colSpan: 'md:col-span-1 lg:col-span-4',
    gradient: 'from-[#EC4899] to-[#F43F5E]',
  },
  {
    icon: Users,
    title: 'Private Family Circles',
    description: 'Organize loved ones into private, invite-only circles with custom map views and individual permissions.',
    colSpan: 'md:col-span-1 lg:col-span-4',
    gradient: 'from-[#8B5CF6] to-[#A855F7]',
  },
  {
    icon: History,
    title: '30-Day Route History',
    description: 'Replay past trips, review travel routes, and inspect timestamped location logs with interactive playback.',
    colSpan: 'md:col-span-2 lg:col-span-4',
    gradient: 'from-[#3B82F6] to-[#06B6D4]',
  },
  {
    icon: Shield,
    title: 'Ghost Mode & Privacy',
    description: 'Control your visibility anytime. Enable Ghost Mode to pause sharing or freeze location on demand.',
    colSpan: 'md:col-span-1 lg:col-span-4',
    gradient: 'from-[#10B981] to-[#059669]',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-[#F8F9FD] dark:bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE9FE] border border-purple-200/60 text-[#7C3AED] text-xs font-bold shadow-sm mb-6">
            <Heart size={14} className="fill-[#7C3AED]/20 text-[#7C3AED]" />
            Built for Family Safety
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] dark:text-foreground mb-6 tracking-tight">
            Features engineered for{' '}
            <span className="text-[#7C3AED] dark:text-purple-400">complete peace of mind</span>
          </h2>
          <p className="text-[#64748B] dark:text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            LocaLink provides effortless real-time awareness without intruding on individual privacy.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-[minmax(280px,auto)]">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                className={cn(
                  "group relative bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(124,58,237,0.08)] hover:border-purple-200 transition-all duration-300 overflow-hidden flex flex-col p-8 sm:p-10",
                  f.colSpan
                )}
              >
                <div className={cn("h-12 w-12 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform", f.gradient)}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-foreground mb-3 tracking-tight">{f.title}</h3>
                <p className="text-[#64748B] dark:text-muted-foreground text-sm sm:text-base leading-relaxed font-normal">
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
