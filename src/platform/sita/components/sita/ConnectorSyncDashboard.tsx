import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Activity, CheckCircle, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ConnectorSyncDashboardProps {
  compact?: boolean;
}

import { useDataMode } from "@/contexts/DataModeContext";
const CONNECTORS = [] as any[];

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
  active: { color: "text-trust-safe", icon: CheckCircle },
  healthy: { color: "text-trust-safe", icon: CheckCircle },
  degraded: { color: "text-accent", icon: AlertTriangle },
  disconnected: { color: "text-muted-foreground", icon: Clock },
};

export function ConnectorSyncDashboard({ compact = false }: ConnectorSyncDashboardProps) {
  const { user } = useAuth();

  const { data: connectors = CONNECTORS } = useQuery({
    queryKey: ["connector-sync-dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: registry } = await fromTable("connector_registry")
        .select("*")
        .eq("user_id", user!.id);
      const { data: accounts } = await fromTable("connector_accounts")
        .select("*")
        .eq("user_id", user!.id);

      if ((!registry || registry.length === 0) && (!accounts || accounts.length === 0)) {
        return CONNECTORS;
      }

      return (accounts || []).map((acc: any) => {
        const reg = (registry || []).find((r: any) => r.connector_type === acc.connector_type);
        return {
          id: acc.id,
          connector_type: acc.connector_type,
          display_name: reg?.display_name || acc.connector_type,
          status: acc.status || "active",
          last_sync_at: acc.last_sync_at,
          sync_count: acc.sync_count || 0,
          error_rate: acc.error_rate || 0,
        };
      });
    },
    staleTime: 30000,
  });

  const handleSync = async (connectorType: string) => {
    try {
      await supabase.functions.invoke("connector-batch", {
        body: { action: "submit", connector_type: connectorType, operations: [{ type: "sync", payload: {} }] },
      });
      toast.success(`Sync triggered for ${connectorType}`);
    } catch {
      toast.error("Sync failed");
    }
  };

  const healthy = connectors.filter((c: any) => c.status === "active" || c.status === "healthy").length;

  return (
    <SitaCard hover={false} className="p-4">
      <SitaCardTitle sub={`${healthy}/${connectors.length} healthy`}>
        <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Sync Health</div>
      </SitaCardTitle>
      <div className="mt-3 space-y-2">
        {connectors.slice(0, compact ? 4 : undefined).map((conn: any) => {
          const cfg = statusConfig[conn.status] || statusConfig.disconnected;
          const Icon = cfg.icon;
          return (
            <div key={conn.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-2.5">
              <div className="flex items-center gap-2.5">
                <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                <div>
                  <p className="text-xs font-medium text-foreground">{conn.display_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {conn.last_sync_at ? `Synced ${new Date(conn.last_sync_at).toLocaleTimeString()}` : "Never synced"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {conn.error_rate > 1 && <Badge variant="outline" className="text-[8px] text-accent border-accent/30">{conn.error_rate}% errors</Badge>}
                <Badge variant="outline" className={cn("text-[8px] capitalize", cfg.color)}>{conn.status}</Badge>
                {!compact && conn.status !== "disconnected" && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleSync(conn.connector_type)}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SitaCard>
  );
}
