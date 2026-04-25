import RCPSubNav from "@/platform/admin/components/admin/RCPSubNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Waves, ArrowRight, Users, Clock, TrendingUp } from "lucide-react";
import { MIGRATION_WAVES, type MigrationStatus } from "@/runtimes/reality/reality-audit-registry";

const statusColors: Record<MigrationStatus, string> = {
  identified: "text-muted-foreground bg-muted/30",
  planned: "text-blue-400 bg-blue-500/10",
  in_progress: "text-amber-400 bg-amber-500/10",
  blocked: "text-red-400 bg-red-500/10",
  completed: "text-emerald-400 bg-emerald-500/10",
  validated: "text-emerald-400 bg-emerald-500/15",
};

const effortLabels: Record<string, string> = { small: "S (1-2 weeks)", medium: "M (3-4 weeks)", large: "L (5-8 weeks)", xlarge: "XL (8+ weeks)" };

const RCP10WavePlanner = () => {
  const totalGain = MIGRATION_WAVES.reduce((s, w) => s + w.readinessGainEstimate, 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <RCPSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Waves className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Migration Wave Planner</h1>
          <p className="text-sm text-muted-foreground">Plan the sequence of mock → real migrations by priority, domain, and dependency</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Total Waves", value: MIGRATION_WAVES.length, color: "text-blue-400" },
          { label: "In Progress", value: MIGRATION_WAVES.filter(w => w.status === "in_progress").length, color: "text-amber-400" },
          { label: "Features Covered", value: MIGRATION_WAVES.reduce((s, w) => s + w.features.length, 0), color: "text-foreground" },
          { label: "Total Readiness Gain", value: `+${totalGain}%`, color: "text-emerald-400" },
        ]).map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* DependencyTimeline */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Wave Dependency Timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {MIGRATION_WAVES.sort((a, b) => a.waveNumber - b.waveNumber).map((w, i) => (
              <div key={w.id} className="flex items-center gap-2">
                <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                  w.status === "in_progress" ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : w.status === "completed" || w.status === "validated" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-muted/30 border-border/50"
                }`}>
                  <div className="text-xs font-bold">Wave {w.waveNumber}</div>
                  <div className="text-[10px] opacity-70">{w.domainGroup}</div>
                </div>
                {i < MIGRATION_WAVES.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* WavePlannerBoard */}
      <div className="space-y-4">
        {MIGRATION_WAVES.sort((a, b) => a.waveNumber - b.waveNumber).map(w => (
          <Card key={w.id} className={w.status === "in_progress" ? "border-amber-500/30" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Waves className="h-4 w-4" /> {w.waveName}
                  <Badge variant={w.priority === "P0" ? "destructive" : "secondary"} className="text-[10px]">{w.priority}</Badge>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[w.status]}`}>{w.status.replace("_", " ")}</span>
                </CardTitle>
                <span className="text-xs text-muted-foreground">{w.targetDate}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs">{w.owner}</span></div>
                <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs">{effortLabels[w.effortEstimate]}</span></div>
                <div className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-emerald-400" /><span className="text-xs text-emerald-400">+{w.readinessGainEstimate}% readiness</span></div>
                <div className="text-xs text-muted-foreground">{w.features.length} features</div>
              </div>

              <div className="flex flex-wrap gap-1">
                {w.featureNames.map(f => <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>)}
              </div>

              {w.dependsOnWaves.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Depends on: {w.dependsOnWaves.map(d => MIGRATION_WAVES.find(mw => mw.id === d)?.waveName || d).join(", ")}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* EffortVsTruthGainChart */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Effort vs Readiness Gain</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MIGRATION_WAVES.sort((a, b) => b.readinessGainEstimate - a.readinessGainEstimate).map(w => (
              <div key={w.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-xs">{w.waveName}</span>
                  <span className="font-mono text-xs text-emerald-400">+{w.readinessGainEstimate}%</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(w.readinessGainEstimate / totalGain) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RCP10WavePlanner;
