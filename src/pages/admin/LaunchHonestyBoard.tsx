import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRealityClassifications } from "@/platform/runtime/hooks/useRealityClassifications";
import { useMockReplacements } from "@/hooks/useMockReplacements";
import { Rocket, AlertTriangle, ShieldCheck, Eye, TrendingDown } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function LaunchHonestyBoard() {
  const { data: classifications = [] } = useRealityClassifications();
  const { data: replacements = [] } = useMockReplacements();

  const domainTruth = useMemo(() => {
    const map = new Map<string, { total: number; proven: number; simulated: number; blockers: string[] }>();
    classifications.forEach(c => {
      const d = map.get(c.domain) ?? { total: 0, proven: 0, simulated: 0, blockers: [] };
      d.total++;
      if (c.classification === "proven") d.proven++;
      if (c.classification === "simulated") d.simulated++;
      if (c.launch_impact === "blocking" && c.classification !== "proven") d.blockers.push(c.feature_name);
      map.set(c.domain, d);
    });
    return [...map.entries()].map(([domain, d]) => ({
      domain, ...d,
      provenPct: d.total > 0 ? Math.round((d.proven / d.total) * 100) : 0,
      truthRisk: d.simulated > d.proven ? "high" : d.simulated > 0 ? "medium" : "low",
    })).sort((a, b) => a.provenPct - b.provenPct);
  }, [classifications]);

  const totalBlockers = useMemo(() =>
    classifications.filter(c => c.launch_impact === "blocking" && c.classification !== "proven").length,
  [classifications]);

  const overallTruth = useMemo(() => {
    if (classifications.length === 0) return 0;
    const proven = classifications.filter(c => c.classification === "proven").length;
    return Math.round((proven / classifications.length) * 100);
  }, [classifications]);

  const claimSeverity = overallTruth >= 80 ? "safe" : overallTruth >= 50 ? "caution" : "danger";
  const claimColors = { safe: "text-emerald-400", caution: "text-yellow-400", danger: "text-destructive" };

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold">Launch Honesty Board</h1>
        <p className="text-sm text-muted-foreground">What can and cannot be honestly claimed — RCP09</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Rocket className={`h-8 w-8 mx-auto mb-2 ${claimColors[claimSeverity]}`} />
            <div className={`text-3xl font-bold ${claimColors[claimSeverity]}`}>{overallTruth}%</div>
            <div className="text-xs text-muted-foreground">Launch Truth Score</div>
            <Badge className={`mt-1 ${claimSeverity === "safe" ? "bg-emerald-500/20 text-emerald-400" : claimSeverity === "caution" ? "bg-yellow-500/20 text-yellow-400" : "bg-destructive/20 text-destructive"}`}>
              {claimSeverity === "safe" ? "Safe to claim" : claimSeverity === "caution" ? "Claim with caveats" : "Do not claim production-ready"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <div className="text-3xl font-bold text-destructive">{totalBlockers}</div>
            <div className="text-xs text-muted-foreground">Launch Blockers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-3xl font-bold">{replacements.filter(m => m.migration_priority === "critical" && m.migration_status !== "validated").length}</div>
            <div className="text-xs text-muted-foreground">Critical mocks remaining</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Domain Truth Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {domainTruth.length === 0 && <p className="text-xs text-muted-foreground">No classifications yet</p>}
          {domainTruth.map(d => (
            <div key={d.domain} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{d.domain}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={d.truthRisk === "high" ? "text-destructive" : d.truthRisk === "medium" ? "text-yellow-400" : "text-emerald-400"}>
                    {d.truthRisk} risk
                  </Badge>
                  <span className="text-muted-foreground">{d.provenPct}% proven</span>
                </div>
              </div>
              <Progress value={d.provenPct} className="h-2" />
              {d.blockers.length > 0 && (
                <div className="text-xs text-destructive">Blockers: {d.blockers.join(", ")}</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
