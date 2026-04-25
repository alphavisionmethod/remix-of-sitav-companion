import { useAction } from "@/hooks/use-action";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Radar, RefreshCw, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const sevColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400", high: "bg-orange-500/20 text-orange-400",
  medium: "bg-yellow-500/20 text-yellow-400", low: "bg-muted text-muted-foreground",
};

const heatCell = (status: string) => {
  if (status === "production" || status === "active") return "bg-green-500/30";
  if (status === "beta") return "bg-cyan-500/20";
  if (status === "planned") return "bg-yellow-500/15";
  return "bg-muted/20";
};

export default function MSA05CompatibilityRadar() {
  const queryClient = useQueryClient();

  const { data: consistency = [] } = useQuery({
    queryKey: ["cross-surface-consistency"],
    queryFn: async () => { const { data } = await fromTable("cross_surface_consistency_records").select("*").order("created_at", { ascending: false }).limit(50); return data || []; },
  });

  const { data: boundaries = [] } = useQuery({
    queryKey: ["architecture-boundaries"],
    queryFn: async () => { const { data } = await fromTable("architecture_boundary_records").select("*").eq("is_boundary_violation", true); return data || []; },
  });

  const { data: surfaces = [] } = useQuery({
    queryKey: ["surface-types"],
    queryFn: async () => { const { data } = await fromTable("surface_types").select("*").order("created_at"); return data || []; },
  });

  const { data: bindings = [] } = useQuery({
    queryKey: ["capability-bindings"],
    queryFn: async () => { const { data } = await fromTable("capability_surface_bindings").select("*, capability_definitions(domain, capability_key)"); return data || []; },
  });

  const checkMutation = useAction("admin", "compatibility.check");

  const consistent = consistency.filter((c: Record<string, any>) => c.consistent);
  const drifts = consistency.filter((c: Record<string, any>) => !c.consistent);

  // Build heatmap: domains vs surfaces
  const domains = [...new Set(bindings.map((b: Record<string, any>) => b.capability_definitions?.domain).filter(Boolean))];
  const heatmapData = domains.map(domain => {
    const row: Record<string, any> = { domain };
    surfaces.forEach((s: Record<string, any>) => {
      const domainBindings = bindings.filter((b: Record<string, any>) => b.capability_definitions?.domain === domain && b.surface_id === s.id);
      const prodCount = domainBindings.filter((b: Record<string, any>) => b.binding_status === "production").length;
      const total = domainBindings.length;
      row[s.surface_key] = { total, production: prodCount, status: prodCount > 0 ? "production" : total > 0 ? "planned" : "none" };
    });
    return row;
  });

  // Migration recommendations
  const recommendations = boundaries
    .filter((b: Record<string, any>) => b.migration_target)
    .sort((a: any,  b: Record<string, any>) => {
      const priority: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priority[a.migration_priority] || 3) - (priority[b.migration_priority] || 3);
    })
    .slice(0, 10);

  return (
    <div className="space-y-6 p-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Radar className="h-6 w-6" /> Future Surface Compatibility Radar</h1>
          <p className="text-sm text-muted-foreground mt-1">Detect web-trapped logic, cross-surface drift, and portability blockers</p>
        </div>
        <Button onClick={() => checkMutation.mutate({})} disabled={checkMutation.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${checkMutation.isPending ? "animate-spin" : ""}`} /> Run Consistency Check
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Consistency Checks</p>
          <p className="text-2xl font-bold">{consistency.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Consistent</p>
          <p className="text-2xl font-bold text-green-400">{consistent.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Drifts</p>
          <p className="text-2xl font-bold text-destructive">{drifts.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Web-Trapped</p>
          <p className="text-2xl font-bold text-yellow-400">{boundaries.length}</p>
        </CardContent></Card>
      </div>

      {/* ── CompatibilityHeatmap ── */}
      {heatmapData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Compatibility Heatmap — Domain × Surface</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left p-2 font-medium text-muted-foreground">Domain</th>
                    {surfaces.map((s: Record<string, any>) => (
                      <th key={s.id} className="text-center p-2 font-medium text-muted-foreground">{s.display_name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row: Record<string, any>) => (
                    <tr key={row.domain}>
                      <td className="p-2 font-mono">{row.domain}</td>
                      {surfaces.map((s: Record<string, any>) => {
                        const cell = row[s.surface_key] || { total: 0, production: 0, status: "none" };
                        return (
                          <td key={s.id} className={`p-2 text-center rounded ${heatCell(cell.status)}`}>
                            {cell.total > 0 ? `${cell.production}/${cell.total}` : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500/30" /> Production</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500/15" /> Planned</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-muted/20" /> No binding</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── WebTrappedLogicList ── */}
      {boundaries.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-400" /> Web-Trapped Logic ({boundaries.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {boundaries.map((b: Record<string, any>) => (
                <div key={b.id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{b.component_path}</span>
                    {b.migration_target && (
                      <>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-xs text-muted-foreground">{b.migration_target}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{b.violation_type}</Badge>
                    <Badge className={sevColors[b.migration_priority] || ""}>{b.migration_priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── MigrationRecommendations ── */}
      {recommendations.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Migration Recommendations</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((r: any, i: number) => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded bg-muted/10 border border-border">
                  <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">Extract <span className="font-mono text-xs">{r.component_path}</span></p>
                    <p className="text-xs text-muted-foreground">
                      → Move {r.violation_type?.replace(/_/g, " ")} to <span className="font-mono">{r.migration_target}</span>
                    </p>
                  </div>
                  <Badge className={sevColors[r.migration_priority] || ""}>{r.migration_priority}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Cross-Surface Consistency ── */}
      {consistency.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Cross-Surface Consistency Checks</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Surfaces</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Drift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consistency.map((c: Record<string, any>) => (
                  <TableRow key={c.id}>
                    <TableCell><Badge variant="outline">{c.check_type}</Badge></TableCell>
                    <TableCell className="text-sm">{c.scope}</TableCell>
                    <TableCell className="text-xs">{(c.surfaces_checked || []).join(", ")}</TableCell>
                    <TableCell>
                      {c.consistent ? <CheckCircle className="h-4 w-4 text-green-400" /> : <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.drift_description || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {consistency.length === 0 && boundaries.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No compatibility data. Run a consistency check and boundary audit.</CardContent></Card>
      )}
    </div>
  );
}
