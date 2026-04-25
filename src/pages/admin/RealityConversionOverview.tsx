import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRealityClassifications, useClassificationStats } from "@/hooks/useRealityClassifications";
import { useMockReplacements, useMockReplacementStats } from "@/hooks/useMockReplacements";
import { useDetectionReport, useIntegrationStatuses } from "@/hooks/useRealityDetection";
import { autoSeedAll } from "@/lib/detection/auto-seed";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shield, Eye, Cpu, CheckCircle2, AlertTriangle, TrendingUp, Layers, Rocket, Scan, Link2, Zap } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const STATE_COLORS = {
  presentational: { bg: "bg-muted", text: "text-muted-foreground", icon: Eye, label: "Presentational" },
  simulated: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: Cpu, label: "Simulated" },
  persisted: { bg: "bg-blue-500/20", text: "text-blue-400", icon: Shield, label: "Persisted" },
  proven: { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: CheckCircle2, label: "Proven" },
};

export default function RealityConversionOverview() {
  const { data: classifications = [] } = useRealityClassifications();
  const { data: replacements = [] } = useMockReplacements();
  const cStats = useClassificationStats(classifications);
  const mStats = useMockReplacementStats(replacements);
  const { data: detectionReport } = useDetectionReport();
  const { data: integrations = [] } = useIntegrationStatuses();
  const qc = useQueryClient();
  const [seeding, setSeeding] = useState(false);

  const handleAutoSeed = async () => {
    setSeeding(true);
    try {
      const result = await autoSeedAll();
      toast.success(`Seeded ${result.classifications.seeded} classifications + ${result.replacements.seeded} mock replacements (${result.classifications.skipped + result.replacements.skipped} skipped)`);
      qc.invalidateQueries({ queryKey: ["reality-classifications"] });
      qc.invalidateQueries({ queryKey: ["mock-replacements"] });
    } catch (e: any) {
      toast.error(e.message || "Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  const domainRollup = useMemo(() => {
    const map = new Map<string, { total: number; proven: number; simulated: number }>();
    classifications.forEach(c => {
      const d = map.get(c.domain) ?? { total: 0, proven: 0, simulated: 0 };
      d.total++;
      if (c.classification === "proven") d.proven++;
      if (c.classification === "simulated") d.simulated++;
      map.set(c.domain, d);
    });
    return [...map.entries()].sort((a, b) => b[1].simulated - a[1].simulated);
  }, [classifications]);

  const launchBlockers = useMemo(() =>
    classifications.filter(c => c.launch_impact === "blocking" && c.classification !== "proven"),
  [classifications]);

  const recentConversions = useMemo(() =>
    replacements.filter(m => m.migration_status === "completed" || m.migration_status === "validated")
      .sort((a, b) => new Date(b.done_at ?? b.updated_at).getTime() - new Date(a.done_at ?? a.updated_at).getTime())
      .slice(0, 8),
  [replacements]);

  return (
    <div className="space-y-6 p-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reality Conversion Overview</h1>
          <p className="text-sm text-muted-foreground">Executive overview of platform reality state — RCP01</p>
        </div>
        <Button onClick={handleAutoSeed} disabled={seeding} variant="outline" size="sm" className="gap-2">
          <Zap className="h-4 w-4" />{seeding ? "Seeding..." : "Auto-Seed from Audit"}
        </Button>
      </div>

      {/* State Distribution Band */}
      <div className="grid grid-cols-4 gap-4">
        {(["presentational", "simulated", "persisted", "proven"] as const).map(key => {
          const cfg = STATE_COLORS[key];
          const Icon = cfg.icon;
          const count = cStats[key];
          return (
            <Card key={key} className={cfg.bg}>
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className={`h-8 w-8 ${cfg.text}`} />
                <div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className={`text-xs ${cfg.text}`}>{cfg.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Readiness + Migration Progress */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Rocket className="h-4 w-4" />Platform Readiness</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cStats.readiness}%</div>
            <Progress value={cStats.readiness} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{cStats.proven} of {cStats.total} features proven</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />Mock Migration Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mStats.completionRate}%</div>
            <Progress value={mStats.completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{mStats.completed + mStats.validated} of {mStats.total} mocks replaced</p>
          </CardContent>
        </Card>
      </div>

      {/* Top simulated domains + launch blockers */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4" />Top Simulated Domains</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {domainRollup.length === 0 && <p className="text-xs text-muted-foreground">No classifications yet</p>}
            {domainRollup.slice(0, 6).map(([domain, d]) => (
              <div key={domain} className="flex items-center justify-between text-sm">
                <span className="font-mono">{domain}</span>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-yellow-400">{d.simulated} sim</Badge>
                  <Badge variant="outline" className="text-emerald-400">{d.proven} proven</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Launch Blockers</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {launchBlockers.length === 0 && <p className="text-xs text-muted-foreground">No launch blockers</p>}
            {launchBlockers.slice(0, 6).map(b => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <span>{b.feature_name}</span>
                <Badge variant="outline" className="text-destructive">{b.classification}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversions */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Recent Conversions</CardTitle></CardHeader>
        <CardContent>
          {recentConversions.length === 0 && <p className="text-xs text-muted-foreground">No completed migrations yet</p>}
          <div className="grid grid-cols-2 gap-2">
            {recentConversions.map(m => (
              <div key={m.id} className="border rounded p-2 text-sm">
                <div className="font-medium">{m.feature_name}</div>
                <div className="text-xs text-muted-foreground">{m.page_path}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detection Summary */}
      {detectionReport && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Scan className="h-4 w-4" />Detection Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: "Mock Imports", count: detectionReport.summary.importCount, color: "text-yellow-400" },
                { label: "Persistence Gaps", count: detectionReport.summary.persistenceGapCount, color: "text-orange-400" },
                { label: "Contract Gaps", count: detectionReport.summary.contractGapCount, color: "text-destructive" },
                { label: "Runtime Gaps", count: detectionReport.summary.runtimeGapCount, color: "text-blue-400" },
                { label: "Critical", count: detectionReport.summary.criticalCount, color: "text-destructive" },
              ].map(d => (
                <div key={d.label} className="text-center">
                  <div className={`text-xl font-bold ${d.color}`}>{d.count}</div>
                  <div className="text-xs text-muted-foreground">{d.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Status */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Link2 className="h-4 w-4" />System Integrations</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>System</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map(i => (
                <TableRow key={i.system}>
                  <TableCell className="text-sm">{i.system}</TableCell>
                  <TableCell><Badge variant="outline" className={i.connected ? "text-emerald-400" : "text-muted-foreground"}>{i.connected ? "Connected" : "Pending"}</Badge></TableCell>
                  <TableCell>{i.dataPoints}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
