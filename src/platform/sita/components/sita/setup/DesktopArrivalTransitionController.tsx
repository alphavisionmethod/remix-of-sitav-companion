import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Sparkles, Shield, Brain, Home, BarChart3, DollarSign, Briefcase, Calendar, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesktopArrivalTransitionControllerProps {
  displayName: string;
  trustLevel: string;
  activeAdvisors: { id: string; enabled: boolean }[];
  primaryUseMode: string;
  firstWinAction: string;
  onComplete: () => void;
}

export function DesktopArrivalTransitionController({
  displayName, trustLevel, activeAdvisors, primaryUseMode, firstWinAction, onComplete,
}: DesktopArrivalTransitionControllerProps) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduced) {
      // Skip animation in reduced motion
      const t = setTimeout(onComplete, 1000);
      setStage(9);
      return () => clearTimeout(t);
    }
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
  }, [onComplete, reduced]);

  const enabledAdvisors = activeAdvisors.filter(a => a.enabled);

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden" style={{ backgroundColor: "#0B0D10" }}>
      <AnimatePresence>
        {stage < 2 && (
          <motion.div exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center">
            <motion.div animate={stage >= 1 ? { opacity: 0.3, scale: 0.95, filter: "blur(8px)" } : {}}>
              <div className="text-center space-y-3">
                <Sparkles className="h-8 w-8 text-primary mx-auto" />
                <p className="text-lg font-display font-bold text-foreground">Entering SITA</p>
                <p className="text-sm text-muted-foreground">{displayName ? `Welcome, ${displayName}` : "Welcome"}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {stage >= 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 30% 20%, hsl(265 55% 58% / 0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, hsl(38 85% 58% / 0.04) 0%, transparent 50%), #0B0D10" }} />
      )}

      {stage >= 3 && (
        <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", damping: 25 }}
          className="absolute top-0 left-0 right-0 h-8 bg-card/80 backdrop-blur-xl border-b border-border flex items-center px-4 z-10">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-primary" />
            <span className="text-[10px] text-muted-foreground">SITA OS</span>
          </div>
          <div className="flex-1" />
          <span className="text-[10px] text-muted-foreground">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </motion.div>
      )}

      {stage >= 4 && (
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", damping: 25 }}
          className="absolute bottom-0 left-0 right-0 h-14 bg-card/80 backdrop-blur-xl border-t border-border flex items-center justify-center gap-3 px-4 z-10">
          {[Home, BarChart3, DollarSign, Briefcase, Calendar].map((Icon, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: i * 0.08, type: "spring" }}
              className="h-9 w-9 rounded-xl bg-secondary/40 flex items-center justify-center">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          ))}
        </motion.div>
      )}

      {stage >= 5 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 25 }}
          className="absolute inset-0 flex items-center justify-center pt-8 pb-14 z-[5]">
          <div className="w-full max-w-md space-y-4 px-4">
            {stage >= 6 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card/90 backdrop-blur-xl p-5 shadow-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {displayName ? `Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${displayName}` : "Welcome"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">SITA is ready. Your environment is configured and your first priorities are prepared.</p>
              </motion.div>
            )}

            {stage >= 7 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-secondary/30 p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">First priorities</p>
                <div className="space-y-1.5">
                  {firstWinAction && (
                    <div className="flex items-center gap-2 text-xs text-foreground">
                      <Sparkles className="h-3 w-3 text-primary" />
                      {firstWinAction}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Bell className="h-3 w-3" />
                    Review your morning pulse
                  </div>
                </div>
              </motion.div>
            )}

            {stage >= 8 && enabledAdvisors.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex justify-center gap-2">
                {enabledAdvisors.slice(0, 4).map((a, i) => (
                  <motion.div key={a.id} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="h-7 w-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <Brain className="h-3 w-3 text-primary" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
