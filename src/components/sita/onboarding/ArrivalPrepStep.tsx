// ═══════════════════════════════════════════════════════════════
// SITA OS — Arrival Preparation Step
// Premium summary screen shown before entering the OS
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Shield, Brain, Globe, Zap, CheckCircle, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArrivalPrepStepProps {
  displayName: string;
  enabledDomains: string[];
  trustLevel: string;
  rituals: string[];
  aiStyle: string;
  onNext: () => void;
  onPrev: () => void;
}

const domainLabels: Record<string, { label: string; color: string }> = {
  business: { label: "Business OS", color: "text-primary" },
  money: { label: "Finance OS", color: "text-accent" },
  concierge: { label: "Concierge OS", color: "text-[hsl(var(--trust-safe))]" },
};

const trustLabels: Record<string, string> = {
  open: "Open — autonomous with proof",
  balanced: "Balanced — approval for important actions",
  guarded: "Guarded — approval before every action",
};

const ritualLabels: Record<string, string> = {
  "morning-pulse": "Morning Pulse",
  "weekly-boardroom": "Weekly Boardroom",
  "daily-close": "End-of-Day Close",
  "weekend-review": "Weekend Review",
  "monthly-boardroom": "Monthly Boardroom",
};

export const ArrivalPrepStep = ({ displayName, enabledDomains, trustLevel, rituals, aiStyle, onNext, onPrev }: ArrivalPrepStepProps) => {
  const sections = [
    { label: "Active Domains", items: enabledDomains.map(d => domainLabels[d]?.label || d), icon: Globe },
    { label: "Trust Mode", items: [trustLabels[trustLevel] || trustLevel], icon: Shield },
    { label: "Active Rituals", items: rituals.map(r => ritualLabels[r] || r), icon: Sparkles },
    { label: "Advisor Style", items: [aiStyle === "proactive" ? "Proactive" : aiStyle === "reserved" ? "Reserved" : "Balanced"], icon: Brain },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20"
          >
            <CheckCircle className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Your environment is ready
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {displayName ? `${displayName}, here's` : "Here's"} what SITA has configured for you
          </p>
        </div>

        {/* Summary Grid */}
        <div className="p-8 pt-6 space-y-3">
          {sections.map((section, i) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="rounded-xl border border-border/50 bg-secondary/20 p-4"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <section.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.label}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {section.items.map((item, j) => (
                  <span key={j} className="rounded-full bg-primary/8 border border-primary/15 px-3 py-1 text-xs font-medium text-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Animated status line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-2 pt-3 text-[11px] text-muted-foreground"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--trust-safe))] animate-pulse" />
            All systems initialized · Advisors standing by · Proof engine active
          </motion.div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Make changes
            </button>
            <motion.button
              onClick={onNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2"
            >
              Enter SITA <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
