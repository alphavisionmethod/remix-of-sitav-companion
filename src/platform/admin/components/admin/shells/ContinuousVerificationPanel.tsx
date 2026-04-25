import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, AlertTriangle, Loader2, TrendingUp, TrendingDown,
  RotateCcw, ChevronRight, Activity, ArrowRight, Eye
} from "lucide-react";

type VerificationStatus = "monitoring" | "verified" | "regression" | "inconclusive";
type Recommendation = "expand" | "hold" | "rollback" | "escalate";

interface VerifiedAction {
  id: string;
  label: string;
  executedAt: string;
  status: VerificationStatus;
  expectedOutcome: string;
  actualOutcome: string;
  regressions: string[];
  sideEffects: string[];
  recommendation: Recommendation;
  learned: string;
}

const VERIFIED_ACTIONS: VerifiedAction[] = [
  {
    id: "v1", label: "Sync retry optimization deployed",
    executedAt: "45 min ago", status: "verified",
    expectedOutcome: "Reduce retry storms by 40%",
    actualOutcome: "Retry storms reduced by 38%",
    regressions: [],
    sideEffects: ["CPU usage increased 2% on older desktops"],
    recommendation: "expand",
    learned: "Retry backoff improvements consistently effective across device cohorts",
  },
  {
    id: "v2", label: "Trust threshold recalibration",
    executedAt: "2h ago", status: "monitoring",
    expectedOutcome: "Reduce false positives by 30%",
    actualOutcome: "Monitoring — 18% reduction so far",
    regressions: [],
    sideEffects: [],
    recommendation: "hold",
    learned: "Still collecting data for 24h verification window",
  },
  {
    id: "v3", label: "AI prompt cache optimization",
    executedAt: "Yesterday", status: "verified",
    expectedOutcome: "Increase cache hit rate by 15%",
    actualOutcome: "Cache hit rate increased by 22%",
    regressions: [],
    sideEffects: [],
    recommendation: "expand",
    learned: "Cache warming strategy works well for repeated advisor patterns",
  },
];

const STATUS_CFG: Record<VerificationStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
  monitoring: { icon: Loader2, color: "text-blue-400", label: "Monitoring" },
  verified: { icon: CheckCircle, color: "text-emerald-400", label: "Verified ✓" },
  regression: { icon: TrendingDown, color: "text-red-400", label: "Regression" },
  inconclusive: { icon: AlertTriangle, color: "text-amber-400", label: "Inconclusive" },
};

const REC_CFG: Record<Recommendation, { color: string; label: string }> = {
  expand: { color: "text-emerald-400 border-emerald-500/20", label: "Expand" },
  hold: { color: "text-blue-400 border-blue-500/20", label: "Hold" },
  rollback: { color: "text-red-400 border-red-500/20", label: "Rollback" },
  escalate: { color: "text-amber-400 border-amber-500/20", label: "Escalate" },
};

export function ContinuousVerificationPanel() {
  return (
    <div className="space-y-3">
      {/* Pipeline indicator */}
      <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
        {["Execute", "Monitor", "Verify", "Confirm", "Learn"].map((step, i) => (
          <span key={step} className="flex items-center gap-1">
            {i > 0 && <ArrowRight className="h-2.5 w-2.5" />}
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">{step}</span>
          </span>
        ))}
      </div>

      {/* Verified actions */}
      <div className="space-y-2">
        {VERIFIED_ACTIONS.map(action => {
          const statusCfg = STATUS_CFG[action.status];
          const StatusIcon = statusCfg.icon;
          const recCfg = REC_CFG[action.recommendation];
          return (
            <div key={action.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2">
                <StatusIcon className={cn("h-3.5 w-3.5", statusCfg.color, action.status === "monitoring" && "animate-spin")} />
                <span className="text-xs font-medium text-foreground flex-1">{action.label}</span>
                <span className="text-[9px] text-muted-foreground">{action.executedAt}</span>
              </div>

              <div className="pl-5 space-y-1 text-[10px]">
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground shrink-0 w-16">Expected:</span>
                  <span className="text-foreground">{action.expectedOutcome}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground shrink-0 w-16">Actual:</span>
                  <span className={statusCfg.color}>{action.actualOutcome}</span>
                </div>
                {action.sideEffects.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground shrink-0 w-16">Side effects:</span>
                    <span className="text-amber-400">{action.sideEffects.join("; ")}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground shrink-0 w-16">Learned:</span>
                  <span className="text-foreground/70 italic">{action.learned}</span>
                </div>
              </div>

              <div className="pl-5 flex items-center gap-2">
                <Badge variant="outline" className={cn("text-[9px] h-4", statusCfg.color)}>
                  {statusCfg.label}
                </Badge>
                <Badge variant="outline" className={cn("text-[9px] h-4", recCfg.color)}>
                  Rec: {recCfg.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
