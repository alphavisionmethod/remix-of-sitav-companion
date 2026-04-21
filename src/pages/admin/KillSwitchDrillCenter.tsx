import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KILL_SWITCH_DRILL_INVENTORY, simulateDryRunDrill } from "@/lib/control-plane/kill-switch-drill-runner";
import { buildDrillSchedule } from "@/lib/control-plane/kill-switch-drill-calendar";
import { Shield, Play, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const blastColors: Record<string, string> = {
  low: "bg-green-500/20 text-green-300",
  medium: "bg-yellow-500/20 text-yellow-300",
  high: "bg-orange-500/20 text-orange-300",
  critical: "bg-red-500/20 text-red-300",
};

export default function KillSwitchDrillCenter() {
  const { toast } = useToast();
  const schedule = buildDrillSchedule();
  const overdue = schedule.filter((s) => s.isOverdue).length;
  const [drillResults, setDrillResults] = useState<Record<string, { success: boolean; timeMs: number }>>({});

  const runDryDrill = (switchId: string) => {
    const result = simulateDryRunDrill(switchId, "operator-current");
    setDrillResults((prev) => ({ ...prev, [switchId]: { success: result.success, timeMs: result.timeToDisableMs ?? 0 } }));
    toast({ title: "Dry-run drill complete", description: `${switchId}: ${result.timeToDisableMs}ms` });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kill Switch Drill Center</h1>
          <p className="text-sm text-muted-foreground">Safety drill execution, scheduling, and audit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-foreground">{KILL_SWITCH_DRILL_INVENTORY.length}</div>
            <div className="text-xs text-muted-foreground">Registered Switches</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-4 text-center">
            <div className={`text-3xl font-bold ${overdue > 0 ? "text-red-400" : "text-green-400"}`}>{overdue}</div>
            <div className="text-xs text-muted-foreground">Overdue Drills</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-foreground">{Object.keys(drillResults).length}</div>
            <div className="text-xs text-muted-foreground">Drills This Session</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">Quarterly</div>
            <div className="text-xs text-muted-foreground">Drill Cadence</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {KILL_SWITCH_DRILL_INVENTORY.map((def) => {
          const sched = schedule.find((s) => s.switchId === def.switchId);
          const result = drillResults[def.switchId];
          return (
            <Card key={def.switchId} className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base text-foreground">{def.displayName}</CardTitle>
                    <Badge variant="outline" className={blastColors[def.blastRadius]}>{def.blastRadius} blast</Badge>
                    {sched?.isOverdue && <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    {result && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {result.success ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <AlertTriangle className="h-3 w-3 text-red-400" />}
                        {result.timeMs}ms
                      </span>
                    )}
                    <Button size="sm" variant="outline" onClick={() => runDryDrill(def.switchId)} className="text-xs">
                      <Play className="h-3 w-3 mr-1" />Dry Run
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-2">{def.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Scope:</span> <span className="text-foreground">{def.scope}</span></div>
                  <div><span className="text-muted-foreground">Target:</span> <span className="text-foreground">{def.timeToDisableMs}ms</span></div>
                  <div><span className="text-muted-foreground">Trigger:</span> <span className="text-foreground">{def.triggerMethod}</span></div>
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">{sched?.cadence}</span></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}