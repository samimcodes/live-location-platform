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
    gradient: 'from-[#7C3AED] to-[#6366F1]',
  },
  {
    step: '02',
    icon: Users,
    title: 'Invite Your Circle',
    description: 'Send secure invitation links to family and trusted friends.',
    gradient: 'from-[#8B5CF6] to-[#A855F7]',
  },
  {
    step: '03',
    icon: MapPin,
    title: 'Share Location',
    description: 'Enable live GPS and instantly sync on your group private map.',
    gradient: 'from-[#EC4899] to-[#F43F5E]',
  },
  {
    step: '04',
    icon: Bell,
    title: 'Get Smart Alerts',
    description: 'Receive instant alerts when family members reach saved places safely.',
    gradient: 'from-[#10B981] to-[#059669]',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 bg-[#F8F9FD] dark:bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE9FE] border border-purple-200/60 text-[#7C3AED] text-xs font-bold shadow-sm mb-6">
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] dark:text-foreground mb-6 tracking-tight">
            Up and running in{' '}
            <span className="text-[#7C3AED] dark:text-purple-400">4 simple steps</span>
          </h2>
          <p className="text-[#64748B] dark:text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            LocaLink is designed to be completely frictionless for every member of your family.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line on desktop */}
          <div className="absolute top-12 left-[12.5%] right-[12.5%] h-1 bg-purple-200/60 dark:bg-purple-900/30 hidden lg:block rounded-full" />
          
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
                <div className="relative h-24 w-24 rounded-3xl bg-white dark:bg-card border border-slate-100 dark:border-border flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] group-hover:-translate-y-1.5 group-hover:shadow-lg transition-all duration-300">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${s.gradient} text-white flex items-center justify-center shadow-md`}>
                    <Icon size={24} />
                  </div>
                  <div className="absolute -top-2.5 -right-2.5 h-7 w-7 rounded-full bg-[#7C3AED] text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {i + 1}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] dark:text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-[#64748B] dark:text-muted-foreground leading-relaxed px-2 font-normal">{s.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
