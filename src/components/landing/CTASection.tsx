'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Send, ShieldCheck, Users, Zap, Star } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { value: '2K+', label: 'Active Families', icon: Users },
  { value: '99.9%', label: 'Uptime SLA', icon: Zap },
  { value: '4.9★', label: 'User Rating', icon: Star },
];

export function CTASection() {
  return (
    <section id="cta" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-[#F8F9FD] dark:bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/20"
        >
          {/* Layered gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#6366F1]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/20 to-indigo-400/30" />

          {/* Decorative blurred orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-300/10 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative z-10 p-10 sm:p-16 lg:p-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left: Text Content */}
              <div className="lg:col-span-7 space-y-8 text-left">
                {/* Label Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Trusted Platform • Free to Start
                </div>

                {/* Headline */}
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
                    Ready to keep your family<br />
                    <span className="text-purple-200">safe and connected?</span>
                  </h2>
                  <p className="text-white/75 text-base sm:text-lg leading-relaxed font-normal max-w-lg">
                    Join thousands of families who trust LocaLink for real-time location awareness, instant geofence alerts, and total peace of mind.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="h-13 px-8 font-bold text-sm rounded-2xl bg-white text-[#7C3AED] hover:bg-white/95 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 active:translate-y-0 group gap-2"
                    asChild
                  >
                    <Link href="/register">
                      Start for Free
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-13 px-7 font-bold text-sm rounded-2xl border border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm gap-2"
                    asChild
                  >
                    <Link href="/login">
                      <Send size={15} />
                      Sign In to Dashboard
                    </Link>
                  </Button>
                </div>

                {/* Trust Line */}
                <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  No credit card required • Setup takes under 2 minutes • Free forever up to 5 members
                </div>
              </div>

              {/* Right: Stats Card */}
              <div className="lg:col-span-5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.93, x: 20 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 space-y-6 shadow-2xl"
                >
                  {/* Mini Logo + Title */}
                  <div className="flex items-center gap-3 pb-2 border-b border-white/15">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M12 11.5C13.38 11.5 14.5 10.38 14.5 9C14.5 7.62 13.38 6.5 12 6.5C10.62 6.5 9.5 7.62 9.5 9C9.5 10.38 10.62 11.5 12 11.5Z" fill="white"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">LocaLink Platform</div>
                      <div className="text-white/60 text-xs font-medium">Real-time • Secure • Private</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-4">
                    {stats.map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                              <Icon size={16} />
                            </div>
                            <span className="text-white/70 text-sm font-medium">{s.label}</span>
                          </div>
                          <span className="text-white font-black text-lg">{s.value}</span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Avatar Stack */}
                  <div className="pt-2 border-t border-white/15 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
                      ].map((url, i) => (
                        <img key={i} src={url} alt="" className="h-8 w-8 rounded-full ring-2 ring-white/30 object-cover" />
                      ))}
                    </div>
                    <p className="text-white/70 text-xs font-medium">
                      <strong className="text-white">2,000+ families</strong> already tracking safely
                    </p>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
