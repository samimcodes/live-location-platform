'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MouseSpotlight() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);

  // Smooth fluid spring physics for cursor follower
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 200, mass: 0.5 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 200, mass: 0.5 });

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden hidden md:block">
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-violet-600/10 via-cyan-500/8 to-indigo-600/10 dark:from-violet-500/15 dark:via-cyan-400/10 dark:to-indigo-500/15 blur-[100px] pointer-events-none"
      />
    </div>
  );
}
