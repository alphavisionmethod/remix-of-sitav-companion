import RCPSubNav from "@/platform/admin/components/admin/RCPSubNav";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle, Activity } from "lucide-react";
import {
  computeRuntimeTruthGate, getRuntimeTruthSummary,
  POST_MIGRATION_VALIDATIONS
} from "@/runtimes/reality/reality-audit-registry";

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
      <RCPSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><ShieldCheck className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Runtime Reality Validation Center</h1>
          <p className="text-sm text-muted-foreground">Validate that features are truly real — 5 truth checks + post-migration verification</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Total Checked", value: summary.total, color: "text-blue-400" },
          { label: "Passing", value: summary.passing, color: summary.passing > 0 ? "text-emerald-400" : "text-muted-foreground" },
          { label: "Partial", value: summary.partial, color: "text-amber-400" },
          { label: "Failing", value: summary.failing, color: summary.failing > 0 ? "text-red-400" : "text-emerald-400" },
        ]).map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Truth checks explanation */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">5 Truth Checks</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {["Real data loads", "Real mutation persists", "Runtime evidence exists", "Critical interaction works", "No mock backing"].map(check => (
              <div key={check} className="p-2 rounded bg-muted/30 text-center text-xs font-medium">{check}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* RuntimeRealityMatrix */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead className="w-20">Gate</TableHead>
                  <TableHead className="w-14">Data</TableHead>
                  <TableHead className="w-14">Mutate</TableHead>
                  <TableHead className="w-14">Evidence</TableHead>
                  <TableHead className="w-14">Interact</TableHead>
                  <TableHead className="w-14">No Mock</TableHead>
                  <TableHead className="w-14">Verified</TableHead>
                  <TableHead className="w-14">Drift</TableHead>
                  <TableHead className="w-16">Conf</TableHead>
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
                    <TableCell><Indicator ok={g.postMigrationVerified} /></TableCell>
                    <TableCell>{g.driftDetected ? <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> : <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}</TableCell>
                    <TableCell><span className={`text-xs font-mono ${g.rolloutConfidence >= 80 ? "text-emerald-400" : g.rolloutConfidence >= 40 ? "text-amber-400" : "text-red-400"}`}>{g.rolloutConfidence}%</span></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {g.failReasons.slice(0, 2).map(r => <Badge key={r} variant="outline" className="text-[9px] text-red-400">{r}</Badge>)}
                        {g.failReasons.length > 2 && <Badge variant="secondary" className="text-[9px]">+{g.failReasons.length - 2}</Badge>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* PostMigrationVerificationFeed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-400" /> Post-Migration Verification Feed</CardTitle>
        </CardHeader>
        <CardContent>
          {POST_MIGRATION_VALIDATIONS.length > 0 ? (
            <div className="space-y-3">
              {POST_MIGRATION_VALIDATIONS.map(v => (
                <div key={v.id} className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{v.featureName}</span>
                    <span className="text-[10px] text-muted-foreground">{v.validatedAt} by {v.validatedBy}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {([
                      { label: "Data Loads", ok: v.dataLoadsFromReal },
                      { label: "Mutation Persists", ok: v.mutationPersists },
                      { label: "Interaction OK", ok: v.interactionSucceeds },
                      { label: "Proof Behavior", ok: v.proofBehaviorWorks },
                      { label: "No Drift", ok: v.noDriftDetected },
                    ]).map(check => (
                      <div key={check.label} className={`flex items-center gap-1 text-[10px] p-1.5 rounded ${check.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {check.ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} {check.label}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">{v.notes}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No post-migration validations yet.</p>
          )}
        </CardContent>
      </Card>

      {/* MutationPersistenceCards */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Mutation Persistence Status</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {gates.map(g => (
              <div key={g.id} className={`p-2 rounded border text-xs ${g.realMutationPersists ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                <div className="flex items-center gap-1.5">
                  {g.realMutationPersists ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                  <span className="font-medium">{g.featureName}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{g.mutationPersistenceDetail}</p>
              </div>
            ))}
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
