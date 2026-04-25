import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRealityClassifications, useClassificationStats } from "@/hooks/useRealityClassifications";
import { useMockReplacements, useMockReplacementStats } from "@/hooks/useMockReplacements";
import { TrendingUp, CheckCircle2, ArrowRight, Clock, Target } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function RealityProgressTimeline() {
  const { data: classifications = [] } = useRealityClassifications();
  const { data: replacements = [] } = useMockReplacements();
  const cStats = useClassificationStats(classifications);
  const mStats = useMockReplacementStats(replacements);

  const transitionCounts = useMemo(() => {
    const counts = { toSimulated: 0, toPersisted: 0, toProven: 0 };
    counts.toSimulated = classifications.filter(c => c.classification === "simulated").length;
    counts.toPersisted = classifications.filter(c => c.classification === "persisted").length;
    counts.toProven = classifications.filter(c => c.classification === "proven").length;
    return counts;
  }, [classifications]);

  const milestones = useMemo(() => {
    const items: { label: string; achieved: boolean; detail: string }[] = [
      { label: "First feature classified", achieved: classifications.length > 0, detail: `${classifications.length} total` },
      { label: "First mock tracked", achieved: replacements.length > 0, detail: `${replacements.length} tracked` },
      { label: "First mock replaced", achieved: mStats.completed + mStats.validated > 0, detail: `${mStats.completed + mStats.validated} done` },
      { label: "First proven feature", achieved: cStats.proven > 0, detail: `${cStats.proven} proven` },
      { label: "50% mocks replaced", achieved: mStats.completionRate >= 50, detail: `${mStats.completionRate}%` },
      { label: "All critical mocks replaced", achieved: replacements.filter(m => m.migration_priority === "critical" && m.migration_status !== "validated" && m.migration_status !== "completed").length === 0 && replacements.some(m => m.migration_priority === "critical"), detail: "" },
      { label: "80% platform proven", achieved: cStats.readiness >= 80, detail: `${cStats.readiness}%` },
      { label: "100% launch honesty", achieved: cStats.readiness === 100, detail: "" },
    ];
    return items;
  }, [classifications, replacements, cStats, mStats]);

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold">Reality Progress Timeline</h1>
        <p className="text-sm text-muted-foreground">Track conversion progress over time — RCP11</p>
      </div>

      {/* State Transition Counters */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "→ Simulated", count: transitionCounts.toSimulated, color: "text-yellow-400" },
          { label: "→ Persisted", count: transitionCounts.toPersisted, color: "text-blue-400" },
          { label: "→ Proven", count: transitionCounts.toProven, color: "text-emerald-400" },
        ].map(t => (
          <Card key={t.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <ArrowRight className={`h-6 w-6 ${t.color}`} />
              <div>
                <div className={`text-2xl font-bold ${t.color}`}>{t.count}</div>
                <div className="text-xs text-muted-foreground">{t.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Mock Source Reduction</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mStats.total - (mStats.completed + mStats.validated)} remaining</div>
            <Progress value={mStats.completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{mStats.completionRate}% eliminated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Proven Surface Growth</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{cStats.proven} features</div>
            <Progress value={cStats.readiness} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{cStats.readiness}% of platform proven</p>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" />Milestones</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${m.achieved ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                  {m.achieved ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-3 w-3" />}
                </div>
                <div className="flex-1">
                  <span className={`text-sm ${m.achieved ? "" : "text-muted-foreground"}`}>{m.label}</span>
                  {m.detail && <span className="text-xs text-muted-foreground ml-2">{m.detail}</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
