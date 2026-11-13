'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Zap,
  ShieldAlert,
  Navigation,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  Map,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import { soundFx } from '@/lib/soundFx';
import { useAuth } from '@/hooks/useAuth';
import { LocaLinkLogo } from '@/components/brand/LocaLinkLogo';

const navLinks = [
  { label: 'Features', href: '#features', id: 'features', icon: Zap },
  { label: 'Safety', href: '#emergency-sos', id: 'emergency-sos', icon: ShieldAlert },
  { label: 'How It Works', href: '#how-it-works', id: 'how-it-works', icon: Navigation },
  { label: 'Pricing', href: '#pricing', id: 'pricing', icon: CreditCard },
  { label: 'FAQ', href: '#faq', id: 'faq', icon: HelpCircle },
];

export function LandingNavbar() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mounted = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  const currentTheme = mounted ? (theme ?? 'system') : 'system';
  const ThemeIcon =
    !mounted ? Monitor :
    currentTheme === 'dark' ? Moon :
    currentTheme === 'light' ? Sun :
    Monitor;

  const themeLabel =
    !mounted ? 'Toggle theme' :
    currentTheme === 'dark' ? 'Theme: Dark' :
    currentTheme === 'light' ? 'Theme: Light' :
    'Theme: System';

  const cycleTheme = () => {
    soundFx?.playPop?.();
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  // Sticky glass elevation & viewport-accurate section tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);

      if (window.scrollY < 160) {
        setActiveSection('');
        return;
      }

      const threshold = 180;
      let current = '';
      for (const link of navLinks) {
        const el = document.querySelector(link.href);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold) {
            current = link.id;
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on Escape or resize to desktop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const highlightedId = hoveredLink ?? activeSection;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out',
        scrolled ? 'py-2.5' : 'py-3.5 sm:py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-50">
        <div
          className={cn(
            'relative flex items-center justify-between gap-3 rounded-2xl px-3.5 sm:px-4 h-14 sm:h-[60px] transition-all duration-300 ease-out',
            'border ring-1 ring-inset',
            scrolled
              ? 'bg-white/88 dark:bg-[#0B1120]/88 backdrop-blur-2xl border-slate-200/80 dark:border-white/[0.09] ring-white/60 dark:ring-white/[0.05] shadow-[0_10px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_14px_38px_rgba(0,0,0,0.5)]'
              : 'bg-white/75 dark:bg-[#0B1120]/75 backdrop-blur-xl border-slate-200/70 dark:border-white/[0.07] ring-white/50 dark:ring-white/[0.04] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
          )}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            onClick={() => {
              soundFx?.playPop?.();
              setMobileOpen(false);
            }}
            className="group shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <LocaLinkLogo size="md" />
          </Link>

          {/* Center Navigation Pill (Desktop) */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center p-1 rounded-full bg-slate-100/75 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06]"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              const isHighlighted = highlightedId === link.id;

              return (
                <a
                  key={link.id}
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.id)}
                  onClick={() => {
                    soundFx?.playPop?.();
                    setActiveSection(link.id);
                  }}
                  className={cn(
                    'relative px-3.5 py-1.5 text-[13px] rounded-full transition-colors duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    isActive
                      ? 'font-semibold text-slate-950 dark:text-white'
                      : isHighlighted
                        ? 'font-medium text-slate-900 dark:text-white'
                        : 'font-medium text-slate-600 dark:text-slate-300/90 hover:text-slate-950 dark:hover:text-white'
                  )}
                >
                  {isHighlighted && (
                    <motion.span
                      layoutId="landing-nav-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className={cn(
                        'absolute inset-0 rounded-full',
                        isActive && !hoveredLink
                          ? 'bg-white dark:bg-white/[0.11] shadow-[0_1px_3px_rgba(15,23,42,0.08)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.35)]'
                          : 'bg-white/90 dark:bg-white/[0.08] shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
                      )}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Actions (Single theme button across all breakpoints + CTAs) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={cycleTheme}
              aria-label={themeLabel}
              title={themeLabel}
              className="h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-white/[0.07] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <ThemeIcon size={16} />
            </button>

            <span className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-white/[0.1]" aria-hidden="true" />

            <div className="hidden sm:flex items-center gap-1.5">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard/map"
                    onClick={() => soundFx?.playPop?.()}
                    className="h-9 px-3.5 rounded-full text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-white/[0.07] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Map size={14} className="text-slate-500 dark:text-slate-400" />
                    <span>Live Map</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => soundFx?.playPop?.()}
                    className="h-9 px-4 rounded-full text-[13px] font-semibold bg-gradient-to-b from-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all duration-200 active:scale-[0.98] inline-flex items-center gap-1.5 whitespace-nowrap group"
                  >
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => soundFx?.playPop?.()}
                    className="h-9 px-3.5 rounded-full text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-white/[0.07] transition-colors inline-flex items-center whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => soundFx?.playPop?.()}
                    className="h-9 px-4 rounded-full text-[13px] font-semibold bg-gradient-to-b from-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all duration-200 active:scale-[0.98] inline-flex items-center gap-1.5 whitespace-nowrap group"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile/Tablet Menu Trigger */}
            <button
              type="button"
              onClick={() => {
                soundFx?.playPop?.();
                setMobileOpen((prev) => !prev);
              }}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="landing-mobile-nav"
              className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100/90 dark:hover:bg-white/[0.07] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Dropdown Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/35 backdrop-blur-[2px] z-40 lg:hidden"
            />

            <motion.div
              id="landing-mobile-nav"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="lg:hidden absolute top-[calc(100%+0.35rem)] left-4 right-4 sm:left-6 sm:right-6 bg-white/95 dark:bg-[#0D1426]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.09] rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.16)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] p-3 z-50 max-h-[80dvh] overflow-y-auto"
            >
              <nav aria-label="Mobile navigation" className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      onClick={() => {
                        soundFx?.playPop?.();
                        setActiveSection(link.id);
                        setMobileOpen(false);
                      }}
                      className={cn(
                        'flex items-center gap-3 text-sm font-medium py-2.5 px-3 rounded-xl transition-colors',
                        isActive
                          ? 'bg-indigo-50/90 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.05]'
                      )}
                    >
                      <span
                        className={cn(
                          'h-7 w-7 rounded-lg flex items-center justify-center shrink-0',
                          isActive
                            ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                            : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400'
                        )}
                      >
                        <Icon size={14} />
                      </span>
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="sm:hidden mt-3 pt-3 border-t border-slate-200/80 dark:border-white/[0.08] grid grid-cols-2 gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard/map"
                      onClick={() => setMobileOpen(false)}
                      className="h-10 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-slate-800 dark:text-slate-100 text-sm font-semibold inline-flex items-center justify-center gap-1.5"
                    >
                      <Map size={14} />
                      <span>Live Map</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="h-10 rounded-xl bg-gradient-to-b from-indigo-500 to-violet-600 text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <LayoutDashboard size={14} />
                      <span>Dashboard</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="h-10 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-slate-800 dark:text-slate-100 text-sm font-semibold inline-flex items-center justify-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="h-10 rounded-xl bg-gradient-to-b from-indigo-500 to-violet-600 text-white text-sm font-semibold inline-flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Get Started</span>
                      <ArrowRight size={14} />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
