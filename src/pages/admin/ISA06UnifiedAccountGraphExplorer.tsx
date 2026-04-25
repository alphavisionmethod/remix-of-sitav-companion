import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { Network, Shield, Plug, Smartphone, Users, ArrowRight, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const nodeTypeConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  identity_provider: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Shield className="h-4 w-4" />, label: "Identity" },
  connector_service: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <Plug className="h-4 w-4" />, label: "Connector" },
  device: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: <Smartphone className="h-4 w-4" />, label: "Device" },
  workspace: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: <Users className="h-4 w-4" />, label: "Workspace" },
  user: { color: "bg-primary/20 text-primary border-primary/30", icon: <Users className="h-4 w-4" />, label: "User" },
};

const statusIcons: Record<string, React.ReactNode> = {
  active: <CheckCircle className="h-3 w-3 text-green-400" />,
  inactive: <AlertTriangle className="h-3 w-3 text-yellow-400" />,
  revoked: <XCircle className="h-3 w-3 text-red-400" />,
};

export default function ISA06UnifiedAccountGraphExplorer() {
  const { data: nodes = [] } = useQuery({
    queryKey: ["isa06-graph-nodes"],
    queryFn: async () => {
      const { data } = await db.from("unified_account_nodes")
        .select("*")
        .order("node_type")
        .order("display_name");
      return data || [];
    },
  });

  const { data: edges = [] } = useQuery({
    queryKey: ["isa06-graph-edges"],
    queryFn: async () => {
      const { data } = await db.from("unified_account_edges")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const byType = nodes.reduce((acc: Record<string, any[]>,  n: Record<string, any>) => {
    const t = n.node_type || "unknown";
    if (!acc[t]) acc[t] = [];
    acc[t].push(n);
    return acc;
  }, {});

  const identityNodes = byType["identity_provider"] || [];
  const connectorNodes = byType["connector_service"] || [];
  const deviceNodes = byType["device"] || [];

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Network className="h-6 w-6 text-primary" /> Unified Account Graph
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Identity links, connected services, devices, and relationships — linked but never collapsed.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-card border-border"><CardContent className="pt-3">
          <p className="text-xs text-muted-foreground">Total Nodes</p>
          <p className="text-xl font-bold">{nodes.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Identity</p>
          <p className="text-xl font-bold text-blue-400">{identityNodes.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Plug className="h-3 w-3" /> Connector</p>
          <p className="text-xl font-bold text-green-400">{connectorNodes.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Smartphone className="h-3 w-3" /> Devices</p>
          <p className="text-xl font-bold text-purple-400">{deviceNodes.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-3">
          <p className="text-xs text-muted-foreground">Edges</p>
          <p className="text-xl font-bold">{edges.length}</p>
        </CardContent></Card>
      </div>

      {/* Graph Nodes by Type */}
      {Object.entries(byType).map(([type, typeNodes]: [string, any[]]) => {
        const config = nodeTypeConfig[type] || { color: "bg-muted text-muted-foreground border-border", icon: null, label: type };
        return (
          <Card key={type} className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {config.icon} {config.label} Nodes ({typeNodes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {typeNodes.map((node: Record<string, any>) => (
                  <Card key={node.id} className={`border ${config.color} bg-opacity-5`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{node.display_name}</p>
                        {statusIcons[node.node_type] || statusIcons.active}
                      </div>
                      <div className="space-y-0.5 text-xs text-muted-foreground">
                        <p>Key: <code className="bg-muted px-1 rounded">{node.entity_id || node.id?.slice(0, 8)}</code></p>
                        {node.workspace_id && <p>Workspace: {node.workspace_id.slice(0, 8)}</p>}
                        <p>Type: {node.node_type || "unknown"}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {nodes.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            No account graph nodes. Sign in and connect services to populate the graph.
          </CardContent>
        </Card>
      )}

      {/* Edges */}
      {edges.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Graph Edges</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {edges.map((edge: Record<string, any>) => {
                const fromNode = nodes.find((n: Record<string, any>) => n.id === edge.from_node_id);
                const toNode = nodes.find((n: Record<string, any>) => n.id === edge.to_node_id);
                return (
                  <div key={edge.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30">
                    <span className="font-medium">{fromNode?.display_name || edge.from_node_id?.slice(0, 8)}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{toNode?.display_name || edge.to_node_id?.slice(0, 8)}</span>
                    <Badge variant="outline" className="text-xs ml-auto">{edge.edge_type}</Badge>
                    {edge.strength != null && (
                      <span className="text-xs text-muted-foreground">{Math.round(edge.strength * 100)}%</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
