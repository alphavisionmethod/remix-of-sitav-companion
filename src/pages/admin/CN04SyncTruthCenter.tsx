import { useAction } from "@/hooks/use-action";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CNSubNav from "@/platform/admin/components/admin/CNSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const statusColors: Record<string, string> = {
  completed: "bg-green-500/20 text-green-400", running: "bg-blue-500/20 text-blue-400",
  partial: "bg-yellow-500/20 text-yellow-400", failed: "bg-red-500/20 text-red-400",
  cancelled: "bg-muted text-muted-foreground",
};

export default function CN04SyncTruthCenter() {
  const queryClient = useQueryClient();

  const { data: syncRuns = [] } = useQuery({
    queryKey: ["connector-sync-runs"],
    queryFn: async () => { const { data } = await fromTable("connector_sync_runs").select("*").order("created_at", { ascending: false }).limit(50); return data || []; },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["connector-accounts"],
    queryFn: async () => { const { data } = await fromTable("connector_accounts").select("id, display_name, connector_type"); return data || []; },
  });

  const syncMutation = useAction("admin", "sync.run");

  const getAccountName = (id: string) => accounts.find((a: Record<string, any>) => a.id === id)?.display_name || id.slice(0, 8);

  const completed = syncRuns.filter((s: Record<string, any>) => s.status === "completed").length;
  const failed = syncRuns.filter((s: Record<string, any>) => s.status === "failed").length;
  const totalRecords = syncRuns.reduce((acc: number,  s: Record<string, any>) => acc + (s.records_imported || 0), 0);

  return (
    <div className="space-y-6 p-6">
      <CNSubNav />
<h1 className="sr-only">Sync Truth Center</h1>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total Syncs</p><p className="text-2xl font-bold">{syncRuns.length}</p></CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Success / Failed</p><p className="text-2xl font-bold text-green-400">{completed} <span className="text-red-400">/ {failed}</span></p></CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Records Imported</p><p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p></CardContent></Card>
        </div>

        {accounts.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {accounts.filter((a: Record<string, any>) => a.connector_type).map((a: Record<string, any>) => (
              <Button key={a.id} size="sm" variant="outline" onClick={() => syncMutation.mutate(a.id)} disabled={syncMutation.isPending}>
                <RefreshCw className="h-3 w-3 mr-1" /> Sync {a.display_name || a.connector_type}
              </Button>
            ))}
          </div>
        )}

        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Sync Run History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fetched</TableHead>
                  <TableHead>Imported</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncRuns.map((s: Record<string, any>) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm">{getAccountName(s.account_id)}</TableCell>
                    <TableCell>{s.sync_type}</TableCell>
                    <TableCell>{s.trigger}</TableCell>
                    <TableCell><Badge className={statusColors[s.status] || ""}>{s.status}</Badge></TableCell>
                    <TableCell>{s.records_fetched}</TableCell>
                    <TableCell>{s.records_imported}</TableCell>
                    <TableCell className={s.records_failed > 0 ? "text-red-400" : ""}>{s.records_failed}</TableCell>
                    <TableCell>{s.duration_ms ? `${s.duration_ms}ms` : "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {syncRuns.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No sync runs recorded</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
