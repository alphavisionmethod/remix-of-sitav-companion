import { useAction } from "@/hooks/use-action";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import PFASubNav from "@/platform/admin/components/admin/PFASubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const sevColors: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-orange-500/20 text-orange-400", medium: "bg-yellow-500/20 text-yellow-400", low: "bg-muted text-muted-foreground" };
const healthColors: Record<string, string> = { healthy: "bg-green-500/20 text-green-400", degraded: "bg-yellow-500/20 text-yellow-400", error: "bg-red-500/20 text-red-400", unknown: "bg-muted text-muted-foreground" };

export default function PFA07ConnectorHealthDrift() {
  const queryClient = useQueryClient();

  const { data: drifts = [] } = useQuery({
    queryKey: ["permission-drifts"],
    queryFn: async () => { const { data } = await fromTable("permission_drift_records").select("*, provider_capabilities(display_name, capability_key)").order("detected_at", { ascending: false }).limit(50); return data || []; },
  });

  const { data: health = [] } = useQuery({
    queryKey: ["connector-health-pfa"],
    queryFn: async () => { const { data } = await fromTable("connector_health_records").select("*").order("updated_at", { ascending: false }).limit(50); return data || []; },
  });

  const checkDrift = useAction("admin", "drift.check");

  const unresolvedDrifts = drifts.filter((d: Record<string, any>) => !d.resolved);

  return (
    <div className="space-y-6 p-6">
<PFASubNav />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6" /> Connector Health & Drift</h1>
          <p className="text-sm text-muted-foreground mt-1">Expired tokens, reduced scopes, reauth needs, sync failures</p>
        </div>
        <Button onClick={() => checkDrift.mutate({})} disabled={checkDrift.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${checkDrift.isPending ? "animate-spin" : ""}`} /> Check Drift
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Drifts</p>
          <p className="text-2xl font-bold">{drifts.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Unresolved</p>
          <p className="text-2xl font-bold text-destructive">{unresolvedDrifts.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Health Records</p>
          <p className="text-2xl font-bold">{health.length}</p>
        </CardContent></Card>
      </div>

      {drifts.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Permission Drift Events</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capability</TableHead>
                  <TableHead>Drift Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Reauth</TableHead>
                  <TableHead>Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drifts.map((d: Record<string, any>) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-xs">{d.provider_capabilities?.display_name || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{d.drift_type}</Badge></TableCell>
                    <TableCell className="text-xs max-w-[250px] truncate">{d.description}</TableCell>
                    <TableCell><Badge className={sevColors[d.severity] || ""}>{d.severity}</Badge></TableCell>
                    <TableCell>{d.reauth_needed ? <AlertTriangle className="h-3 w-3 text-yellow-400" /> : <CheckCircle className="h-3 w-3 text-green-400" />}</TableCell>
                    <TableCell>{d.resolved ? <CheckCircle className="h-3 w-3 text-green-400" /> : <AlertTriangle className="h-3 w-3 text-yellow-400" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {drifts.length === 0 && health.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No drift or health data. Run a drift check.</CardContent></Card>
      )}
    </div>
  );
}
