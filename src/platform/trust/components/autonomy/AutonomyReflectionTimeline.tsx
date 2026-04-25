// ═══════════════════════════════════════════════════════════════
// SITA OS — Autonomy Reflection Timeline (Phase 6)
// Reads from `advisor_board_reflections` and renders the most
// recent post-execution scoring + lesson-learned entries as a
// timeline. Live updates via realtime channel.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { TimelineRow } from "@/components/primitives/timelines/TimelineRow";
import { Brain, Sparkles, Repeat, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ReflectionRow = {
  id: string;
  advisor_id: string;
  owner_action: string;
  outcome_observed: string | null;
  outcome_quality: number | null;
  execution_fitness_score: number | null;
  recommendation_quality_score: number | null;
  should_repeat: boolean | null;
  lesson_learned: string | null;
  pattern_tags: unknown;
  created_at: string;
};

type Props = {
  advisorId?: string;
  compact?: boolean;
  limit?: number;
};

export function AutonomyReflectionTimeline({ advisorId, compact = false, limit = 25 }: Props) {
  const [rows, setRows] = useState<ReflectionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("advisor_board_reflections")
      .select(
        "id, advisor_id, owner_action, outcome_observed, outcome_quality, execution_fitness_score, recommendation_quality_score, should_repeat, lesson_learned, pattern_tags, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (advisorId) q = q.eq("advisor_id", advisorId);
    const { data } = await q;
    setRows((data as ReflectionRow[]) ?? []);
    setLoading(false);
  }, [advisorId, limit]);

  useEffect(() => {
    void load();
    const ch = supabase
      .channel("autonomy-reflections")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "advisor_board_reflections" },
        () => void load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  const body = (
    <ScrollArea className="h-[420px]">
      <div className="space-y-2 pr-3">
        {loading && (
          <>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </>
        )}
        {!loading && rows.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
            <Brain className="mx-auto mb-2 h-6 w-6 opacity-60" />
            No reflections yet. They appear after advisors execute or you approve a queued action.
          </div>
        )}
        {!loading &&
          rows.map((r, idx) => {
            const tags = Array.isArray(r.pattern_tags) ? (r.pattern_tags as string[]) : [];
            const status = scoreToStatus(r);
            return (
              <TimelineRow
                key={r.id}
                isLast={idx === rows.length - 1}
                status={status}
                label={
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {r.advisor_id}
                      </span>
                      <OwnerActionBadge owner={r.owner_action} />
                      {r.should_repeat && (
                        <Badge variant="outline" className="text-[10px] border-trust-safe/50 text-trust-safe">
                          <Repeat className="mr-1 h-3 w-3" /> repeat
                        </Badge>
                      )}
                      <ScoreChip label="OQ" value={r.outcome_quality} />
                      <ScoreChip label="EF" value={r.execution_fitness_score} />
                      <ScoreChip label="RQ" value={r.recommendation_quality_score} />
                    </div>
                    {r.outcome_observed && (
                      <p className="text-xs text-foreground/80">{r.outcome_observed}</p>
                    )}
                    {r.lesson_learned && (
                      <p className="text-[11px] text-muted-foreground italic flex items-start gap-1">
                        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
                        <span>{r.lesson_learned}</span>
                      </p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {tags.slice(0, 5).map((t) => (
                          <span
                            key={t}
                            className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                }
                meta={timeAgo(r.created_at)}
              />
            );
          })}
      </div>
    </ScrollArea>
  );

  if (compact) return body;

  return (
    <Card className={cn("border-border/60")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" /> Reflections timeline
          </CardTitle>
          <Badge variant="secondary">{rows.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}

function scoreToStatus(r: ReflectionRow): "done" | "current" | "failed" | "pending" {
  if (r.owner_action === "rejected") return "failed";
  const oq = r.outcome_quality ?? 0;
  const ef = r.execution_fitness_score ?? 0;
  if (oq < 0.3 || ef < 0.4) return "failed";
  if (oq >= 0.7) return "done";
  return "current";
}

function ScoreChip({ label, value }: { label: string; value: number | null }) {
  if (value === null || value === undefined) return null;
  const pct = Math.round(value * 100);
  const tone =
    pct >= 70 ? "border-trust-safe/40 text-trust-safe" :
    pct >= 40 ? "border-border text-muted-foreground" :
    "border-destructive/40 text-destructive";
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-px text-[10px] tabular-nums font-medium",
        tone,
      )}
      title={`${label} score`}
    >
      {label} {pct}
    </span>
  );
}

function OwnerActionBadge({ owner }: { owner: string }) {
  const map: Record<string, { tone: string; label: string }> = {
    auto_executed: { tone: "border-primary/40 text-primary", label: "auto" },
    approved: { tone: "border-trust-safe/40 text-trust-safe", label: "approved" },
    rejected: { tone: "border-destructive/40 text-destructive", label: "rejected" },
    ignored: { tone: "border-border text-muted-foreground", label: "ignored" },
    failed_no_owner: { tone: "border-destructive/40 text-destructive", label: "failed" },
  };
  const m = map[owner] ?? { tone: "border-border text-muted-foreground", label: owner };
  return (
    <Badge variant="outline" className={cn("text-[10px]", m.tone)}>
      {m.label === "rejected" && <AlertTriangle className="mr-1 h-3 w-3" />}
      {m.label}
    </Badge>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}