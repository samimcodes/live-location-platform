import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color?: string;
  bg?: string;
  href?: string;
  delta?: number | null;
}

export default function KpiCard({
  label,
  value,
  icon: Icon,
  color = "text-primary",
  bg = "bg-primary/10",
  href = "#",
  delta = null,
}: KpiCardProps) {
  const positive = typeof delta === "number" && delta > 0;
  const negative = typeof delta === "number" && delta < 0;

  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-shadow transform hover:-translate-y-0.5 cursor-pointer group">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                {label}
              </p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                {delta !== null && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                      positive
                        ? "bg-emerald-50 text-emerald-600"
                        : negative
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {positive ? (
                      <ArrowUp size={12} />
                    ) : negative ? (
                      <ArrowDown size={12} />
                    ) : null}
                    <span>{Math.abs(Number(delta))}%</span>
                  </span>
                )}
              </div>
            </div>
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                bg,
              )}
            >
              <Icon size={18} className={cn(color)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
