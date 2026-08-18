'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Shield, Zap, Heart, Lock, Globe } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* ── Animated Background ── */}
      <div className="absolute inset-0 -z-10 bg-background overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Glow orbs */}
        <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-indigo-500/20 rounded-full blur-[100px] mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-fuchsia-500/15 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col items-center text-center">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-semibold mb-8 shadow-sm backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Real-time location sharing is now live
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground mb-6 max-w-4xl"
          >
            Stay close to{' '}
            <span className="relative inline-block">
              <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 blur-2xl opacity-30 animate-pulse"></span>
              <span className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                everyone
              </span>
            </span>
            <br className="hidden sm:block" />
            {' '}you love
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            LocaLink brings your family and friends together on one beautiful, secure, real-time map.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center"
          >
            <Button size="lg" className="h-14 px-8 text-base font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 group" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-base font-bold rounded-2xl border-border/60 bg-background/50 backdrop-blur-md hover:bg-muted/80 transition-all" asChild>
              <Link href="/login">Sign In to Dashboard</Link>
            </Button>
          </motion.div>

          {/* Feature Micro-Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-12 text-sm font-medium text-muted-foreground/80"
          >
            {[
              { icon: Shield, text: 'End-to-End Encrypted' },
              { icon: Globe, text: 'Global GPS Precision' },
              { icon: Zap, text: 'Live 15s Updates' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={16} className="text-primary/70" />
                {text}
              </div>
            ))}
          </motion.div>

          {/* ── Mock Dashboard Preview ── */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-20 w-full max-w-5xl relative"
          >
            {/* Outer Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 opacity-20 blur-2xl rounded-3xl -z-10" />
            
            {/* Glassmorphic Container */}
            <div className="relative rounded-3xl overflow-hidden border border-border/60 shadow-2xl bg-card/40 backdrop-blur-2xl">
              {/* Fake Window Header */}
              <div className="h-12 border-b border-border/40 flex items-center px-4 bg-muted/20">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="mx-auto px-4 py-1 rounded-md bg-background/50 border border-border/30 text-[10px] font-mono text-muted-foreground flex items-center gap-2">
                  <Lock size={10} className="text-emerald-500" />
                  localink.app/dashboard
                </div>
              </div>

              {/* Fake Map Content */}
              <div className="relative aspect-[16/10] md:aspect-[21/9] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center overflow-hidden">
                {/* Map Grid/Texture */}
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/0,0,2,0,0/1200x600?access_token=pk.eyJ1IjoiZmFrZSIsImEiOiJmYWtlIn0.fake')] bg-cover bg-center opacity-30 dark:invert dark:opacity-20 mix-blend-luminosity" />
                
                {/* Center Callout */}
                <div className="relative z-10 text-center p-6 rounded-3xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-xl max-w-sm">
                  <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center mb-4 shadow-lg ring-4 ring-card">
                    <MapPin size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Live Map Preview</h3>
                  <p className="text-sm text-muted-foreground">Sign in to start tracking your family and friends in real-time.</p>
                </div>

                {/* Floating Mock Markers */}
                {[
                  { top: '20%', left: '15%', name: 'Mom', img: 'M', color: 'from-emerald-400 to-teal-500', delay: 0 },
                  { top: '65%', left: '25%', name: 'Dad', img: 'D', color: 'from-blue-400 to-indigo-500', delay: 0.2 },
                  { top: '35%', left: '75%', name: 'Alex', img: 'A', color: 'from-fuchsia-400 to-pink-500', delay: 0.4 },
                  { top: '70%', left: '80%', name: 'Sarah', img: 'S', color: 'from-orange-400 to-amber-500', delay: 0.6 },
                ].map((m) => (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.8 + m.delay, type: 'spring' }}
                    className="absolute flex flex-col items-center gap-1.5"
                    style={{ top: m.top, left: m.left }}
                  >
                    <div className="relative">
                      {/* Ping animation */}
                      <div className={cn("absolute -inset-1 rounded-full opacity-50 animate-ping bg-gradient-to-br", m.color)} />
                      {/* Avatar */}
                      <div className={cn("relative h-12 w-12 rounded-full border-[3px] border-card shadow-xl flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br", m.color)}>
                        {m.img}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold bg-card/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-lg border border-border/50 text-foreground">
                      {m.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
