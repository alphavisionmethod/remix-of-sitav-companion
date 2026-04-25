// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 5 Admin: Knowledge Spine Board
// Operator-facing dashboard for memory provenance health,
// knowledge chunk distribution, and ingestion job state.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Database, Brain, FileText, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IngestionStatusPanel, MemoryReviewQueue } from "@/platform/knowledge";

interface SpineCounts {
  memories_total: number;
  provenance_total: number;
  pending_review: number;
  chunks_total: number;
  chunks_with_workspace: number;
  jobs_active: number;
  jobs_failed_24h: number;
  by_pillar: Record<string, number>;
  by_sensitivity: Record<string, number>;
}

function KnowledgeSpineBoard() {
  const [counts, setCounts] = useState<SpineCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = supabase as any;
      const [
        { count: memories_total },
        { count: provenance_total },
        { count: pending_review },
        { count: chunks_total },
        { count: chunks_with_workspace },
        { count: jobs_active },
        { count: jobs_failed_24h },
        { data: pillarRows },
        { data: sensitivityRows },
      ] = await Promise.all([
        sb.from("pb_memories").select("id", { count: "exact", head: true }),
        sb.from("memory_provenance").select("memory_id", { count: "exact", head: true }),
        sb.from("memory_provenance").select("memory_id", { count: "exact", head: true }).eq("review_status", "pending_review"),
        sb.from("knowledge_chunks").select("id", { count: "exact", head: true }),
        sb.from("knowledge_chunks").select("id", { count: "exact", head: true }).not("workspace_id", "is", null),
        sb.from("ingestion_jobs").select("id", { count: "exact", head: true }).not("stage", "in", "(indexed,failed)"),
        sb.from("ingestion_jobs").select("id", { count: "exact", head: true }).eq("stage", "failed").gte("created_at", new Date(Date.now() - 86400000).toISOString()),
        sb.from("memory_provenance").select("pillar"),
        sb.from("memory_provenance").select("sensitivity"),
      ]);
      if (cancelled) return;
      const tally = (rows: { pillar?: string; sensitivity?: string }[] | null, k: "pillar" | "sensitivity") => {
        const out: Record<string, number> = {};
        (rows ?? []).forEach((r) => { const v = (r as any)[k] ?? "unknown"; out[v] = (out[v] ?? 0) + 1; });
        return out;
      };
      setCounts({
        memories_total: memories_total ?? 0,
        provenance_total: provenance_total ?? 0,
        pending_review: pending_review ?? 0,
        chunks_total: chunks_total ?? 0,
        chunks_with_workspace: chunks_with_workspace ?? 0,
        jobs_active: jobs_active ?? 0,
        jobs_failed_24h: jobs_failed_24h ?? 0,
        by_pillar: tally(pillarRows as any, "pillar"),
        by_sensitivity: tally(sensitivityRows as any, "sensitivity"),
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const coverage = counts && counts.memories_total > 0
    ? Math.round((counts.provenance_total / counts.memories_total) * 100)
    : 100;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Knowledge Spine</h1>
        <p className="text-sm text-muted-foreground">
          Phase 5 — provenance, chunks, and ingestion across memory and files.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Brain className="h-4 w-4" />} label="Memories" value={counts?.memories_total} loading={loading} />
        <StatCard
          icon={<Database className="h-4 w-4" />}
          label="Provenance coverage"
          value={loading ? undefined : `${coverage}%`}
          loading={loading}
          tone={coverage >= 95 ? "good" : coverage >= 80 ? "warn" : "bad"}
        />
        <StatCard icon={<FileText className="h-4 w-4" />} label="Knowledge chunks" value={counts?.chunks_total} loading={loading} />
        <StatCard
          icon={<Inbox className="h-4 w-4" />}
          label="Pending reviews"
          value={counts?.pending_review}
          loading={loading}
          tone={(counts?.pending_review ?? 0) > 0 ? "warn" : "good"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Memories by pillar</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-20 w-full" /> : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(counts?.by_pillar ?? {}).map(([k, v]) => (
                  <Badge key={k} variant="outline">{k}: {v}</Badge>
                ))}
                {Object.keys(counts?.by_pillar ?? {}).length === 0 && (
                  <p className="text-sm text-muted-foreground">No memories yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Memories by sensitivity</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-20 w-full" /> : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(counts?.by_sensitivity ?? {}).map(([k, v]) => (
                  <Badge key={k} variant={k === "restricted" ? "destructive" : k === "confidential" ? "secondary" : "outline"}>
                    {k}: {v}
                  </Badge>
                ))}
                {Object.keys(counts?.by_sensitivity ?? {}).length === 0 && (
                  <p className="text-sm text-muted-foreground">No memories yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MemoryReviewQueue />
        <IngestionStatusPanel />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, loading, tone }: {
  icon: React.ReactNode; label: string; value: number | string | undefined;
  loading: boolean; tone?: "good" | "warn" | "bad";
}) {
  const toneClass = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "bad" ? "text-destructive" : "";
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">{icon} {label}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-7 w-16" /> : (
          <p className={`text-2xl font-semibold ${toneClass}`}>{value ?? 0}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default KnowledgeSpineBoard;