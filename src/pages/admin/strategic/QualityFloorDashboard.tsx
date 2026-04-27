import { Shield, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { useQualityFloors } from "@/platform/personal-brain/hooks/useIntelligencePersistence";
import { DEFAULT_QUALITY_FLOORS } from "@/lib/strategic-intelligence/quality-floor-engine";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const enfColors: Record<string,string> = { pass: "text-emerald-400 bg-emerald-500/10", block: "text-rose-400 bg-rose-500/10", escalate: "text-amber-400 bg-amber-500/10", reroute: "text-blue-400 bg-blue-500/10", warn: "text-amber-400 bg-amber-500/10" };

const QualityFloorDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { floors, loading: dataLoading } = useQualityFloors();

  if (authLoading || !isAdmin) return null;

  // Merge DB floors with defaults (DB takes precedence)
  const dbKeys = new Set(floors.map(f => `${f.task_class}:${f.domain}`));
  const merged = [
    ...floors.map(f => ({
      taskClass: f.task_class, domain: f.domain, minConfidence: Number(f.min_confidence) * 100,
      minEvidence: Number(f.min_evidence_completeness) * 100, verification: f.min_verification_standard,
      minFreshness: Number(f.min_freshness) * 100, enforcement: f.enforcement_mode, active: f.active, fromDb: true,
    })),
    ...DEFAULT_QUALITY_FLOORS
      .filter(f => !dbKeys.has(`${f.taskClass}:${f.domain}`))
      .map(f => ({
        taskClass: f.taskClass, domain: f.domain, minConfidence: f.minConfidence,
        minEvidence: f.minEvidenceCompleteness, verification: f.minVerificationStandard,
        minFreshness: f.minFreshness, enforcement: f.enforcementMode, active: true, fromDb: false,
      })),
  ];

  const activeCount = merged.filter(f => f.active).length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader icon={<Shield className="h-6 w-6" />} title="Quality Floor Engine" subtitle="Hard quality thresholds that prevent optimization from lowering standards" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Total Policies", v: String(merged.length) },
          { l: "Active", v: String(activeCount), c: "text-emerald-400" },
          { l: "From DB", v: String(floors.length), c: "text-primary" },
          { l: "Defaults", v: String(merged.length - floors.length) },
        ].map(m => (
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center">
            <p className={`text-2xl font-bold ${m.c || "text-foreground"}`}>{m.v}</p>
            <p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>
      {dataLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading quality floor configs…</div>
      ) : (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Quality Floor Definitions</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow>
            <TableHead className="text-xs">Task Class</TableHead>
            <TableHead className="text-xs">Domain</TableHead>
            <TableHead className="text-xs text-right">Min Conf.</TableHead>
            <TableHead className="text-xs text-right">Min Evidence</TableHead>
            <TableHead className="text-xs">Verification</TableHead>
            <TableHead className="text-xs text-right">Freshness</TableHead>
            <TableHead className="text-xs">Enforcement</TableHead>
            <TableHead className="text-xs text-center">Source</TableHead>
          </TableRow></TableHeader><TableBody>
            {merged.map(f => (<TableRow key={f.taskClass + f.domain}>
              <TableCell className="text-xs font-medium text-foreground">{f.taskClass.replace(/_/g, " ")}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{f.domain}</TableCell>
              <TableCell className="text-xs text-right">{f.minConfidence.toFixed(0)}%</TableCell>
              <TableCell className="text-xs text-right">{f.minEvidence.toFixed(0)}%</TableCell>
              <TableCell><Badge variant="outline" className="text-[9px]">{f.verification}</Badge></TableCell>
              <TableCell className="text-xs text-right">{f.minFreshness.toFixed(0)}%</TableCell>
              <TableCell><Badge className={`${enfColors[f.enforcement] || ""} text-[9px]`} variant="secondary">{f.enforcement}</Badge></TableCell>
              <TableCell className="text-center">
                {f.fromDb ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mx-auto" /> : <span className="text-[10px] text-muted-foreground">default</span>}
              </TableCell>
            </TableRow>))}
          </TableBody></Table></CardContent>
        </Card>
      )}
    </div>
  );
};
export default QualityFloorDashboard;
