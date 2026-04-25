import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useRealityClassifications } from "@/hooks/useRealityClassifications";
import { useMockReplacements } from "@/hooks/useMockReplacements";
import { Server, FileCheck, AlertTriangle, Database } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const CONTRACT_COLORS: Record<string, string> = { none: "text-destructive", partial: "text-yellow-400", aligned: "text-blue-400", verified: "text-emerald-400" };

export default function ContractBackendReadiness() {
  const { data: classifications = [] } = useRealityClassifications();
  const { data: replacements = [] } = useMockReplacements();

  const contractStats = useMemo(() => {
    const counts = { none: 0, partial: 0, aligned: 0, verified: 0 };
    classifications.forEach(c => counts[c.contract_status]++);
    return counts;
  }, [classifications]);

  const gapItems = useMemo(() =>
    classifications.filter(c => c.contract_status === "none" || c.contract_status === "partial")
      .sort((a, b) => (a.launch_impact === "blocking" ? -1 : 1) - (b.launch_impact === "blocking" ? -1 : 1)),
  [classifications]);

  const readyPct = classifications.length > 0
    ? Math.round(((contractStats.aligned + contractStats.verified) / classifications.length) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold">Contract & Backend Readiness</h1>
        <p className="text-sm text-muted-foreground">Backend target readiness for mock-backed pages — RCP08</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {(["none", "partial", "aligned", "verified"] as const).map(status => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${CONTRACT_COLORS[status]}`}>{contractStats[status]}</div>
              <div className="text-xs text-muted-foreground capitalize">{status}</div>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{readyPct}%</div>
            <Progress value={readyPct} className="mt-1" />
            <div className="text-xs text-muted-foreground">Overall readiness</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Contract Gaps</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Contract Status</TableHead>
                <TableHead>Backend Target</TableHead>
                <TableHead>Launch Impact</TableHead>
                <TableHead>Classification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gapItems.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No contract gaps — all features have aligned or verified contracts</TableCell></TableRow>}
              {gapItems.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.feature_name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.route_path}</TableCell>
                  <TableCell><Badge variant="outline" className={CONTRACT_COLORS[c.contract_status]}>{c.contract_status}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{c.backend_target || "—"}</TableCell>
                  <TableCell><Badge variant={c.launch_impact === "blocking" ? "destructive" : "outline"}>{c.launch_impact}</Badge></TableCell>
                  <TableCell className="capitalize">{c.classification}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
