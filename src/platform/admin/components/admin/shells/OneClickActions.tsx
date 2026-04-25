import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SafetyConfirmDialog, type SafetyAction } from "./SafetyConfirmDialog";
import { toast } from "sonner";
import {
  Wrench, Shield, TrendingUp, DollarSign, Activity, Rocket,
  RotateCcw, Target, Sparkles, RefreshCw, Zap, AlertTriangle,
  Play, PauseCircle
} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  safetyAction: SafetyAction;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "fix-safe",
    label: "Fix All Safe Issues",
    description: "Auto-resolve low-risk issues",
    icon: Wrench,
    color: "text-emerald-400",
    safetyAction: {
      title: "Fix All Safe Issues",
      description: "Automatically resolve all issues classified as low-risk with available automated fixes.",
      riskLevel: "low",
      affectedSystems: ["sync-service", "storage-service", "trust-engine"],
      rollbackAvailable: true,
      rollbackDescription: "All changes can be individually reverted within 24 hours.",
      estimatedDuration: "5-15 minutes",
    },
  },
  {
    id: "optimize-perf",
    label: "Optimize Performance",
    description: "Run performance sweep",
    icon: TrendingUp,
    color: "text-blue-400",
    safetyAction: {
      title: "Optimize Performance",
      description: "Profile and optimize the top latency sources identified this week.",
      riskLevel: "low",
      affectedSystems: ["api-gateway", "sync-service", "cache-layer"],
      rollbackAvailable: true,
      estimatedDuration: "15-30 minutes",
    },
  },
  {
    id: "improve-sync",
    label: "Improve Sync Reliability",
    description: "Analyze and fix sync issues",
    icon: Activity,
    color: "text-cyan-400",
    safetyAction: {
      title: "Improve Sync Reliability",
      description: "Deep analysis of sync failure patterns with automated retry optimization.",
      riskLevel: "medium",
      affectedSystems: ["sync-service", "mobile-sync-core", "desktop-syncd"],
      affectedUsers: "All users with active sync",
      rollbackAvailable: true,
      rollbackDescription: "Previous sync configuration can be restored instantly.",
      estimatedDuration: "1-2 hours",
      simulationAvailable: true,
      saferAlternative: { label: "Run Canary First", description: "Apply fixes to 10% of users before full rollout." },
    },
  },
  {
    id: "security-sweep",
    label: "Run Security Sweep",
    description: "Full platform security scan",
    icon: Shield,
    color: "text-purple-400",
    safetyAction: {
      title: "Full Security Sweep",
      description: "Comprehensive security review across auth, storage, sync, and admin systems.",
      riskLevel: "low",
      affectedSystems: ["auth-service", "storage-service", "admin-bff", "trust-engine"],
      rollbackAvailable: true,
      estimatedDuration: "30-60 minutes",
    },
  },
  {
    id: "prepare-release",
    label: "Prepare Next Release",
    description: "Quality gates and staging",
    icon: Rocket,
    color: "text-amber-400",
    safetyAction: {
      title: "Prepare Next Release",
      description: "Run all quality gates, check for regressions, and stage a rollout plan.",
      riskLevel: "medium",
      affectedSystems: ["release-service", "ci-pipeline", "canary-controller"],
      rollbackAvailable: true,
      estimatedDuration: "2-4 hours",
      simulationAvailable: true,
    },
  },
  {
    id: "pause-rollouts",
    label: "Pause Risky Rollouts",
    description: "Freeze active deployments",
    icon: PauseCircle,
    color: "text-orange-400",
    safetyAction: {
      title: "Pause All Active Rollouts",
      description: "Immediately freeze all in-progress canary and staged rollouts.",
      riskLevel: "medium",
      affectedSystems: ["release-service", "canary-controller", "update-service"],
      affectedUsers: "Users in active canary cohorts will remain on current version",
      rollbackAvailable: true,
      rollbackDescription: "Rollouts can be resumed at any time.",
      estimatedDuration: "Immediate",
    },
  },
  {
    id: "reduce-ai",
    label: "Reduce AI Spend",
    description: "Optimize model routing",
    icon: DollarSign,
    color: "text-green-400",
    safetyAction: {
      title: "Reduce AI Operating Cost",
      description: "Switch low-priority tasks to budget models, increase cache aggressiveness, disable low-value suggestions.",
      riskLevel: "low",
      affectedSystems: ["ai-router", "cache-layer", "suggestion-engine"],
      rollbackAvailable: true,
      estimatedDuration: "5-10 minutes",
    },
  },
  {
    id: "refresh-trust",
    label: "Refresh Trust Analysis",
    description: "Recalibrate trust engine",
    icon: RefreshCw,
    color: "text-teal-400",
    safetyAction: {
      title: "Refresh Trust Analysis",
      description: "Recalculate trust scores, review false positive rates, and update thresholds.",
      riskLevel: "low",
      affectedSystems: ["trust-engine", "auth-service"],
      rollbackAvailable: true,
      estimatedDuration: "10-20 minutes",
    },
  },
];

interface OneClickActionsProps {
  compact?: boolean;
}

export function OneClickActions({ compact = false }: OneClickActionsProps) {
  const [confirmAction, setConfirmAction] = useState<QuickAction | null>(null);

  const handleConfirm = () => {
    if (confirmAction) {
      toast.success(`${confirmAction.label} — Execution started`, {
        description: "You can track progress in the AI panel.",
      });
      setConfirmAction(null);
    }
  };

  return (
    <>
      <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4")}>
        {QUICK_ACTIONS.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setConfirmAction(action)}
            className={cn(
              "group relative rounded-xl border p-3 text-left transition-all",
              "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]",
              "focus:outline-none focus:ring-1 focus:ring-primary/30"
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <action.icon className={cn("h-4 w-4", action.color)} />
              <Badge variant="outline" className={cn(
                "text-[8px] px-1 py-0",
                action.safetyAction.riskLevel === "low" ? "text-emerald-400 border-emerald-500/20" :
                action.safetyAction.riskLevel === "medium" ? "text-amber-400 border-amber-500/20" :
                "text-red-400 border-red-500/20"
              )}>
                {action.safetyAction.riskLevel}
              </Badge>
            </div>
            <h4 className="text-xs font-semibold text-foreground mb-0.5">{action.label}</h4>
            <p className="text-[10px] text-muted-foreground">{action.description}</p>
            <Play className="absolute top-3 right-3 h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </motion.button>
        ))}
      </div>

      {confirmAction && (
        <SafetyConfirmDialog
          open={!!confirmAction}
          onOpenChange={() => setConfirmAction(null)}
          action={confirmAction.safetyAction}
          onConfirm={handleConfirm}
          onSimulate={() => {
            toast.info("Running simulation...", { description: "Results will appear in the AI panel." });
            setConfirmAction(null);
          }}
          onChooseSafer={() => {
            toast.info("Switching to safer alternative...");
            setConfirmAction(null);
          }}
        />
      )}
    </>
  );
}
