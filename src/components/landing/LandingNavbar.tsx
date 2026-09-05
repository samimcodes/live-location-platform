'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, LogIn, Sun, Moon, Monitor, Shield, Navigation, MapPin, Zap, ShieldAlert, Users, CreditCard, Star, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import { soundFx } from '@/lib/soundFx';

const navLinks = [
  { label: 'Radar Map', href: '#map-preview', id: 'map-preview', icon: MapPin },
  { label: 'Features', href: '#features', id: 'features', icon: Zap },
  { label: 'Emergency SOS', href: '#emergency-sos', id: 'emergency-sos', icon: ShieldAlert },
  { label: 'How It Works', href: '#how-it-works', id: 'how-it-works', icon: Navigation },
  { label: 'Circles', href: '#circles-safety', id: 'circles-safety', icon: Users },
  { label: 'Pricing', href: '#pricing', id: 'pricing', icon: CreditCard },
  { label: 'Reviews', href: '#testimonials', id: 'testimonials', icon: Star },
  { label: 'FAQ', href: '#faq', id: 'faq', icon: HelpCircle },
];

export function LandingNavbar() {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('map-preview');
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mounted = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  const currentTheme = mounted ? (theme ?? 'system') : 'system';
  const ThemeIcon =
    !mounted                 ? Monitor :
    currentTheme === 'dark'  ? Moon :
    currentTheme === 'light' ? Sun :
    Monitor;

  const cycleTheme = () => {
    soundFx?.playPop?.();
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  // Scroll listener for sticky glass elevation & active section tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

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
        scrolled ? 'py-2.5 sm:py-3' : 'py-4 sm:py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className={cn(
            'transition-all duration-300 ease-out flex items-center justify-between',
            scrolled
              ? 'bg-white/90 dark:bg-[#0A1020]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/90 shadow-[0_12px_36px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] rounded-2xl px-4 sm:px-5 h-16'
              : 'bg-white/95 dark:bg-[#0A1020]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/70 rounded-2xl px-4 sm:px-5 h-16 shadow-[0_4px_25px_rgba(0,0,0,0.04)]'
          )}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            onClick={() => soundFx?.playPop?.()}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer shrink-0"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 opacity-60 blur-xs group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M12 11.5C13.3807 11.5 14.5 10.3807 14.5 9C14.5 7.61929 13.3807 6.5 12 6.5C10.6193 6.5 9.5 7.61929 9.5 9C9.5 10.3807 10.6193 11.5 12 11.5Z" fill="white"/>
                </svg>
              </div>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white leading-none">
                  LocaLink
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300/40">
                  LIVE
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-violet-600 dark:text-violet-400 uppercase mt-0.5">
                GPS NETWORK
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav
            className="hidden lg:flex items-center gap-0.5 xl:gap-1"
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
                  onClick={() => soundFx?.playPop?.()}
                  className={cn(
                    'relative px-2.5 xl:px-3 py-1.5 text-xs xl:text-[13px] font-bold transition-colors duration-200 rounded-xl',
                    isActive
                      ? 'text-slate-950 dark:text-white font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  )}
                >
                  {/* Subtle hover background highlight */}
                  {isHovered && (
                    <motion.div
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 bg-slate-100/90 dark:bg-[#15203A] rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  {l.label}

                  {/* Active violet indicator dot */}
                  {isActive && (
                    <motion.span
                      layoutId="active-indicator-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 shadow-[0_0_8px_#8B5CF6]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={cycleTheme}
              aria-label={mounted ? `Theme: ${theme ?? 'system'}` : 'Toggle theme'}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-violet-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ThemeIcon size={17} />
            </button>

            <Link
              href="/login"
              onClick={() => soundFx?.playPop?.()}
              className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-violet-600 flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <LogIn size={15} className="text-slate-500 dark:text-slate-400" />
              <span>Sign In</span>
            </Link>

            <Button
              size="sm"
              className="h-9 sm:h-10 px-4 sm:px-5 font-bold text-xs sm:text-sm rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/25 hover:shadow-lg transition-all hover:-translate-y-0.5 group gap-1.5 cursor-pointer"
              onClick={() => soundFx?.playPop?.()}
              asChild
            >
              <Link href="/register">
                <span>Get Started</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Mobile menu toggle & theme */}
          <div className="lg:hidden flex items-center gap-1">
            <button
              onClick={cycleTheme}
              aria-label={mounted ? `Theme: ${theme ?? 'system'}` : 'Toggle theme'}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ThemeIcon size={18} />
            </button>
            <button
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => {
                soundFx?.playPop?.();
                setMobileOpen(!mobileOpen);
              }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="lg:hidden absolute top-[calc(100%+0.5rem)] left-4 right-4 bg-white/95 dark:bg-[#0E1528]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-1.5 z-50 max-h-[82vh] overflow-y-auto"
            >
              {navLinks.map((l) => {
                const isActive = activeSection === l.id;
                const Icon = l.icon;
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => {
                      soundFx?.playPop?.();
                      setMobileOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 text-sm font-bold py-2.5 px-3.5 rounded-xl transition-colors',
                      isActive
                        ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-extrabold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <Icon size={16} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'} />
                    <span>{l.label}</span>
                  </a>
                );
              })}
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full h-11 font-bold text-sm rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-800 dark:text-foreground shadow-xs"
                  asChild
                >
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button
                  className="w-full h-11 font-bold text-sm rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/25"
                  asChild
                >
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
