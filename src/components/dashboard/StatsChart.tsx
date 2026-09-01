'use client';

import React, { useId } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface DataPoint {
  date: string;
  value: number;
}

export interface StatsChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  unit?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit?: string;
}

function CustomTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl px-3.5 py-2.5 shadow-xl text-xs">
      <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">{label}</p>
      <p className="font-extrabold text-foreground text-sm flex items-center gap-1">
        <span>{payload[0].value.toLocaleString()}</span>
        {unit && <span className="text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}

const emptySubscribe = () => () => {};

export default function StatsChart({
  data,
  color,
  height = 180,
  unit,
}: StatsChartProps) {
  const uid = useId();
  const gradId = `chart-grad-${uid.replace(/:/g, '')}`;
  const isClient = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Resolve CSS variable at render time so Recharts SVG attrs get a real color value.
  const resolvedColor = React.useMemo(() => {
    if (typeof window === 'undefined') return 'oklch(0.65 0.2 280)';
    if (color && !color.startsWith('var(')) return color;

    const varName = color?.startsWith('var(')
      ? color.slice(4, -1).trim()
      : '--chart-1';

    return (
      getComputedStyle(document.documentElement).getPropertyValue(varName).trim() ||
      '#6366f1'
    );
  }, [color]);

  if (!isClient) {
    return <div style={{ height }} className="w-full bg-muted/20 animate-pulse rounded-xl" />;
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={resolvedColor} stopOpacity={0.35} />
              <stop offset="60%" stopColor={resolvedColor} stopOpacity={0.08} />
              <stop offset="100%" stopColor={resolvedColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="currentColor"
            className="text-border/40"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-muted-foreground/70"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-muted-foreground/70"
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip unit={unit} />}
            cursor={{ stroke: resolvedColor, strokeWidth: 1.5, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={resolvedColor}
            fill={`url(#${gradId})`}
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: resolvedColor,
              stroke: 'var(--card, #ffffff)',
              strokeWidth: 2.5,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
