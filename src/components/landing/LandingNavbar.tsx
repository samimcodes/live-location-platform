'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Live Map', href: '#map-preview', id: 'map-preview' },
  { label: 'Features', href: '#features', id: 'features' },
  { label: 'How it works', href: '#how-it-works', id: 'how-it-works' },
  { label: 'Pricing', href: '#cta', id: 'cta' },
  { label: 'FAQ', href: '#faq', id: 'faq' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('map-preview');
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll listener for sticky glass elevation & section tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Section tracking for active dot
      const sections = navLinks.map((link) => document.querySelector(link.href));
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i] as HTMLElement | null;
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(navLinks[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out',
        scrolled ? 'py-3' : 'py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className={cn(
            'transition-all duration-300 ease-out flex items-center justify-between',
            scrolled
              ? 'bg-white/85 dark:bg-card/90 backdrop-blur-2xl border border-slate-200/80 dark:border-border/80 shadow-[0_12px_36px_rgba(0,0,0,0.06)] rounded-2xl px-6 h-16'
              : 'bg-white/95 dark:bg-card/95 backdrop-blur-xl border border-slate-100 dark:border-border rounded-2xl px-6 h-16 shadow-[0_4px_25px_rgba(0,0,0,0.03)]'
          )}
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] opacity-50 blur-xs group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M12 11.5C13.3807 11.5 14.5 10.3807 14.5 9C14.5 7.61929 13.3807 6.5 12 6.5C10.6193 6.5 9.5 7.61929 9.5 9C9.5 10.3807 10.6193 11.5 12 11.5Z" fill="white"/>
                </svg>
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-foreground leading-none">
                LocaLink
              </span>
              <span className="text-[9px] font-black tracking-widest text-[#7C3AED] uppercase mt-0.5">
                LIVE LOCATION
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav
            className="hidden md:flex items-center gap-2"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {navLinks.map((l) => {
              const isActive = activeSection === l.id;
              const isHovered = hoveredLink === l.id;

              return (
                <a
                  key={l.label}
                  href={l.href}
                  onMouseEnter={() => setHoveredLink(l.id)}
                  className={cn(
                    'relative px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 rounded-xl',
                    isActive
                      ? 'text-slate-900 dark:text-foreground font-bold'
                      : 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground'
                  )}
                >
                  {/* Subtle hover background highlight */}
                  {isHovered && (
                    <motion.div
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 bg-slate-100/70 dark:bg-muted/60 rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  {l.label}

                  {/* Active purple indicator dot */}
                  {isActive && (
                    <motion.span
                      layoutId="active-indicator-dot"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#7C3AED]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold text-slate-700 dark:text-foreground hover:text-[#7C3AED] flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-muted/50"
            >
              <LogIn size={16} className="text-slate-500 dark:text-muted-foreground" />
              Sign In
            </Link>

            <Button
              size="sm"
              className="h-11 px-6 font-bold text-sm rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all group gap-1.5"
              asChild
            >
              <Link href="/register">
                Get Started
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden absolute top-[calc(100%+0.5rem)] left-4 right-4 bg-white/95 dark:bg-card/95 backdrop-blur-2xl border border-slate-100 dark:border-border rounded-2xl shadow-2xl p-4 space-y-2 z-50"
          >
            {navLinks.map((l) => {
              const isActive = activeSection === l.id;
              return (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block text-sm font-semibold py-2.5 px-3.5 rounded-xl transition-colors',
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-[#7C3AED] font-bold'
                      : 'text-slate-700 dark:text-foreground hover:bg-slate-50 dark:hover:bg-muted'
                  )}
                >
                  {l.label}
                </a>
              );
            })}
            <div className="pt-3 border-t border-slate-100 dark:border-border grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full h-11 font-bold text-sm rounded-2xl bg-white border border-slate-200 text-[#1E293B] shadow-sm hover:bg-slate-50" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="w-full h-11 font-bold text-sm rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/30" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
