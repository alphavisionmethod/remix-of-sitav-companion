// ═══════════════════════════════════════════════════════════════
// SITA OS — Holographic Advisor Presence
// Animated advisor with idle animations, reactions, typing
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Brain, Briefcase, DollarSign, Headphones, Heart, Shield, Sparkles, TrendingUp, Scale } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";

type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "general";
type AdvisorState = "idle" | "speaking" | "thinking" | "reacting" | "entering" | "exiting";
type Reaction = "nod" | "think" | "concern" | "agree" | "surprise";

interface HolographicAdvisorProps {
  domain: AdvisorDomain;
  name?: string;
  state?: AdvisorState;
  reaction?: Reaction | null;
  size?: "sm" | "md" | "lg" | "xl";
  showParticles?: boolean;
  className?: string;
}

const domainConfig: Record<AdvisorDomain, { icon: LucideIcon; gradient: string; glow: string }> = {
  business: { icon: Briefcase, gradient: "from-[hsl(var(--sita-purple))] to-[hsl(var(--sita-purple-light))]", glow: "hsl(var(--sita-purple))" },
  money: { icon: DollarSign, gradient: "from-[hsl(var(--trust-safe))] to-emerald-400", glow: "hsl(var(--trust-safe))" },
  concierge: { icon: Headphones, gradient: "from-[hsl(var(--sita-gold))] to-amber-400", glow: "hsl(var(--sita-gold))" },
  family: { icon: Heart, gradient: "from-rose-500 to-pink-400", glow: "rgb(244 63 94)" },
  growth: { icon: TrendingUp, gradient: "from-blue-500 to-cyan-400", glow: "rgb(59 130 246)" },
  trust: { icon: Shield, gradient: "from-[hsl(var(--trust-safe))] to-teal-400", glow: "hsl(var(--trust-safe))" },
  opportunity: { icon: Sparkles, gradient: "from-[hsl(var(--sita-gold))] to-orange-400", glow: "hsl(var(--sita-gold))" },
  recovery: { icon: Scale, gradient: "from-slate-500 to-slate-400", glow: "rgb(100 116 139)" },
  boardroom: { icon: Brain, gradient: "from-[hsl(var(--sita-purple-dark))] to-[hsl(var(--sita-purple))]", glow: "hsl(var(--sita-purple))" },
  general: { icon: Brain, gradient: "from-[hsl(var(--sita-purple))] to-[hsl(var(--sita-gold))]", glow: "hsl(var(--sita-purple))" },
};

const sizes = {
  sm: { container: "h-10 w-10", icon: "h-4 w-4", ring: 44, particleR: 28 },
  md: { container: "h-14 w-14", icon: "h-6 w-6", ring: 60, particleR: 38 },
  lg: { container: "h-20 w-20", icon: "h-8 w-8", ring: 84, particleR: 50 },
  xl: { container: "h-28 w-28", icon: "h-10 w-10", ring: 120, particleR: 68 },
};

// Idle breathing animation
const breatheVariants = {
  idle: {
    scale: [1, 1.03, 1],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  speaking: {
    scale: [1, 1.06, 1.02, 1.05, 1],
    transition: { duration: 0.8, repeat: Infinity },
  },
  thinking: {
    scale: [1, 0.97, 1],
    rotate: [0, -2, 2, 0],
    transition: { duration: 2, repeat: Infinity },
  },
  reacting: {
    y: [0, -4, 0],
    transition: { duration: 0.4 },
  },
  entering: {
    scale: [0, 1.1, 1],
    opacity: [0, 1],
    transition: { duration: 0.6, ease: "backOut" },
  },
  exiting: {
    scale: [1, 0.8, 0],
    opacity: [1, 0],
    transition: { duration: 0.4, ease: "easeIn" },
  },
};

// Thought particles
function ThoughtParticles({ count, radius, glow, active }: { count: number; radius: number; glow: string; active: boolean }) {
  if (!active) return null;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const delay = i * 0.2;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 4,
              height: 4,
              background: glow,
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: [0, Math.cos(angle) * radius, Math.cos(angle + 0.5) * (radius * 0.7)],
              y: [0, Math.sin(angle) * radius, Math.sin(angle + 0.5) * (radius * 0.7)],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </>
  );
}

// Reaction emoji overlay
const reactionEmoji: Record<Reaction, string> = {
  nod: "👍",
  think: "🤔",
  concern: "😟",
  agree: "✅",
  surprise: "😮",
};

export function HolographicAdvisor({
  domain,
  name,
  state = "idle",
  reaction = null,
  size = "lg",
  showParticles = true,
  className,
}: HolographicAdvisorProps) {
  const cfg = domainConfig[domain];
  const s = sizes[size];
  const Icon = cfg.icon;

  // Pulsing ring for speaking/thinking
  const showRing = state === "speaking" || state === "thinking";

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* Outer glow ring */}
      <AnimatePresence>
        {showRing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute rounded-full"
            style={{
              width: s.ring,
              height: s.ring,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              border: `2px solid ${cfg.glow}`,
              boxShadow: `0 0 20px ${cfg.glow}40, inset 0 0 20px ${cfg.glow}20`,
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `1px solid ${cfg.glow}` }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thought particles */}
      {showParticles && (
        <ThoughtParticles
          count={state === "thinking" ? 6 : state === "speaking" ? 4 : 0}
          radius={s.particleR}
          glow={cfg.glow}
          active={state === "thinking" || state === "speaking"}
        />
      )}

      {/* Main avatar */}
      <motion.div
        variants={breatheVariants}
        animate={state}
        className={cn(
          "relative flex items-center justify-center rounded-full bg-gradient-to-br shadow-lg z-10",
          s.container,
          cfg.gradient
        )}
        style={{
          boxShadow: state === "speaking"
            ? `0 0 30px ${cfg.glow}50, 0 0 60px ${cfg.glow}20`
            : `0 4px 20px ${cfg.glow}20`,
        }}
      >
        <Icon className={cn(s.icon, "text-white")} strokeWidth={1.5} />

        {/* Status dot */}
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
          state === "speaking" ? "bg-[hsl(var(--trust-safe))] animate-pulse" :
          state === "thinking" ? "bg-[hsl(var(--sita-purple))] animate-pulse" :
          state === "idle" ? "bg-[hsl(var(--trust-safe))]" : "bg-muted-foreground/40"
        )} />
      </motion.div>

      {/* Reaction bubble */}
      <AnimatePresence>
        {reaction && (
          <motion.div
            initial={{ scale: 0, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: -8, opacity: 1 }}
            exit={{ scale: 0, y: 10, opacity: 0 }}
            className="absolute -top-2 -right-2 text-lg z-20"
          >
            {reactionEmoji[reaction]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name label */}
      {name && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-[11px] font-medium text-muted-foreground text-center truncate max-w-[80px]"
        >
          {name}
        </motion.span>
      )}

      {/* Thinking indicator dots */}
      <AnimatePresence>
        {state === "thinking" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-1 mt-1"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--sita-purple))]"
                animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
