'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bell, Users, History, Shield, Navigation, Heart, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: MapPin,
    title: 'Live Location Tracking',
    description: 'See everyone on an interactive map updated every 15 seconds with pinpoint GPS precision.',
    gradient: 'from-indigo-500 to-indigo-400',
    colSpan: 'md:col-span-2 lg:col-span-8',
    image: 'bg-indigo-50 dark:bg-indigo-950/20', // Placeholder for visual element
  },
  {
    icon: Bell,
    title: 'Smart Place Alerts',
    description: 'Get instant push notifications when loved ones arrive at or leave saved locations.',
    gradient: 'from-orange-500 to-amber-400',
    colSpan: 'md:col-span-1 lg:col-span-4',
    image: 'bg-orange-50 dark:bg-orange-950/20',
  },
  {
    icon: Users,
    title: 'Family & Friend Groups',
    description: 'Organize friends and family into private circles. Each circle has its own shared map view and settings.',
    gradient: 'from-emerald-500 to-teal-400',
    colSpan: 'md:col-span-1 lg:col-span-4',
    image: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  {
    icon: History,
    title: '30-Day Location History',
    description: 'Review past movements, routes taken, and places visited with interactive timeline playback.',
    gradient: 'from-blue-500 to-cyan-400',
    colSpan: 'md:col-span-2 lg:col-span-4',
    image: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your location data is strictly encrypted. Ghost mode lets you control exactly who sees what, and when.',
    gradient: 'from-rose-500 to-pink-400',
    colSpan: 'md:col-span-1 lg:col-span-4',
    image: 'bg-rose-50 dark:bg-rose-950/20',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
          className="text-center mb-16 sm:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 shadow-sm border border-primary/20">
            <Heart size={14} className="fill-primary/20" />
            Everything your family needs
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
            Features built for <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">peace of mind</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            More than just a location app. LocaLink is your family&apos;s digital safety net, providing real-time awareness without compromising privacy.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const }}
              className={cn(
                "group relative bg-card rounded-[2rem] border border-border/50 hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col",
                f.colSpan
              )}
            >
              {/* Decorative top gradient line */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5 opacity-80" 
                style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} 
              />
              
              {/* Inner content */}
              <div className="p-8 sm:p-10 flex-1 flex flex-col relative z-10">
                <div className={cn("inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br items-center justify-center mb-6 shadow-lg shadow-black/5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500", f.gradient)}>
                  <f.icon size={26} className="text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 tracking-tight">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>

              {/* Abstract decorative background per card */}
              <div className={cn("absolute bottom-0 right-0 w-64 h-64 rounded-tl-full opacity-10 transition-transform duration-700 group-hover:scale-110", f.gradient)} />
              
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
