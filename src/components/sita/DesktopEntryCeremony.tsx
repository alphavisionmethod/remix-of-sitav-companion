// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Entry Ceremony
// Cinematic transition from First Win / onboarding into the
// desktop environment. Dock, top bar, wallpaper emerge sequentially.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DesktopEntryCeremonyProps {
  onComplete: () => void;
}

export function DesktopEntryCeremony({ onComplete }: DesktopEntryCeremonyProps) {
  const [phase, setPhase] = useState<
    "wallpaper" | "topbar" | "sidebar" | "content" | "complete"
  >("wallpaper");

  useEffect(() => {
    const sequence = [
      { next: "topbar" as const, delay: 800 },
      { next: "sidebar" as const, delay: 600 },
      { next: "content" as const, delay: 500 },
      { next: "complete" as const, delay: 700 },
    ];

    let timeout: ReturnType<typeof setTimeout>;
    let step = 0;

    const advance = () => {
      if (step >= sequence.length) {
        onComplete();
        return;
      }
      timeout = setTimeout(() => {
        setPhase(sequence[step].next);
        step++;
        advance();
      }, sequence[step].delay);
    };

    advance();
    return () => clearTimeout(timeout);
  }, [onComplete]);

  const phaseIdx = ["wallpaper", "topbar", "sidebar", "content", "complete"].indexOf(phase);

  return (
    <motion.div
      className="fixed inset-0 z-[180] bg-background"
      animate={{ opacity: phase === "complete" ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Wallpaper emergence — deep ambient glow */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: phaseIdx >= 0 ? 1 : 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-background" />
        <motion.div
          className="absolute top-1/4 left-1/3 h-[500px] w-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 70%)" }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.03) 0%, transparent 70%)" }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />
      </motion.div>

      {/* Top bar emergence */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-12 border-b border-border/30"
        style={{ background: "hsl(var(--card) / 0.8)", backdropFilter: "blur(12px)" }}
        initial={{ y: -48, opacity: 0 }}
        animate={{
          y: phaseIdx >= 1 ? 0 : -48,
          opacity: phaseIdx >= 1 ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--trust-safe))]" />
            <div className="h-2 w-20 rounded-full bg-foreground/8" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-12 rounded-full bg-foreground/5" />
            <div className="h-2 w-8 rounded-full bg-foreground/5" />
            <div className="h-6 w-6 rounded-full bg-foreground/8" />
          </div>
        </div>
      </motion.div>

      {/* Sidebar emergence */}
      <motion.div
        className="absolute top-12 left-0 bottom-0 w-56 border-r border-border/20"
        style={{ background: "hsl(var(--card) / 0.6)", backdropFilter: "blur(8px)" }}
        initial={{ x: -224, opacity: 0 }}
        animate={{
          x: phaseIdx >= 2 ? 0 : -224,
          opacity: phaseIdx >= 2 ? 1 : 0,
        }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="p-4 space-y-3 mt-4">
          {[80, 60, 90, 50, 70, 40].map((w, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: -8 }}
              animate={{
                opacity: phaseIdx >= 2 ? 0.5 : 0,
                x: phaseIdx >= 2 ? 0 : -8,
              }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
            >
              <div className="h-4 w-4 rounded bg-foreground/8" />
              <div className="h-2 rounded-full bg-foreground/6" style={{ width: w }} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main content area emergence */}
      <motion.div
        className="absolute top-12 left-56 right-0 bottom-0 p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: phaseIdx >= 3 ? 1 : 0,
          y: phaseIdx >= 3 ? 0 : 12,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Skeleton cards */}
        <div className="space-y-4 max-w-5xl">
          <motion.div
            className="h-8 w-48 rounded-lg bg-foreground/6"
            initial={{ opacity: 0 }}
            animate={{ opacity: phaseIdx >= 3 ? 0.6 : 0 }}
            transition={{ delay: 0.1 }}
          />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="h-24 rounded-xl border border-border/20 bg-card/50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: phaseIdx >= 3 ? 0.5 : 0,
                  scale: phaseIdx >= 3 ? 1 : 0.95,
                }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.3 }}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="h-40 rounded-xl border border-border/20 bg-card/50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: phaseIdx >= 3 ? 0.4 : 0,
                  scale: phaseIdx >= 3 ? 1 : 0.95,
                }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Welcome flash */}
      <AnimatePresence>
        {phase === "content" && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.p
              className="text-lg font-display font-semibold text-foreground/60 tracking-wide"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 0.7 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome to SITA OS
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
