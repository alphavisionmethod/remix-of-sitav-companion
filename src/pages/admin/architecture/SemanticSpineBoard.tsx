// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 6 Admin: Semantic Spine Board
// Operator-facing dashboard for the Vector + Voice spine: embedding
// coverage, voice sessions, transcript pipeline, and recent
// orchestrator semantic retrievals.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Sparkles, Clock, Activity, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  EmbeddingHealthPanel,
  SemanticContextBadge,
  VoiceTranscriptDrawer,
  useRecentVoiceSessions,
  type RetrievalKind,
  type VoiceSessionRow,
} from "@/platform/knowledge";

interface RecentTrace {
  id: string;
  invocation_id: string;
  source_type: string;
  source_label: string | null;
  weight: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function durationLabel(ms: number | null): string {
  if (!ms || ms <= 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  ended: "secondary",
  aborted: "outline",
  failed: "destructive",
};

function SemanticSpineBoard() {
  const { data: sessions, isLoading: sessionsLoading } = useRecentVoiceSessions(20);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [traces, setTraces] = useState<RecentTrace[]>([]);
  const [tracesLoading, setTracesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = supabase as any;
      const { data } = await sb
        .from("ai_explainability_traces")
        .select("id, invocation_id, source_type, source_label, weight, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!cancelled) {
        setTraces((data ?? []) as RecentTrace[]);
        setTracesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const semanticTraces = useMemo(
    () => traces.filter((t) => (t.metadata as any)?.retrieval_kind === "semantic"),
    [traces],
  );
  const semanticShare = traces.length > 0
    ? Math.round((semanticTraces.length / traces.length) * 100)
    : 0;

  const kindOf = (t: RecentTrace): RetrievalKind => {
    const k = (t.metadata as any)?.retrieval_kind as string | undefined;
    if (k === "semantic" || k === "fulltext" || k === "recency") return k;
    return "manual";
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5" /> Semantic Spine
        </h1>
        <p className="text-sm text-muted-foreground">
          Phase 6 — vector embeddings, voice → memory bridge, and orchestrator retrieval mix.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EmbeddingHealthPanel />
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Orchestrator retrieval mix (last 50)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tracesLoading ? <Skeleton className="h-20 w-full" /> : (
              <>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-semibold">{semanticShare}%</p>
                  <p className="text-xs text-muted-foreground">semantic share</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["semantic", "fulltext", "recency", "manual"] as RetrievalKind[]).map((k) => {
                    const n = traces.filter((t) => kindOf(t) === k).length;
                    return (
                      <Badge key={k} variant="outline" className="gap-1 text-[10px]">
                        <SemanticContextBadge kind={k} /> {n}
                      </Badge>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Traces emitted by the orchestrator across all modes.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="h-4 w-4" /> Recent voice sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? <Skeleton className="h-32 w-full" /> : (
            <ScrollArea className="max-h-80 pr-2">
              {(sessions?.length ?? 0) === 0 && (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No voice sessions yet. Sessions will appear here once dictation begins.
                </div>
              )}
              <div className="space-y-2">
                {(sessions ?? []).map((s: VoiceSessionRow) => (
                  <div key={s.id} className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant={STATUS_VARIANT[s.status] ?? "outline"} className="text-[10px] uppercase">
                        {s.status}
                      </Badge>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium">{s.provider}</span>
                          <span className="text-muted-foreground">· {s.mode}</span>
                          <span className="text-muted-foreground">· {s.pillar}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(s.started_at).toLocaleString()} · {durationLabel(s.duration_ms)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => setActiveSessionId(s.id)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Transcripts
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent semantic traces</CardTitle>
        </CardHeader>
        <CardContent>
          {tracesLoading ? <Skeleton className="h-24 w-full" /> : (
            <ScrollArea className="max-h-72 pr-2">
              {semanticTraces.length === 0 && (
                <p className="text-sm text-muted-foreground">No semantic retrievals recorded yet.</p>
              )}
              <div className="space-y-2">
                {semanticTraces.slice(0, 15).map((t) => {
                  const sim = (t.metadata as any)?.similarity as number | undefined;
                  return (
                    <div key={t.id} className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <SemanticContextBadge kind="semantic" similarity={sim ?? null} />
                        <span className="truncate">{t.source_label ?? t.source_type}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(t.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <VoiceTranscriptDrawer
        open={!!activeSessionId}
        onOpenChange={(o) => !o && setActiveSessionId(null)}
        sessionId={activeSessionId}
      />
    </div>
  );
}

export default SemanticSpineBoard;
