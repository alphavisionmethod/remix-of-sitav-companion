import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaCard";
import { ProjectionFreshnessIndicator } from "@/platform/sita/components/sita/truth/ProjectionFreshnessIndicator";
import { SourceOfTruthDisclosure } from "@/platform/sita/components/sita/truth/SourceOfTruthDisclosure";
import { DegradedStateBanner } from "@/platform/sita/components/sita/truth/DegradedStateBanner";
import { TruthBadge } from "@/platform/sita/components/sita/truth/TruthBadge";
import {
  Database, RefreshCw, Activity, BarChart3, Clock, CheckCircle, AlertTriangle,
  XCircle, Layers, Eye, Zap, Shield, Settings, RotateCcw, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

const projections = [
  { key: "boardroom-synthesis", domain: "boardroom", source: "calculation" as const, status: "fresh" as const, confidence: 0.95, threshold: 3600000, lastMaterialized: h(0.2), eventLag: 0, classification: "Sovereign Calculation", rebuildable: true, fallbackMasked: false },
  { key: "timeline-feed", domain: "timeline", source: "database" as const, status: "fresh" as const, confidence: 0.98, threshold: 300000, lastMaterialized: h(0.05), eventLag: 0, classification: "Event-Sourced", rebuildable: true, fallbackMasked: false },
  { key: "inbox-projection", domain: "inbox", source: "database" as const, status: "fresh" as const, confidence: 0.97, threshold: 60000, lastMaterialized: h(0.02), eventLag: 1, classification: "Event-Sourced", rebuildable: true, fallbackMasked: false },
  { key: "approval-queue", domain: "approvals", source: "database" as const, status: "fresh" as const, confidence: 1.0, threshold: 30000, lastMaterialized: h(0.01), eventLag: 0, classification: "Live Query", rebuildable: false, fallbackMasked: false },
  { key: "receipt-chain", domain: "receipts", source: "calculation" as const, status: "fresh" as const, confidence: 1.0, threshold: 7200000, lastMaterialized: h(0.5), eventLag: 0, classification: "Append-Only Chain", rebuildable: true, fallbackMasked: false },
  { key: "owner-home-pulse", domain: "owner-home", source: "calculation" as const, status: "fresh" as const, confidence: 0.94, threshold: 300000, lastMaterialized: h(0.1), eventLag: 2, classification: "Composite Projection", rebuildable: true, fallbackMasked: false },
  { key: "mission-overview", domain: "mission", source: "database" as const, status: "stale" as const, confidence: 0.85, threshold: 600000, lastMaterialized: h(0.5), eventLag: 5, classification: "Materialized View", rebuildable: true, fallbackMasked: true },
  { key: "mission-registry", domain: "registry", source: "database" as const, status: "fresh" as const, confidence: 0.99, threshold: 3600000, lastMaterialized: h(0.3), eventLag: 0, classification: "Live Query", rebuildable: false, fallbackMasked: false },
  { key: "ai-team-state", domain: "advisors", source: "database" as const, status: "fresh" as const, confidence: 0.96, threshold: 900000, lastMaterialized: h(0.1), eventLag: 0, classification: "Hybrid", rebuildable: true, fallbackMasked: false },
  { key: "cross-domain-kpis", domain: "analytics", source: "calculation" as const, status: "degraded" as const, confidence: 0.72, threshold: 1800000, lastMaterialized: h(2), eventLag: 12, classification: "Composite Projection", rebuildable: true, fallbackMasked: true },
  { key: "concierge-state", domain: "concierge", source: "connector" as const, status: "stale" as const, confidence: 0.8, threshold: 1800000, lastMaterialized: h(3), eventLag: 8, classification: "External-Fed", rebuildable: false, fallbackMasked: true },
  { key: "digital-presence", domain: "presence", source: "connector" as const, status: "stale" as const, confidence: 0.65, threshold: 7200000, lastMaterialized: h(8), eventLag: 3, classification: "External-Fed", rebuildable: false, fallbackMasked: true },
  { key: "store-catalog", domain: "store", source: "database" as const, status: "fresh" as const, confidence: 0.99, threshold: 14400000, lastMaterialized: h(1), eventLag: 0, classification: "Live Query", rebuildable: false, fallbackMasked: false },
  { key: "connector-health", domain: "connectors", source: "connector" as const, status: "degraded" as const, confidence: 0.7, threshold: 300000, lastMaterialized: h(0.8), eventLag: 0, classification: "Health Probe", rebuildable: false, fallbackMasked: true },
];

const classifications = [...new Set(projections.map(p => p.classification))];

const surfaceTruth = [
  { surface: "Boardroom", sources: ["boardroom-synthesis", "ai-team-state"], truthLevel: "Sovereign", fallbackRisk: "Low" },
  { surface: "Owner Home", sources: ["owner-home-pulse", "cross-domain-kpis"], truthLevel: "Composite", fallbackRisk: "Medium" },
  { surface: "Mission Control", sources: ["mission-overview", "connector-health", "ai-team-state"], truthLevel: "Mixed", fallbackRisk: "Medium" },
  { surface: "Approvals", sources: ["approval-queue"], truthLevel: "Live", fallbackRisk: "None" },
  { surface: "Receipts & Proof", sources: ["receipt-chain"], truthLevel: "Append-Only", fallbackRisk: "None" },
  { surface: "Timeline", sources: ["timeline-feed"], truthLevel: "Event-Sourced", fallbackRisk: "Low" },
  { surface: "Digital Presence", sources: ["digital-presence"], truthLevel: "External", fallbackRisk: "High" },
  { surface: "Concierge", sources: ["concierge-state"], truthLevel: "External", fallbackRisk: "High" },
];

const materializationQueue = [
  { projection: "cross-domain-kpis", priority: "high", queuedAt: h(0.1), estimatedMs: 4500, status: "processing" as const, attempt: 2 },
  { projection: "mission-overview", priority: "medium", queuedAt: h(0.05), estimatedMs: 2200, status: "queued" as const, attempt: 1 },
  { projection: "connector-health", priority: "high", queuedAt: h(0.02), estimatedMs: 800, status: "queued" as const, attempt: 1 },
  { projection: "concierge-state", priority: "low", queuedAt: h(0.3), estimatedMs: 3500, status: "blocked" as const, attempt: 3 },
];

export default function ProjectionControlCenter() {
  const [tab, setTab] = useState("projections");
  const fresh = projections.filter(p => p.status === "fresh").length;
  const stale = projections.filter(p => p.status === "stale").length;
  const degraded = projections.filter(p => p.status === "degraded").length;
  const avgConf = projections.reduce((s, p) => s + p.confidence, 0) / projections.length;
  const totalLag = projections.reduce((s, p) => s + p.eventLag, 0);
  const masked = projections.filter(p => p.fallbackMasked).length;

  const handleRebuild = (key: string) => {
    toast.success(`Rebuild queued for ${key}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="Projection Control Center" subtitle="Read-model materialization, freshness, fallback masking audit, rebuild controls, materialization queue, and honest staleness" />

      {degraded > 0 && (
        <DegradedStateBanner severity="warning" reason={`${degraded} projection(s) in degraded state — composite surfaces may show partial truth`} impact="Cross-domain KPIs and connector health affected" affectedCapabilities={projections.filter(p => p.status === "degraded").map(p => p.key)} dismissible />
      )}

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Fresh", value: fresh, color: "text-green-400" },
          { label: "Stale", value: stale, color: "text-amber-400" },
          { label: "Degraded", value: degraded, color: "text-red-400" },
          { label: "Avg Confidence", value: `${Math.round(avgConf * 100)}%`, color: avgConf > 0.9 ? "text-green-400" : "text-amber-400" },
          { label: "Event Lag", value: totalLag, color: totalLag > 10 ? "text-amber-400" : "text-green-400" },
          { label: "Fallback Masked", value: masked, color: masked > 0 ? "text-red-400" : "text-green-400" },
        ].map((kpi, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</p>
              <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5 flex-wrap">
          {[
            { value: "projections", label: "Projections", icon: Database },
            { value: "surfaces", label: "Surface Truth", icon: Eye },
            { value: "fallback", label: "Fallback Audit", icon: Shield },
            { value: "queue", label: "Materialization Queue", icon: Loader2 },
            { value: "classifications", label: "Classification", icon: Layers },
            { value: "lag", label: "Event Lag", icon: Activity },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1">
              <t.icon className="h-3 w-3" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-3">
          <TabsContent value="projections">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold">All Projections ({projections.length})</h3>
              <Button variant="ghost" size="sm" className="text-[10px] gap-1 h-6" onClick={() => toast.success("Rebuilding all stale projections")}><RefreshCw className="w-3 h-3" /> Rebuild All Stale</Button>
            </div>
            <div className="space-y-2">
              {projections.map(p => (
                <div key={p.key} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{p.key}</p>
                      <p className="text-[10px] text-muted-foreground">{p.classification} • {p.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.fallbackMasked && <Badge variant="destructive" className="text-[8px]">Fallback</Badge>}
                    {p.eventLag > 0 && <Badge variant="outline" className="text-[8px]">{p.eventLag} behind</Badge>}
                    <TruthBadge status={p.status} source={p.source} confidence={p.confidence} lastUpdated={p.lastMaterialized} />
                    {p.rebuildable && <Button variant="ghost" size="sm" className="h-5 text-[9px] gap-0.5" onClick={() => handleRebuild(p.key)}><RefreshCw className="w-2.5 h-2.5" />Rebuild</Button>}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="surfaces">
            <h3 className="text-xs font-semibold mb-3">Surface → Truth Classification</h3>
            <div className="space-y-2">
              {surfaceTruth.map(s => (
                <div key={s.surface} className="p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground">{s.surface}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px]">{s.truthLevel}</Badge>
                      <Badge variant={s.fallbackRisk === "None" ? "default" : s.fallbackRisk === "Low" ? "secondary" : s.fallbackRisk === "Medium" ? "secondary" : "destructive"} className="text-[8px]">
                        Fallback Risk: {s.fallbackRisk}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {s.sources.map(src => {
                      const proj = projections.find(p => p.key === src);
                      return proj ? <TruthBadge key={src} status={proj.status} source={proj.source} confidence={proj.confidence} lastUpdated={proj.lastMaterialized} /> : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fallback">
            <h3 className="text-xs font-semibold mb-3">Fallback Masking Audit</h3>
            <p className="text-[10px] text-muted-foreground mb-3">Projections currently serving fallback/cached data instead of live truth. Users may see stale information.</p>
            <div className="space-y-2">
              {projections.filter(p => p.fallbackMasked).map(p => (
                <div key={p.key} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{p.key}</p>
                      <p className="text-[10px] text-muted-foreground">{p.classification} • Confidence: {Math.round(p.confidence * 100)}% • Lag: {p.eventLag} events</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-[9px]">{p.status}</Badge>
                    {p.rebuildable && <Button variant="ghost" size="sm" className="h-5 text-[9px]" onClick={() => handleRebuild(p.key)}><RefreshCw className="w-2.5 h-2.5" />Fix</Button>}
                  </div>
                </div>
              ))}
              {projections.filter(p => !p.fallbackMasked).length > 0 && (
                <div className="p-3 text-center bg-green-500/5 border border-green-500/20 rounded-lg mt-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-xs text-green-400">{projections.filter(p => !p.fallbackMasked).length} projections serving live truth</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="queue">
            <h3 className="text-xs font-semibold mb-3">Materialization Queue ({materializationQueue.length})</h3>
            <div className="space-y-2">
              {materializationQueue.map(q => (
                <div key={q.projection} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    {q.status === "processing" ? <Loader2 className="w-4 h-4 text-blue-400 animate-spin" /> :
                     q.status === "blocked" ? <XCircle className="w-4 h-4 text-red-400" /> :
                     <Clock className="w-4 h-4 text-muted-foreground" />}
                    <div>
                      <p className="text-xs font-medium text-foreground">{q.projection}</p>
                      <p className="text-[10px] text-muted-foreground">Est: {q.estimatedMs}ms • Attempt #{q.attempt} • Priority: {q.priority}</p>
                    </div>
                  </div>
                  <Badge variant={q.status === "processing" ? "default" : q.status === "blocked" ? "destructive" : "secondary"} className="text-[9px] capitalize">{q.status}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="classifications">
            <h3 className="text-xs font-semibold mb-3">By Classification</h3>
            {classifications.map(cls => (
              <div key={cls} className="mb-4">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">{cls}</p>
                <div className="space-y-1.5">
                  {projections.filter(p => p.classification === cls).map(p => (
                    <ProjectionFreshnessIndicator key={p.key} domain={p.key} lastMaterialized={p.lastMaterialized} thresholdMs={p.threshold} eventLag={p.eventLag} rebuildAvailable={p.rebuildable} />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="lag">
            <h3 className="text-xs font-semibold mb-3">Event-to-Projection Lag</h3>
            <div className="space-y-2">
              {projections.filter(p => p.eventLag > 0).sort((a, b) => b.eventLag - a.eventLag).map(p => (
                <div key={p.key} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className={cn("w-3.5 h-3.5", p.eventLag > 5 ? "text-red-400" : "text-amber-400")} />
                    <div>
                      <p className="text-xs font-medium text-foreground">{p.key}</p>
                      <p className="text-[10px] text-muted-foreground">{p.domain}{p.fallbackMasked ? " • ⚠ serving fallback" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", p.eventLag > 5 ? "text-red-400" : "text-amber-400")}>{p.eventLag}</p>
                      <p className="text-[9px] text-muted-foreground">events behind</p>
                    </div>
                    <Progress value={Math.max(0, 100 - p.eventLag * 10)} className="w-16 h-1.5" />
                  </div>
                </div>
              ))}
              {projections.filter(p => p.eventLag === 0).length > 0 && (
                <div className="p-3 text-center bg-green-500/5 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-xs text-green-400">{projections.filter(p => p.eventLag === 0).length} projections fully caught up</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}