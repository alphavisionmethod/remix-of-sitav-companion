import { useAction } from "@/hooks/use-action";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Activity, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";



const statusColors: Record<string, string> = {
  healthy: "bg-green-500/20 text-green-400", degraded: "bg-yellow-500/20 text-yellow-400",
  unhealthy: "bg-red-500/20 text-red-400", token_expired: "bg-red-500/20 text-red-400",
  reauth_required: "bg-orange-500/20 text-orange-400", not_configured: "bg-muted text-muted-foreground",
  demo_simulated: "bg-purple-500/20 text-purple-400", internal_test: "bg-blue-500/20 text-blue-400",
  shell_only: "bg-muted text-muted-foreground", unknown: "bg-muted text-muted-foreground",
};

export default function CN05ConnectorHealthBoard() {
  const { isDemoMode } = useDataMode();
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
    <div className="space-y-6 p-6"  >
      <DemoModeBadge />
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
                    <Badge className={statusColors[latest.health_status] || ""}>{latest.health_status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Latency: {latest.latency_ms ? `${latest.latency_ms}ms` : "—"}</div>
                    <div>Token: {latest.token_valid ? "✓" : "✗"}</div>
                    <div>Failures: {latest.consecutive_failures}</div>
                    <div>Last Sync: {latest.last_successful_sync ? new Date(latest.last_successful_sync).toLocaleDateString() : "Never"}</div>
                  </div>
                  {latest.error_message && <p className="text-xs text-red-400 mt-2">{latest.error_message}</p>}
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
