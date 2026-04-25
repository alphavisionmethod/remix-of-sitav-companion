import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertOctagon, KeyRound, Gauge, ServerCrash, DollarSign, FileWarning, Ban } from "lucide-react";
import { getDegradedDiagnostics, type DegradedDiagnostic } from "@/lib/core-services/ai-gateway/diagnostics.service";
import AIGSubNav from "@/platform/admin/components/admin/AIGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const CATEGORY_META: Record<DegradedDiagnostic["category"], { label: string; icon: React.ReactNode; color: string }> = {
  missing_key: { label: "Missing Key", icon: <KeyRound className="h-3.5 w-3.5" />, color: "text-destructive" },
  rate_limited: { label: "Rate Limited", icon: <Gauge className="h-3.5 w-3.5" />, color: "text-amber-400" },
  provider_failure: { label: "Provider Failure", icon: <ServerCrash className="h-3.5 w-3.5" />, color: "text-destructive" },
  provider_degraded: { label: "Provider Degraded", icon: <ServerCrash className="h-3.5 w-3.5" />, color: "text-amber-400" },
  budget_fallback: { label: "Budget Fallback", icon: <DollarSign className="h-3.5 w-3.5" />, color: "text-amber-400" },
  invalid_structured: { label: "Invalid Structured", icon: <FileWarning className="h-3.5 w-3.5" />, color: "text-orange-400" },
  unavailable_capability: { label: "Unavailable", icon: <Ban className="h-3.5 w-3.5" />, color: "text-muted-foreground" },
};

const SEVERITY_VARIANT: Record<string, string> = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

export default function AIG08DegradedDiagnostics() {
  const { data: diagnostics = [], isLoading } = useQuery({
    queryKey: ["ai-degraded-diagnostics"],
    queryFn: getDegradedDiagnostics,
  });

  const byCat = diagnostics.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const criticalCount = diagnostics.filter(d => d.severity === "critical").length;
  const highCount = diagnostics.filter(d => d.severity === "high").length;

  return (
    <div className="space-y-6 p-6">
<AIGSubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertOctagon className="h-6 w-6" /> AIG08 — Degraded State Diagnostics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Missing keys, rate limits, provider failures, budget fallbacks, invalid outputs, unavailable capabilities
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">Total Issues</p>
            <p className="text-xl font-bold">{diagnostics.length}</p>
          </CardContent>
        </Card>
        <Card className={`bg-card ${criticalCount > 0 ? "border-destructive/50" : "border-border"}`}>
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-destructive">Critical</p>
            <p className="text-xl font-bold">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-amber-400">High</p>
            <p className="text-xl font-bold">{highCount}</p>
          </CardContent>
        </Card>
        {Object.entries(CATEGORY_META).map(([cat, meta]) => (
          <Card key={cat} className="bg-card border-border">
            <CardContent className="pt-3 pb-3">
              <div className={`flex items-center gap-1 text-xs ${meta.color}`}>
                {meta.icon}
                <span>{meta.label}</span>
              </div>
              <p className="text-xl font-bold mt-1">{byCat[cat] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diagnostics Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>All Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-4">Loading diagnostics…</p>
          ) : diagnostics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Capability</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnostics.map(d => {
                  const meta = CATEGORY_META[d.category];
                  return (
                    <TableRow key={d.id}>
                      <TableCell>
                        <Badge variant={SEVERITY_VARIANT[d.severity] as never} className="text-xs capitalize">
                          {d.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 text-xs ${meta.color}`}>
                          {meta.icon}
                          <span>{meta.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium max-w-[250px]">{d.title}</TableCell>
                      <TableCell className="font-mono text-xs">{d.provider ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{d.capability ?? "—"}</TableCell>
                      <TableCell className="text-xs max-w-[300px] truncate">{d.description}</TableCell>
                      <TableCell className="text-xs">{new Date(d.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <AlertOctagon className="h-12 w-12 mx-auto text-emerald-400 mb-3" />
              <p className="text-lg font-medium text-emerald-400">All Clear</p>
              <p className="text-sm text-muted-foreground mt-1">No degraded states detected. All AI systems operational.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
