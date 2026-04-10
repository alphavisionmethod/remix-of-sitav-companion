// ═══════════════════════════════════════════════════════════════
// ITC12 — Validation Pipeline Monitor
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { useSpecRegistry, useDriftDetection } from "@/hooks/use-implementation-truth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Clock, FileText, Shield, Route, Cpu } from "lucide-react";

interface PipelineCheck {
  name: string;
  icon: typeof Activity;
  status: "pass" | "fail" | "warn" | "unknown";
  detail: string;
  passCount: number;
  failCount: number;
  total: number;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "fail") return <XCircle className="h-4 w-4 text-destructive" />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
}

function PipelineCheckCard({ check }: { check: PipelineCheck }) {
  const pct = check.total > 0 ? Math.round((check.passCount / check.total) * 100) : 0;
  return (
    <Card className={check.status === "fail" ? "border-destructive/40" : check.status === "warn" ? "border-yellow-500/40" : ""}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          <StatusIcon status={check.status} />
          <check.icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-foreground">{check.name}</span>
          <Badge variant={check.status === "pass" ? "outline" : check.status === "fail" ? "destructive" : "secondary"} className="text-[8px] ml-auto">
            {check.status.toUpperCase()}
          </Badge>
        </div>
        <div className="text-[10px] text-muted-foreground mb-2">{check.detail}</div>
        {check.total > 0 && (
          <div className="flex items-center gap-2">
            <Progress value={pct} className="flex-1 h-1.5" />
            <span className="text-[9px] text-muted-foreground">{check.passCount}/{check.total} ({pct}%)</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ITC12ValidationPipeline() {
  const { data: specs } = useSpecRegistry();
  const { drifts } = useDriftDetection(specs);
  const allSpecs = specs || [];
  const [archReport, setArchReport] = useState<{ rules?: { status: string }[] } | null>(null);

  useEffect(() => {
    fetch("/generated/architecture-compliance-report.json")
      .then(r => r.ok ? r.json() : null)
      .then(setArchReport)
      .catch(() => setArchReport(null));
  }, []);

  const checks = useMemo<PipelineCheck[]>(() => {
    const specCheck: PipelineCheck = {
      name: "Spec Registry Completeness",
      icon: FileText,
      status: allSpecs.length >= 20 ? "pass" : allSpecs.length >= 10 ? "warn" : "fail",
      detail: `${allSpecs.length} specs registered. Expected ~27 canonical specs.`,
      passCount: allSpecs.filter(s => (s.overall_readiness || 0) >= 50).length,
      failCount: allSpecs.filter(s => (s.overall_readiness || 0) < 50).length,
      total: allSpecs.length,
    };

    const contractSpecs = allSpecs.filter(s => s.required_contracts.length > 0);
    const contractPass = contractSpecs.filter(s => (s.contract_score || 0) >= 50).length;
    const contractCheck: PipelineCheck = {
      name: "Contract Validation",
      icon: Shield,
      status: contractSpecs.length === 0 ? "unknown" : contractPass >= contractSpecs.length * 0.7 ? "pass" : contractPass >= contractSpecs.length * 0.4 ? "warn" : "fail",
      detail: `${contractPass} of ${contractSpecs.length} specs with contracts scored ≥50%.`,
      passCount: contractPass,
      failCount: contractSpecs.length - contractPass,
      total: contractSpecs.length,
    };

    const routeSpecs = allSpecs.filter(s => s.required_routes.length > 0);
    const routePass = routeSpecs.filter(s => (s.ui_score || 0) >= 50).length;
    const routeCheck: PipelineCheck = {
      name: "Route Inventory Validation",
      icon: Route,
      status: routeSpecs.length === 0 ? "unknown" : routePass >= routeSpecs.length * 0.7 ? "pass" : routePass >= routeSpecs.length * 0.4 ? "warn" : "fail",
      detail: `${routePass} of ${routeSpecs.length} specs with routes scored ≥50%.`,
      passCount: routePass,
      failCount: routeSpecs.length - routePass,
      total: routeSpecs.length,
    };

    const runtimePass = allSpecs.filter(s => (s.runtime_score || 0) > 0).length;
    const runtimeCheck: PipelineCheck = {
      name: "Runtime Probe Validation",
      icon: Activity,
      status: allSpecs.length === 0 ? "unknown" : runtimePass >= allSpecs.length * 0.5 ? "pass" : runtimePass >= allSpecs.length * 0.2 ? "warn" : "fail",
      detail: `${runtimePass} of ${allSpecs.length} specs have runtime evidence.`,
      passCount: runtimePass,
      failCount: allSpecs.length - runtimePass,
      total: allSpecs.length,
    };

    const archRules = archReport?.rules || [];
    const archPassed = archRules.filter((r: { status: string }) => r.status === "pass").length;
    const archCheck: PipelineCheck = {
      name: "Architecture Compliance",
      icon: Cpu,
      status: archRules.length === 0 ? "unknown" : archPassed >= archRules.length * 0.8 ? "pass" : archPassed >= archRules.length * 0.5 ? "warn" : "fail",
      detail: archRules.length > 0 ? `${archPassed} of ${archRules.length} rules pass.` : "No compliance report found — run architecture check.",
      passCount: archPassed,
      failCount: archRules.length - archPassed,
      total: archRules.length,
    };

    const driftCheck: PipelineCheck = {
      name: "Drift Detection",
      icon: AlertTriangle,
      status: drifts.length === 0 ? "pass" : drifts.filter(d => d.severity === "high").length > 0 ? "fail" : "warn",
      detail: `${drifts.length} drift issues detected (${drifts.filter(d => d.severity === "high").length} high severity).`,
      passCount: allSpecs.length - drifts.length,
      failCount: drifts.length,
      total: allSpecs.length,
    };

    return [specCheck, contractCheck, routeCheck, runtimeCheck, archCheck, driftCheck];
  }, [allSpecs, archReport, drifts]);

  const overallPassed = checks.filter(c => c.status === "pass").length;
  const overallStatus = checks.some(c => c.status === "fail") ? "FAILING" : checks.some(c => c.status === "warn") ? "WARNING" : checks.some(c => c.status === "unknown") ? "PARTIAL" : "PASSING";

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Validation Pipeline Monitor</h1>
          <Badge variant="outline" className="text-[8px]">ITC-12</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Static and runtime validation pipeline results across spec, contract, route, and runtime layers</p>
      </div>

      {/* Pipeline Status Banner */}
      <Card className={overallStatus === "FAILING" ? "border-destructive/50 bg-destructive/5" : overallStatus === "WARNING" ? "border-yellow-500/50 bg-yellow-500/5" : "border-green-500/50 bg-green-500/5"}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Pipeline Status</div>
              <div className="text-[11px] text-muted-foreground">{overallPassed} of {checks.length} checks passing</div>
            </div>
            <Badge variant={overallStatus === "FAILING" ? "destructive" : overallStatus === "WARNING" ? "secondary" : "outline"} className="text-xs">
              {overallStatus}
            </Badge>
          </div>
          <Progress value={(overallPassed / checks.length) * 100} className="h-2 mt-3" />
        </CardContent>
      </Card>

      {/* Individual Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map(c => <PipelineCheckCard key={c.name} check={c} />)}
      </div>

      {/* Failing Checks Detail */}
      {checks.some(c => c.status === "fail" || c.status === "warn") && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Failing & Warning Checks</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Status</TableHead>
                  <TableHead className="text-[10px]">Check</TableHead>
                  <TableHead className="text-[10px]">Pass Rate</TableHead>
                  <TableHead className="text-[10px]">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checks.filter(c => c.status === "fail" || c.status === "warn").map(c => (
                  <TableRow key={c.name}>
                    <TableCell><StatusIcon status={c.status} /></TableCell>
                    <TableCell className="text-[11px] font-medium">{c.name}</TableCell>
                    <TableCell className="text-[11px]">{c.total > 0 ? `${Math.round((c.passCount / c.total) * 100)}%` : "N/A"}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground max-w-[300px]">{c.detail}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Re-run Instructions */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Re-run Instructions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-[11px] text-muted-foreground font-mono bg-muted/30 p-3 rounded-md">
            <div># Regenerate architecture compliance report</div>
            <div className="text-foreground">npx ts-node scripts/check-architecture-compliance.ts</div>
            <div className="mt-2"># Regenerate route manifest</div>
            <div className="text-foreground">npx ts-node scripts/generate-route-manifest.ts</div>
            <div className="mt-2"># Seed canonical specs (from ITC02)</div>
            <div className="text-foreground">Navigate to ITC02 → Click "Seed Canonical Specs"</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
