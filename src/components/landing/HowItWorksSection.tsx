'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, MapPin, Bell } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up free in under 60 seconds using email or Google.',
    gradient: 'from-indigo-600 to-indigo-500',
  },
  {
    step: '02',
    icon: Users,
    title: 'Invite Your Circle',
    description: 'Send secure invitation links to family and trusted friends.',
    gradient: 'from-purple-600 to-purple-500',
  },
  {
    step: '03',
    icon: MapPin,
    title: 'Share Location',
    description: 'Enable live GPS and instantly sync on your group private map.',
    gradient: 'from-fuchsia-600 to-fuchsia-500',
  },
  {
    step: '04',
    icon: Bell,
    title: 'Get Smart Alerts',
    description: 'Receive instant alerts when family members reach saved places safely.',
    gradient: 'from-emerald-600 to-teal-500',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 bg-muted/20 relative overflow-hidden border-t border-border/40">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
            Up and running in <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">4 simple steps</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            LocaLink is designed to be frictionless for every generation in your family.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line on desktop */}
          <div className="absolute top-12 left-[12.5%] right-[12.5%] h-1 bg-border/60 hidden lg:block rounded-full" />
          
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: 'easeOut' }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                {/* Step Icon Box */}
                <div className="relative h-24 w-24 rounded-3xl bg-card border border-border/80 flex items-center justify-center mb-6 shadow-lg group-hover:-translate-y-1.5 transition-transform duration-300">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${s.gradient} text-white flex items-center justify-center shadow-md`}>
                    <Icon size={24} />
                  </div>
                  <div className="absolute -top-2.5 -right-2.5 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                    {i + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed px-2">{s.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
