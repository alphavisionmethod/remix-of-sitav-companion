import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Network, ArrowRight, AlertTriangle, Bug, Server, Layout, Database, Shield, Zap } from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { EmptyState } from "@/components/sita/EmptyState";
const typeStyles: Record<string, { icon: typeof Bug; color: string; bg: string }> = {
  symptom: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  service: { icon: Server, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  release: { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  config: { icon: Database, color: "text-muted-foreground", bg: "bg-muted border-border/40" },
  root_cause: { icon: Bug, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
};

const AIRootCauseGraph = () => {
const GRAPH_NODES: any[] = [];
  const { isDemo } = useAIEngDomain("violations", GRAPH_NODES);
  const [selectedNode, setSelectedNode] = useState<string | null>("root-1");
  const selected = ([] as never[]).find(n => n.id === selectedNode);
  const connectedEdges = ([] as never[]).filter(e => e.from === selectedNode || e.to === selectedNode);
  const connectedNodes = connectedEdges.map(e => e.from === selectedNode ? e.to : e.from);

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={Network} title="Root Cause Graph" subtitle="Visual graph linking symptoms → services → releases → configs → likely root causes" accent="destructive" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Visualization (structured list view) */}
        <div className="lg:col-span-2 space-y-4">
          {(["symptom", "service", "release", "config", "root_cause"] as const).map(type => {
            const nodes = ([] as never[]).filter(n => n.type === type);
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
                    const other = ([] as never[]).find(n => n.id === (e.from === selectedNode ? e.to : e.from));
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
            <EmptyState
              variant="card"
              icon={Network}
              title="No node selected"
              description="Select a node to see its connections."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRootCauseGraph;
