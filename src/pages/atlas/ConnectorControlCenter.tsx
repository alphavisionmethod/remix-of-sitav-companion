import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { DegradedStateBanner } from "@/components/sita/truth/DegradedStateBanner";
import { StalenessIndicator } from "@/components/sita/truth/StalenessIndicator";
import { DurabilityStateBadge } from "@/components/sita/truth/DurabilityStateBadge";
import {
  Plug, Shield, CheckCircle, XCircle, AlertTriangle, Clock, Activity,
  Play, Pause, RotateCcw, Settings, FileCheck, GitBranch, Lock, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { DEMO_auditTimeline, DEMO_connectors } from "@/data/seed/atlas";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

const lifecycleStates = ["registered", "configured", "active", "paused", "error", "disabled", "decommissioned"];

export default function ConnectorControlCenter() {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("overview");
  const healthy = DEMO_connectors.filter(c => c.status === "active").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="Connector Control Center" subtitle="Connector lifecycle, health matrix, capability registry, audit lineage, and failure recovery" />

      {DEMO_connectors.some(c => c.status === "error") && (
        <DegradedStateBanner severity="warning" reason={`${DEMO_connectors.filter(c => c.status === "error").length} connector(s) in error state`} impact="Data sync affected for failed connectors" affectedCapabilities={DEMO_connectors.filter(c => c.status === "error").flatMap(c => c.capabilities)} dismissible />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Active", value: healthy, color: "text-green-400" },
          { label: "Error", value: DEMO_connectors.filter(c => c.status === "error").length, color: DEMO_connectors.some(c => c.status === "error") ? "text-red-400" : "text-green-400" },
          { label: "Paused", value: DEMO_connectors.filter(c => c.status === "paused").length, color: "text-amber-400" },
          { label: "Avg Health", value: `${Math.round(DEMO_connectors.reduce((s, c) => s + c.health, 0) / DEMO_connectors.length)}%`, color: "text-blue-400" },
          { label: "Total Capabilities", value: DEMO_connectors.reduce((s, c) => s + c.capabilities.length, 0), color: "text-foreground" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5 flex-wrap">
          {[
            { value: "overview", label: "Overview", icon: Plug },
            { value: "lifecycle", label: "Lifecycle", icon: GitBranch },
            { value: "health", label: "Health Matrix", icon: Activity },
            { value: "capabilities", label: "Capabilities", icon: Zap },
            { value: "audit", label: "Audit Timeline", icon: FileCheck },
            { value: "recovery", label: "Recovery", icon: RotateCcw },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-3">
          <TabsContent value="overview">
            {DEMO_connectors.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2.5 h-2.5 rounded-full", c.status === "active" ? "bg-green-400" : c.status === "error" ? "bg-red-400" : "bg-amber-400")} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.capabilities.length} capabilities • {c.auditEntries} audit entries</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.enterprise && <Badge variant="outline" className="text-[8px]">Enterprise</Badge>}
                  {c.approvalRequired && <Badge variant="outline" className="text-[8px]"><Lock className="w-2 h-2 mr-0.5" />Approval</Badge>}
                  <Badge variant={c.status === "active" ? "default" : c.status === "error" ? "destructive" : "secondary"} className="text-[9px] capitalize">{c.status}</Badge>
                  <StalenessIndicator lastUpdated={c.lastSync} thresholdSeconds={3600} />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="lifecycle">
            {DEMO_connectors.map(c => (
              <Card key={c.id} className="bg-card/50 border-border/50 mb-2">
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-foreground mb-2">{c.name}</p>
                  <div className="flex items-center gap-1">
                    {lifecycleStates.map((state, i) => {
                      const isActive = state === c.lifecycleState;
                      const isPast = lifecycleStates.indexOf(c.lifecycleState) > i;
                      return (
                        <div key={state} className="flex items-center gap-1">
                          <div className={cn("h-1.5 rounded-full flex-1 min-w-[40px]", isActive ? "bg-primary" : isPast ? "bg-primary/30" : "bg-muted/30")} />
                          <span className={cn("text-[8px]", isActive ? "text-primary font-bold" : "text-muted-foreground")}>{state}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="health">
            {DEMO_connectors.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <Activity className={cn("w-3.5 h-3.5", c.health > 90 ? "text-green-400" : c.health > 50 ? "text-amber-400" : "text-red-400")} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.failureCount} failures • Sync: {c.syncStatus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={c.health} className="w-20 h-1.5" />
                  <span className={cn("text-xs font-bold", c.health > 90 ? "text-green-400" : c.health > 50 ? "text-amber-400" : "text-red-400")}>{c.health}%</span>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="capabilities">
            {DEMO_connectors.map(c => (
              <Card key={c.id} className="bg-card/50 border-border/50 mb-2">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-foreground">{c.name}</p>
                    <DurabilityStateBadge state={c.status === "active" ? "persisted" : "transient"} compact />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {c.capabilities.map(cap => (
                      <Badge key={cap} variant="outline" className={cn("text-[9px]", cap.startsWith("write") ? "border-amber-500/30 text-amber-400" : "border-green-500/30 text-green-400")}>{cap}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="audit">
            <div className="relative pl-4 border-l border-border/40 space-y-2">
              {DEMO_auditTimeline.map((e, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2 bg-primary border-primary/50" />
                  <div className="p-2.5 bg-muted/20 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs text-foreground">{e.action}</p>
                      <p className="text-[10px] text-muted-foreground">{e.connector} • {e.actor}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-muted-foreground">{e.receiptId}</span>
                      <StalenessIndicator lastUpdated={e.time} thresholdSeconds={3600} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recovery">
            {DEMO_connectors.filter(c => c.status === "error" || c.failureCount > 0).map(c => (
              <Card key={c.id} className={cn("border-border/50 mb-2", c.status === "error" ? "bg-red-500/5 border-red-500/20" : "bg-card/50")}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn("w-4 h-4", c.status === "error" ? "text-red-400" : "text-amber-400")} />
                      <span className="text-xs font-medium text-foreground">{c.name}</span>
                    </div>
                    <Badge variant={c.status === "error" ? "destructive" : "secondary"} className="text-[9px]">{c.syncStatus}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{c.failureCount} failures recorded • Last sync {c.lastSync ? `${Math.round((Date.now() - new Date(c.lastSync).getTime()) / 3600000)}h ago` : "never"}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-[10px] h-6 gap-0.5"><RotateCcw className="w-2.5 h-2.5" />Reconnect</Button>
                    <Button variant="outline" size="sm" className="text-[10px] h-6 gap-0.5"><Play className="w-2.5 h-2.5" />Retry Sync</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {DEMO_connectors.filter(c => c.status === "error" || c.failureCount > 0).length === 0 && (
              <div className="p-6 text-center bg-green-500/5 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-green-400">All connectors healthy — no recovery needed</p>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
