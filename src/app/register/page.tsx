'use client';

import { SignUpForm } from '@/components/auth/signup';
import { MapPin, ShieldCheck, Zap, Users, ArrowLeft, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const perks = [
    { 
      icon: ShieldCheck, 
      title: 'End-to-End Encrypted', 
      desc: 'Your location data is private and visible only to your trusted circle.' 
    },
    { 
      icon: Zap, 
      title: 'Real-Time GPS Sync', 
      desc: 'Instant updates every 15 seconds with zero battery drain.' 
    },
    { 
      icon: Users, 
      title: 'Unlimited Circles', 
      desc: 'Create separate private maps for family, close friends, and teams.' 
    },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-background relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-card/60 hover:bg-card border border-border/40 backdrop-blur-md px-3.5 py-2 rounded-xl transition-all shadow-sm"
      >
        <ArrowLeft size={14} />
        Back to Home
      </Link>

      {/* Left panel — Branding & Perks */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-purple-600/90 via-indigo-600/90 to-blue-600/90 flex-col justify-between p-12 lg:p-16 overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Logo */}
        <div className="relative z-10 pt-8">
          <Link href="/" className="inline-flex items-center gap-3 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              <MapPin size={22} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">LocaLink</span>
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 my-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 uppercase tracking-widest bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 mb-6">
              <HeartHandshake size={14} />
              Free Forever For Families
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
              Start protecting <br />
              your family today.
            </h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-md mb-10">
              Create your account in less than 2 minutes. No credit card required.
            </p>
          </motion.div>

          {/* Perks list */}
          <div className="space-y-4 max-w-md">
            {perks.map(({ icon: Icon, title, desc }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-sm hover:bg-white/15 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white shadow-inner">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  <p className="text-xs text-white/70 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 text-white/60 text-xs font-medium">
          Join over 10,000+ connected members worldwide.
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Mobile branding */}
          <div className="flex lg:hidden items-center justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <MapPin size={20} className="text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                LocaLink
              </span>
            </Link>
          </div>

          {/* Form Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-black/5"
          >
            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Create Account</h1>
              <p className="text-muted-foreground text-sm mt-2">Get started with your free LocaLink account</p>
            </div>

            <SignUpForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
