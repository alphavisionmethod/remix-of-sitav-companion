import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag, CheckCircle, AlertTriangle } from "lucide-react";
import PFASubNav from "@/platform/admin/components/admin/PFASubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const labelColors: Record<string, string> = {
  shell_only: "bg-muted text-muted-foreground", identity_only: "bg-blue-500/20 text-blue-400",
  read_only_connected: "bg-cyan-500/20 text-cyan-400", read_sync_real: "bg-green-500/20 text-green-400",
  write_enabled: "bg-green-600/20 text-green-300", internal_only: "bg-yellow-500/20 text-yellow-400",
  pilot_ready: "bg-purple-500/20 text-purple-400", launch_ready: "bg-green-500/30 text-green-300",
  demo_only: "bg-orange-500/20 text-orange-400", degraded: "bg-red-500/20 text-red-400",
  permission_drift_detected: "bg-red-600/20 text-red-300",
};

export default function PFA10IntegrationLaunchHonesty() {
  const { data: honesty = [] } = useQuery({
    queryKey: ["integration-launch-honesty"],
    queryFn: async () => { const { data } = await fromTable("integration_launch_honesty").select("*, provider_families(name, provider_key), provider_capabilities(display_name, capability_key)").order("created_at"); return data || []; },
  });

  const launchReady = honesty.filter((h: Record<string, any>) => h.launch_label === "launch_ready").length;
  const shellOnly = honesty.filter((h: Record<string, any>) => h.launch_label === "shell_only").length;
  const withBlockers = honesty.filter((h: Record<string, any>) => (h.blockers || []).length > 0).length;

  return (
    <div className="space-y-6 p-6">
<PFASubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Flag className="h-6 w-6" /> Integration Launch Honesty</h1>
        <p className="text-sm text-muted-foreground mt-1">Truthful production/demo/internal launch state per integration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{honesty.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Launch Ready</p>
          <p className="text-2xl font-bold text-green-400">{launchReady}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Shell Only</p>
          <p className="text-2xl font-bold text-muted-foreground">{shellOnly}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">With Blockers</p>
          <p className="text-2xl font-bold text-destructive">{withBlockers}</p>
        </CardContent></Card>
      </div>

      {honesty.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Capability</TableHead>
                  <TableHead>Launch Label</TableHead>
                  <TableHead>Blockers</TableHead>
                  <TableHead>Verified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {honesty.map((h: Record<string, any>) => (
                  <TableRow key={h.id}>
                    <TableCell>{h.provider_families?.name || "—"}</TableCell>
                    <TableCell className="text-xs">{h.provider_capabilities?.display_name || "Family-level"}</TableCell>
                    <TableCell><Badge className={labelColors[h.launch_label] || ""}>{h.launch_label?.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell>
                      {(h.blockers || []).length > 0 ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-yellow-400" />
                          <span className="text-xs">{h.blockers.length} blockers</span>
                        </div>
                      ) : <CheckCircle className="h-3 w-3 text-green-400" />}
                    </TableCell>
                    <TableCell className="text-xs">{h.verified_at ? new Date(h.verified_at).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {honesty.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No launch honesty data. Seed providers first.</CardContent></Card>
      )}
    </div>
  );
}
