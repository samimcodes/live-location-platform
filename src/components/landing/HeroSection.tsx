'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-background to-purple-50 dark:from-indigo-950/30 dark:via-background dark:to-purple-950/30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-400/15 rounded-full blur-3xl animate-blob" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6"
        >
          <Zap size={14} />
          Real-time location sharing — now live
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6"
        >
          Stay close to{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            everyone
          </span>
          <br />
          you love
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          LocaLink lets your family and friends share live locations, create groups,
          and get instant alerts — all in one beautiful app.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button size="lg" className="h-12 px-8 text-base" asChild>
            <Link href="/register">
              Get Started Free
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground"
        >
          {[
            { icon: Shield, text: 'End-to-end encrypted' },
            { icon: MapPin, text: 'GPS accurate to 3m' },
            { icon: Zap, text: 'Updates every 15s' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={15} className="text-primary" />
              {text}
            </div>
          ))}
        </motion.div>

        {/* Mock map preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 aspect-[16/9] flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
            <div className="relative z-10 text-center">
              <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center mb-4 shadow-lg">
                <MapPin size={32} className="text-white" />
              </div>
              <p className="text-sm text-muted-foreground">Live map preview</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Sign in to see your family on the map</p>
            </div>

            {/* Fake friend markers */}
            {[
              { top: '30%', left: '25%', name: 'Mom', color: 'from-emerald-500 to-teal-500' },
              { top: '55%', left: '60%', name: 'Dad', color: 'from-blue-500 to-indigo-500' },
              { top: '40%', left: '70%', name: 'Alex', color: 'from-pink-500 to-rose-500' },
            ].map((m) => (
              <div
                key={m.name}
                className="absolute flex flex-col items-center gap-1"
                style={{ top: m.top, left: m.left }}
              >
                <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${m.color} border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold`}>
                  {m.name[0]}
                </div>
                <span className="text-[10px] font-medium bg-white/80 dark:bg-black/60 px-1.5 py-0.5 rounded-full shadow text-foreground">
                  {m.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
