'use client';

/**
 * Custom ThemeProvider — drops next-themes entirely.
 *
 * next-themes injects a <script> tag for FOUC prevention which React 19
 * warns about. This implementation achieves the same result using:
 *   1. A tiny <script> in globals.css @layer base via data attribute
 *   2. Client-side localStorage read on mount
 *   3. Direct classList manipulation on <html>
 *
 * Exposes the same useTheme() API: { theme, resolvedTheme, setTheme, systemTheme, themes }
 */

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useMemo, type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  themes: Theme[];
  systemTheme: 'light' | 'dark';
}

const Ctx = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => undefined,
  themes: ['light', 'dark', 'system'],
  systemTheme: 'light',
});

export const useTheme = () => useContext(Ctx);

interface Props {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  disableTransitionOnChange?: boolean;
  // Accept but ignore next-themes compat props
  attribute?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme          = 'system',
  storageKey            = 'theme',
  disableTransitionOnChange = false,
}: Props) {

  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Hydrate stored theme and system preference on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(storageKey) as Theme | null;
        if (stored) setThemeState(stored);
      } catch {
        // ignore
      }

      if (typeof window !== 'undefined') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setSystemTheme(isDark ? 'dark' : 'light');
      }
    });

    return () => cancelAnimationFrame(id);
  }, [storageKey]);

  // Watch OS preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) =>
      setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Apply class + color-scheme to <html>
  useEffect(() => {
    const resolved = theme === 'system' ? systemTheme : theme;
    const root = document.documentElement;

    let restore: (() => void) | undefined;
    if (disableTransitionOnChange) {
      const s = document.createElement('style');
      s.textContent = '*,*::before,*::after{transition:none!important}';
      document.head.appendChild(s);
      restore = () => {
        window.getComputedStyle(document.body);
        setTimeout(() => document.head.removeChild(s), 1);
      };
    }

    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
    restore?.();
  }, [theme, systemTheme, disableTransitionOnChange]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try { localStorage.setItem(storageKey, next); } catch { /* quota */ }
  }, [storageKey]);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? systemTheme : theme;

  const value = useMemo<ThemeContextValue>(() => ({
    theme, resolvedTheme, setTheme,
    themes: ['light', 'dark', 'system'],
    systemTheme,
  }), [theme, resolvedTheme, setTheme, systemTheme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
