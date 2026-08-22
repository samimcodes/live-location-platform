'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section id="cta" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-10 sm:p-16 text-center shadow-2xl shadow-indigo-500/20 border border-white/10"
        >
          {/* Subtle Ambient Background Glows */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 items-center justify-center mb-6 text-white shadow-lg">
              <MapPin size={32} />
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight max-w-2xl mx-auto leading-tight">
              Ready to keep your family safe and connected?
            </h2>
            
            <p className="text-white/85 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed font-normal">
              Join thousands of families who trust LocaLink for real-time location awareness and peace of mind. Free forever up to 5 members.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Button
                size="lg"
                className="h-14 px-8 bg-white text-indigo-700 hover:bg-white/90 text-base font-bold rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all group w-full sm:w-auto"
                asChild
              >
                <Link href="/register">
                  Start for Free
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-base font-bold rounded-2xl transition-all w-full sm:w-auto backdrop-blur-sm"
                asChild
              >
                <Link href="/login">Sign in to Dashboard</Link>
              </Button>
            </div>
            
            <p className="mt-8 text-xs sm:text-sm text-white/70 font-medium flex items-center gap-1.5">
              <ShieldCheck size={14} />
              No credit card required. Setup takes under 2 minutes.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
