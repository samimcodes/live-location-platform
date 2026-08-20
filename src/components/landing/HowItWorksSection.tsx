'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, MapPin, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create your account',
    description: 'Sign up free in seconds. No credit card required.',
    gradient: 'from-indigo-500 to-indigo-400',
    color: 'text-indigo-500',
  },
  {
    step: '02',
    icon: Users,
    title: 'Invite your circle',
    description: 'Send secure invites to family members and trusted friends.',
    gradient: 'from-purple-500 to-purple-400',
    color: 'text-purple-500',
  },
  {
    step: '03',
    icon: MapPin,
    title: 'Share your location',
    description: 'Enable live sharing and instantly appear on your group\'s private map.',
    gradient: 'from-fuchsia-500 to-pink-400',
    color: 'text-fuchsia-500',
  },
  {
    step: '04',
    icon: Bell,
    title: 'Get smart alerts',
    description: 'Receive automatic notifications when loved ones reach saved places safely.',
    gradient: 'from-orange-500 to-amber-400',
    color: 'text-orange-500',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 bg-muted/20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
            Up and running in <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">minutes</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
            Getting started with LocaLink is incredibly simple. We've designed the onboarding to be friction-free for the whole family.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Desktop Connecting Line */}
          <div className="absolute top-12 left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-orange-200 dark:from-indigo-900/50 dark:via-purple-900/50 dark:to-orange-900/50 hidden lg:block rounded-full" />
          
          {/* Active Progress Line (simulated with motion) */}
          <motion.div 
            initial={{ width: "0%" }}
            whileInView={{ width: "75%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            className="absolute top-12 left-[12.5%] h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-500 hidden lg:block rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] z-0" 
          />

          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.2, ease: 'easeOut' as const }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              {/* Step Icon Container */}
              <div className="relative h-24 w-24 rounded-[2rem] bg-card border border-border/60 flex items-center justify-center mb-6 shadow-xl shadow-black/5 group-hover:-translate-y-2 transition-transform duration-500">
                
                {/* Background glow on hover */}
                <div className={cn("absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl bg-gradient-to-br", s.gradient)} />
                
                {/* Icon wrapper */}
                <div className={cn("relative z-10 h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-inner", s.gradient)}>
                  <s.icon size={26} className="text-white" />
                </div>

                {/* Step Number Badge */}
                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-foreground text-background text-sm font-bold flex items-center justify-center shadow-lg border-2 border-background">
                  {i + 1}
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed px-4">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
