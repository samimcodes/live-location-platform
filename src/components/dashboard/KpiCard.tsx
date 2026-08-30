"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import Sparkline from "./Sparkline";

interface KpiCardProps {
  label:     string;
  value:     number | string;
  icon:      React.ComponentType<{ size?: number; className?: string }>;
  /** Tailwind text-color class */
  color?:    string;
  /** Tailwind bg class for icon wrapper (light tint) */
  bg?:       string;
  /**
   * CSS variable name (e.g. "--primary", "--chart-2") whose resolved value
   * is used for sparkline, progress bar, orb, and left accent.
   * Defaults to "--primary".
   */
  accentVar?: string;
  href?:     string;
  sub?:      string;
  /** 7 data-points (oldest → newest) for sparkline + trend */
  sparkData?: number[];
}

/** Count-up animation — 0 → target in `duration` ms with easeOutCubic */
function useCountUp(target: number, duration = 700) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (typeof target !== "number" || target === 0) return;
    const start = performance.now();
    const tick  = (now: number) => {
      const t  = Math.min((now - start) / duration, 1);
      const e  = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setCount(Math.round(e * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  if (typeof target !== "number" || target === 0) {
    return target;
  }

  return count;
}

/** Resolve a CSS custom property to its computed string value.
 *  Uses useEffect so the initial render matches SSR (fallback) — no hydration mismatch. */
function useCssVar(varName: string, fallback = "oklch(0.55 0.2 280)"): string {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const resolved = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      if (resolved) setValue(resolved);
    });
    return () => cancelAnimationFrame(id);
  }, [varName]);
  return value;
}

export default function KpiCard({
  label,
  value,
  icon:     Icon,
  color     = "text-primary",
  bg        = "bg-primary/10",
  accentVar = "--primary",
  href      = "#",
  sub,
  sparkData,
}: KpiCardProps) {
  const numericValue  = typeof value === "number" ? value : 0;
  // Always call hook unconditionally — Rules of Hooks require consistent call order
  const countedValue  = useCountUp(numericValue);
  const displayValue  = typeof value === "number" ? countedValue : value;

  // Resolved accent color from CSS design token
  const accent = useCssVar(accentVar);

  // Trend: last point minus first point of sparkData
  const trend =
    sparkData && sparkData.length >= 2
      ? sparkData[sparkData.length - 1] - sparkData[0]
      : null;

  // Progress bar width — capped 0–100
  const barWidth = Math.min(100, Math.max(8, numericValue === 0 ? 8 : numericValue * 12));

  return (
    <Link href={href} className="group block h-full">
      <div
        className={cn(
          // Layout & shape
          "relative flex flex-col justify-between h-full overflow-hidden",
          "rounded-2xl bg-card border border-border/60",
          "p-5",
          // Transitions — uses globals.css .card-shine and .glow-shadow
          "transition-all duration-300 ease-out",
          "hover:shadow-xl hover:-translate-y-1",
          "card-shine glow-shadow",
        )}
      >
        {/* ── Left edge accent line ─────────────────────────────── */}
        <div
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(180deg, ${accent}, ${accent}60)` }}
        />

        {/* ── Soft background orb ──────────────────────────────── */}
        <div
          className="absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl opacity-[0.06] group-hover:opacity-[0.11] transition-opacity duration-500"
          style={{ background: accent }}
        />

        {/* ── Icon row ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-4 relative z-[2]">
          <div
            className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
              "transition-transform duration-300 group-hover:scale-110",
              bg,
            )}
          >
            <Icon size={19} className={color} />
          </div>
          <ArrowUpRight
            size={15}
            className={cn(
              "mt-0.5 text-muted-foreground/25",
              "group-hover:text-muted-foreground/70",
              "group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
              "transition-all duration-300",
            )}
          />
        </div>

        {/* ── Value + label ─────────────────────────────────────── */}
        <div className="relative z-[2]">
          <p className="text-3xl font-extrabold tracking-tight tabular-nums leading-none animate-count-up">
            {displayValue}
          </p>
          <p className="text-sm text-muted-foreground font-medium mt-1.5">{label}</p>

          {/* Sub with trend badge */}
          {sub && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {trend !== null && trend !== 0 && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    trend > 0
                      ? "bg-chart-5/15 text-chart-5"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {trend > 0 ? "+" : ""}{trend}
                </span>
              )}
              <p className="text-xs text-muted-foreground/60 truncate">{sub}</p>
            </div>
          )}
        </div>

        {/* ── Sparkline ─────────────────────────────────────────── */}
        {sparkData && sparkData.length > 1 && (
          <div className="mt-3 -mx-1 relative z-[2]">
            <Sparkline data={sparkData} color={accent} height={34} />
          </div>
        )}

        {/* ── Bottom progress bar — uses border token for bg ─────── */}
        {!sparkData && (
          <div className="mt-4 h-1 rounded-full overflow-hidden bg-border/50 relative z-[2]">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width:      `${barWidth}%`,
                background: `linear-gradient(90deg, ${accent}, ${accent}70)`,
              }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
