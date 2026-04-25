import { useState, useEffect } from "react";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, ArrowUp, Target } from "lucide-react";
import { computeLaunchReadiness, type LaunchBlockerEntry } from "@/lib/core-services/launch-readiness/launch-readiness-engine";
import { cn } from "@/lib/utils";

const SEV_COLORS: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

export default function LAUNCH04BlockerCommand() {
  const [blockers, setBlockers] = useState<LaunchBlockerEntry[]>([]);
  useEffect(() => { const r = computeLaunchReadiness(null); setBlockers(r.blockers); }, []);

  return (
    <div className="space-y-6 p-6" data-testid="launch04-blocker-command">
      <SitaPageHeader icon={<AlertOctagon className="h-6 w-6" />} title="Blocker Command Board" subtitle="All launch blockers ranked by severity and flagship loop impact" />
      <div className="space-y-3">
        {blockers.map(b => (
          <Card key={b.id} className="bg-card/50 border-border/50" data-testid={`blocker-${b.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[10px]", SEV_COLORS[b.severity])}>{b.severity}</Badge>
                  <p className="text-sm font-medium text-foreground">{b.title}</p>
                </div>
                <Badge variant="outline" className="text-[9px] text-muted-foreground">{b.id}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
                <div>
                  <p className="text-muted-foreground mb-0.5">Domain</p>
                  <p className="text-foreground">{b.domain}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Evidence</p>
                  <p className="text-foreground">{b.evidence}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Recommended Fix</p>
                  <p className="text-foreground">{b.recommendedFix}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                {b.flagshipLoopImpact.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-primary" />
                    {b.flagshipLoopImpact.map(l => <Badge key={l} variant="outline" className="text-[8px]">{l}</Badge>)}
                  </div>
                )}
                <div className="flex items-center gap-1 text-emerald-400">
                  <ArrowUp className="h-3 w-3" />
                  <span className="text-[10px]">+{b.expectedScoreUplift} pts if resolved</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
