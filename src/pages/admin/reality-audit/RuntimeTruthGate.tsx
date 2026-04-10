import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { computeRuntimeTruthGate, getRuntimeTruthSummary } from "@/lib/reality-audit/reality-audit-registry";

const gateColors: Record<string, string> = {
  pass: "text-emerald-400 bg-emerald-500/10",
  partial: "text-amber-400 bg-amber-500/10",
  fail: "text-red-400 bg-red-500/10",
};

const RuntimeTruthGate = () => {
  const gates = useMemo(() => computeRuntimeTruthGate(), []);
  const summary = getRuntimeTruthSummary();

  const Indicator = ({ ok }: { ok: boolean }) => ok
    ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
    : <XCircle className="h-3.5 w-3.5 text-red-400" />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><ShieldCheck className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Runtime Truth Gate</h1>
          <p className="text-sm text-muted-foreground">A feature is not "working" unless it passes all 5 truth checks</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Checked", value: summary.total, color: "text-blue-400" },
          { label: "Passing", value: summary.passing, color: summary.passing > 0 ? "text-emerald-400" : "text-muted-foreground" },
          { label: "Partial", value: summary.partial, color: "text-amber-400" },
          { label: "Failing", value: summary.failing, color: summary.failing > 0 ? "text-red-400" : "text-emerald-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Truth checks explanation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">5 Truth Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {["Real data loads", "Real mutation persists", "Runtime evidence exists", "Critical interaction works", "No mock backing"].map(check => (
              <div key={check} className="p-2 rounded bg-muted/30 text-center text-xs font-medium">{check}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gate table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead className="w-20">Gate</TableHead>
                  <TableHead className="w-16">Data</TableHead>
                  <TableHead className="w-16">Mutate</TableHead>
                  <TableHead className="w-16">Evidence</TableHead>
                  <TableHead className="w-16">Interact</TableHead>
                  <TableHead className="w-16">No Mock</TableHead>
                  <TableHead>Fail Reasons</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gates.map(g => (
                  <TableRow key={g.id} className={g.gateStatus === "fail" ? "bg-red-500/5" : g.gateStatus === "pass" ? "bg-emerald-500/5" : ""}>
                    <TableCell className="font-medium text-sm">{g.featureName}</TableCell>
                    <TableCell><span className={`text-[10px] px-2 py-0.5 rounded font-bold ${gateColors[g.gateStatus]}`}>{g.gateStatus.toUpperCase()}</span></TableCell>
                    <TableCell><Indicator ok={g.realDataLoads} /></TableCell>
                    <TableCell><Indicator ok={g.realMutationPersists} /></TableCell>
                    <TableCell><Indicator ok={g.runtimeEvidenceExists} /></TableCell>
                    <TableCell><Indicator ok={g.criticalInteractionWorks} /></TableCell>
                    <TableCell><Indicator ok={g.noMockBackingForLaunch} /></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {g.failReasons.slice(0, 3).map(r => <Badge key={r} variant="outline" className="text-[9px] text-red-400">{r}</Badge>)}
                        {g.failReasons.length > 3 && <Badge variant="secondary" className="text-[9px]">+{g.failReasons.length - 3}</Badge>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Failing features alert */}
      {summary.failing > 0 && (
        <Card className="border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> Features Failing Truth Gate ({summary.failing})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gates.filter(g => g.gateStatus === "fail").map(g => (
                <div key={g.id} className="p-2 rounded bg-red-500/10 border border-red-500/20 text-sm">
                  <div className="font-medium">{g.featureName}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{g.failReasons.join(" · ")}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RuntimeTruthGate;
