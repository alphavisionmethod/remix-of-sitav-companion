import { useState, useEffect } from "react";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, AlertTriangle, CheckCircle } from "lucide-react";
import { computeLaunchReadiness, type FlagshipLoopReadiness } from "@/lib/core-services/launch-readiness/launch-readiness-engine";
import { cn } from "@/lib/utils";

export default function LAUNCH02FlagshipReadiness() {
  const [loops, setLoops] = useState<FlagshipLoopReadiness[]>([]);
  useEffect(() => { const r = computeLaunchReadiness(null); setLoops(r.flagshipLoopReadiness); }, []);

  const scoreColor = (s: number) => s >= 80 ? "text-emerald-400" : s >= 60 ? "text-amber-400" : "text-destructive";
  const dimensions = ["structural", "runtime", "proof", "ux"] as const;

  return (
    <div className="space-y-6 p-6" data-testid="launch02-flagship-readiness">
      <SitaPageHeader icon={<Target className="h-6 w-6" />} title="Flagship Loop Readiness" subtitle="Per-loop scores, blockers, and next actions across all 5 flagship loops" />
      <div className="space-y-4">
        {loops.map(loop => (
          <Card key={loop.loopKey} className="bg-card/50 border-border/50" data-testid={`loop-detail-${loop.loopKey}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{loop.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[10px]", loop.claimSafety === "safe" ? "text-emerald-400 border-emerald-500/30" : loop.claimSafety === "qualify" ? "text-amber-400 border-amber-500/30" : "text-destructive border-destructive/30")}>
                    {loop.claimSafety}
                  </Badge>
                  <span className={cn("text-lg font-bold", scoreColor(loop.truthPct))}>{loop.truthPct}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dimensions.map(d => {
                  const val = loop[`${d}Score` as keyof FlagshipLoopReadiness] as number;
                  return (
                    <div key={d}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground capitalize">{d}</span>
                        <span className={scoreColor(val)}>{val}%</span>
                      </div>
                      <Progress value={val} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
              {loop.blockers.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-400" /> Blockers</p>
                  <div className="flex flex-wrap gap-1">
                    {loop.blockers.map(b => <Badge key={b} variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">{b}</Badge>)}
                  </div>
                </div>
              )}
              {loop.nextActions.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><CheckCircle className="h-3 w-3 text-primary" /> Next Actions</p>
                  <ul className="space-y-0.5">
                    {loop.nextActions.map((a, i) => <li key={i} className="text-[10px] text-muted-foreground">• {a}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
