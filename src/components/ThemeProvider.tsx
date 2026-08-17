'use client';

/**
 * ThemeProvider + useTheme
 * ------------------------
 * Lightweight drop-in replacement for next-themes that avoids the
 * React 19 <script> tag warning.
 *
 * Strategy:
 *  - Reads initial theme from localStorage on mount (client-only)
 *  - Applies "dark" class to <html> element directly
 *  - Listens to system prefers-color-scheme changes
 *  - Persists preference to localStorage
 *  - Exposes the same useTheme() API surface as next-themes
 *
 * FOUC prevention: a small inline script in globals.css @layer base
 * sets the correct class before React hydrates (no React component needed).
 */

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useMemo, type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  themes: Theme[];
  systemTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => undefined,
  themes: ['light', 'dark', 'system'],
  systemTheme: 'light',
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme   = 'system',
  storageKey     = 'theme',
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) setThemeState(stored);
    setSystemTheme(getSystemTheme());
  }, [storageKey, getSystemTheme]);

  // Watch system preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Apply theme class to <html>
  useEffect(() => {
    const resolved = theme === 'system' ? systemTheme : theme;
    const root = document.documentElement;

    let cleanup: (() => void) | undefined;
    if (disableTransitionOnChange) {
      const style = document.createElement('style');
      style.textContent = '*,*::before,*::after{transition:none!important}';
      document.head.appendChild(style);
      cleanup = () => {
        window.getComputedStyle(document.body); // force reflow
        setTimeout(() => document.head.removeChild(style), 1);
      };
    }

    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.style.colorScheme = resolved;

    cleanup?.();
  }, [theme, systemTheme, disableTransitionOnChange]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try { localStorage.setItem(storageKey, next); } catch { /* ignore */ }
  }, [storageKey]);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    resolvedTheme,
    setTheme,
    themes: ['light', 'dark', 'system'],
    systemTheme,
  }), [theme, resolvedTheme, setTheme, systemTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
