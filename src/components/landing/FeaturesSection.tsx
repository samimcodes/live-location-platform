'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bell, Users, History, Shield, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: MapPin,
    title: 'Live 15s Location Sync',
    description: 'Track movements smoothly on an interactive map with 15-second refresh intervals and high-accuracy GPS coordinates.',
    colSpan: 'md:col-span-2 lg:col-span-8',
    gradient: 'from-indigo-600 to-purple-600',
  },
  {
    icon: Bell,
    title: 'Smart Place Geofencing',
    description: 'Receive automated notifications when family members safely arrive at or leave home, school, or work.',
    colSpan: 'md:col-span-1 lg:col-span-4',
    gradient: 'from-purple-600 to-fuchsia-600',
  },
  {
    icon: Users,
    title: 'Private Family Circles',
    description: 'Organize loved ones into private, invite-only circles with custom map views and individual permissions.',
    colSpan: 'md:col-span-1 lg:col-span-4',
    gradient: 'from-fuchsia-600 to-pink-600',
  },
  {
    icon: History,
    title: '30-Day Route History',
    description: 'Replay past trips, review travel routes, and inspect timestamped location logs with interactive playback.',
    colSpan: 'md:col-span-2 lg:col-span-4',
    gradient: 'from-indigo-600 to-blue-600',
  },
  {
    icon: Shield,
    title: 'Ghost Mode & Privacy',
    description: 'Control your visibility anytime. Enable Ghost Mode to pause sharing or freeze location on demand.',
    colSpan: 'md:col-span-1 lg:col-span-4',
    gradient: 'from-emerald-600 to-teal-600',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <Heart size={14} className="fill-primary/20" />
            Built for Family Safety
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
            Features engineered for <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">complete peace of mind</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            LocaLink provides effortless real-time awareness without intruding on privacy.
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
                  "group relative bg-card rounded-3xl border border-border/70 hover:border-primary/40 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col p-8 sm:p-10",
                  f.colSpan
                )}
              >
                <div className={cn("h-13 w-13 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform", f.gradient)}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 tracking-tight">{f.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
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
