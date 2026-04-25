import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { CheckCircle, XCircle, AlertTriangle, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CNSubNav from "@/platform/admin/components/admin/CNSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const stageColors: Record<string, string> = {
  shell_only: "bg-muted text-muted-foreground", framework_ready: "bg-blue-500/20 text-blue-400",
  reference_implemented: "bg-cyan-500/20 text-cyan-400", user_connectable: "bg-green-500/20 text-green-400",
  pilot_ready: "bg-green-500/20 text-green-400", launch_ready: "bg-emerald-500/20 text-emerald-400",
  demo_only: "bg-purple-500/20 text-purple-400", internal_test_only: "bg-blue-500/20 text-blue-400",
};

export default function CN07ConnectorLaunchGate() {
  const { data: readiness = [] } = useQuery({
    queryKey: ["connector-launch-readiness"],
    queryFn: async () => { const { data } = await fromTable("connector_launch_readiness").select("*"); return data || []; },
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ["connector-receipts-recent"],
    queryFn: async () => { const { data } = await fromTable("connector_receipts").select("*").order("created_at", { ascending: false }).limit(20); return data || []; },
  });

  const getScore = (r: Record<string, any>) => {
    const checks = [r.oauth_working, r.token_storage_working, r.sync_working, r.health_reporting, r.disconnect_working, r.demo_available];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const launchReady = readiness.filter((r: Record<string, any>) => getScore(r) === 100).length;
  const totalConnectors = readiness.length;

  return (
    <div className="space-y-6 p-6">
      <CNSubNav />
<h1 className="sr-only">Connector Launch Gate</h1>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border"><CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Connectors</p>
            <p className="text-2xl font-bold">{totalConnectors}</p>
          </CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Fully Ready</p>
            <p className="text-2xl font-bold text-green-400">{launchReady}</p>
          </CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Audit Trail Events</p>
            <p className="text-2xl font-bold">{receipts.length}</p>
          </CardContent></Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Launch Readiness Matrix</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Connector</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>OAuth</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Sync</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Disconnect</TableHead>
                  <TableHead>Demo</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readiness.map((r: Record<string, any>) => {
                  const score = getScore(r);
                  const Icon = ({ val }: { val: boolean }) => val ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.connector_type}</TableCell>
                      <TableCell><Badge className={stageColors[r.readiness_stage] || ""}>{r.readiness_stage}</Badge></TableCell>
                      <TableCell><Icon val={r.oauth_working} /></TableCell>
                      <TableCell><Icon val={r.token_storage_working} /></TableCell>
                      <TableCell><Icon val={r.sync_working} /></TableCell>
                      <TableCell><Icon val={r.health_reporting} /></TableCell>
                      <TableCell><Icon val={r.disconnect_working} /></TableCell>
                      <TableCell><Icon val={r.demo_available} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={score} className="h-2 w-16" />
                          <span className="text-xs">{score}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {readiness.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No readiness data. Seed the registry first.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Receipts */}
        {receipts.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader><CardTitle>Recent Connector Events</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {receipts.map((r: Record<string, any>) => (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{r.event_type}</Badge>
                      <span className="text-sm">{r.connector_type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
