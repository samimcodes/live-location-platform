import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Sparkline from "./Sparkline";

interface KpiCardProps {
  label:  string;
  value:  number | string;
  icon:   React.ComponentType<{ size?: number; className?: string }>;
  color?: string;    // Tailwind text-color class
  bg?:    string;    // Tailwind bg class for icon wrapper
  accent?: string;  // hex color for sparkline + left-border accent
  href?:  string;
  sub?:   string;
  /** 7 data-points for the sparkline (oldest → newest) */
  sparkData?: number[];
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
  // Trend direction for the sub-label indicator
  const trend =
    sparkData && sparkData.length >= 2
      ? sparkData[sparkData.length - 1] - sparkData[0]
      : null;

  return (
    <Link href={href} className="group block h-full">
      <div
        className={cn(
          "relative flex flex-col justify-between h-full overflow-hidden",
          "rounded-2xl border border-border bg-card",
          "p-5 transition-all duration-200",
          "hover:shadow-lg hover:-translate-y-0.5",
          // Left accent border on hover
          "border-l-2 border-l-transparent hover:border-l-2",
        )}
        style={{ "--accent": accent } as React.CSSProperties}
      >
        {/* Hover left-border accent via inline style */}
        <style>{`
          .group:hover [data-accent-border] {
            border-left-color: var(--accent);
          }
        `}</style>
        <span data-accent-border className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-hover:border-l-[3px] transition-all duration-200" style={{ borderLeftColor: "transparent" }} />

        {/* Top row: icon + arrow */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
            <Icon size={18} className={color} />
          </div>
          <ArrowUpRight
            size={14}
            className="text-muted-foreground/20 group-hover:text-muted-foreground/60 transition-colors mt-0.5"
          />
        </div>

        {/* Value + label */}
        <div>
          <p className="text-3xl font-bold tracking-tight tabular-nums leading-none">
            {value}
          </p>
          <p className="text-sm text-muted-foreground font-medium mt-1">{label}</p>

          {/* Sub-label with trend indicator */}
          {sub && (
            <div className="flex items-center gap-1 mt-0.5">
              {trend !== null && trend !== 0 && (
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    trend > 0 ? "text-emerald-500" : "text-red-400",
                  )}
                >
                  {trend > 0 ? "↑" : "↓"}
                </span>
              )}
              <p className="text-xs text-muted-foreground/60 truncate">{sub}</p>
            </div>
          )}
        </div>

        {/* Sparkline pinned to bottom */}
        {sparkData && sparkData.length > 1 && (
          <div className="mt-3 -mx-1">
            <Sparkline data={sparkData} color={accent} height={36} />
          </div>
        )}
      </div>
    </Link>
  );
}
