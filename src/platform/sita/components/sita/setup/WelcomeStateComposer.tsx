import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Brain, Sparkles, Bell, Calendar } from "lucide-react";

interface WelcomeStateComposerProps {
  displayName: string;
  firstWinAction: string;
  advisorCount: number;
}

export function WelcomeStateComposer({ displayName, firstWinAction, advisorCount }: WelcomeStateComposerProps) {
  const reduced = useReducedMotion();
  const greeting = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening";

  return (
    <div className="space-y-3">
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card/90 backdrop-blur-xl p-5 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Good {greeting}{displayName ? `, ${displayName}` : ""}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          SITA is ready. {advisorCount} advisor{advisorCount !== 1 ? "s" : ""} active. Your environment is configured.
        </p>
      </motion.div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.2 }}
        className="rounded-xl border border-border bg-secondary/30 p-3"
      >
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Today</p>
        <div className="space-y-1.5">
          {firstWinAction && (
            <div className="flex items-center gap-2 text-xs text-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              {firstWinAction}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bell className="h-3 w-3" /> Review morning pulse
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" /> Check today's schedule
          </div>
        </div>
      </motion.div>
    </div>
  );
}
