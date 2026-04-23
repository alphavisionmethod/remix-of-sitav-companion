import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plug, CheckCircle, AlertTriangle, RefreshCw, ArrowRight, Clock, Activity, Shield, Users, Settings, LinkIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyState } from "@/components/sita/SitaComponents";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
export default function ConnectionsList() {
  const [tab, setTab] = useState("connections");
  const [agencyMode, setAgencyMode] = useState(false);
  const navigate = useNavigate();
  const { user, isDemo } = useAuth();
  // Real mode: fetch from connector_instances table
  const { data: realConnections = [] } = useQuery({
    queryKey: ["connector_configs", user?.id],
    enabled: !!user && !false,
    queryFn: async () => {
      const { data, error } = await fromTable("connector_configs").select("*").order("created_at", { ascending: false });
      if (error) return [];
      return data ?? [];
    },
  });

  const connections = realConnections;
  const auditLog = [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Connections</h1>
          <p className="text-muted-foreground">Manage connected integrations, health, and sync status</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
            <span className="text-[10px] text-muted-foreground font-medium">Agency Mode</span>
            <Switch checked={agencyMode} onCheckedChange={setAgencyMode} />
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => navigate("/integrations")}>
            <Plug className="w-3.5 h-3.5" /> Add Connection
          </Button>
        </div>
      </div>

      {agencyMode && (
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Users className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-xs font-semibold text-foreground">Agency Mode Active</p>
              <p className="text-[10px] text-muted-foreground">Multi-account routing enabled. All high-risk actions require approval. Client routing rules apply.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="connections">Connections ({connections.length})</TabsTrigger>
          <TabsTrigger value="health">Health Dashboard</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="mt-4 space-y-3">
          {connections.length === 0 && !connections.map((conn: Record<string, any>) => {
            const provider = getProviderById(conn.providerId);
            return (
              <Card key={conn.id} className={`bg-card/50 border-border/50 hover:border-primary/30 transition-colors cursor-pointer ${conn.status === "expired" ? "border-l-2 border-l-amber-500" : conn.status === "connected" ? "border-l-2 border-l-green-500" : ""}`}
                onClick={() => navigate(`/integrations/connections/${conn.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: (provider?.color || "#666") + "15" }}>
                        {provider?.icon || "🔗"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">{conn.providerName}</h3>
                          <Badge variant={conn.status === "connected" ? "default" : conn.status === "expired" ? "destructive" : "secondary"} className="text-[9px] capitalize">{conn.status}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{conn.externalAccountName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      {conn.lastSyncAt && (
                        <div className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          <span>Synced {new Date(conn.lastSyncAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {conn.lastHealthStatus && (
                        <div className="flex items-center gap-1">
                          {conn.lastHealthStatus === "healthy" ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                          <span className="capitalize">{conn.lastHealthStatus}</span>
                        </div>
                      )}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  {conn.lastError && (
                    <div className="mt-2 p-2 bg-red-500/5 border border-red-500/20 rounded text-xs text-red-400">{conn.lastError}</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="health" className="mt-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            {connections.map((conn: Record<string, any>) => {
              const provider = getProviderById(conn.providerId);
              return (
                <Card key={conn.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{provider?.icon}</span>
                        <span className="text-xs font-semibold text-foreground">{conn.providerName}</span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${conn.lastHealthStatus === "healthy" ? "bg-green-400" : conn.lastHealthStatus === "error" ? "bg-red-400" : "bg-amber-400"}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 bg-muted/20 rounded">
                        <p className="text-xs font-bold text-foreground">{conn.syncRuns.length}</p>
                        <p className="text-[9px] text-muted-foreground">Sync Runs</p>
                      </div>
                      <div className="p-2 bg-muted/20 rounded">
                        <p className="text-xs font-bold text-foreground">{conn.syncRuns.reduce((s, r) => s + r.recordsFailed, 0)}</p>
                        <p className="text-[9px] text-muted-foreground">Failures</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-[10px] gap-1">
                      <Activity className="w-3 h-3" /> Run Health Check
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4 space-y-2">
          {auditLog.length === 0 && !auditLog.map((entry: Record<string, any>) => (
            <div key={entry.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${entry.eventType.includes("error") || entry.eventType.includes("warning") ? "bg-amber-400" : entry.eventType.includes("rejected") ? "bg-red-400" : "bg-green-400"}`} />
              <div className="flex-1">
                <p className="text-xs text-foreground">{entry.summary}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                  <Badge variant="outline" className="text-[9px]">{entry.actor}</Badge>
                  <Badge variant="outline" className="text-[9px]">{entry.eventType}</Badge>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
