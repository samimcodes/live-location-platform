'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function CTASection() {
  return (
    <section id="cta" className="py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: 'easeOut' as const }}
          className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-10 sm:p-16 md:p-20 text-center shadow-2xl shadow-indigo-600/20 border border-white/10"
        >
          {/* ── Background decoration ── */}
          {/* Subtle noise texture */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          
          {/* Abstract glowing shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="inline-flex h-20 w-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 items-center justify-center mb-8 shadow-xl shadow-black/10"
            >
              <MapPin size={36} className="text-white drop-shadow-md" />
            </motion.div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm max-w-2xl mx-auto">
              Ready to stay <br className="hidden sm:block" /> connected?
            </h2>
            
            <p className="text-white/80 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of families already using LocaLink to ensure safety and peace of mind. Free forever for up to 5 members.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Button
                size="lg"
                className="h-14 px-10 bg-white text-indigo-600 hover:bg-white/90 text-base font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group w-full sm:w-auto"
                asChild
              >
                <Link href="/register">
                  Start for free
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-10 border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-base font-bold rounded-2xl transition-all w-full sm:w-auto backdrop-blur-sm"
                asChild
              >
                <Link href="/login">Sign in to Dashboard</Link>
              </Button>
            </div>
            
            <p className="mt-8 text-sm text-white/50 font-medium">
              No credit card required. Setup takes 2 minutes.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
