'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LocaLinkLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showSubtitle?: boolean;
  showPulse?: boolean;
  className?: string;
  iconClassName?: string;
}

/**
 * LocaLink Brand Emblem — Precision Spatial Beacon with Orbital Connection Ring.
 * Symbolizes: Location Pin (Loca) + Interconnected Satellite Orbit (Link) + Live Mesh.
 */
export function LocaLinkIcon({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8 rounded-xl',
    md: 'h-9 w-9 rounded-xl',
    lg: 'h-11 w-11 rounded-2xl',
  }[size];

  const svgDimensions = {
    sm: 18,
    md: 20,
    lg: 24,
  }[size];

  return (
    <div
      className={cn(
        'relative flex items-center justify-center shrink-0',
        'bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 text-white',
        'shadow-[0_2px_10px_rgba(99,102,241,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]',
        'transition-transform duration-200 group-hover:scale-105 select-none',
        sizeClasses,
        className
      )}
    >
      <svg
        width={svgDimensions}
        height={svgDimensions}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Subtle glow filter for the central beacon */}
          <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Elliptical Spatial Orbit Ring (The "Link" Ring) */}
        <ellipse
          cx="14"
          cy="14"
          rx="11.5"
          ry="5.2"
          transform="rotate(-26 14 14)"
          stroke="white"
          strokeWidth="1.4"
          strokeOpacity="0.45"
          strokeDasharray="2 1.5"
        />

        {/* 2. Precision Location Beacon Pin (The "Loca" Core) */}
        <path
          d="M14 3.5C10.41 3.5 7.5 6.41 7.5 10C7.5 14.875 14 23.5 14 23.5C14 23.5 20.5 14.875 20.5 10C20.5 6.41 17.59 3.5 14 3.5Z"
          fill="white"
          fillOpacity="0.18"
          stroke="white"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />

        {/* 3. Central Connection Pulse Node */}
        <circle cx="14" cy="10" r="3.2" fill="white" />
        <circle cx="14" cy="10" r="1.6" fill="#4F46E5" />

        {/* 4. Active Satellite Node on Orbit */}
        <circle cx="23.2" cy="9.8" r="1.75" fill="#38BDF8" />
      </svg>
    </div>
  );
}

export function LocaLinkLogo({
  size = 'md',
  showText = true,
  showSubtitle = false,
  showPulse = true,
  className,
  iconClassName,
}: LocaLinkLogoProps) {
  const textClasses = {
    sm: 'text-base font-bold',
    md: 'text-[17px] font-bold tracking-tight',
    lg: 'text-xl font-extrabold tracking-tight',
  }[size];

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <LocaLinkIcon size={size} className={iconClassName} />

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={cn('text-slate-950 dark:text-white', textClasses)}>
              Loca<span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">Link</span>
            </span>

            {showPulse && (
              <span className="relative flex h-2 w-2" title="Real-time GPS network live">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
          </div>

          {showSubtitle && (
            <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">
              Spatial Family Radar
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default LocaLinkLogo;

