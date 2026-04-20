// ═══════════════════════════════════════════════════════════════
// SITA OS — Artifact Ownership Graph Card (read-only governance widget)
// Surfaces the producer→consumer graph at /admin/governance routes.
// Loads from /generated/artifact-ownership-graph.json (mirrored).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle2, GitBranch, Network } from "lucide-react";

interface GraphData {
  totalNodes: number;
  totalEdges: number;
  artifactToArtifactEdges: number;
  artifactToConsumerEdges: number;
  freshNodes: number;
  agingNodes: number;
  staleNodes: number;
  transitivelyStaleCount: number;
  releaseCriticalStaleCount: number;
  releaseCriticalStale: string[];
  orphanProducerCount: number;
  orphanConsumerCount: number;
  cycleCount: number;
  hubs: Array<{ artifact: string; consumerCount: number; owner: string }>;
  staleBlastRadius: Array<{ artifact: string; blastRadius: number; downstream: string[] }>;
}

interface Envelope {
  generatedAt?: string;
  data?: GraphData;
}

export const ArtifactOwnershipGraphCard = () => {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/generated/artifact-ownership-graph.json")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: Envelope | GraphData) => {
        const env = j as Envelope;
        const d = env.data ?? (j as GraphData);
        setGraph(d);
        setGeneratedAt(env.generatedAt ?? null);
      })
      .catch(e => setError(String(e)));
  }, []);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Network className="h-5 w-5" />
            Artifact Ownership Graph
          </CardTitle>
          <CardDescription>Producer→consumer graph not yet generated. Run <code className="text-xs">npm run generate:artifact-ownership-graph</code>.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!graph) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Artifact Ownership Graph</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const healthy = graph.cycleCount === 0 && graph.orphanProducerCount === 0 && graph.releaseCriticalStaleCount === 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Network className="h-5 w-5" />
                Artifact Ownership Graph
              </CardTitle>
              <CardDescription>
                Directed producer→consumer graph for all generated artifacts. BLOCK gate #30.
                {generatedAt && <span className="ml-2 text-xs">Generated {new Date(generatedAt).toLocaleString()}</span>}
              </CardDescription>
            </div>
            <Badge variant={healthy ? "default" : "destructive"} className="shrink-0">
              {healthy ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
              {healthy ? "HEALTHY" : "ATTENTION"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Stat label="Nodes" value={graph.totalNodes} />
            <Stat label="Edges" value={graph.totalEdges} />
            <Stat label="A→A edges" value={graph.artifactToArtifactEdges} />
            <Stat label="Fresh" value={graph.freshNodes} tone="success" />
            <Stat label="Stale" value={graph.staleNodes} tone={graph.staleNodes > 0 ? "warning" : "muted"} />
            <Stat label="Transitively stale" value={graph.transitivelyStaleCount} tone={graph.transitivelyStaleCount > 0 ? "warning" : "muted"} />
            <Stat label="Cycles" value={graph.cycleCount} tone={graph.cycleCount > 0 ? "destructive" : "success"} />
            <Stat label="Orphan producers" value={graph.orphanProducerCount} tone={graph.orphanProducerCount > 0 ? "destructive" : "success"} />
            <Stat label="Orphan consumers" value={graph.orphanConsumerCount} tone={graph.orphanConsumerCount > 0 ? "warning" : "muted"} />
            <Stat label="Release-critical stale" value={graph.releaseCriticalStaleCount} tone={graph.releaseCriticalStaleCount > 0 ? "destructive" : "success"} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <GitBranch className="h-4 w-4" />
              Top consumed artifacts (hubs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artifact</TableHead>
                  <TableHead className="text-right">Consumers</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {graph.hubs.map(h => (
                  <TableRow key={h.artifact}>
                    <TableCell className="font-mono text-xs">{h.artifact.replace(/^generated\//, "")}</TableCell>
                    <TableCell className="text-right">{h.consumerCount}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{h.owner}</Badge></TableCell>
                  </TableRow>
                ))}
                {graph.hubs.length === 0 && <TableRow><TableCell colSpan={3} className="text-muted-foreground text-center text-xs">No hubs yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <AlertTriangle className="h-4 w-4" />
              Stale blast radius
            </CardTitle>
            <CardDescription className="text-xs">Stale artifacts ranked by downstream impact</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stale artifact</TableHead>
                  <TableHead className="text-right">Downstream</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {graph.staleBlastRadius.map(s => (
                  <TableRow key={s.artifact}>
                    <TableCell className="font-mono text-xs">{s.artifact.replace(/^generated\//, "")}</TableCell>
                    <TableCell className="text-right">{s.blastRadius}</TableCell>
                  </TableRow>
                ))}
                {graph.staleBlastRadius.length === 0 && <TableRow><TableCell colSpan={2} className="text-muted-foreground text-center text-xs">No stale artifacts 🎉</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {graph.releaseCriticalStale.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive text-base">
              <AlertTriangle className="h-4 w-4" />
              Release-critical artifacts requiring regeneration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-xs font-mono">
              {graph.releaseCriticalStale.slice(0, 10).map(a => (
                <li key={a} className="text-muted-foreground">{a}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Stat = ({ label, value, tone = "muted" }: { label: string; value: number; tone?: "success" | "warning" | "destructive" | "muted" }) => {
  const toneClass = {
    success: "text-emerald-500",
    warning: "text-amber-500",
    destructive: "text-destructive",
    muted: "text-foreground",
  }[tone];
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${toneClass}`}>{value}</div>
    </div>
  );
};

export default ArtifactOwnershipGraphCard;
