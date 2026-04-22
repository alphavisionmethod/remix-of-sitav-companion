import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, AlertTriangle, RefreshCw, Trash2, Activity, Clock, Settings, Shield } from "lucide-react";
import { DEMO_CONNECTIONS } from "@/data/seed/integrations";
import { getProviderById } from "@/data/seed/integrations";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";


export default function ConnectionDetail() {
  const { isDemoMode } = useDataMode();
  const { isDemo: isDemoMode } = useAuth();
  const { connectionId } = useParams();
  const navigate = useNavigate();

  const conn = isDemoMode ? DEMO_CONNECTIONS.find(c => c.id === connectionId) : null;

  if (!conn && isDemoMode) return <div className="p-6 text-muted-foreground">Connection not found</div>;
  if (!isDemoMode) return (
    <div className="p-6 space-y-4">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate("/integrations/connections")}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Connections
      </Button>
      <div className="text-center py-16">
        <h2 className="text-lg font-semibold text-foreground mb-2">Connection Details</h2>
        <p className="text-sm text-muted-foreground">Real connection details will appear here once integrations are connected.</p>
      </div>
    </div>
  );

  const provider = getProviderById(conn.providerId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate("/integrations/connections")}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Connections
      </Button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: (provider?.color || "#666") + "15" }}>
            {provider?.icon || "🔗"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{conn.providerName}</h1>
            <p className="text-sm text-muted-foreground">{conn.externalAccountName}</p>
            <div className="flex gap-1.5 mt-1">
              <Badge variant={conn.status === "connected" ? "default" : "destructive"} className="text-[10px] capitalize">{conn.status}</Badge>
              <Badge variant="outline" className="text-[10px] capitalize">{conn.mode} mode</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Sync Now</Button>
          <Button variant="outline" size="sm" className="gap-1.5"><Activity className="w-3.5 h-3.5" /> Health Check</Button>
          <Button variant="destructive" size="sm" className="gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Disconnect</Button>
        </div>
      </div>

      {conn.lastError && (
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-400">Error</p>
              <p className="text-xs text-foreground">{conn.lastError}</p>
            </div>
            <Button size="sm" variant="outline" className="ml-auto text-xs">Reconnect</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-foreground">{conn.syncRuns.length}</p>
            <p className="text-[10px] text-muted-foreground">Sync Runs</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-foreground">{conn.syncRuns.reduce((s, r) => s + r.recordsProcessed, 0)}</p>
            <p className="text-[10px] text-muted-foreground">Records Synced</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-foreground">{conn.scopes.length}</p>
            <p className="text-[10px] text-muted-foreground">Active Scopes</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3 text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${conn.lastHealthStatus === "healthy" ? "bg-green-400" : "bg-amber-400"}`} />
            <p className="text-[10px] text-muted-foreground capitalize">{conn.lastHealthStatus || "Unknown"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="syncs">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="syncs">Sync History</TabsTrigger>
          <TabsTrigger value="scopes">Scopes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="syncs" className="mt-4 space-y-2">
          {conn.syncRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No sync runs yet</p>
          ) : conn.syncRuns.map(run => (
            <Card key={run.id} className="bg-card/50 border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={run.status === "completed" ? "default" : run.status === "running" ? "secondary" : "destructive"} className="text-[9px] capitalize">{run.status}</Badge>
                    <Badge variant="outline" className="text-[9px] capitalize">{run.type}</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(run.startedAt).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-1.5 bg-muted/20 rounded">
                    <p className="text-xs font-bold text-foreground">{run.recordsProcessed}</p>
                    <p className="text-[9px] text-muted-foreground">Processed</p>
                  </div>
                  <div className="p-1.5 bg-muted/20 rounded">
                    <p className="text-xs font-bold text-green-400">{run.recordsCreated}</p>
                    <p className="text-[9px] text-muted-foreground">Created</p>
                  </div>
                  <div className="p-1.5 bg-muted/20 rounded">
                    <p className="text-xs font-bold text-blue-400">{run.recordsUpdated}</p>
                    <p className="text-[9px] text-muted-foreground">Updated</p>
                  </div>
                  <div className="p-1.5 bg-muted/20 rounded">
                    <p className="text-xs font-bold text-red-400">{run.recordsFailed}</p>
                    <p className="text-[9px] text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="scopes" className="mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 space-y-2">
              {conn.scopes.map(scope => (
                <div key={scope} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-foreground font-mono">{scope}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px]">Active</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 space-y-3">
              {[
                { label: "Auto-sync interval", value: "30 minutes" },
                { label: "Health check interval", value: "15 minutes" },
                { label: "Write approval required", value: "Yes — high risk actions" },
                { label: "Connected since", value: new Date(conn.connectedAt).toLocaleDateString() },
                { label: "External Account ID", value: conn.externalAccountId },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="text-xs text-foreground font-medium">{s.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
