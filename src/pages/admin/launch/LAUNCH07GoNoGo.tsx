import { useState, useEffect } from "react";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gavel, CheckCircle, XCircle, Clock } from "lucide-react";
import { computeLaunchReadiness, getGoNoGoConditions, type LaunchReadinessResult, type GoNoGoCondition, type LaunchMode } from "@/lib/core-services/launch-readiness/launch-readiness-engine";
import { cn } from "@/lib/utils";
const MODE_LABELS: Record<LaunchMode, string> = {
  not_launch_safe: "Not Launch Safe",
  internal_only: "Internal Only",
  pilot_ready: "Pilot Ready",
  private_beta_ready: "Private Beta",
  public_launch_qualified: "Public (Qualified)",
  public_launch_ready: "Public Launch",
};

export default function LAUNCH07GoNoGo() {
  const [result, setResult] = useState<LaunchReadinessResult | null>(null);
  const [conditions, setConditions] = useState<GoNoGoCondition[]>([]);

  useEffect(() => {
    const r = computeLaunchReadiness(null);
    setResult(r);
    setConditions(getGoNoGoConditions(r));
  }, []);

  if (!result) return null;

  const currentModeIdx = DEMO_MODE_ORDER.indexOf(result.recommendedMode);

  return (
    <div className="space-y-6 p-6" data-testid="launch07-go-no-go">
      <SitaPageHeader icon={<Gavel className="h-6 w-6" />} title="Go / No-Go Decision Board" subtitle="Evidence-based launch decision framework with conditions and rationale" />

      {/* Current Decision */}
      <Card className="bg-card/50 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-xs text-muted-foreground mb-2">Current Recommendation</p>
          <p className="text-2xl font-bold text-primary mb-1">{result.modeLabel}</p>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">{result.modeDescription}</p>
          <p className="text-[10px] text-muted-foreground mt-3">Composite Score: <span className="text-foreground font-bold">{result.compositeScore}/100</span></p>
        </CardContent>
      </Card>

      {/* Mode Progression */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Launch Mode Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            {([] as any[]).map((mode, idx) => (
              <div key={mode} className={cn("flex-1 p-2 rounded text-center text-[9px]", idx <= currentModeIdx ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground")}>
                {idx <= currentModeIdx && <CheckCircle className="h-3 w-3 mx-auto mb-0.5" />}
                {MODE_LABELS[mode]}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conditions Checklist */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Required Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {conditions.map((c, i) => (
            <div key={i} className={cn("flex items-center gap-3 p-2 rounded", c.met ? "bg-emerald-500/5" : "bg-destructive/5")} data-testid={`condition-${i}`}>
              {c.met ? <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
              <div className="flex-1">
                <p className="text-xs text-foreground">{c.label}</p>
                <div className="flex gap-1 mt-0.5">
                  {c.requiredForMode.map(m => <Badge key={m} variant="outline" className="text-[8px]">{MODE_LABELS[m]}</Badge>)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Blockers preventing upgrade */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Blockers Preventing Upgrade</CardTitle>
        </CardHeader>
        <CardContent>
          {result.blockers.filter(b => b.severity === "critical" || b.severity === "high").length === 0 ? (
            <p className="text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> No critical/high blockers remaining</p>
          ) : (
            <div className="space-y-1.5">
              {result.blockers.filter(b => b.severity === "critical" || b.severity === "high").map(b => (
                <div key={b.id} className="flex items-center gap-2 p-2 rounded bg-destructive/5">
                  <Badge variant="outline" className="text-[9px] text-destructive border-destructive/30">{b.severity}</Badge>
                  <p className="text-[10px] text-foreground">{b.title}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-[10px] text-muted-foreground text-right flex items-center justify-end gap-1">
        <Clock className="h-3 w-3" /> Last reviewed: {new Date(result.lastComputed).toLocaleString()}
      </p>
    </div>
  );
}
