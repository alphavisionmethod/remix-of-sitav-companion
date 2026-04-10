// ═══════════════════════════════════════════════════════════════
// ITC06 — Drift Radar (dedicated drift detection & classification)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useSpecRegistry, useDriftDetection } from "@/hooks/use-implementation-truth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radar, AlertTriangle, CheckCircle2, Shield, FileText, GitBranch, Route, Server, Activity } from "lucide-react";

const DRIFT_CATEGORIES = [
  { key: "all", label: "All", icon: Radar },
  { key: "spec_code", label: "Spec / Code", icon: FileText },
  { key: "contract_code", label: "Contract / Code", icon: Shield },
  { key: "route_manifest", label: "Route / Manifest", icon: Route },
  { key: "shell_component", label: "Shell / Component", icon: GitBranch },
  { key: "runtime_claim", label: "Runtime Claim", icon: Activity },
  { key: "docs_runtime", label: "Docs / Runtime", icon: Server },
] as const;

function categorizeDrift(issue: string): string {
  const lower = issue.toLowerCase();
  if (lower.includes("contract")) return "contract_code";
  if (lower.includes("route") || lower.includes("manifest")) return "route_manifest";
  if (lower.includes("shell")) return "shell_component";
  if (lower.includes("runtime") || lower.includes("evidence") || lower.includes("proven")) return "runtime_claim";
  if (lower.includes("doc") || lower.includes("description")) return "docs_runtime";
  return "spec_code";
}

function DriftHeatmap({ drifts }: { drifts: { severity: string; canonical_name: string; issue: string }[] }) {
  const catCounts = DRIFT_CATEGORIES.filter(c => c.key !== "all").map(cat => ({
    ...cat,
    count: drifts.filter(d => categorizeDrift(d.issue) === cat.key).length,
    high: drifts.filter(d => categorizeDrift(d.issue) === cat.key && d.severity === "high").length,
  }));
  const maxCount = Math.max(1, ...catCounts.map(c => c.count));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {catCounts.map(cat => {
        const intensity = cat.count / maxCount;
        return (
          <div
            key={cat.key}
            className="border border-border rounded-lg p-3 transition-colors"
            style={{ backgroundColor: cat.count > 0 ? `hsl(0 70% ${90 - intensity * 40}%)` : undefined }}
          >
            <div className="flex items-center gap-2 mb-1">
              <cat.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-foreground">{cat.label}</span>
            </div>
            <div className="text-xl font-bold text-foreground">{cat.count}</div>
            {cat.high > 0 && (
              <div className="text-[9px] text-destructive">{cat.high} high severity</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SeverityRail({ drifts }: { drifts: { severity: string }[] }) {
  const high = drifts.filter(d => d.severity === "high").length;
  const med = drifts.filter(d => d.severity === "medium").length;
  const low = drifts.filter(d => d.severity === "low").length;
  const total = high + med + low || 1;

  return (
    <div className="flex items-center gap-2 h-4 w-full">
      {high > 0 && (
        <div className="bg-destructive h-full rounded-sm" style={{ width: `${(high / total) * 100}%` }} title={`${high} high`} />
      )}
      {med > 0 && (
        <div className="bg-yellow-500 h-full rounded-sm" style={{ width: `${(med / total) * 100}%` }} title={`${med} medium`} />
      )}
      {low > 0 && (
        <div className="bg-muted h-full rounded-sm" style={{ width: `${(low / total) * 100}%` }} title={`${low} low`} />
      )}
      {total === 1 && high === 0 && med === 0 && low === 0 && (
        <div className="bg-green-500/20 h-full rounded-sm w-full" />
      )}
    </div>
  );
}

function ResolutionHints() {
  const hints = [
    { title: "Spec / Code Drift", remedy: "Update the spec registry entry to reflect actual implementation, or implement missing artifacts." },
    { title: "Contract / Code Drift", remedy: "Verify contracts are defined in both frontend and backend. Remove shadow duplicates." },
    { title: "Route / Manifest Drift", remedy: "Ensure route-manifest.json matches actual routes in App.tsx. Add missing route entries." },
    { title: "Shell / Component Drift", remedy: "Verify required shells wrap the correct routes. Check component composition rules." },
    { title: "Runtime Claim Drift", remedy: "Collect runtime evidence: route renders, data loads, mutations persist. Update runtime_score." },
    { title: "Docs / Runtime Drift", remedy: "Align documentation claims with actual readiness scores. Update docs_score after verification." },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />Drift Resolution Workflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hints.map(h => (
            <div key={h.title} className="flex items-start gap-3">
              <Badge variant="outline" className="text-[8px] shrink-0 mt-0.5">{h.title}</Badge>
              <span className="text-[10px] text-muted-foreground">{h.remedy}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ITC06DriftRadar() {
  const { data: specs } = useSpecRegistry();
  const { drifts, driftCount } = useDriftDetection(specs);
  const [catFilter, setCatFilter] = useState("all");

  const filteredDrifts = catFilter === "all" ? drifts : drifts.filter(d => categorizeDrift(d.issue) === catFilter);

  const driftedSpecs = (specs || []).filter(s => s.drift_state === "drifted").length;
  const alignedSpecs = (specs || []).filter(s => s.drift_state === "aligned").length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Radar className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Drift Radar</h1>
          <Badge variant="outline" className="text-[8px]">ITC-06</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Detect and classify spec-to-implementation drift across all categories</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{driftCount}</div><div className="text-[10px] text-muted-foreground">Total Drifts</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-destructive">{drifts.filter(d => d.severity === "high").length}</div><div className="text-[10px] text-muted-foreground">High</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-yellow-500">{drifts.filter(d => d.severity === "medium").length}</div><div className="text-[10px] text-muted-foreground">Medium</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-destructive">{driftedSpecs}</div><div className="text-[10px] text-muted-foreground">Drifted Specs</div></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-green-500">{alignedSpecs}</div><div className="text-[10px] text-muted-foreground">Aligned Specs</div></CardContent></Card>
      </div>

      {/* Severity Rail */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Severity Distribution</CardTitle></CardHeader>
        <CardContent><SeverityRail drifts={drifts} /></CardContent>
      </Card>

      {/* Drift Heatmap */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Radar className="h-4 w-4" />Drift Heatmap by Category</CardTitle></CardHeader>
        <CardContent><DriftHeatmap drifts={drifts} /></CardContent>
      </Card>

      {/* Category Tabs + Drift Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Active Drift Alerts ({filteredDrifts.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Tabs value={catFilter} onValueChange={setCatFilter}>
            <div className="px-4 pt-2">
              <TabsList className="w-full flex-wrap h-auto gap-1">
                {DRIFT_CATEGORIES.map(c => (
                  <TabsTrigger key={c.key} value={c.key} className="text-[9px] px-2 py-1">{c.label}</TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsContent value={catFilter} className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Severity</TableHead>
                    <TableHead className="text-[10px]">Category</TableHead>
                    <TableHead className="text-[10px]">System</TableHead>
                    <TableHead className="text-[10px]">Drift Issue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2 text-green-500 text-[11px]">
                          <CheckCircle2 className="h-4 w-4" /> No drift in this category
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredDrifts.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Badge variant={d.severity === "high" ? "destructive" : d.severity === "medium" ? "secondary" : "outline"} className="text-[8px]">{d.severity}</Badge>
                      </TableCell>
                      <TableCell className="text-[9px] text-muted-foreground">{categorizeDrift(d.issue).replace("_", " / ")}</TableCell>
                      <TableCell className="text-[11px] font-medium">{d.canonical_name}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[300px] truncate">{d.issue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resolution Workflow */}
      <ResolutionHints />
    </div>
  );
}
