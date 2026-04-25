import { useAction } from "@/hooks/use-action";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import { SectionSkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plug, Wifi, WifiOff, RefreshCw, Clock, ChevronRight, Activity, Database, Shield, Circle, AlertTriangle, ExternalLink, Unplug, Search } from "lucide-react";
import { ConnectorSyncDashboard } from "@/platform/sita/components/sita/ConnectorSyncDashboard";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { useLoopEmitter } from "@/hooks/use-flagship-loop-proof";
import { PageShell } from "@/platform/sita/components/sita/PageShell";



const ConnectorHub = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const emitConnectorLoop = useLoopEmitter("connected-services-sync");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Legacy connector configs
  const { data: connectors = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["connector_configs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("connector_configs").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  // Real connector accounts from new system
  const { data: connectorAccounts = [] } = useQuery({
    queryKey: ["real-connector-accounts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await fromTable("connector_accounts").select("*").order("created_at");
      return data || [];
    },
  });

  // Real connector registry
  const { data: registry = [] } = useQuery({
    queryKey: ["connector-registry-hub", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await fromTable("connector_registry").select("*").eq("connector_class", "real").order("display_name");
      return data || [];
    },
  });

  // OAuth config check
  const { data: oauthConfig } = useQuery({
    queryKey: ["oauth-config-check"],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke("connector-oauth", { body: { action: "check_config" } });
      return data;
    },
  });

  const { data: credentials = [] } = useQuery({
    queryKey: ["connector_credentials", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("connector_credentials").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: syncLogs = [] } = useQuery({
    queryKey: ["sync_logs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("sync_logs").select("*").order("synced_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: healthResult } = useQuery<any>({
    queryKey: ["connector_health", user?.id],
    enabled: !!user,
    queryFn: async () => ({ status: "healthy", connectors: [] }),
    refetchInterval: 60_000,
  });

  // Connect mutation (OAuth initiate)
  const connectMutation = useAction("system", "connector.connect");

  // Disconnect mutation
  const disconnectMutation = useAction("system", "connector.disconnect");

  const filtered = filter === "all" ? connectors : connectors.filter((c: Record<string, any>) => c.status === filter);
  const selected = connectors.find((c: Record<string, any>) => c.id === selectedId);
  const selectedLogs = syncLogs.filter((l: Record<string, any>) => l.connector_id === selectedId);
  const selectedCred = credentials.find((c: Record<string, any>) => selected && c.connector_id === selected.id);
  const activeCount = connectors.filter((c: Record<string, any>) => c.status === "active").length;

  const getHealthColor = (connectorId: string) => {
    const health = healthResult?.connectors.find((h: Record<string, any>) => h.connectorId === connectorId);
    if (!health) return "text-muted-foreground";
    if (health.status === "up") return "text-primary";
    if (health.status === "degraded") return "text-yellow-500";
    return "text-destructive";
  };

  const getAccountForConnector = (connectorId: string) => {
    return connectorAccounts.find((a: Record<string, any>) => a.connector_type === connectorId && a.status === "connected");
  };

  const isGoogleConfigured = oauthConfig?.google_oauth_configured === true;

  return (
    <PageShell>
    <motion.div className="mx-auto max-w-6xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
<SitaPageHeader title="Connector Hub" subtitle="Manage integrations, health status, and sync history" />

      {/* Sync Health Dashboard */}
      <ConnectorSyncDashboard />

      {/* Discover New Connectors */}
      <SitaCard hover={false} className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Discover Available Connectors</p>
            <p className="text-xs text-muted-foreground">Scan for new integration endpoints</p>
          </div>
          <SitaButton variant="primary" onClick={async () => {
            try {
              await supabase.functions.invoke("connector-discover", { body: { action: "scan" } });
              toast.success("Discovery scan started");
              queryClient.invalidateQueries({ queryKey: ["connector-registry-hub"] });
            } catch { toast.error("Discovery failed"); }
          }}><Search className="h-3.5 w-3.5" /> Discover</SitaButton>
        </div>
      </SitaCard>

      {/* Real Connector Connect Section */}
      <SitaCard hover={false} className="p-5">
        <SitaCardTitle sub="Google OAuth connectors">Real Connectors</SitaCardTitle>
        <div className="mt-4 space-y-3">
          {registry.length === 0 ? (
            <p className="text-sm text-muted-foreground">No real connectors registered. Seed the registry from Admin → Connectors.</p>
          ) : (
            registry.map((reg: Record<string, any>) => {
              const account = getAccountForConnector(reg.connector_id);
              const isConnected = !!account;
              return (
                <div key={reg.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-3">
                    <Plug className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{reg.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {isConnected ? "Connected" : isGoogleConfigured ? "Ready to connect" : "OAuth not configured"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <>
                        <Badge variant="outline" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Connected</Badge>
                        <SitaButton
                          variant="danger"
                          onClick={() => disconnectMutation.mutate({ accountId: account.id })}
                          disabled={disconnectMutation.isPending}
                        >
                          <Unplug className="h-3.5 w-3.5" /> Disconnect
                        </SitaButton>
                      </>
                    ) : isGoogleConfigured ? (
                      <SitaButton
                        variant="primary"
                        onClick={() => connectMutation.mutate({ connectorId: reg.connector_id })}
                        disabled={connectMutation.isPending}
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Connect
                      </SitaButton>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">Not Configured</Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SitaCard>

      {/* Legacy Connectors */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Connectors" value={connectors.length} icon={Plug} />
        <KPITile label="Active" value={activeCount} icon={Wifi} />
        <KPITile label="Credentials" value={credentials.length} icon={Shield} />
        <KPITile label="Sync Events" value={syncLogs.length} icon={RefreshCw} />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: connectors.length },
          { key: "active", label: "Active", count: connectors.filter((c: Record<string, any>) => c.status === "active").length },
          { key: "inactive", label: "Inactive", count: connectors.filter((c: Record<string, any>) => c.status === "inactive").length },
          { key: "error", label: "Error", count: connectors.filter((c: Record<string, any>) => c.status === "error").length },
        ]}
        active={filter}
        onChange={setFilter}
      />

      {isLoading ? (
        <SectionSkeleton cards={4} columns={2} />
      ) : isError ? (
        <SitaCard hover={false} className="p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Failed to load connectors</p>
          <p className="text-xs text-muted-foreground mb-4">There was a problem fetching your integrations.</p>
          <SitaButton variant="primary" onClick={() => refetch()}><RefreshCw className="h-3.5 w-3.5" /> Retry</SitaButton>
        </SitaCard>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Plug} title="No connectors configured" description="Set up connectors to integrate calendar, email, CRM, banking, and other services." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-2">
            {filtered.map((conn: any, i: number) => (
              <motion.div key={conn.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <SitaCard selected={selectedId === conn.id} onClick={() => setSelectedId(conn.id)} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {conn.status === "active" ? <Wifi className="h-4 w-4 text-primary shrink-0" /> : conn.status === "error" ? <WifiOff className="h-4 w-4 text-destructive shrink-0" /> : <WifiOff className="h-4 w-4 text-muted-foreground shrink-0" />}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Circle className={`h-2 w-2 fill-current ${getHealthColor(conn.id)}`} />
                          <p className="text-sm font-medium text-foreground capitalize">{conn.service}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {conn.last_sync_at ? `Last sync: ${new Date(conn.last_sync_at).toLocaleString()}` : "Never synced"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrustBadge level={conn.status === "active" ? "verified" : conn.status === "error" ? "low-confidence" : "review"} label={conn.status} size="sm" />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </SitaCard>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <SitaCard hover={false} glow className="p-5">
                  <SitaCardTitle sub={selected.status} className="capitalize">{selected.service}</SitaCardTitle>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><TrustBadge level={selected.status === "active" ? "verified" : "low-confidence"} label={selected.status} size="sm" /></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Last Sync</span><span className="text-foreground">{selected.last_sync_at ? new Date(selected.last_sync_at).toLocaleString() : "Never"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Credential</span><span className="text-foreground">{selectedCred ? selectedCred.status : "None"}</span></div>
                  </div>
                </SitaCard>

                {selectedLogs.length > 0 && (
                  <SitaCard hover={false}>
                    <SitaCardTitle>Sync History</SitaCardTitle>
                    <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                      {selectedLogs.slice(0, 10).map((log: Record<string, any>) => (
                        <div key={log.id} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${log.status === "success" ? "bg-primary" : "bg-destructive"}`} />
                            <span className="text-xs text-foreground">{log.records_synced || 0} records</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{new Date(log.synced_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </SitaCard>
                )}

                <div className="flex gap-2">
                  <SitaButton variant="primary" className="flex-1" onClick={async () => {
                    try {
                      await supabase.functions.invoke("connector-batch", {
                        body: { action: "submit", connector_type: selected.service, operations: [{ type: "sync", payload: {} }] },
                      });
                      emitConnectorLoop("sync_run", { evidence: { connector: selected.service } });
                      toast.success(`Sync triggered for ${selected.service}`);
                      queryClient.invalidateQueries({ queryKey: ["sync_logs"] });
                      queryClient.invalidateQueries({ queryKey: ["connector_configs"] });
                      queryClient.invalidateQueries({ queryKey: ["real-connector-accounts"] });
                    } catch { toast.error("Sync failed"); }
                  }}><RefreshCw className="h-3.5 w-3.5" /> Sync Now</SitaButton>
                  <SitaButton variant="danger"><WifiOff className="h-3.5 w-3.5" /> Disconnect</SitaButton>
                </div>
              </>
            ) : (
              <EmptyState icon={Plug} title="Select a connector" description="Click on a connector to view details and sync history" />
            )}
          </div>
        </div>
      )}
    </motion.div>
    </PageShell>
  );
};

export default ConnectorHub;
