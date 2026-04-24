// ═══════════════════════════════════════════════════════════════
// Personal Brain — Command Center
// ───────────────────────────────────────────────────────────────
// A unified live view: Brain Snapshot summary, Learning Momentum
// (last 14 days of new memories), and Insights Feed wired to the
// existing pb_* tables and the personal-brain edge function.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  ChevronRight,
  Loader2,
  Pin,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/components/sita/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePbMemories } from "@/components/personal-brain/hooks/usePbMemories";
import { usePbInsightsSignals } from "@/components/personal-brain/hooks/usePbInsightsSignals";
import { usePbProfile } from "@/components/personal-brain/hooks/usePbProfile";
import { usePbGoals } from "@/components/personal-brain/hooks/usePbGoals";

function CommandCenterInner() {
  const navigate = useNavigate();
  const { memories, loading: memoriesLoading, triggerScan } = usePbMemories();
  const { signals, loading: signalsLoading, busy, scan, updateStatus } = usePbInsightsSignals();
  const { profile } = usePbProfile();
  const { goals } = usePbGoals();

  // ── Snapshot stats ──────────────────────────────────────────
  const explicitCount = useMemo(
    () => memories.filter((m) => m.kind === "explicit" && m.status !== "pending").length,
    [memories],
  );
  const inferredCount = useMemo(
    () => memories.filter((m) => m.kind === "inferred" && m.status === "active").length,
    [memories],
  );
  const pendingCount = useMemo(
    () => memories.filter((m) => m.status === "pending").length,
    [memories],
  );
  const avgConfidence = useMemo(() => {
    const inf = memories.filter((m) => m.kind === "inferred" && m.status === "active");
    if (!inf.length) return 0;
    return Math.round((inf.reduce((s, m) => s + Number(m.confidence), 0) / inf.length) * 100);
  }, [memories]);

  // ── Learning momentum: last 14 days ────────────────────────
  const momentum = useMemo(() => {
    const days: { day: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({
        day: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1),
        count: 0,
      });
    }
    const idx = new Map(days.map((d, i) => [d.day, i]));
    for (const m of memories) {
      const k = m.created_at?.slice(0, 10);
      if (k && idx.has(k)) days[idx.get(k)!].count += 1;
    }
    const total = days.reduce((s, d) => s + d.count, 0);
    const peak = Math.max(1, ...days.map((d) => d.count));
    return { days, total, peak };
  }, [memories]);

  const handleScanAll = async () => {
    await Promise.all([triggerScan(null), scan()]);
  };

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => navigate("/personal-brain")}>
              <ArrowLeft className="h-4 w-4" />
              Brain
            </Button>
            <div className="rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 p-2">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-foreground">Command Center</h1>
              <p className="truncate text-xs text-muted-foreground">
                A live view of what your Brain knows, is learning, and noticing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleScanAll()}
              disabled={busy}
              className="h-8 text-xs"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Scan now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/personal-brain/snapshot")}
              className="h-8 text-xs"
            >
              Full snapshot
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Brain Snapshot summary tiles */}
        <section aria-labelledby="snapshot-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="snapshot-heading" className="text-sm font-semibold text-foreground">
              Brain Snapshot
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {profile?.personalization_depth
                ? `Personalization: ${profile.personalization_depth}`
                : "Personalization: standard"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Explicit</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{explicitCount}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">You taught me directly</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Inferred</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{inferredCount}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Patterns I picked up</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Confidence</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{avgConfidence}%</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Avg across inferred</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pending review</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{pendingCount}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {pendingCount > 0 ? (
                    <button
                      className="underline-offset-2 hover:underline text-primary"
                      onClick={() => navigate("/personal-brain/snapshot")}
                    >
                      Review now
                    </button>
                  ) : (
                    "Nothing to approve"
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Two-column: Momentum + Goals */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Learning Momentum */}
          <Card className="lg:col-span-2">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Learning momentum</h2>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {momentum.total} new memories · last 14 days
                </span>
              </div>
              {memoriesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex h-32 items-end gap-1.5">
                  {momentum.days.map((d) => {
                    const pct = Math.round((d.count / momentum.peak) * 100);
                    return (
                      <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-accent/60 transition-all"
                          style={{ height: `${Math.max(pct, 3)}%` }}
                          title={`${d.day}: ${d.count}`}
                          aria-label={`${d.day}: ${d.count} memories`}
                        />
                        <span className="text-[9px] text-muted-foreground">{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                Each bar is a day. Taller bars mean a more active learning day.
              </p>
            </CardContent>
          </Card>

          {/* Goals snapshot */}
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Active goals</h2>
                <Badge variant="outline" className="text-[10px]">{goals.length}</Badge>
              </div>
              {goals.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No goals yet. The Brain works better when it knows what you're aiming for.
                </p>
              ) : (
                <ul className="space-y-2">
                  {goals.slice(0, 5).map((g) => (
                    <li
                      key={g.id}
                      className="rounded-lg border border-border/50 bg-card/40 p-2.5"
                    >
                      <p className="text-xs font-medium text-foreground truncate">{g.title}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground capitalize">
                        {g.kind} · {g.status} · {g.progress_pct}%
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insights Feed */}
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Insights feed</h2>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {signals.length} signal{signals.length === 1 ? "" : "s"}
              </span>
            </div>
            {signalsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : signals.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-muted-foreground/60" />
                <p className="mt-2 text-sm font-medium text-foreground">No insights yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Run a scan after a few chats to surface patterns and themes.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {signals.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-lg border border-border/50 bg-card/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {s.kind}
                          </Badge>
                          {s.status === "pinned" && (
                            <Badge className="text-[10px]">Pinned</Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {Math.round(Number(s.confidence) * 100)}% confidence
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-foreground">{s.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{s.body}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          aria-label={s.status === "pinned" ? "Unpin" : "Pin"}
                          onClick={() =>
                            void updateStatus(s.id, s.status === "pinned" ? "new" : "pinned")
                          }
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          aria-label="Dismiss"
                          onClick={() => void updateStatus(s.id, "dismissed")}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export default function BrainCommandCenter() {
  return (
    <GlobalErrorBoundary>
      <CommandCenterInner />
    </GlobalErrorBoundary>
  );
}