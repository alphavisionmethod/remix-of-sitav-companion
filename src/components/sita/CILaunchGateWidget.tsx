import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Rocket,
  Shield,
  GitBranch,
  Clock,
} from "lucide-react";
import {
  computeLocalLaunchGateStatus,
  getPromotionEligibility,
  type LaunchGateStatus,
} from "@/lib/core-services/ci-launch-gate-service";

const STATE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  blocked: { icon: <XCircle className="h-5 w-5 text-destructive" />, color: "border-destructive/30 bg-destructive/5", label: "Blocked" },
  conditionally_eligible: { icon: <AlertTriangle className="h-5 w-5 text-amber-400" />, color: "border-amber-500/30 bg-amber-500/5", label: "Conditional" },
  pilot_ready: { icon: <Shield className="h-5 w-5 text-blue-400" />, color: "border-blue-500/30 bg-blue-500/5", label: "Pilot Ready" },
  internal_ready: { icon: <Shield className="h-5 w-5 text-blue-400" />, color: "border-blue-500/30 bg-blue-500/5", label: "Internal Ready" },
  launch_ready: { icon: <Rocket className="h-5 w-5 text-green-400" />, color: "border-green-500/30 bg-green-500/5", label: "Launch Ready" },
  production_hardened: { icon: <Rocket className="h-5 w-5 text-green-400" />, color: "border-green-500/30 bg-green-500/5", label: "Production Hardened" },
};

const CATEGORY_COLORS: Record<string, string> = {
  build: "bg-blue-500/20 text-blue-400",
  test: "bg-purple-500/20 text-purple-400",
  security: "bg-red-500/20 text-red-400",
  architecture: "bg-amber-500/20 text-amber-400",
  quality: "bg-green-500/20 text-green-400",
};

export function CILaunchGateWidget({ status }: { status?: LaunchGateStatus }) {
  const gateStatus = status ?? computeLocalLaunchGateStatus();
  const config = STATE_CONFIG[gateStatus.state] ?? STATE_CONFIG.blocked;
  const promotion = getPromotionEligibility(gateStatus.state);

  return (
    <Card className={`${config.color} border`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {config.icon}
          CI Launch Gate — {config.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">
              {gateStatus.passedGates}/{gateStatus.totalGates} gates passed
            </span>
            <span className="font-bold">{gateStatus.truthScore}%</span>
          </div>
          <Progress value={gateStatus.truthScore} className="h-2" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" /> {gateStatus.branch}
          </span>
          <span className="font-mono">{gateStatus.commit}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(gateStatus.lastUpdated).toLocaleString()}
          </span>
        </div>

        {/* Gates grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {gateStatus.gates.map((gate) => (
            <div
              key={gate.name}
              className="flex items-center gap-2 rounded-md border border-border/30 px-2 py-1.5"
            >
              {gate.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
              )}
              <span className="text-xs flex-1 truncate">{gate.name}</span>
              <Badge className={`text-[9px] px-1 py-0 ${CATEGORY_COLORS[gate.category] ?? ""}`}>
                {gate.category}
              </Badge>
              {gate.required && (
                <span className="text-[9px] text-amber-400">req</span>
              )}
            </div>
          ))}
        </div>

        {/* Ring promotion */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/30">
          <span className="text-[10px] text-muted-foreground">Rings:</span>
          <Badge
            variant={promotion.canary ? "default" : "destructive"}
            className="text-[9px] px-1.5 py-0"
          >
            Canary {promotion.canary ? "✓" : "✗"}
          </Badge>
          <Badge
            variant={promotion.pilot ? "default" : "destructive"}
            className="text-[9px] px-1.5 py-0"
          >
            Pilot {promotion.pilot ? "✓" : "✗"}
          </Badge>
          <Badge
            variant={promotion.ga ? "default" : "destructive"}
            className="text-[9px] px-1.5 py-0"
          >
            GA {promotion.ga ? "✓" : "✗"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
