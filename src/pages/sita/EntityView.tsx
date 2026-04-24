// ═══════════════════════════════════════════════════════════════
// SITA OS — EntityView (Phase J)
// First-time-navigable surface for the Sita knowledge graph.
// Reads sita_knowledge_nodes + sita_knowledge_edges + cross-refs.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Network, Tag, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Node {
  id: string;
  kind: string;
  label: string;
  body: string | null;
  confidence: number;
  source: string | null;
  metadata: Record<string, unknown>;
  last_seen_at: string;
}

interface Edge {
  id: string;
  from_node_id: string;
  to_node_id: string;
  relation: string;
  weight: number;
  other?: Pick<Node, "id" | "label" | "kind">;
  direction: "out" | "in";
}

export default function EntityView() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { user } = useAuth();
  const [node, setNode] = useState<Node | null>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nodeId || !user?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: n } = await supabase
        .from("sita_knowledge_nodes" as never)
        .select("*")
        .eq("user_id", user.id)
        .eq("id", nodeId)
        .maybeSingle();

      const [outRes, inRes] = await Promise.all([
        supabase.from("sita_knowledge_edges" as never)
          .select("id, from_node_id, to_node_id, relation, weight").eq("user_id", user.id).eq("from_node_id", nodeId),
        supabase.from("sita_knowledge_edges" as never)
          .select("id, from_node_id, to_node_id, relation, weight").eq("user_id", user.id).eq("to_node_id", nodeId),
      ]);

      const allEdges: Edge[] = [
        ...((outRes.data as Edge[] | null) ?? []).map((e) => ({ ...e, direction: "out" as const })),
        ...((inRes.data as Edge[] | null) ?? []).map((e) => ({ ...e, direction: "in" as const })),
      ];
      const otherIds = Array.from(new Set(
        allEdges.map((e) => (e.direction === "out" ? e.to_node_id : e.from_node_id))
      ));
      if (otherIds.length) {
        const { data: others } = await supabase
          .from("sita_knowledge_nodes" as never)
          .select("id, label, kind").in("id", otherIds).eq("user_id", user.id);
        const map = new Map<string, Pick<Node, "id" | "label" | "kind">>();
        for (const o of ((others as Array<Pick<Node, "id" | "label" | "kind">> | null) ?? [])) map.set(o.id, o);
        for (const e of allEdges) {
          const otherId = e.direction === "out" ? e.to_node_id : e.from_node_id;
          e.other = map.get(otherId);
        }
      }

      if (cancelled) return;
      setNode((n as unknown as Node) ?? null);
      setEdges(allEdges);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [nodeId, user?.id]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="p-6">
        <PremiumEmptyState
          variant="no-data"
          title="Entity not found"
          description="This knowledge node doesn't exist or isn't accessible to you."
          actions={[{ label: "Back to Jarvis", onClick: () => history.back(), variant: "primary" }]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-4">
      <SitaPageHeader
        icon={<Network className="h-6 w-6" />}
        title={node.label}
        subtitle={`${node.kind} · confidence ${(node.confidence * 100).toFixed(0)}%`}
      >
        <Button asChild variant="outline" size="sm">
          <Link to="/sita">← Bridge</Link>
        </Button>
      </SitaPageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="h-4 w-4" /> Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {node.body && <p className="text-muted-foreground">{node.body}</p>}
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-[10px]">{node.kind}</Badge>
              {node.source && <Badge variant="outline" className="text-[10px]">source: {node.source}</Badge>}
              <Badge variant="outline" className="text-[10px]">last seen {new Date(node.last_seen_at).toLocaleDateString()}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Network className="h-4 w-4" /> Relationships ({edges.length})</CardTitle></CardHeader>
          <CardContent>
            {edges.length === 0 ? (
              <p className="text-xs text-muted-foreground">No relationships recorded for this entity.</p>
            ) : (
              <ul className="space-y-1.5">
                {edges.map((e) => (
                  <li key={e.id} className="flex items-center gap-2 text-sm">
                    {e.direction === "out" ? <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /> : <ArrowRight className="h-3.5 w-3.5 text-muted-foreground rotate-180" />}
                    <Badge variant="outline" className="text-[10px]">{e.relation}</Badge>
                    {e.other ? (
                      <Link to={`/sita/entity/${e.other.id}`} className="hover:underline">
                        {e.other.label} <span className="text-xs text-muted-foreground">({e.other.kind})</span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-xs">unknown node</span>
                    )}
                    <span className="ml-auto text-[10px] font-mono text-muted-foreground">{Number(e.weight).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}