// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Transition Step (Phase 2.17)
// Cinematic entry into the desktop environment
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Brain, Sparkles, Home, BarChart3,
  DollarSign, Briefcase, Calendar, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface DesktopTransitionStepProps {
  displayName: string;
  trustLevel: string;
  activeAdvisors: { id: string; enabled: boolean }[];
  primaryUseMode: string;
  firstWinAction: string;
  onComplete: () => void;
}

export function DesktopTransitionStep({
  displayName, trustLevel, activeAdvisors, primaryUseMode, firstWinAction, onComplete,
}: DesktopTransitionStepProps) {
  const [stage, setStage] = useState(0);
  // Stages: 0=hold, 1=dissolve, 2=wallpaper, 3=topbar, 4=dock, 5=boardroom, 6=welcome, 7=priorities, 8=advisors, 9=done

  useEffect(() => {
    const delays = [600, 800, 600, 500, 500, 600, 700, 600, 500, 400];
    let timeout: ReturnType<typeof setTimeout>;
    let current = 0;

    const advance = () => {
      current++;
      setStage(current);
      if (current < 9) {
        timeout = setTimeout(advance, delays[current]);
      } else {
        timeout = setTimeout(onComplete, 800);
      }
    };

    timeout = setTimeout(advance, delays[0]);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  const enabledAdvisors = activeAdvisors.filter(a => a.enabled);

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden" style={{ backgroundColor: "#0B0D10" }}>
      {/* Stage 0-1: Arrival summary dissolving */}
      <AnimatePresence>
        {stage < 2 && (
          <motion.div
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={stage >= 1 ? { opacity: 0.3, scale: 0.95, filter: "blur(8px)" } : {}}
              className="text-center space-y-3"
            >
              <Sparkles className="h-8 w-8 text-primary mx-auto" />
              <p className="text-lg font-display font-bold text-foreground">Entering SITA</p>
              <p className="text-sm text-muted-foreground">{displayName ? `Welcome, ${displayName}` : "Welcome"}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 2+: Wallpaper gradient */}
      {stage >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 30% 20%, hsl(265 55% 58% / 0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, hsl(38 85% 58% / 0.04) 0%, transparent 50%), #0B0D10",
          }}
        />
      )}

      {/* Stage 3+: Top system bar */}
      <AnimatePresence>
        {stage >= 3 && (
          <motion.div
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 right-0 h-10 bg-card/80 backdrop-blur-xl border-b border-border/30 flex items-center justify-between px-4 z-30"
          >
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-[11px] font-display font-semibold text-foreground">SITA OS</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Trust indicator */}
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--trust-safe))] animate-pulse" />
                <span className="text-[9px] text-muted-foreground capitalize">{trustLevel}</span>
              </div>
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 4+: Dock */}
      <AnimatePresence>
        {stage >= 4 && (
          <motion.div
            initial={{ y: 72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/30 px-4 py-2 z-30"
          >
            {[
              { icon: Home, label: "Home" },
              { icon: Briefcase, label: "Business" },
              { icon: DollarSign, label: "Money" },
              { icon: Calendar, label: "Concierge" },
              { icon: BarChart3, label: "Boardroom" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08, type: "spring", damping: 15 }}
                className="flex flex-col items-center gap-0.5 px-2"
              >
                <div className="h-9 w-9 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-secondary/80 transition-colors">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-[8px] text-muted-foreground">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 5+: Boardroom surface */}
      <AnimatePresence>
        {stage >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 w-[600px] max-w-[calc(100%-2rem)] z-20"
          >
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-lg p-6 space-y-4">
              {/* Stage 6+: Welcome card */}
              {stage >= 6 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="rounded-xl bg-primary/5 border border-primary/20 p-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <p className="text-sm font-display font-semibold text-foreground">
                      {displayName ? `Welcome, ${displayName}` : "Welcome to SITA"}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground pl-8">
                    Your environment is configured and ready. Your advisors are standing by.
                  </p>
                </motion.div>
              )}

              {/* Stage 7+: First priorities */}
              {stage >= 7 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-2"
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">First priorities</p>
                  {[
                    firstWinAction ? `First win: ${firstWinAction.replace(/-/g, " ")}` : "Daily pulse ready",
                    "Review your trust settings",
                    "Explore your dashboard",
                  ].map((priority, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-xs text-foreground capitalize">{priority}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Stage 8+: Advisor presence */}
              {stage >= 8 && enabledAdvisors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 pt-2"
                >
                  <Brain className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {enabledAdvisors.length} advisor{enabledAdvisors.length !== 1 ? "s" : ""} standing by
                  </span>
                  <div className="flex gap-1 ml-auto">
                    {enabledAdvisors.slice(0, 4).map((a, i) => (
                      <motion.div
                        key={a.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-primary" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
