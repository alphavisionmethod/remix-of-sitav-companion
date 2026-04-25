// ═══════════════════════════════════════════════════════════════
// SITA OS — EntityView (Phase J)
// First-time-navigable surface for the Sita knowledge graph.
// Reads sita_knowledge_nodes + sita_knowledge_edges + cross-refs.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Network, Tag, ArrowRight, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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

type NodeIndexEntry = Pick<Node, "id" | "label" | "kind"> & { confidence: number };

const ALL_KINDS = "__all__";
const SEARCH_LIMIT = 50;

export default function EntityView() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [node, setNode] = useState<Node | null>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/filter state for the quick-jump panel.
  const [allNodes, setAllNodes] = useState<NodeIndexEntry[]>([]);
  const [indexLoading, setIndexLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeKind, setActiveKind] = useState<string>(ALL_KINDS);

  // Load a lightweight index of nodes once per user — used by search + filters.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setIndexLoading(true);
      const { data } = await supabase
        .from("sita_knowledge_nodes" as never)
        .select("id, label, kind, confidence")
        .eq("user_id", user.id)
        .order("last_seen_at", { ascending: false })
        .limit(500);
      if (cancelled) return;
      setAllNodes((data as unknown as NodeIndexEntry[] | null) ?? []);
      setIndexLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const kindOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of allNodes) counts.set(n.kind, (counts.get(n.kind) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8); // top kinds as quick-filter chips
  }, [allNodes]);

  const filteredNodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = allNodes;
    if (activeKind !== ALL_KINDS) list = list.filter((n) => n.kind === activeKind);
    if (q) list = list.filter((n) =>
      n.label.toLowerCase().includes(q) || n.kind.toLowerCase().includes(q)
    );
    return list.slice(0, SEARCH_LIMIT);
  }, [allNodes, query, activeKind]);

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

      {/* Quick-jump search & filter — lets you hop to any knowledge node. */}
      <Card data-testid="entity-search">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4" /> Jump to entity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by label or kind…"
              className="pl-8 pr-8"
              aria-label="Search knowledge nodes"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick-filter chips by kind */}
          {kindOptions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveKind(ALL_KINDS)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] transition",
                  activeKind === ALL_KINDS
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-muted-foreground hover:text-foreground",
                )}
              >
                All ({allNodes.length})
              </button>
              {kindOptions.map(([kind, count]) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setActiveKind(kind)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] transition",
                    activeKind === kind
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {kind} ({count})
                </button>
              ))}
            </div>
          )}

          {/* Results list */}
          {indexLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : filteredNodes.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {allNodes.length === 0
                ? "No knowledge nodes yet."
                : "No nodes match your search."}
            </p>
          ) : (
            <ul className="max-h-56 overflow-y-auto space-y-1 rounded-md border border-border/40 bg-muted/20 p-1">
              {filteredNodes.map((n) => {
                const isActive = n.id === nodeId;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/sita/entity/${n.id}`)}
                      className={cn(
                        "w-full text-left rounded-sm px-2 py-1.5 text-xs flex items-center gap-2 transition",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent hover:text-accent-foreground",
                      )}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span className="truncate flex-1 font-medium">{n.label}</span>
                      <Badge variant="outline" className="text-[9px] shrink-0">{n.kind}</Badge>
                      <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                        {(n.confidence * 100).toFixed(0)}%
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {filteredNodes.length === SEARCH_LIMIT && (
            <p className="text-[10px] text-muted-foreground">
              Showing first {SEARCH_LIMIT} matches. Refine your search to narrow down.
            </p>
          )}
        </CardContent>
      </Card>

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