import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Code2, Eye, TestTube, Shield, Server, DollarSign, Rocket,
  CheckCircle, Loader2, AlertTriangle, Clock, Minus
} from "lucide-react";

interface AIContributor {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
  status: "active" | "idle" | "reviewing" | "blocked";
  currentTask: string;
  latestFinding?: string;
  findingType?: "positive" | "caution" | "neutral";
}

const STATUS_CFG = {
  active: { icon: Loader2, color: "text-blue-400", label: "Active", animate: true },
  idle: { icon: Minus, color: "text-muted-foreground", label: "Idle", animate: false },
  reviewing: { icon: Eye, color: "text-amber-400", label: "Reviewing", animate: false },
  blocked: { icon: AlertTriangle, color: "text-red-400", label: "Blocked", animate: false },
};

const FINDING_COLOR = {
  positive: "text-emerald-400",
  caution: "text-amber-400",
  neutral: "text-muted-foreground",
};

const AI_TEAM: AIContributor[] = [
  {
    id: "dev", name: "Dev AI", role: "Fix preparation & code generation",
    icon: Code2, color: "text-blue-400", status: "active",
    currentTask: "Preparing sync retry optimization patch",
    latestFinding: "Fix prepared for upload finalization timeout", findingType: "positive",
  },
  {
    id: "review", name: "Review AI", role: "Code review & impact analysis",
    icon: Eye, color: "text-purple-400", status: "reviewing",
    currentTask: "Reviewing sync retry patch for side effects",
    latestFinding: "Concern: patch may increase CPU on low-end devices", findingType: "caution",
  },
  {
    id: "qa", name: "QA AI", role: "Testing & regression detection",
    icon: TestTube, color: "text-cyan-400", status: "active",
    currentTask: "Running regression suite on sync changes",
    latestFinding: "All regression tests passed. Stress test recommended", findingType: "positive",
  },
  {
    id: "security", name: "Security AI", role: "Vulnerability & privilege scanning",
    icon: Shield, color: "text-emerald-400", status: "idle",
    currentTask: "Monitoring for auth anomalies",
    latestFinding: "No new privilege or auth risk found", findingType: "positive",
  },
  {
    id: "ops", name: "Ops AI", role: "Infrastructure & deployment health",
    icon: Server, color: "text-orange-400", status: "active",
    currentTask: "Preparing canary rollout configuration",
    latestFinding: "Canary rollout ready for desktop beta", findingType: "positive",
  },
  {
    id: "cost", name: "Cost AI", role: "Budget optimization & spend analysis",
    icon: DollarSign, color: "text-amber-400", status: "idle",
    currentTask: "Monitoring real-time AI spend",
    latestFinding: "AI cost impact negligible. Infra cost impact low", findingType: "neutral",
  },
  {
    id: "release", name: "Release AI", role: "Release readiness & rollout strategy",
    icon: Rocket, color: "text-violet-400", status: "reviewing",
    currentTask: "Evaluating rollout strategy for v2.14.0-rc3",
    latestFinding: "Suggest 10% beta desktop rollout first", findingType: "positive",
  },
];

export function MultiAITeamPanel() {
  return (
    <div className="space-y-1.5">
      {AI_TEAM.map(contributor => {
        const statusCfg = STATUS_CFG[contributor.status];
        const StatusIcon = statusCfg.icon;
        return (
          <div key={contributor.id} className="p-2.5 rounded-lg bg-muted/10 border border-border/10 space-y-1.5">
            {/* Header */}
            <div className="flex items-center gap-2">
              <contributor.icon className={cn("h-3.5 w-3.5", contributor.color)} />
              <span className="text-[11px] font-semibold text-foreground flex-1">{contributor.name}</span>
              <div className="flex items-center gap-1">
                <StatusIcon className={cn("h-2.5 w-2.5", statusCfg.color, statusCfg.animate && "animate-spin")} />
                <span className={cn("text-[9px]", statusCfg.color)}>{statusCfg.label}</span>
              </div>
            </div>

            {/* Current Task */}
            <p className="text-[10px] text-muted-foreground pl-5">{contributor.currentTask}</p>

            {/* Latest Finding */}
            {contributor.latestFinding && (
              <div className="pl-5 flex items-start gap-1.5">
                <CheckCircle className={cn("h-2.5 w-2.5 mt-0.5 shrink-0", FINDING_COLOR[contributor.findingType || "neutral"])} />
                <span className={cn("text-[10px]", FINDING_COLOR[contributor.findingType || "neutral"])}>
                  {contributor.latestFinding}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
