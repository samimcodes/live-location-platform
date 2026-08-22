'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, EyeOff, UserPlus, Share2, Shield, Battery, CheckCircle2, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const friendItems = [
  { name: 'Mom (Emma)', status: 'At Home', distance: '1.2 km away', battery: '92%', online: true, color: 'bg-emerald-500' },
  { name: 'Dad (Robert)', status: 'Driving to Work', distance: '8.4 km away', battery: '78%', online: true, color: 'bg-blue-500' },
  { name: 'Alex (Brother)', status: 'At University', distance: '4.1 km away', battery: '45%', online: true, color: 'bg-purple-500' },
  { name: 'Sarah (Sister)', status: 'Offline (Ghost Mode)', distance: 'Hidden', battery: '85%', online: false, color: 'bg-muted-foreground' },
];

export function FriendsRealtimeSection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual UI Card Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <div className="rounded-3xl border border-border/80 bg-card shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">Family Circle</h3>
                    <p className="text-xs text-muted-foreground">4 Members Active • Real-time Sync</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Wifi size={12} className="animate-pulse" />
                  Live Socket Connected
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                {friendItems.map((item) => (
                  <div
                    key={item.name}
                    className="p-4 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/30 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-background flex items-center justify-center font-bold text-foreground">
                          {item.name[0]}
                        </div>
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${item.color}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{item.status}</span>
                          <span>•</span>
                          <span className="font-medium text-foreground/80">{item.distance}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-background px-2.5 py-1 rounded-lg border border-border/50">
                      <Battery size={13} className="text-primary" />
                      {item.battery}
                    </div>
                  </div>
                ))}
              </div>

              {/* Privacy Notice Banner */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-3 text-xs text-muted-foreground">
                <EyeOff size={18} className="text-primary shrink-0" />
                <span>
                  <strong>Ghost Mode Control:</strong> Pause location sharing anytime for individual friends or circles with a single tap.
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Text & Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-8 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Users size={14} />
              Circles & Privacy First
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-[1.15]">
              Stay connected with <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">complete privacy control</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed">
              Create invite-only circles for family, travel buddies, or close friends. Share live movements when you want, and hide your location with Ghost Mode whenever you need privacy.
            </p>

            <div className="space-y-4">
              {[
                { title: 'Invite-Only Private Circles', desc: 'Nobody outside your explicit circle can view your map coordinates.' },
                { title: 'Granular Ghost Mode', desc: 'Choose to share precise GPS, fuzzy city-level location, or freeze your marker entirely.' },
                { title: 'Real-time Battery & Signal Alerts', desc: 'Know when a family member’s phone battery is running dangerously low.' },
              ].map((point) => (
                <div key={point.title} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{point.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Button size="lg" className="rounded-2xl font-bold gap-2" asChild>
                <Link href="/register">
                  <UserPlus size={16} />
                  Create Your Circle Free
                </Link>
              </Button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
