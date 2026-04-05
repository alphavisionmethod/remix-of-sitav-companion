// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Ambient Background
// Shared living background across Lock Screen, Desktop, Setup
// Responds to time-of-day, trust state, and display mode
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export type AmbientMood = "serene" | "alert" | "warm" | "focus" | "night";

interface ShellAmbientBackgroundProps {
  mood?: AmbientMood;
  intensity?: "subtle" | "normal" | "vivid";
  className?: string;
}

const MOOD_PALETTES: Record<AmbientMood, { orbs: { color: string; x: string; y: string; size: number }[] }> = {
  serene: {
    orbs: [
      { color: "hsl(265 55% 58% / 0.05)", x: "25%", y: "20%", size: 600 },
      { color: "hsl(190 60% 50% / 0.03)", x: "70%", y: "65%", size: 500 },
      { color: "hsl(38 85% 58% / 0.02)", x: "50%", y: "85%", size: 400 },
    ],
  },
  alert: {
    orbs: [
      { color: "hsl(25 90% 55% / 0.05)", x: "30%", y: "25%", size: 550 },
      { color: "hsl(265 55% 58% / 0.04)", x: "65%", y: "60%", size: 480 },
      { color: "hsl(0 65% 52% / 0.02)", x: "80%", y: "20%", size: 350 },
    ],
  },
  warm: {
    orbs: [
      { color: "hsl(38 85% 58% / 0.05)", x: "35%", y: "30%", size: 580 },
      { color: "hsl(25 90% 55% / 0.03)", x: "60%", y: "70%", size: 450 },
      { color: "hsl(265 55% 58% / 0.02)", x: "20%", y: "80%", size: 380 },
    ],
  },
  focus: {
    orbs: [
      { color: "hsl(265 55% 58% / 0.03)", x: "50%", y: "40%", size: 700 },
      { color: "hsl(220 30% 50% / 0.02)", x: "30%", y: "70%", size: 400 },
    ],
  },
  night: {
    orbs: [
      { color: "hsl(240 40% 35% / 0.04)", x: "40%", y: "30%", size: 650 },
      { color: "hsl(265 55% 58% / 0.03)", x: "70%", y: "60%", size: 500 },
      { color: "hsl(220 50% 20% / 0.03)", x: "20%", y: "75%", size: 400 },
    ],
  },
};

function getAutoMood(): AmbientMood {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "warm";
  if (hour >= 12 && hour < 18) return "serene";
  if (hour >= 18 && hour < 21) return "warm";
  return "night";
}

export function ShellAmbientBackground({
  mood,
  intensity = "normal",
  className,
}: ShellAmbientBackgroundProps) {
  const reduced = useReducedMotion();
  const activeMood = mood ?? getAutoMood();
  const palette = MOOD_PALETTES[activeMood];

  const intensityScale = intensity === "subtle" ? 0.6 : intensity === "vivid" ? 1.4 : 1;

  const particles = useMemo(() => {
    if (reduced) return [];
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 60,
      size: 1.5 + Math.random() * 2,
      opacity: 0.08 + Math.random() * 0.12,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 4,
    }));
  }, [reduced]);

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none select-none", className)}
      aria-hidden="true"
    >
      {/* Gradient orbs */}
      {palette.orbs.map((orb, i) => (
        <motion.div
          key={`${activeMood}-${i}`}
          className="absolute rounded-full"
          style={{
            width: orb.size * intensityScale,
            height: orb.size * intensityScale,
            left: orb.x,
            top: orb.y,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${60 + i * 20}px)`,
          }}
          animate={
            reduced
              ? {}
              : {
                  x: [0, 15 * (i % 2 === 0 ? 1 : -1), 0],
                  y: [0, 10 * (i % 2 === 0 ? -1 : 1), 0],
                }
          }
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `hsl(265 55% 58% / ${p.opacity})`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}
