import { useState, useEffect } from "react";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Rocket, RefreshCw, Shield, AlertTriangle, CheckCircle, XCircle, Target } from "lucide-react";
import { computeLaunchReadiness, type LaunchReadinessResult } from "@/lib/core-services/launch-readiness/launch-readiness-engine";
import { computeTruthIndices } from "@/lib/core-services/truth-indices/truth-index-aggregator";
import { cn } from "@/lib/utils";

const MODE_COLORS: Record<string, string> = {
  public_launch_ready: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  public_launch_qualified: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  private_beta_ready: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  pilot_ready: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  internal_only: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  not_launch_safe: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function LAUNCH01ReadinessExecutive() {
  const [result, setResult] = useState<LaunchReadinessResult | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const indices = await computeTruthIndices();
      const r = computeLaunchReadiness(indices);
      setResult(r);
    } catch {
      const r = computeLaunchReadiness(null);
      setResult(r);
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const scoreColor = (s: number) => s >= 80 ? "text-emerald-400" : s >= 60 ? "text-amber-400" : "text-destructive";

  return (
    <div className="space-y-6 p-6" data-testid="launch01-readiness-executive">
      <SitaPageHeader
        icon={<Rocket className="h-6 w-6" />}
        title="Launch Readiness Command Center"
        subtitle="Composite readiness score, launch mode, blockers, and flagship loop status"
      >
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} /> Refresh
        </Button>
      </SitaPageHeader>

      {result && (
        <>
          {/* Hero Score + Mode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50 md:col-span-1">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground mb-2">Composite Readiness</p>
                <p className={cn("text-5xl font-bold", scoreColor(result.compositeScore))}>{result.compositeScore}</p>
                <p className="text-xs text-muted-foreground mt-1">/ 100</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 md:col-span-1">
              <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                <p className="text-xs text-muted-foreground">Recommended Launch Mode</p>
                <Badge variant="outline" className={cn("text-sm px-3 py-1", MODE_COLORS[result.recommendedMode])}>
                  {result.modeLabel}
                </Badge>
                <p className="text-[10px] text-muted-foreground text-center">{result.modeDescription}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 md:col-span-1">
              <CardContent className="p-6 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{result.hardBlockerCount}</p>
                  <p className="text-[10px] text-muted-foreground">Hard Blockers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400">{result.softBlockerCount}</p>
                  <p className="text-[10px] text-muted-foreground">Soft Blockers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">{result.claimRiskCount}</p>
                  <p className="text-[10px] text-muted-foreground">Claim Risks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{result.claimSafePct}%</p>
                  <p className="text-[10px] text-muted-foreground">Claim Safe</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flagship Loops */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Flagship Loop Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.flagshipLoopReadiness.map(loop => (
                <div key={loop.loopKey} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30" data-testid={`flagship-loop-${loop.loopKey}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">{loop.title}</p>
                      <Badge variant="outline" className={cn("text-[10px]", loop.claimSafety === "safe" ? "text-emerald-400 border-emerald-500/30" : loop.claimSafety === "qualify" ? "text-amber-400 border-amber-500/30" : "text-destructive border-destructive/30")}>
                        {loop.launchClassification.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <Progress value={loop.truthPct} className="h-2" />
                  </div>
                  <p className={cn("text-lg font-bold min-w-[48px] text-right", scoreColor(loop.truthPct))}>{loop.truthPct}%</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Truth Indices */}
          {result.truthIndices && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Truth Index Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {Object.entries(result.truthIndices).filter(([k]) => k !== "overallScore" && k !== "lastComputed").map(([key, val]) => {
                    const v = val as { score: number; label: string };
                    return (
                      <div key={key} className="text-center p-2 rounded-lg bg-muted/20">
                        <p className={cn("text-lg font-bold", scoreColor(v.score))}>{v.score}</p>
                        <p className="text-[9px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <p className="text-[10px] text-muted-foreground text-right">Last computed: {new Date(result.lastComputed).toLocaleString()}</p>
        </>
      )}
    </div>
  );
}
