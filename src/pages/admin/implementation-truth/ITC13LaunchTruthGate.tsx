// ═══════════════════════════════════════════════════════════════
// ITC13 — Launch Truth Gate View
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useSpecRegistry, type SpecRegistryEntry } from "@/hooks/use-implementation-truth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Target, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Rocket, FileText, Activity, Shield } from "lucide-react";

interface LaunchBlocker {
  spec: SpecRegistryEntry;
  reason: string;
  category: "readiness" | "runtime" | "contract" | "proof" | "docs";
  severity: "critical" | "high" | "medium";
}

function uselaunchBlockers(specs: SpecRegistryEntry[]): LaunchBlocker[] {
  return useMemo(() => {
    const blockers: LaunchBlocker[] = [];
    specs.forEach(spec => {
      if ((spec.overall_readiness || 0) < 50) {
        blockers.push({ spec, reason: `Readiness at ${spec.overall_readiness}% (need ≥50%)`, category: "readiness", severity: "critical" });
      }
      if ((spec.runtime_score || 0) === 0 && (spec.required_proofs?.length || 0) + (spec.required_events?.length || 0) > 0) {
        blockers.push({ spec, reason: "No runtime evidence collected", category: "runtime", severity: "critical" });
      }
      if ((spec.contract_score || 0) < 30 && spec.required_contracts.length > 0) {
        blockers.push({ spec, reason: `Contract score at ${spec.contract_score || 0}%`, category: "contract", severity: "high" });
      }
      if ((spec.proof_score || 0) === 0 && (spec.required_proofs?.length || 0) > 0) {
        blockers.push({ spec, reason: "Proof/trust edges missing", category: "proof", severity: "high" });
      }
      if ((spec.docs_score || 0) < 20 && (spec.required_docs?.length || 0) > 0) {
        blockers.push({ spec, reason: `Docs score at ${spec.docs_score || 0}%`, category: "docs", severity: "medium" });
      }
    });
    return blockers.sort((a, b) => {
      const sev = { critical: 0, high: 1, medium: 2 };
      return sev[a.severity] - sev[b.severity];
    });
  }, [specs]);
}

function PromotionBadge({ spec }: { spec: SpecRegistryEntry }) {
  const ready = (spec.overall_readiness || 0);
  if (ready >= 80 && (spec.runtime_score || 0) > 0) {
    return <Badge className="text-[7px] bg-green-500/20 text-green-500 border-green-500/30">Launch Eligible</Badge>;
  }
  if (ready >= 60) {
    return <Badge variant="secondary" className="text-[7px] text-yellow-500">Beta Eligible</Badge>;
  }
  if (ready >= 30) {
    return <Badge variant="outline" className="text-[7px] text-orange-500">Canary Only</Badge>;
  }
  return <Badge variant="destructive" className="text-[7px]">Not Promotable</Badge>;
}

function RingImpactPanel({ specs }: { specs: SpecRegistryEntry[] }) {
  const byDomain = new Map<string, { total: number; blocking: number }>();
  specs.forEach(s => {
    const d = s.owning_module || "Unassigned";
    const entry = byDomain.get(d) || { total: 0, blocking: 0 };
    entry.total++;
    if ((s.overall_readiness || 0) < 50) entry.blocking++;
    byDomain.set(d, entry);
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {Array.from(byDomain.entries()).map(([domain, data]) => (
        <div key={domain} className="border border-border rounded-lg p-3">
          <div className="text-[10px] font-medium text-foreground truncate">{domain}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`text-lg font-bold ${data.blocking > 0 ? "text-destructive" : "text-green-500"}`}>{data.blocking}</div>
            <span className="text-[9px] text-muted-foreground">of {data.total} blocking</span>
          </div>
          <Progress value={data.total > 0 ? ((data.total - data.blocking) / data.total) * 100 : 100} className="h-1.5 mt-1" />
        </div>
      ))}
    </div>
  );
}

export default function ITC13LaunchTruthGate() {
  const { data: specs } = useSpecRegistry();
  const allSpecs = specs || [];
  const blockers = uselaunchBlockers(allSpecs);

  const launchEligible = allSpecs.filter(s => (s.overall_readiness || 0) >= 80 && (s.runtime_score || 0) > 0).length;
  const criticalBlockers = blockers.filter(b => b.severity === "critical").length;
  const verdict = criticalBlockers === 0 && allSpecs.length > 0 ? "GO" : "NO-GO";

  const catIcons = { readiness: Target, runtime: Activity, contract: Shield, proof: FileText, docs: FileText };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Rocket className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Launch Truth Gate</h1>
          <Badge variant="outline" className="text-[8px]">ITC-13</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Implementation truth as a launch blocker source — honest go/no-go readiness</p>
      </div>

      {/* Verdict Banner */}
      <Card className={verdict === "GO" ? "border-green-500/50 bg-green-500/5" : "border-destructive/50 bg-destructive/5"}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {verdict === "GO" ? <CheckCircle2 className="h-8 w-8 text-green-500" /> : <XCircle className="h-8 w-8 text-destructive" />}
              <div>
                <div className="text-lg font-bold text-foreground">Launch Verdict: {verdict}</div>
                <div className="text-[11px] text-muted-foreground">
                  {verdict === "GO" ? `All critical blockers resolved. ${launchEligible} features launch-eligible.` : `${criticalBlockers} critical blockers remaining. ${blockers.length} total issues.`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{launchEligible}</div>
              <div className="text-[10px] text-muted-foreground">of {allSpecs.length} eligible</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Critical", value: criticalBlockers, cls: "text-destructive" },
          { label: "High", value: blockers.filter(b => b.severity === "high").length, cls: "text-orange-500" },
          { label: "Medium", value: blockers.filter(b => b.severity === "medium").length, cls: "text-yellow-500" },
          { label: "Eligible", value: launchEligible, cls: "text-green-500" },
          { label: "Total Specs", value: allSpecs.length, cls: "" },
        ].map(m => (
          <Card key={m.label}><CardContent className="pt-4 text-center"><div className={`text-2xl font-bold ${m.cls}`}>{m.value}</div><div className="text-[10px] text-muted-foreground">{m.label}</div></CardContent></Card>
        ))}
      </div>

      {/* Promotion Eligibility */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Rocket className="h-4 w-4" />Promotion Eligibility</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allSpecs.map(s => (
              <div key={s.spec_id} className="flex items-center gap-1.5 border border-border rounded px-2 py-1">
                <span className="text-[9px] text-foreground">{s.canonical_name}</span>
                <PromotionBadge spec={s} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ring Impact */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" />Ring Impact by Domain</CardTitle></CardHeader>
        <CardContent><RingImpactPanel specs={allSpecs} /></CardContent>
      </Card>

      {/* Critical Truth Gap List */}
      {blockers.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-destructive" />Launch Blockers ({blockers.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Severity</TableHead>
                  <TableHead className="text-[10px]">Category</TableHead>
                  <TableHead className="text-[10px]">Feature</TableHead>
                  <TableHead className="text-[10px]">Blocker</TableHead>
                  <TableHead className="text-[10px]">Readiness</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockers.map((b, i) => {
                  const CatIcon = catIcons[b.category];
                  return (
                    <TableRow key={i}>
                      <TableCell><Badge variant={b.severity === "critical" ? "destructive" : b.severity === "high" ? "secondary" : "outline"} className="text-[8px]">{b.severity}</Badge></TableCell>
                      <TableCell><div className="flex items-center gap-1"><CatIcon className="h-3 w-3 text-muted-foreground" /><span className="text-[9px]">{b.category}</span></div></TableCell>
                      <TableCell className="text-[11px] font-medium">{b.spec.canonical_name}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[250px]">{b.reason}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Progress value={b.spec.overall_readiness || 0} className="w-12 h-1.5" />
                          <span className="text-[9px]">{b.spec.overall_readiness}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
