import { useAction } from "@/hooks/use-action";
import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { Activity, RefreshCw } from "lucide-react";
import CNSubNav from "@/platform/admin/components/admin/CNSubNav";
import { ConnectorStateBadge } from "@/components/primitives/status/ConnectorStateBadge";


export default function CN05ConnectorHealthBoard() {
  const queryClient = useQueryClient();

  const { data: healthRecords = [] } = useQuery({
    queryKey: ["connector-health-all"],
    queryFn: async () => { const { data } = await fromTable("connector_health_records").select("*").order("checked_at", { ascending: false }).limit(50); return data || []; },
  });

  const healthCheckMutation = useAction("admin", "health.check");

  const grouped = healthRecords.reduce((acc: any,  h: Record<string, any>) => {
    const key = h.account_id || h.registry_id || "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(h);
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6">
      <CNSubNav />
<h1 className="sr-only">Connector Health Board</h1>
      <div className="space-y-6">
        <Button onClick={() => healthCheckMutation.mutate({})} disabled={healthCheckMutation.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${healthCheckMutation.isPending ? "animate-spin" : ""}`} /> Run Health Check
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(grouped).map(([key, records]: [string, any]) => {
            const latest = records[0];
            return (
              <Card key={key} className="bg-card border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{key.slice(0, 8)}...</span>
                    </div>
                    <ConnectorStateBadge state={latest.health_status} size="xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Latency: {latest.latency_ms ? `${latest.latency_ms}ms` : "—"}</div>
                    <div>Token: {latest.token_valid ? "✓" : "✗"}</div>
                    <div>Failures: {latest.consecutive_failures}</div>
                    <div>Last Sync: {latest.last_successful_sync ? new Date(latest.last_successful_sync).toLocaleDateString() : "Never"}</div>
                  </div>
                  {latest.error_message && <p className="text-xs text-destructive mt-2">{latest.error_message}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {healthRecords.length === 0 && (
          <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No health records. Run a health check to generate data.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
