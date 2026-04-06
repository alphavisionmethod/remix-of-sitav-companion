import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const db: any = supabase;
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plug, Wifi, WifiOff, RefreshCw, Clock, ChevronRight, Activity, Database, Shield, Circle } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { fetchConnectorHealth, type ConnectorHealthResult } from "@/lib/services/connector-health-service";

const ConnectorHub = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: connectors = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["connector_configs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("connector_configs").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: credentials = [] } = useQuery({
    queryKey: ["connector_credentials", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("connector_credentials").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: syncLogs = [] } = useQuery({
    queryKey: ["sync_logs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("sync_logs").select("*").order("synced_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: healthResult } = useQuery<ConnectorHealthResult>({
    queryKey: ["connector_health", user?.id],
    enabled: !!user,
    queryFn: fetchConnectorHealth,
    refetchInterval: 60_000,
  });

  const filtered = filter === "all" ? connectors : connectors.filter(c => c.status === filter);
  const selected = connectors.find(c => c.id === selectedId);
  const selectedLogs = syncLogs.filter(l => l.connector_id === selectedId);
  const selectedCred = credentials.find(c => selected && c.connector_id === selected.id);
  const activeCount = connectors.filter(c => c.status === "active").length;

  const getHealthColor = (connectorId: string) => {
    const health = healthResult?.connectors.find(h => h.connectorId === connectorId);
    if (!health) return "text-muted-foreground";
    if (health.status === "up") return "text-primary";
    if (health.status === "degraded") return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <motion.div className="mx-auto max-w-6xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <DemoModeBadge />
      <SitaPageHeader title="Connector Hub" subtitle="Manage integrations, health status, and sync history" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Connectors" value={connectors.length} icon={Plug} />
        <KPITile label="Active" value={activeCount} icon={Wifi} />
        <KPITile label="Credentials" value={credentials.length} icon={Shield} />
        <KPITile label="Sync Events" value={syncLogs.length} icon={RefreshCw} />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: connectors.length },
          { key: "active", label: "Active", count: connectors.filter(c => c.status === "active").length },
          { key: "inactive", label: "Inactive", count: connectors.filter(c => c.status === "inactive").length },
          { key: "error", label: "Error", count: connectors.filter(c => c.status === "error").length },
        ]}
        active={filter}
        onChange={setFilter}
      />

      {isLoading ? (
        <SectionSkeleton cards={4} columns={2} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Plug} title="No connectors configured" description="Set up connectors to integrate calendar, email, CRM, banking, and other services." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-2">
            {filtered.map((conn, i) => (
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
                      {selectedLogs.slice(0, 10).map(log => (
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
                  <SitaButton variant="primary" className="flex-1"><RefreshCw className="h-3.5 w-3.5" /> Sync Now</SitaButton>
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
  );
};

export default ConnectorHub;
