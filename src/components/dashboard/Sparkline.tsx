import React, { useId } from "react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

interface Props {
  data: number[];
  color?: string;
  height?: number;
}

// Tiny tooltip — just the value, no label
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SparkTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-semibold shadow-md">
      {payload[0].value}
    </div>
  );
}

export default function Sparkline({ data, color = "#7c3aed", height = 40 }: Props) {
  const uid    = useId();
  const gradId = `spark-${uid.replace(/:/g, "")}`;
  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <Tooltip content={<SparkTooltip />} cursor={false} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={`url(#${gradId})`}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: color, stroke: "white", strokeWidth: 1.5 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
