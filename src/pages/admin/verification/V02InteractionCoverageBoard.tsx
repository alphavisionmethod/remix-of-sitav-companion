// ═══════════════════════════════════════════════════════
// SITA OS — V02: Interaction Coverage Board
// Shows verified vs unverified actions
// ═══════════════════════════════════════════════════════

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useVerificationSurfaces } from "@/lib/verification/verification-hooks";
import { SURFACE_REGISTRY, getVerificationStats } from "@/lib/verification/surface-registry";
import { CheckCircle2, XCircle, MinusCircle, BarChart3 } from "lucide-react";

export default function InteractionCoverageBoard() {
  const { data: dbSurfaces } = useVerificationSurfaces();
  const surfaces = dbSurfaces && dbSurfaces.length > 0 ? dbSurfaces : [];
  const stats = getVerificationStats();

  const passed = surfaces.filter((s: any) => s.verification_status === "pass").length;
  const failed = surfaces.filter((s: any) => s.verification_status === "fail").length;
  const untested = Math.max(0, stats.total - passed - failed);
  const coverage = stats.total > 0 ? Math.round((passed / stats.total) * 100) : 0;

  // Group by domain
  const domains = [...new Set(SURFACE_REGISTRY.map((s) => s.domain))];
  const domainCoverage = domains.map((d) => {
    const domainSurfaces = SURFACE_REGISTRY.filter((s) => s.domain === d);
    const dbDomain = surfaces.filter((s: any) => s.domain === d);
    const domainPassed = dbDomain.filter((s: any) => s.verification_status === "pass").length;
    return { domain: d, total: domainSurfaces.length, passed: domainPassed, pct: domainSurfaces.length > 0 ? Math.round((domainPassed / domainSurfaces.length) * 100) : 0 };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6 p-6" data-testid="verification-coverage-board">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          V02 — Interaction Coverage Board
        </h1>
        <p className="text-muted-foreground mt-1">Verified vs unverified interactions</p>
      </div>

      {/* Overall Coverage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-primary">{coverage}%</div><div className="text-xs text-muted-foreground">Overall Coverage</div><Progress value={coverage} className="mt-2" /></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-green-500" /><div><div className="text-2xl font-bold text-green-500">{passed}</div><div className="text-xs text-muted-foreground">Passed</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><XCircle className="h-8 w-8 text-destructive" /><div><div className="text-2xl font-bold text-destructive">{failed}</div><div className="text-xs text-muted-foreground">Failed</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><MinusCircle className="h-8 w-8 text-muted-foreground" /><div><div className="text-2xl font-bold">{untested}</div><div className="text-xs text-muted-foreground">Untested</div></div></CardContent></Card>
      </div>

      {/* Domain Breakdown */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-lg">Coverage by Domain</h3>
          {domainCoverage.map((d) => (
            <div key={d.domain} className="flex items-center gap-3">
              <div className="w-40 text-sm font-mono">{d.domain}</div>
              <Progress value={d.pct} className="flex-1" />
              <div className="w-20 text-right text-sm">
                <Badge variant={d.pct === 100 ? "default" : d.pct > 0 ? "outline" : "secondary"}>{d.pct}%</Badge>
              </div>
              <div className="w-16 text-right text-xs text-muted-foreground">{d.passed}/{d.total}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
