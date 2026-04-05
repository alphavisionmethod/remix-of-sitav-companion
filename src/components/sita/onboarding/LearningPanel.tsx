import { motion, AnimatePresence } from "framer-motion";
import { Brain, Shield, Sparkles, BarChart3, Home, Activity } from "lucide-react";
import { useMemo } from "react";

interface SetupSnapshot {
  displayName: string;
  role: string;
  enabledDomains: string[];
  trustLevel: string;
  aiStyle: string;
  painPoints?: string[];
  protectionPriorities?: string[];
  presenceStyle?: string;
  rituals?: string[];
  homeComposition?: string;
}

interface LearningPanelProps {
  state: SetupSnapshot;
}

export function LearningPanel({ state }: LearningPanelProps) {
  const insights = useMemo(() => {
    const items: { icon: typeof Brain; label: string; value: string }[] = [];

    // Active advisors
    const advisorCount = state.enabledDomains.length + 1; // +1 for core advisor
    items.push({ icon: Brain, label: "Active Advisors", value: `${advisorCount} advisor${advisorCount !== 1 ? "s" : ""}` });

    // Trust mode
    const trustLabels: Record<string, string> = { open: "Open — Act freely", balanced: "Balanced — Ask first", guarded: "Guarded — Full control" };
    items.push({ icon: Shield, label: "Trust Mode", value: trustLabels[state.trustLevel] || "Not set" });

    // Detected priorities
    if (state.painPoints && state.painPoints.length > 0) {
      items.push({ icon: Activity, label: "Detected Priorities", value: state.painPoints.slice(0, 2).join(", ") });
    }

    // Likely workflows
    const workflows: string[] = [];
    if (state.enabledDomains.includes("business")) workflows.push("Lead follow-up");
    if (state.enabledDomains.includes("money")) workflows.push("Bill tracking");
    if (state.enabledDomains.includes("concierge")) workflows.push("Calendar sync");
    if (workflows.length > 0) {
      items.push({ icon: Sparkles, label: "Likely First Workflows", value: workflows.join(", ") });
    }

    // Desktop shape
    if (state.homeComposition) {
      const shapes: Record<string, string> = { calm: "Calm dashboard", business: "Business-first", family: "Family-first", money: "Money-first", command: "Full command center" };
      items.push({ icon: Home, label: "Desktop Shape", value: shapes[state.homeComposition] || state.homeComposition });
    }

    // Rituals
    if (state.rituals.length > 0) {
      items.push({ icon: BarChart3, label: "Rhythm", value: `${state.rituals.length} ritual${state.rituals.length !== 1 ? "s" : ""} active` });
    }

    return items;
  }, [state]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-72 shrink-0 rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 space-y-4 hidden lg:block"
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your OS is learning you
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {insights.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-secondary/30 p-3 space-y-1"
          >
            <div className="flex items-center gap-2">
              <item.icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</span>
            </div>
            <p className="text-xs text-foreground font-medium">{item.value}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {insights.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Make your first choices to see SITA learn…
        </p>
      )}
    </motion.div>
  );
}
