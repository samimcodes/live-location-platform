'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Menu, X, ChevronRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#cta' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out',
        scrolled
          ? 'py-3'
          : 'py-5'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={cn(
          'transition-all duration-500 ease-out flex items-center justify-between',
          scrolled
            ? 'bg-background/70 backdrop-blur-xl border border-border/50 shadow-sm shadow-black/5 rounded-2xl px-5 h-16'
            : 'bg-transparent px-2 h-14'
        )}>
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <MapPin size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              LocaLink
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-200"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="rounded-xl font-semibold hover:bg-muted/50" asChild>
              <Link href="/login">
                <LogIn size={14} className="mr-2 opacity-50" />
                Sign In
              </Link>
            </Button>
            <Button size="sm" className="rounded-xl shadow-sm font-semibold gap-1.5 group" asChild>
              <Link href="/register">
                Get Started
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 -mr-2 rounded-xl hover:bg-muted/80 transition-colors text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-[calc(100%+0.5rem)] left-4 right-4 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-base font-semibold text-foreground/80 hover:text-foreground rounded-xl hover:bg-muted/50 transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <div className="pt-4 mt-2 border-t border-border/30 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full rounded-xl h-11 border-border/50 bg-background" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button className="w-full rounded-xl h-11 shadow-sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
