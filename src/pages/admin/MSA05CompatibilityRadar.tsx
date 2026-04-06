import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Radar, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const sevColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400", high: "bg-orange-500/20 text-orange-400",
  medium: "bg-yellow-500/20 text-yellow-400", low: "bg-muted text-muted-foreground",
};

export default function MSA05CompatibilityRadar() {
  const queryClient = useQueryClient();

  const { data: consistency = [] } = useQuery({
    queryKey: ["cross-surface-consistency"],
    queryFn: async () => { const { data } = await supabase.from("cross_surface_consistency_records").select("*").order("created_at", { ascending: false }).limit(50); return data || []; },
  });

  const { data: boundaries = [] } = useQuery({
    queryKey: ["architecture-boundaries"],
    queryFn: async () => { const { data } = await supabase.from("architecture_boundary_records").select("*").eq("is_boundary_violation", true); return data || []; },
  });

  const checkMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("msa-operations", { body: { action: "check_consistency" } });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => { toast.success(`Consistency check: ${data?.inconsistent || 0} drifts found`); queryClient.invalidateQueries({ queryKey: ["cross-surface-consistency"] }); },
    onError: (e: any) => toast.error(`Check failed: ${e.message}`),
  });

  const consistent = consistency.filter((c: any) => c.consistent);
  const drifts = consistency.filter((c: any) => !c.consistent);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Radar className="h-6 w-6" /> Future Surface Compatibility Radar</h1>
          <p className="text-sm text-muted-foreground mt-1">Detect web-trapped logic, cross-surface drift, and portability blockers</p>
        </div>
        <Button onClick={() => checkMutation.mutate()} disabled={checkMutation.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${checkMutation.isPending ? "animate-spin" : ""}`} /> Run Consistency Check
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Consistency Checks</p>
          <p className="text-2xl font-bold">{consistency.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Consistent</p>
          <p className="text-2xl font-bold">{consistent.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Drifts Detected</p>
          <p className="text-2xl font-bold text-destructive">{drifts.length}</p>
        </CardContent></Card>
      </div>

      {/* Web-Trapped Logic */}
      {boundaries.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-400" /> Web-Trapped Logic ({boundaries.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {boundaries.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                  <span className="font-mono text-xs">{b.component_path}</span>
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

      {/* Cross-Surface Consistency */}
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
                {consistency.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell><Badge variant="outline">{c.check_type}</Badge></TableCell>
                    <TableCell className="text-sm">{c.scope}</TableCell>
                    <TableCell className="text-xs">{(c.surfaces_checked || []).join(", ")}</TableCell>
                    <TableCell>
                      {c.consistent ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      )}
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
