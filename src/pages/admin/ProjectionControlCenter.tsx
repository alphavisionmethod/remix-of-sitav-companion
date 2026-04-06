import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart3, CheckCircle, AlertTriangle, Clock, RefreshCw, Database, Layers, ArrowRight, XCircle, Zap } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

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

interface ReadModel {
  id: string;
  name: string;
  source: string;
  freshness: FreshnessState;
  lagMs: number;
  lastRebuilt: string;
  affectedSurfaces: string[];
  eventToProjectionDelay: number;
  rebuildSuccess: boolean;
}

const MODELS: ReadModel[] = [
  { id: "rm-1", name: "Dashboard Metrics", source: "events → aggregator", freshness: "fresh", lagMs: 450, lastRebuilt: "2026-04-05T10:20:00Z", affectedSurfaces: ["AdminDashboard", "MissionControl"], eventToProjectionDelay: 450, rebuildSuccess: true },
  { id: "rm-2", name: "Incident Summary", source: "incidents → materializer", freshness: "fresh", lagMs: 200, lastRebuilt: "2026-04-05T10:22:00Z", affectedSurfaces: ["IncidentCommand"], eventToProjectionDelay: 200, rebuildSuccess: true },
  { id: "rm-3", name: "Connector Health", source: "connector_sync → projector", freshness: "stale", lagMs: 18500, lastRebuilt: "2026-04-05T09:55:00Z", affectedSurfaces: ["ConnectorGovernance", "MissionControl"], eventToProjectionDelay: 18500, rebuildSuccess: true },
  { id: "rm-4", name: "Proof Coverage Matrix", source: "audit_logs → proof_builder", freshness: "fresh", lagMs: 800, lastRebuilt: "2026-04-05T10:19:00Z", affectedSurfaces: ["ProofMatrix"], eventToProjectionDelay: 800, rebuildSuccess: true },
  { id: "rm-5", name: "Fleet Predictions", source: "device_statuses → ml_pipeline", freshness: "degraded", lagMs: 65000, lastRebuilt: "2026-04-05T08:30:00Z", affectedSurfaces: ["FleetHealth", "IntelligenceDashboard"], eventToProjectionDelay: 65000, rebuildSuccess: false },
  { id: "rm-6", name: "Revenue Analytics", source: "invoices → revenue_projector", freshness: "fresh", lagMs: 1200, lastRebuilt: "2026-04-05T10:18:00Z", affectedSurfaces: ["RevenueOffice"], eventToProjectionDelay: 1200, rebuildSuccess: true },
];

const ProjectionControlCenter = () => {
  const freshCount = MODELS.filter(m => m.freshness === "fresh").length;
  const avgLag = Math.round(MODELS.reduce((s, m) => s + m.lagMs, 0) / MODELS.length);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Projection Control Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Read-model freshness and materialized view truth</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { label: "Fresh Models", value: `${freshCount}/${MODELS.length}`, color: freshCount === MODELS.length ? "text-emerald-500" : "text-amber-500" },
            { label: "Average Lag", value: avgLag < 1000 ? `${avgLag}ms` : `${(avgLag / 1000).toFixed(1)}s`, color: avgLag < 5000 ? "text-emerald-500" : "text-amber-500" },
            { label: "Rebuild Queue", value: "1", color: "text-blue-500" },
            { label: "Degraded Models", value: String(MODELS.filter(m => m.freshness === "degraded" || m.freshness === "fallback").length), color: "text-orange-500" },
          ].map(m => (
            <Card key={m.label}>
              <CardContent className="p-4">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Read Model Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {MODELS.map((model) => {
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
                      <span>Last rebuilt: {new Date(model.lastRebuilt).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {model.affectedSurfaces.map(s => (
                        <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">{s}</Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProjectionControlCenter;
