import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Zap, Shield, Play, Pause, AlertTriangle } from "lucide-react";

export interface AutomationRule {
  id: string;
  title: string;
  trigger: string;
  conditions?: string;
  trustLevel: "full" | "review" | "restricted";
  safetyBoundary?: string;
  recentRuns: number;
  status: "active" | "paused" | "failed";
  lastRun?: string;
}

const trustColors = {
  full: { bg: "bg-chart-2/10", text: "text-chart-2", label: "Full Trust" },
  review: { bg: "bg-amber-500/10", text: "text-amber-500", label: "Review Required" },
  restricted: { bg: "bg-destructive/10", text: "text-destructive", label: "Restricted" },
};

const statusIcon = { active: Play, paused: Pause, failed: AlertTriangle };
const statusColor = { active: "text-chart-2", paused: "text-muted-foreground", failed: "text-destructive" };

export const ConciergeAutomationRuleCard = ({ rule, className }: { rule: AutomationRule; className?: string }) => {
  const StatusIcon = statusIcon[rule.status];
  const trust = trustColors[rule.trustLevel];

  return (
    <motion.div
      className={cn("rounded-2xl border border-border/50 bg-card p-4", className)}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-4 w-4 text-accent" />
        <p className="text-xs font-semibold text-foreground flex-1 truncate">{rule.title}</p>
        <StatusIcon className={cn("h-3.5 w-3.5", statusColor[rule.status])} />
      </div>
      <div className="space-y-1.5 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Trigger:</span>
          <span className="text-foreground">{rule.trigger}</span>
        </div>
        {rule.conditions && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Conditions:</span>
            <span className="text-foreground">{rule.conditions}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Shield className="h-3 w-3 text-muted-foreground" />
          <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-medium", trust.bg, trust.text)}>{trust.label}</span>
        </div>
        {rule.safetyBoundary && (
          <p className="text-[9px] text-muted-foreground italic">🛡 {rule.safetyBoundary}</p>
        )}
        <div className="flex items-center gap-3 pt-1 border-t border-border/20">
          <span className="text-muted-foreground">{rule.recentRuns} runs</span>
          {rule.lastRun && <span className="text-muted-foreground">Last: {rule.lastRun}</span>}
        </div>
      </div>
    </motion.div>
  );
};
