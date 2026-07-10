"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export interface ChartDataPoint {
  name: string
  [key: string]: string | number
}

interface DashboardChartProps {
  title?: string
  description?: string
  data: ChartDataPoint[]
  dataKeys: { key: string; color: string; label: string }[]
  className?: string
}

export function DashboardChart({ title, description, data, dataKeys, className }: DashboardChartProps) {
  // Generate the chart config dynamically based on the passed dataKeys
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {}
    dataKeys.forEach((item, index) => {
      config[item.key] = {
        label: item.label,
        color: item.color,
      }
    })
    return config
  }, [dataKeys])

  return (
    <Card className={`glass-card ${className || ""}`}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {dataKeys.map((item) => (
                  <linearGradient key={`color-${item.key}`} id={`fill${item.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${item.key})`} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={`var(--color-${item.key})`} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tickMargin={10} 
                fontSize={12} 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tickMargin={10} 
                fontSize={12} 
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              {dataKeys.map((item) => (
                <Area
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  stroke={`var(--color-${item.key})`}
                  fillOpacity={1}
                  fill={`url(#fill${item.key})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
