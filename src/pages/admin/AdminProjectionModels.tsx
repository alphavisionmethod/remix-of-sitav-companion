import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, CheckCircle, AlertTriangle, Clock, RefreshCw, Database, Layers, XCircle, Zap, Eye, ArrowRight, Activity } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type FreshnessState = "fresh" | "stale" | "rebuilding" | "degraded" | "fallback";
const freshnessConfig: Record<FreshnessState, { color: string; label: string }> = {
  fresh: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Fresh" },
  stale: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Stale" },
  rebuilding: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Rebuilding" },
  degraded: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", label: "Degraded" },
  fallback: { color: "bg-red-500/10 text-red-500 border-red-500/20", label: "Fallback" },
};

type TruthClass = "durable" | "materialized" | "stale" | "fallback" | "degraded" | "unknown";
const SURFACE_TRUTH: { surface: string; classification: TruthClass; model: string; lastChecked: string; dependencies: string[] }[] = [
  { surface: "AdminDashboard", classification: "materialized", model: "Dashboard Metrics", lastChecked: "2026-04-05T10:20:00Z", dependencies: ["events", "aggregator"] },
  { surface: "IncidentCommand", classification: "durable", model: "Incident Summary", lastChecked: "2026-04-05T10:22:00Z", dependencies: ["incidents", "materializer"] },
  { surface: "ConnectorGovernance", classification: "stale", model: "Connector Health", lastChecked: "2026-04-05T09:55:00Z", dependencies: ["connector_sync", "projector"] },
  { surface: "FleetHealth", classification: "degraded", model: "Fleet Predictions", lastChecked: "2026-04-05T08:30:00Z", dependencies: ["device_statuses", "ml_pipeline"] },
  { surface: "ProofMatrix", classification: "materialized", model: "Proof Coverage Matrix", lastChecked: "2026-04-05T10:19:00Z", dependencies: ["audit_logs", "proof_builder"] },
  { surface: "RevenueOffice", classification: "durable", model: "Revenue Analytics", lastChecked: "2026-04-05T10:18:00Z", dependencies: ["invoices", "revenue_projector"] },
  { surface: "MissionControl", classification: "materialized", model: "Dashboard Metrics", lastChecked: "2026-04-05T10:20:00Z", dependencies: ["events", "aggregator"] },
];

const truthClassColor: Record<TruthClass, string> = {
  durable: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  materialized: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  stale: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  fallback: "bg-red-500/10 text-red-500 border-red-500/20",
  degraded: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  unknown: "bg-muted text-muted-foreground border-muted",
};

const REBUILD_QUEUE = [
  { id: "rq-1", model: "Connector Health", priority: "high", reason: "Stale >15m", estimatedTime: "~45s", status: "queued" as const },
  { id: "rq-2", model: "Fleet Predictions", priority: "critical", reason: "ML pipeline failure", estimatedTime: "~3m", status: "queued" as const },
];

const REBUILD_HISTORY = [
  { id: "rh-1", model: "Dashboard Metrics", result: "success" as const, duration: "1.2s", rebuiltAt: "2026-04-05T10:20:00Z", eventRange: "1,247 events" },
  { id: "rh-2", model: "Proof Coverage Matrix", result: "success" as const, duration: "3.8s", rebuiltAt: "2026-04-05T10:19:00Z", eventRange: "892 events" },
  { id: "rh-3", model: "Fleet Predictions", result: "failed" as const, duration: "12.4s", rebuiltAt: "2026-04-05T08:30:00Z", eventRange: "2,341 events" },
];

const ProjectionControlCenter = () => {
  const [tab, setTab] = useState("inventory");
  const freshCount = ([] as never[]).filter(m => m.freshness === "fresh").length;
  const avgLag = Math.round(([] as never[]).reduce((s, m) => s + m.lagMs, 0) / ([] as never[]).length);
  const degradedCount = ([] as never[]).filter(m => m.freshness === "degraded" || m.freshness === "fallback").length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Projection Control Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Read-model freshness · Surface truth · Fallback audit · Rebuild control</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Fresh Models", value: `${freshCount}/${([] as never[]).length}`, color: freshCount === ([] as never[]).length ? "text-emerald-500" : "text-amber-500" },
            { label: "Average Lag", value: avgLag < 1000 ? `${avgLag}ms` : `${(avgLag / 1000).toFixed(1)}s`, color: avgLag < 5000 ? "text-emerald-500" : "text-amber-500" },
            { label: "Rebuild Queue", value: String(REBUILD_QUEUE.length), color: "text-blue-500" },
            { label: "Degraded Models", value: String(degradedCount), color: degradedCount === 0 ? "text-emerald-500" : "text-orange-500" },
          ].map(m => (
            <Card key={m.label}><CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </CardContent></Card>
          ))}
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="inventory">Read Model Inventory</TabsTrigger>
            <TabsTrigger value="surface-truth">Surface Truth</TabsTrigger>
            <TabsTrigger value="rebuild">Rebuild Queue</TabsTrigger>
            <TabsTrigger value="history">Rebuild History</TabsTrigger>
            <TabsTrigger value="fallback">Fallback Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-4 space-y-2">
            {([] as never[]).map((model) => {
              const cfg = freshnessConfig[model.freshness];
              return (
                <div key={model.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{model.name}</span>
                      <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>{cfg.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {model.rebuildSuccess ? (
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Build ✓</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-500 border-red-500/20">Build ✗</Badge>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 text-[10px]"><RefreshCw className="h-3 w-3 mr-1" /> Rebuild</Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-2">
                    <span>Source: <span className="text-foreground font-mono">{model.source}</span></span>
                    <span>Lag: <span className={model.lagMs > 10000 ? "text-amber-500 font-medium" : "text-foreground"}>{model.lagMs < 1000 ? `${model.lagMs}ms` : `${(model.lagMs / 1000).toFixed(1)}s`}</span></span>
                    <span>Event delay: <span className="text-foreground">{model.eventToProjectionDelay < 1000 ? `${model.eventToProjectionDelay}ms` : `${(model.eventToProjectionDelay / 1000).toFixed(1)}s`}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {model.affectedSurfaces.map(s => (<Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">{s}</Badge>))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="surface-truth" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Surface Truth Classification</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {SURFACE_TRUTH.map(st => (
                  <div key={st.surface} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{st.surface}</span>
                        <Badge variant="outline" className={`text-[9px] capitalize ${truthClassColor[st.classification]}`}>{st.classification}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(st.lastChecked).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Model: <span className="text-foreground">{st.model}</span></span>
                      <span>Deps: {st.dependencies.map(d => <Badge key={d} variant="secondary" className="text-[8px] px-1 py-0 mr-0.5">{d}</Badge>)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rebuild" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Rebuild Queue</CardTitle>
                  <Button size="sm" className="h-7 text-xs"><RefreshCw className="h-3 w-3 mr-1" /> Rebuild All Stale</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {REBUILD_QUEUE.map(rq => (
                  <div key={rq.id} className={`p-3 rounded-lg border ${rq.priority === "critical" ? "border-red-500/30" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{rq.model}</span>
                        <Badge variant="outline" className={`text-[9px] ${rq.priority === "critical" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>{rq.priority}</Badge>
                      </div>
                      <Button variant="outline" size="sm" className="h-6 text-[10px]"><Zap className="h-3 w-3 mr-1" /> Rebuild Now</Button>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Reason: <span className="text-foreground">{rq.reason}</span></span>
                      <span>ETA: <span className="text-foreground">{rq.estimatedTime}</span></span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Rebuild History</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {REBUILD_HISTORY.map(rh => (
                  <div key={rh.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {rh.result === "success" ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="text-sm font-medium text-foreground">{rh.model}</span>
                        <Badge variant="outline" className={`text-[9px] ${rh.result === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>{rh.result}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(rh.rebuiltAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Duration: <span className="text-foreground">{rh.duration}</span></span>
                      <span>Events: <span className="text-foreground">{rh.eventRange}</span></span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fallback" className="mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Fallback & Degraded Audit</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {([] as never[]).filter(m => m.freshness === "degraded" || m.freshness === "fallback" || m.freshness === "stale").map(model => (
                  <div key={model.id} className={`p-3 rounded-lg border ${model.freshness === "degraded" || model.freshness === "fallback" ? "border-orange-500/20 bg-orange-500/5" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${model.freshness === "fallback" ? "text-red-500" : "text-orange-500"}`} />
                        <span className="text-sm font-medium text-foreground">{model.name}</span>
                        <Badge variant="outline" className={`text-[9px] ${freshnessConfig[model.freshness].color}`}>{freshnessConfig[model.freshness].label}</Badge>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground mb-2">
                      Lag: <span className="text-amber-500 font-medium">{model.lagMs < 1000 ? `${model.lagMs}ms` : `${(model.lagMs / 1000).toFixed(1)}s`}</span> · Affected surfaces: {model.affectedSurfaces.join(", ")}
                    </div>
                    <p className="text-[10px] text-amber-500">⚠ Surfaces using this model may show stale or approximate data. Truth disclosure should be visible to operators.</p>
                  </div>
                ))}
                {([] as never[]).filter(m => m.freshness === "degraded" || m.freshness === "fallback" || m.freshness === "stale").length === 0 && (
                  <div className="text-center py-6 text-xs text-muted-foreground"><CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500/50" />All models are fresh — no fallback masking detected</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ProjectionControlCenter;
