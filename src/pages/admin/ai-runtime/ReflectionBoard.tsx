// ═══════════════════════════════════════════════════════════════
// SITA OS — /admin/ai-runtime/reflection-board (Phase 3)
// Per-agent learning summary — outcome quality, gate fitness,
// repeat/avoid signals, top patterns, and the most recent
// reflections with lesson + recommendation. Admin-only.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/sita/EmptyState";

interface AgentSummary {
  agent_id: string;
  reflections_count: number;
  avg_outcome_quality: number;
  avg_gate_fitness: number;
  repeat_count: number;
  avoid_count: number;
  trust_score: number | null;
  last_reflected_at: string | null;
  top_patterns: Array<{ tag: string; count: number }>;
}

interface ReflectionRow {
  id: string;
  agent_id: string;
  action_class: string;
  intent_status: string;
  outcome_quality: number;
  gate_fitness_score: number;
  should_repeat: boolean | null;
  pattern_tags: string[];
  lesson_learned: string;
  recommendation: string | null;
  reflected_at: string;
}

const PATTERN_TONE: Record<string, string> = {
  rate_limit_pressure: "bg-amber-500/15 text-amber-400",
  autonomy_block: "bg-red-500/15 text-red-400",
  kill_switch_active: "bg-red-500/15 text-red-400",
  rollback_unavailable: "bg-orange-500/15 text-orange-400",
  missing_evidence: "bg-orange-500/15 text-orange-400",
  class_not_whitelisted: "bg-red-500/15 text-red-400",
  required_approval: "bg-violet-500/15 text-violet-400",
  agent_suspended: "bg-red-500/15 text-red-400",
  rolled_back: "bg-orange-500/15 text-orange-400",
  execution_failure: "bg-destructive/15 text-destructive",
  denied_at_gate: "bg-red-500/15 text-red-400",
  low_confidence_success: "bg-amber-500/15 text-amber-400",
  high_confidence_success: "bg-green-500/15 text-green-400",
  timeout: "bg-amber-500/15 text-amber-400",
  permission_error: "bg-red-500/15 text-red-400",
};

function PatternBadge({ tag, count }: { tag: string; count?: number }) {
  const cls = PATTERN_TONE[tag] ?? "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium", cls)}>
      {tag.replace(/_/g, " ")}
      {typeof count === "number" && count > 1 ? <span className="opacity-70">×{count}</span> : null}
    </span>
  );
}

function QualityBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round((value ?? 0) * 100);
  const tone = pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
        <span>{label}</span><span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded bg-muted overflow-hidden">
        <div className={cn("h-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ReflectionBoard() {
  const [summary, setSummary] = useState<AgentSummary[]>([]);
  const [reflections, setReflections] = useState<ReflectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [lookback, setLookback] = useState<number>(168);
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    const [sumRes, reflRes] = await Promise.all([
      supabase.rpc("summarize_internal_agent_learning", { _lookback_hours: lookback }),
      supabase
        .from("internal_agent_reflections")
        .select("id,agent_id,action_class,intent_status,outcome_quality,gate_fitness_score,should_repeat,pattern_tags,lesson_learned,recommendation,reflected_at")
        .order("reflected_at", { ascending: false })
        .limit(100),
    ]);
    if (sumRes.error) toast.error("Summary load failed", { description: sumRes.error.message });
    else setSummary((sumRes.data ?? []) as AgentSummary[]);
    if (reflRes.error) toast.error("Reflections load failed", { description: reflRes.error.message });
    else setReflections((reflRes.data ?? []) as ReflectionRow[]);
    setLoading(false);
  }, [lookback]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-reflection-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "internal_agent_reflections" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const runReflection = useCallback(async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("internal-agent-reflect", {
        body: { lookback_hours: 24, max_batch: 50 },
      });
      if (error) throw error;
      const ok = data?.succeeded ?? 0;
      const total = data?.processed ?? 0;
      toast.success(`Reflection pass complete`, { description: `${ok}/${total} intents reflected` });
      await load();
    } catch (e: any) {
      toast.error("Reflection pass failed", { description: e?.message ?? String(e) });
    } finally {
      setRunning(false);
    }
  }, [load]);

  const filteredReflections = useMemo(() => {
    return agentFilter === "all" ? reflections : reflections.filter((r) => r.agent_id === agentFilter);
  }, [reflections, agentFilter]);

  const totals = useMemo(() => {
    const t = { agents: summary.length, reflections: 0, repeat: 0, avoid: 0, avg: 0 };
    for (const s of summary) {
      t.reflections += Number(s.reflections_count ?? 0);
      t.repeat += Number(s.repeat_count ?? 0);
      t.avoid += Number(s.avoid_count ?? 0);
    }
    if (summary.length > 0) {
      t.avg = summary.reduce((acc, s) => acc + Number(s.avg_outcome_quality ?? 0), 0) / summary.length;
    }
    return t;
  }, [summary]);

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Reflection &amp; Learning Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Phase 3 — every settled intent is scored on outcome quality and gate fitness. Patterns surface here so operators can promote, restrict, or retrain agents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={lookback}
            onChange={(e) => setLookback(Number(e.target.value))}
            className="h-9 px-2 text-sm rounded-md border bg-background"
          >
            <option value={24}>Last 24h</option>
            <option value={72}>Last 3d</option>
            <option value={168}>Last 7d</option>
            <option value={720}>Last 30d</option>
          </select>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={runReflection} disabled={running}>
            <Sparkles className={cn("h-4 w-4 mr-2", running && "animate-pulse")} />
            Run reflection now
          </Button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Agents</div><div className="text-2xl font-semibold mt-0.5">{totals.agents}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Reflections</div><div className="text-2xl font-semibold mt-0.5">{totals.reflections}</div></CardContent></Card>
        <Card className="bg-green-500/5"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Repeat signals</div><div className="text-2xl font-semibold mt-0.5 text-green-400">{totals.repeat}</div></CardContent></Card>
        <Card className="bg-red-500/5"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Avoid signals</div><div className="text-2xl font-semibold mt-0.5 text-red-400">{totals.avoid}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Avg outcome</div><div className="text-2xl font-semibold mt-0.5">{(totals.avg * 100).toFixed(0)}%</div></CardContent></Card>
      </div>

      <Tabs defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents">By agent</TabsTrigger>
          <TabsTrigger value="recent">Recent reflections</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-4">
          {summary.length === 0 ? (
            <EmptyState
              icon={<Brain className="h-5 w-5" />}
              title={loading ? "Loading reflections…" : "No reflections in this window"}
              description={loading ? "Fetching the latest agent self-assessments." : "Run a reflection pass to populate this window with outcome quality and trust signals."}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.map((s) => {
                const trustPct = Math.round((Number(s.trust_score ?? 0)) * 100);
                const tone = trustPct >= 75 ? TrendingUp : trustPct >= 50 ? Brain : TrendingDown;
                const Icon = tone;
                return (
                  <Card key={s.agent_id} className="cursor-pointer hover:border-primary/40 transition" onClick={() => setAgentFilter(s.agent_id)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-mono">{s.agent_id}</CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <QualityBar value={Number(s.avg_outcome_quality ?? 0)} label="Avg outcome quality" />
                      <QualityBar value={Number(s.avg_gate_fitness ?? 0)} label="Avg gate fitness" />
                      <QualityBar value={Number(s.trust_score ?? 0)} label="Trust score (EWMA)" />
                      <div className="flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-400" />{s.repeat_count} repeat</span>
                        <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-400" />{s.avoid_count} avoid</span>
                        <Badge variant="outline" className="ml-auto text-[10px]">{s.reflections_count} total</Badge>
                      </div>
                      {s.top_patterns?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t">
                          {s.top_patterns.slice(0, 5).map((p) => (
                            <PatternBadge key={p.tag} tag={p.tag} count={p.count} />
                          ))}
                        </div>
                      )}
                      {s.last_reflected_at && (
                        <div className="text-[11px] text-muted-foreground">
                          Last reflected {new Date(s.last_reflected_at).toLocaleString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter:</span>
            <Button size="sm" variant={agentFilter === "all" ? "secondary" : "outline"} onClick={() => setAgentFilter("all")}>All</Button>
            {Array.from(new Set(reflections.map((r) => r.agent_id))).slice(0, 8).map((id) => (
              <Button key={id} size="sm" variant={agentFilter === id ? "secondary" : "outline"} onClick={() => setAgentFilter(id)} className="font-mono text-xs">{id}</Button>
            ))}
            <Badge variant="outline" className="ml-auto">{filteredReflections.length} shown</Badge>
          </div>
          {filteredReflections.length === 0 ? (
            <EmptyState
              icon={<Brain className="h-5 w-5" />}
              title="No reflections match the filter"
              description="Switch the agent filter or trigger a fresh reflection pass to surface new entries."
            />
          ) : filteredReflections.map((r) => {
            const repeatBadge = r.should_repeat === true
              ? <Badge className="bg-green-500/15 text-green-400 border-green-500/30">Repeat</Badge>
              : r.should_repeat === false
              ? <Badge className="bg-red-500/15 text-red-400 border-red-500/30">Avoid</Badge>
              : <Badge variant="outline">Neutral</Badge>;
            return (
              <Card key={r.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="font-mono text-xs">{r.agent_id}</Badge>
                      <Badge variant="outline" className="font-mono text-xs">{r.action_class}</Badge>
                      <Badge variant="outline" className="text-xs">{r.intent_status}</Badge>
                      {repeatBadge}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{new Date(r.reflected_at).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <QualityBar value={Number(r.outcome_quality ?? 0)} label="Outcome quality" />
                    <QualityBar value={Number(r.gate_fitness_score ?? 0)} label="Gate fitness" />
                  </div>
                  <p className="text-sm">{r.lesson_learned}</p>
                  {r.recommendation && <p className="text-sm text-muted-foreground italic">→ {r.recommendation}</p>}
                  {r.pattern_tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {r.pattern_tags.map((t) => <PatternBadge key={t} tag={t} />)}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
