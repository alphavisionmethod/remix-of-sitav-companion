// ═══════════════════════════════════════════════════════════════
// SITA OS — Signature Wow Moments
// 7 hero animations at key setup transitions. Cinematic, skippable,
// respects reduced motion.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export type WowMomentId =
  | "boot-formation"
  | "secure-stabilization"
  | "timezone-lightmap"
  | "restore-return"
  | "world-model-assembly"
  | "trust-spectrum"
  | "desktop-reveal";

interface SignatureWowMomentProps {
  momentId: WowMomentId;
  onComplete: () => void;
  /** Duration in ms — defaults to 2000 */
  duration?: number;
}

const MOMENT_CONFIG: Record<WowMomentId, {
  title: string;
  subtitle: string;
  gradient: string;
  glowColor: string;
  particleCount: number;
}> = {
  "boot-formation": {
    title: "Awakening",
    subtitle: "Your environment is forming",
    gradient: "from-[hsl(265,55%,20%)] via-[hsl(265,55%,12%)] to-transparent",
    glowColor: "hsl(265 55% 58% / 0.15)",
    particleCount: 12,
  },
  "secure-stabilization": {
    title: "Secured",
    subtitle: "Foundation established",
    gradient: "from-[hsl(220,60%,18%)] via-[hsl(220,60%,10%)] to-transparent",
    glowColor: "hsl(220 60% 55% / 0.12)",
    particleCount: 8,
  },
  "timezone-lightmap": {
    title: "Located",
    subtitle: "Your world, centered",
    gradient: "from-[hsl(38,85%,20%)] via-[hsl(38,60%,10%)] to-transparent",
    glowColor: "hsl(38 85% 58% / 0.1)",
    particleCount: 15,
  },
  "restore-return": {
    title: "Returning",
    subtitle: "Your world is coming back",
    gradient: "from-[hsl(265,55%,22%)] via-[hsl(265,40%,14%)] to-transparent",
    glowColor: "hsl(265 55% 58% / 0.18)",
    particleCount: 20,
  },
  "world-model-assembly": {
    title: "Understanding",
    subtitle: "SITA is learning you",
    gradient: "from-[hsl(280,50%,20%)] via-[hsl(280,40%,12%)] to-transparent",
    glowColor: "hsl(280 50% 55% / 0.14)",
    particleCount: 16,
  },
  "trust-spectrum": {
    title: "Calibrated",
    subtitle: "Trust boundaries set",
    gradient: "from-[hsl(255,50%,18%)] via-[hsl(255,40%,10%)] to-transparent",
    glowColor: "hsl(255 50% 55% / 0.12)",
    particleCount: 10,
  },
  "desktop-reveal": {
    title: "Ready",
    subtitle: "Your environment awaits",
    gradient: "from-[hsl(32,80%,22%)] via-[hsl(32,60%,12%)] to-transparent",
    glowColor: "hsl(32 80% 58% / 0.15)",
    particleCount: 24,
  },
};

export function SignatureWowMoment({ momentId, onComplete, duration = 2000 }: SignatureWowMomentProps) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const config = MOMENT_CONFIG[momentId];

  useEffect(() => {
    const d = reduced ? 400 : duration;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, d);
    return () => clearTimeout(timer);
  }, [duration, onComplete, reduced]);

  // Skip on click
  const handleSkip = () => {
    setVisible(false);
    setTimeout(onComplete, 100);
  };

  if (reduced) {
    // Minimal version for reduced motion
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 cursor-pointer"
          >
            <div className="text-center space-y-2">
              <p className="text-lg font-display font-bold text-foreground">{config.title}</p>
              <p className="text-xs text-muted-foreground">{config.subtitle}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          onClick={handleSkip}
          className="fixed inset-0 z-[200] flex items-center justify-center cursor-pointer overflow-hidden"
          style={{ backgroundColor: "#0B0D10" }}
        >
          {/* Radial gradient background */}
          <div className={cn("absolute inset-0 bg-gradient-radial", config.gradient)} />

          {/* Central glow */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute w-96 h-96 rounded-full blur-[120px]"
            style={{ background: config.glowColor }}
          />

          {/* Secondary pulse */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 2, opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute w-64 h-64 rounded-full blur-[80px]"
            style={{ background: config.glowColor }}
          />

          {/* Floating particles */}
          {Array.from({ length: config.particleCount }).map((_, i) => {
            const angle = (i / config.particleCount) * Math.PI * 2;
            const radius = 100 + Math.random() * 150;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const delay = Math.random() * 0.8;
            const size = 1 + Math.random() * 2;

            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x, y,
                  opacity: [0, 0.6, 0],
                  scale: [0, 1, 0.5],
                }}
                transition={{ duration: 1.8, delay, ease: "easeOut" }}
                className="absolute rounded-full bg-primary/40"
                style={{ width: size, height: size }}
              />
            );
          })}

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 text-center space-y-2"
          >
            <h2 className="text-2xl font-display font-bold tracking-tight text-foreground">{config.title}</h2>
            <p className="text-sm text-muted-foreground">{config.subtitle}</p>
          </motion.div>

          {/* Skip hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 text-[10px] text-muted-foreground"
          >
            Click to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
