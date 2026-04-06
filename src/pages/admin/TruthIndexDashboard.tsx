// ═══════════════════════════════════════════════════════════════
// SITA OS — Truth Index Dashboard
// Real-time truth indices computed from DB-backed services
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { computeTruthIndices, type TruthIndexSummary } from "@/lib/services/truth-indices/truth-index-aggregator";
import { Shield, Brain, Plug, Monitor, Eye, Layers, RefreshCw, Activity, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const INDEX_CONFIG = [
  { key: "runtimeTruth", label: "Runtime Truth Index", icon: Shield, color: "text-blue-400" },
  { key: "launchHonesty", label: "Launch Honesty Index", icon: Eye, color: "text-emerald-400" },
  { key: "aiTruth", label: "AI Truth Index", icon: Brain, color: "text-purple-400" },
  { key: "connectorTruth", label: "Connector Truth Index", icon: Plug, color: "text-amber-400" },
  { key: "demoGovernance", label: "Demo Governance Index", icon: Layers, color: "text-cyan-400" },
  { key: "surfacePortability", label: "Surface Portability Index", icon: Monitor, color: "text-pink-400" },
  { key: "deviceReadiness", label: "Device Readiness Index", icon: Smartphone, color: "text-orange-400" },
  { key: "observability", label: "Observability Index", icon: Activity, color: "text-teal-400" },
] as const;

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 75) return "text-blue-400";
  if (score >= 50) return "text-amber-400";
  if (score >= 25) return "text-orange-400";
  return "text-destructive";
}

function getScoreBadgeVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 75) return "default";
  if (score >= 50) return "secondary";
  return "destructive";
}

export default function TruthIndexDashboard() {
  const { data: indices, isLoading, refetch } = useQuery({
    queryKey: ["truth-indices"],
    queryFn: computeTruthIndices,
    staleTime: 60_000,
  });

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SITA OS — Truth Index Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time truth indices computed from DB-backed domain, launch, AI, connector, demo, and surface data
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="border-primary/30">
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Overall Truth Score</div>
            <div className={`text-4xl font-bold ${getScoreColor(indices?.overallScore ?? 0)}`}>
              {indices?.overallScore ?? 0}/100
            </div>
          </div>
          <Badge variant={getScoreBadgeVariant(indices?.overallScore ?? 0)} className="text-lg px-4 py-1">
            {indices?.overallScore !== undefined
              ? indices.overallScore >= 90 ? "EXCELLENT"
              : indices.overallScore >= 75 ? "GOOD"
              : indices.overallScore >= 50 ? "MODERATE"
              : "NEEDS WORK"
              : "COMPUTING..."}
          </Badge>
        </CardContent>
      </Card>

      {/* Individual Indices */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INDEX_CONFIG.map(cfg => {
          const idx = indices?.[cfg.key as keyof TruthIndexSummary] as { score: number; label: string; detail: string } | undefined;
          const score = idx?.score ?? 0;
          return (
            <Card key={cfg.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                  {cfg.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}/100</span>
                  <Badge variant={getScoreBadgeVariant(score)}>{idx?.label ?? "—"}</Badge>
                </div>
                <Progress value={score} className="h-2" />
                <p className="text-xs text-muted-foreground">{idx?.detail ?? "Computing..."}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {indices?.lastComputed && (
        <p className="text-xs text-muted-foreground text-right">
          Last computed: {new Date(indices.lastComputed).toLocaleString()}
        </p>
      )}
    </div>
  );
}
