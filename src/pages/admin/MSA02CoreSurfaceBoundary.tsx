import { useAction } from "@/hooks/use-action";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, RefreshCw, Layers } from "lucide-react";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const layerColors: Record<string, string> = {
  core_runtime: "bg-green-500/20 text-green-400", contract: "bg-cyan-500/20 text-cyan-400",
  capability: "bg-blue-500/20 text-blue-400", adapter: "bg-purple-500/20 text-purple-400",
  surface: "bg-yellow-500/20 text-yellow-400", unknown: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400", high: "bg-orange-500/20 text-orange-400",
  medium: "bg-yellow-500/20 text-yellow-400", low: "bg-muted text-muted-foreground", none: "",
};

export default function MSA02CoreSurfaceBoundary() {
  const queryClient = useQueryClient();

  const { data: boundaries = [] } = useQuery({
    queryKey: ["architecture-boundaries"],
    queryFn: async () => { const { data } = await fromTable("architecture_boundary_records").select("*").order("migration_priority"); return data || []; },
  });

  const auditMutation = useAction("admin", "audit.run");

  const violations = boundaries.filter((b: Record<string, any>) => b.is_boundary_violation);
  const clean = boundaries.filter((b: Record<string, any>) => !b.is_boundary_violation);

  return (
    <div className="space-y-6 p-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="h-6 w-6" /> Core vs Surface Boundary</h1>
          <p className="text-sm text-muted-foreground mt-1">What lives in core runtime vs shell layer — violations and migration candidates</p>
        </div>
        <Button onClick={() => auditMutation.mutate({})} disabled={auditMutation.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${auditMutation.isPending ? "animate-spin" : ""}`} /> Run Audit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Total Components</p>
          <p className="text-2xl font-bold">{boundaries.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Boundary Violations</p>
          <p className="text-2xl font-bold text-destructive">{violations.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Clean Components</p>
          <p className="text-2xl font-bold">{clean.length}</p>
        </CardContent></Card>
      </div>

      {violations.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Boundary Violations</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Layer</TableHead>
                  <TableHead>Violation</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Migration Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.map((b: Record<string, any>) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.component_path}</TableCell>
                    <TableCell><Badge variant="outline">{b.component_type}</Badge></TableCell>
                    <TableCell><Badge className={layerColors[b.layer] || ""}>{b.layer}</Badge></TableCell>
                    <TableCell className="text-xs">{b.violation_type}</TableCell>
                    <TableCell><Badge className={priorityColors[b.migration_priority] || ""}>{b.migration_priority}</Badge></TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{b.migration_target || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {clean.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-400" /> Properly Layered Components</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clean.map((b: Record<string, any>) => (
                <div key={b.id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                  <span className="font-mono text-xs">{b.component_path}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{b.component_type}</Badge>
                    <Badge className={layerColors[b.layer] || ""}>{b.layer}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {boundaries.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No boundary data. Run an audit to analyze the codebase.</CardContent></Card>
      )}
    </div>
  );
}
