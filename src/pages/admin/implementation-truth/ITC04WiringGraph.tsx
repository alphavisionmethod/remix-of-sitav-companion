// ═══════════════════════════════════════════════════════════════
// ITC04 — Wiring Graph Explorer
// Per-spec directed graph: spec → route → component → hook →
// contract → service → event → projection → proof
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Shield } from "lucide-react";
import { useSpecRegistry, useWiringEdges, type SpecRegistryEntry } from "@/hooks/use-implementation-truth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, ArrowRight, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const NODE_TYPES = ["spec", "route", "component", "hook", "contract", "service", "event", "projection", "proof"] as const;

function StatusIcon({ status }: { status: string }) {
  if (status === "connected") return <CheckCircle2 className="h-3 w-3 text-green-500" />;
  if (status === "broken") return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
  return <XCircle className="h-3 w-3 text-destructive" />;
}

function NodeBadge({ type, name }: { type: string; name: string }) {
  const colors: Record<string, string> = {
    spec: "bg-primary/10 text-primary border-primary/30",
    route: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    component: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    hook: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
    contract: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
    service: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    event: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    projection: "bg-pink-500/10 text-pink-500 border-pink-500/30",
    proof: "bg-green-500/10 text-green-500 border-green-500/30",
  };
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[9px] font-mono ${colors[type] || "bg-muted text-muted-foreground border-border"}`}>
      <span className="font-medium uppercase opacity-60">{type}</span>
      <span>{name}</span>
    </div>
  );
}

export default function ITC04WiringGraph() {
  const { data: specs, isLoading } = useSpecRegistry();
  const [selectedSpec, setSelectedSpec] = useState<string>("");

  const currentSpec = specs?.find(s => s.spec_id === selectedSpec);
  const { data: edges } = useWiringEdges(selectedSpec);

  // Build a synthetic wiring chain from spec requirements if no edges exist
  const buildSyntheticChain = (spec: SpecRegistryEntry) => {
    const chain: { source_type: string; source_name: string; target_type: string; target_name: string; edge_status: string }[] = [];

    // spec → routes
    spec.required_routes.forEach(r => {
      chain.push({ source_type: "spec", source_name: spec.spec_id, target_type: "route", target_name: r, edge_status: "connected" });
    });
    // routes → components
    spec.required_components.forEach((c, i) => {
      const route = spec.required_routes[Math.min(i, spec.required_routes.length - 1)] || spec.spec_id;
      chain.push({ source_type: "route", source_name: route, target_type: "component", target_name: c, edge_status: spec.ui_score > 50 ? "connected" : "missing" });
    });
    // components → contracts
    spec.required_contracts.forEach((ct, i) => {
      const comp = spec.required_components[Math.min(i, spec.required_components.length - 1)] || "unknown";
      chain.push({ source_type: "component", source_name: comp, target_type: "contract", target_name: ct, edge_status: spec.contract_score > 50 ? "connected" : "missing" });
    });
    // contracts → services
    spec.required_services.forEach((svc, i) => {
      const ct = spec.required_contracts[Math.min(i, spec.required_contracts.length - 1)] || "unknown";
      chain.push({ source_type: "contract", source_name: ct, target_type: "service", target_name: svc, edge_status: spec.wiring_score > 50 ? "connected" : "broken" });
    });
    // services → proofs
    spec.required_proofs.forEach((p, i) => {
      const svc = spec.required_services[Math.min(i, spec.required_services.length - 1)] || "unknown";
      chain.push({ source_type: "service", source_name: svc, target_type: "proof", target_name: p, edge_status: spec.runtime_score > 40 ? "connected" : "missing" });
    });

    return chain;
  };

  const displayEdges = edges && edges.length > 0
    ? edges
    : currentSpec
      ? buildSyntheticChain(currentSpec)
      : [];

  const connectedCount = displayEdges.filter(e => e.edge_status === "connected").length;
  const brokenCount = displayEdges.filter(e => e.edge_status === "broken").length;
  const missingCount = displayEdges.filter(e => e.edge_status === "missing").length;

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-foreground">TITLE_PLACEHOLDER</h1>
        <p className="text-sm text-muted-foreground">DESC_PLACEHOLDER</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={selectedSpec} onValueChange={setSelectedSpec}>
          <SelectTrigger className="w-64 h-8 text-sm">
            <SelectValue placeholder="Select a spec…" />
          </SelectTrigger>
          <SelectContent>
            {(specs || []).map(s => (
              <SelectItem key={s.spec_id} value={s.spec_id}>{s.canonical_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedSpec && (
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-green-500">● {connectedCount} connected</span>
            <span className="text-yellow-500">● {brokenCount} broken</span>
            <span className="text-destructive">● {missingCount} missing</span>
          </div>
        )}
      </div>

      {!selectedSpec ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-[11px]">
            Select a spec to explore its wiring graph
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Wiring Chain: {currentSpec?.canonical_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayEdges.length === 0 ? (
              <div className="text-[11px] text-muted-foreground text-center py-8">No wiring edges defined</div>
            ) : (
              <div className="space-y-3">
                {displayEdges.map((edge, i) => (
                  <div key={i} className="flex items-center gap-2 flex-wrap">
                    <NodeBadge type={edge.source_type} name={edge.source_name} />
                    <div className="flex items-center gap-1">
                      <StatusIcon status={edge.edge_status} />
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <NodeBadge type={edge.target_type} name={edge.target_name} />
                    {edge.edge_status !== "connected" && (
                      <Badge variant={edge.edge_status === "broken" ? "secondary" : "destructive"} className="text-[7px] h-4">
                        {edge.edge_status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
