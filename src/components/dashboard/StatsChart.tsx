import React, { useId } from "react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

interface DataPoint { date: string; value: number; }
interface Props {
  data: DataPoint[];
  color?: string;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-semibold text-foreground">{payload[0].value}</p>
    </div>
  );
}

export default function StatsChart({ data, color, height = 160 }: Props) {
  const uid    = useId();
  const gradId = `chart-grad-${uid.replace(/:/g, "")}`;

  // Resolve CSS variable at render time so Recharts SVG attrs get a real color value.
  // Falls back to the token's own value string if getComputedStyle is unavailable (SSR).
  const resolvedColor = React.useMemo(() => {
    if (typeof window === "undefined") return "oklch(0.65 0.2 280)"; // --chart-1 light value
    if (color) return color;
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--chart-1")
      .trim() || "oklch(0.65 0.2 280)";
  }, [color]);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={resolvedColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={resolvedColor} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="currentColor"
            className="text-border"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-muted-foreground"
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: resolvedColor, strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={resolvedColor}
            fill={`url(#${gradId})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: resolvedColor, stroke: "white", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
