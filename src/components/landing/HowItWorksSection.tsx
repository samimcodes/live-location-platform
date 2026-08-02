'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, MapPin, Bell } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create your account',
    description: 'Sign up free in seconds. No credit card required.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
  },
  {
    step: '02',
    icon: Users,
    title: 'Invite your circle',
    description: 'Send friend requests to family members and friends.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/50',
  },
  {
    step: '03',
    icon: MapPin,
    title: 'Share your location',
    description: 'Enable sharing and appear on your circle\'s live map.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    step: '04',
    icon: Bell,
    title: 'Get smart alerts',
    description: 'Receive notifications when loved ones reach saved places.',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Up and running in 2 minutes
          </h2>
          <p className="text-muted-foreground text-lg">
            Getting started with LocaLink is as simple as 4 easy steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-indigo-200 via-purple-200 to-orange-200 dark:from-indigo-800 dark:via-purple-800 dark:to-orange-800 hidden lg:block" />

          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`relative h-20 w-20 rounded-2xl ${s.bg} flex items-center justify-center mb-4 border border-border/50 z-10`}>
                <s.icon size={28} className={s.color} />
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
