import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle, AlertTriangle, Shield, TrendingUp, Undo2,
  Beaker, HelpCircle, X, ChevronDown, Play, Pencil
} from "lucide-react";

interface SimulationOutcome {
  type: "improvement" | "warning" | "blocked";
  text: string;
}

interface SimulationResultCardProps {
  objective: string;
  outcomes: SimulationOutcome[];
  confidence: number;
  risk: "low" | "medium" | "high";
  impact: "local" | "service" | "cohort" | "global";
  rollbackAvailable: boolean;
  recommendation: string;
  onApply?: () => void;
  onAdjust?: () => void;
  onExplain?: () => void;
  onCancel?: () => void;
}

const RISK_STYLES = {
  low: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  high: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

const IMPACT_LABELS = {
  local: "Local",
  service: "Service-level",
  cohort: "Cohort-wide",
  global: "Global",
};

const OUTCOME_CFG = {
  improvement: { icon: CheckCircle, color: "text-emerald-400" },
  warning: { icon: AlertTriangle, color: "text-amber-400" },
  blocked: { icon: X, color: "text-red-400" },
};

export function SimulationResultCard({
  objective, outcomes, confidence, risk, impact,
  rollbackAvailable, recommendation,
  onApply, onAdjust, onExplain, onCancel,
}: SimulationResultCardProps) {
  const riskStyle = RISK_STYLES[risk];

  return (
    <div className="rounded-xl border border-border/30 bg-card/95 backdrop-blur-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-border/20">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Beaker className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-medium text-primary uppercase tracking-wider">Simulation Result</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{objective}</h3>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="p-1 hover:bg-muted/40 rounded">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Scoring chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[9px] h-5 gap-1 bg-primary/5 border-primary/20 text-primary">
            Confidence: {confidence}%
          </Badge>
          <Badge variant="outline" className={cn("text-[9px] h-5 gap-1", riskStyle.bg, riskStyle.text, riskStyle.border)}>
            Risk: {risk}
          </Badge>
          <Badge variant="outline" className="text-[9px] h-5 text-muted-foreground">
            Impact: {IMPACT_LABELS[impact]}
          </Badge>
          <Badge variant="outline" className={cn("text-[9px] h-5 gap-1", rollbackAvailable ? "text-emerald-400 border-emerald-500/20" : "text-red-400 border-red-500/20")}>
            <Undo2 className="h-2.5 w-2.5" />
            Rollback: {rollbackAvailable ? "Available" : "Limited"}
          </Badge>
        </div>
      </div>

      {/* Outcomes */}
      <div className="p-4 space-y-2">
        {outcomes.map((outcome, i) => {
          const cfg = OUTCOME_CFG[outcome.type];
          const Icon = cfg.icon;
          return (
            <div key={i} className="flex items-start gap-2.5">
              <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", cfg.color)} />
              <span className="text-xs text-foreground leading-relaxed">{outcome.text}</span>
            </div>
          );
        })}
      </div>

      {/* Recommendation */}
      <div className="mx-4 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-[11px] text-foreground leading-relaxed">
            <span className="font-medium">Recommendation: </span>{recommendation}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
        <Button size="sm" className="h-7 text-xs gap-1.5" onClick={onApply}>
          <Play className="h-3 w-3" /> Apply Canary Plan
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={onAdjust}>
          <Pencil className="h-3 w-3" /> Adjust Plan
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={onExplain}>
          <HelpCircle className="h-3 w-3" /> Explain More
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
