"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  label:  string;
  value:  number | string;
  icon:   React.ComponentType<{ size?: number; className?: string }>;
  color?: string;    // Tailwind text-color class
  bg?:    string;    // Tailwind bg class for icon wrapper
  accent?: string;   // hex color for glow + accents
  href?:  string;
  sub?:   string;
  /** 7 data-points for trend calculation (oldest → newest) */
  sparkData?: number[];
}

/** Animated counter hook — counts from 0 → target */
function useCountUp(target: number, duration = 600) {
  const [count, setCount] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (typeof target !== "number" || target === 0) {
      setCount(target);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        ref.current = requestAnimationFrame(step);
      }
    };
    ref.current = requestAnimationFrame(step);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);

  return count;
}

/** Extract RGB from hex for CSS custom properties */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export default function KpiCard({
  label,
  value,
  icon: Icon,
  color   = "text-primary",
  bg      = "bg-primary/10",
  accent  = "#7c3aed",
  href    = "#",
  sub,
  sparkData,
}: KpiCardProps) {
  const numericValue = typeof value === "number" ? value : 0;
  const animatedCount = useCountUp(numericValue);
  const displayValue  = typeof value === "number" ? animatedCount : value;

  // Trend direction from sparkData
  const trend =
    sparkData && sparkData.length >= 2
      ? sparkData[sparkData.length - 1] - sparkData[0]
      : null;

  const rgb = hexToRgb(accent);

  return (
    <Link href={href} className="group block h-full">
      <div
        className={cn(
          "relative flex flex-col justify-between h-full overflow-hidden",
          "rounded-2xl bg-card",
          "border border-border/60",
          "p-5 transition-all duration-300 ease-out",
          "hover:shadow-xl hover:-translate-y-1",
          "card-shine glow-shadow",
        )}
        style={{
          "--glow-r": rgb.r,
          "--glow-g": rgb.g,
          "--glow-b": rgb.b,
        } as React.CSSProperties}
      >
        {/* Subtle gradient accent on the left edge */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(180deg, ${accent}, ${accent}80)` }}
        />

        {/* Background gradient orb — very subtle */}
        <div
          className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500 blur-2xl"
          style={{ background: accent }}
        />

        {/* Top row: icon + arrow */}
        <div className="flex items-start justify-between mb-4 relative z-[2]">
          <div
            className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
              "shadow-sm transition-transform duration-300 group-hover:scale-110",
            )}
            style={{
              background: `linear-gradient(135deg, ${accent}18, ${accent}30)`,
            }}
          >
            <Icon size={19} className={color} />
          </div>
          <ArrowUpRight
            size={15}
            className="text-muted-foreground/20 group-hover:text-muted-foreground/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 mt-0.5"
          />
        </div>

        {/* Value + label */}
        <div className="relative z-[2]">
          <p className="text-3xl font-extrabold tracking-tight tabular-nums leading-none animate-count-up">
            {displayValue}
          </p>
          <p className="text-sm text-muted-foreground font-medium mt-1.5">
            {label}
          </p>

          {/* Sub-label with trend indicator */}
          {sub && (
            <div className="flex items-center gap-1.5 mt-1">
              {trend !== null && trend !== 0 && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    trend > 0
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400",
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

        {/* Bottom accent line */}
        <div className="mt-4 h-1 rounded-full overflow-hidden bg-muted/50">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(100, Math.max(15, numericValue * 10))}%`,
              background: `linear-gradient(90deg, ${accent}, ${accent}90)`,
            }}
          />
        </div>
      </div>
    </Link>
  );
}
