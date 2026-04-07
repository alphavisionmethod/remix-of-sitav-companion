import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Network, ArrowRight, AlertTriangle, Bug, Server, Layout, Database, Shield, Zap } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const GRAPH_NODES = [
  { id: "symptom-1", type: "symptom" as const, label: "500 errors on /api/projections/rebuild", severity: "critical" },
  { id: "symptom-2", type: "symptom" as const, label: "Stale projection data on admin dashboard", severity: "high" },
  { id: "symptom-3", type: "symptom" as const, label: "Timeout on boardroom synthesis", severity: "medium" },
  { id: "service-1", type: "service" as const, label: "Projection Service", health: 62 },
  { id: "service-2", type: "service" as const, label: "Cache Layer (Redis)", health: 78 },
  { id: "service-3", type: "service" as const, label: "Edge Function: rebuild-projections", health: 45 },
  { id: "release-1", type: "release" as const, label: "v2.14.3 — Cache strategy update", deployedAt: "Apr 4" },
  { id: "config-1", type: "config" as const, label: "PROJECTION_REBUILD_CONCURRENCY=5", changedAt: "Apr 3" },
  { id: "root-1", type: "root_cause" as const, label: "Race condition: concurrent rebuilds corrupt cache entries", confidence: 87 },
];

const GRAPH_EDGES = [
  { from: "symptom-1", to: "service-3", label: "triggers" },
  { from: "symptom-2", to: "service-2", label: "served by" },
  { from: "symptom-3", to: "service-1", label: "depends on" },
  { from: "service-3", to: "service-2", label: "writes to" },
  { from: "service-1", to: "service-2", label: "reads from" },
  { from: "release-1", to: "service-3", label: "changed" },
  { from: "config-1", to: "service-3", label: "configured" },
  { from: "service-3", to: "root-1", label: "likely cause" },
  { from: "service-2", to: "root-1", label: "likely cause" },
];

const typeStyles: Record<string, { icon: typeof Bug; color: string; bg: string }> = {
  symptom: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  service: { icon: Server, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  release: { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  config: { icon: Database, color: "text-muted-foreground", bg: "bg-muted border-border/40" },
  root_cause: { icon: Bug, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
};

const AIRootCauseGraph = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>("root-1");
  const selected = GRAPH_NODES.find(n => n.id === selectedNode);
  const connectedEdges = GRAPH_EDGES.filter(e => e.from === selectedNode || e.to === selectedNode);
  const connectedNodes = connectedEdges.map(e => e.from === selectedNode ? e.to : e.from);

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <AdminPageHeader icon={Network} title="Root Cause Graph" subtitle="Visual graph linking symptoms → services → releases → configs → likely root causes" accent="destructive" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Visualization (structured list view) */}
        <div className="lg:col-span-2 space-y-4">
          {(["symptom", "service", "release", "config", "root_cause"] as const).map(type => {
            const nodes = GRAPH_NODES.filter(n => n.type === type);
            if (!nodes.length) return null;
            const style = typeStyles[type];
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <style.icon className={`h-3.5 w-3.5 ${style.color}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{type.replace("_", " ")}s</span>
                </div>
                <div className="space-y-1">
                  {nodes.map(n => (
                    <div
                      key={n.id}
                      onClick={() => setSelectedNode(n.id === selectedNode ? null : n.id)}
                      className={`rounded-xl border p-3 cursor-pointer transition-all ${
                        n.id === selectedNode ? `${style.bg} ring-1 ring-primary/30` :
                        connectedNodes.includes(n.id) ? `${style.bg} opacity-90` :
                        "border-border/40 bg-card hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{n.label}</span>
                        {"severity" in n && <Badge variant={n.severity === "critical" ? "destructive" : "outline"} className="text-[10px]">{n.severity}</Badge>}
                        {"health" in n && <Badge variant="outline" className="text-[10px]">{n.health}% health</Badge>}
                        {"confidence" in n && <Badge variant="destructive" className="text-[10px]">{n.confidence}% confidence</Badge>}
                        {"deployedAt" in n && <Badge variant="outline" className="text-[10px]">{n.deployedAt}</Badge>}
                        {"changedAt" in n && <Badge variant="outline" className="text-[10px]">{n.changedAt}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Connection Detail Panel */}
        <div className="rounded-xl border border-border/40 bg-card p-5">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Selected Node</p>
                <h3 className="font-semibold text-sm">{selected.label}</h3>
                <Badge variant="outline" className="text-[10px] mt-1">{selected.type.replace("_", " ")}</Badge>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Connections ({connectedEdges.length})</p>
                <div className="space-y-2">
                  {connectedEdges.map((e, i) => {
                    const other = GRAPH_NODES.find(n => n.id === (e.from === selectedNode ? e.to : e.from));
                    const direction = e.from === selectedNode ? "→" : "←";
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{direction}</span>
                        <Badge variant="outline" className="text-[10px]">{e.label}</Badge>
                        <span className="font-medium truncate">{other?.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {selected.type === "root_cause" && (
                <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3">
                  <p className="text-xs font-semibold text-destructive mb-1">Root Cause Identified</p>
                  <p className="text-xs">{selected.label}</p>
                  {"confidence" in selected && <p className="text-xs text-muted-foreground mt-1">Confidence: {selected.confidence}%</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <Network className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Select a node to see connections</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRootCauseGraph;
