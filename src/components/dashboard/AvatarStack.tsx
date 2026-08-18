import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarItem {
  id: number;
  name: string;
  avatar?: string | null;
}

interface Props {
  items:    AvatarItem[];
  max?:     number;   // how many avatars to show before "+N"
  size?:    number;   // px
  className?: string;
}

const GRADIENTS = [
  "from-indigo-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
  "from-sky-400 to-blue-500",
];

export default function AvatarStack({ items, max = 5, size = 28, className }: Props) {
  const visible  = items.slice(0, max);
  const overflow = items.length - visible.length;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((item, i) => (
        <div
          key={item.id}
          className="relative rounded-full border-2 border-card -ml-2 first:ml-0 shrink-0"
          style={{ width: size, height: size, zIndex: visible.length - i }}
          title={item.name}
        >
          {item.avatar ? (
            <Image
              src={item.avatar}
              alt={item.name}
              fill
              sizes={`${size}px`}
              className="rounded-full object-cover"
            />
          ) : (
            <div
              className={cn(
                "w-full h-full rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold",
                GRADIENTS[i % GRADIENTS.length],
              )}
              style={{ fontSize: Math.round(size * 0.38) }}
            >
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ))}

      {overflow > 0 && (
        <div
          className="relative -ml-2 rounded-full border-2 border-card bg-muted flex items-center justify-center shrink-0"
          style={{ width: size, height: size, zIndex: 0 }}
        >
          <span
            className="text-muted-foreground font-semibold"
            style={{ fontSize: Math.round(size * 0.32) }}
          >
            +{overflow}
          </span>
        </div>
      )}
    </div>
  );
}
